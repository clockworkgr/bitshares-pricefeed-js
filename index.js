const yaml = require('js-yaml');
const fs = require('fs');
const Feed = require('./pricefeed.js');
const table = require('table').table;
const chalk = require('chalk');
const moment = require('moment-timezone');
const Price = require('./lib/Price.js');
const prompt = require('prompt-sync')({sigint: true});
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('./lib/Logger.js');
const {Apis} = require('bitsharesjs-ws');
const {PrivateKey, TransactionBuilder} =require('bitsharesjs');


var privKey = argv['k'];
let pKey = PrivateKey.fromWif(privKey);
let logger= new Logger(argv['d']);
let confYaml = argv['c'];
let apiNode = argv['s'];
let publishFeed = argv['broadcast'];

try {
	(async  ()=> {
		//console.log(chalk.white('Loading config file...'));
		logger.log('Starting pricefeed run');
		logger.transient('Loading config file...');
		var config = yaml.safeLoad(fs.readFileSync(confYaml, 'utf8'));
		logger.info('Config file loaded.');
		var feed = new Feed(config);
		logger.transient('Initialising pricefeed...');
		await feed.init();
		logger.info('Pricefeed class initialised.');
		logger.info('Setting up pricefeed sources...');
		await feed.fetch();
		logger.info('Pricefeed sources setup complete.');
		logger.info('Calculating prices...');
		await feed.derive([]);
		logger.info('Prices calculation complete.');
		var prices = await feed.get_prices();
		printLog(prices);
		printPrices(prices);
		Apis.instance(apiNode, true).init_promise.then(() => {
			logger.log('Connected to API node: '+ apiNode);

			let tr = new TransactionBuilder();

			for (var symbol in prices) {
				let price=prices[symbol];
				if(price==undefined) {
					logger.warning('No price for '+chalk.white(symbol)+'. '+chalk.red('SKIPPING.'));
					continue;
				}
				let flags = price['flags'];
				if ((flags.indexOf('min_change')==-1) && (flags.indexOf('over_max_age')==-1)) {
					logger.info(chalk.white(symbol)+' below min change and not old enough. '+chalk.green('SKIPPING.'));
					continue;
				}
				if (flags.indexOf('over_warn_change')>=0) {
					if (flags.indexOf('skip_change')==-1) {
						let includeprice= prompt(chalk.yellow('WARNING:')+' Price change for '+symbol+' ('+price['priceChange']+') above \'warn_change\'. Include in feed (Y/n)?');
						if ((includeprice=='n') || (includeprice=='N')) {
							logger.log('Skipping...');
							continue;
						}
					}else{
						let includeprice= prompt(chalk.red('CRITICAL:')+' Price change for '+symbol+' ('+price['priceChange']+') above \'skip_change\'. Include in feed (y/N)?');
						if ((includeprice!='y') && (includeprice!='Y')) {
							logger.log('Skipping...');
							continue;
						}
					}
				}



				let newprice=price.new_feed;
				let newcer = newprice.Multiply(price.cef);
				tr.add_type_operation( 'asset_publish_feed', {
					publisher: feed.producer.id,
					asset_id: newprice.base.asset_id,
					feed: {
						settlement_price: {
							base: {
								amount: newprice.base.amount,
								asset_id: newprice.base.asset_id },
							quote: {
								amount: newprice.quote.amount,
								asset_id: newprice.quote.asset_id }
						},
						maintenance_collateral_ratio: price.mcr*10,
						maximum_short_squeeze_ratio: price.mssr*10,
						core_exchange_rate: {
							base: {
								amount: newcer.base.amount,
								asset_id: newcer.base.asset_id },
							quote: {
								amount: newcer.quote.amount,
								asset_id: newcer.quote.asset_id }
						}
					}
				} );
			}
			tr.set_required_fees().then(() => {
				tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
				if (publishFeed) {
					tr.broadcast();
				}
			});
		});
	})();
} catch (e) {
	logger.log(e);
}

function formatPrice(price) {
	return chalk.yellow(Number(price).toFixed(9));
}
function highlightlargeDeviation(d, p) {
	var perc = ((d - p) / p) * 100;
	if (perc < 0) {
		return chalk.red(perc.toFixed(2) + '%');
	} else {
		return chalk.green('+' + perc.toFixed(2) + '%');
	}
}
function printLog(prices) {
	var tabledata = [['base', 'quote', 'price', 'diff', 'volume', 'source']];
	for (var symbol in prices) {
		var backing_symbol = prices[symbol]['short_backing_symbol'];
		var data = prices[symbol]['log'];
		var price = data[symbol];
		if (price == undefined) {
			continue;
		}
		for (var didx in price[backing_symbol]) {
			var d = price[backing_symbol][didx];
			tabledata.push([symbol, backing_symbol, formatPrice(d['price']), highlightlargeDeviation(d['price'], prices[symbol]['price']), d['volume'], JSON.stringify(d['sources'])]);
		}

	}

	let options = {
		drawHorizontalLine: (index, size) => {
			return index === 0 || index === 1 || index === size;
		},
		columns: {
			0: {
				alignment: 'right',
				width: 7,
				paddingLeft: 1,
				paddingRight: 1
			},
			1: {
				alignment: 'right',
				width: 7,
				paddingLeft: 1,
				paddingRight: 1
			},
			2: {
				alignment: 'right',
				width: 13,
				paddingLeft: 1,
				paddingRight: 1
			},
			3: {
				alignment: 'right',
				width: 6,
				paddingLeft: 1,
				paddingRight: 1
			},
			4: {
				alignment: 'right',
				width: 24,
				paddingLeft: 1,
				paddingRight: 1
			},
			5: {
				alignment: 'left',
				width: 40,
				paddingLeft: 1,
				paddingRight: 1
			}
		}
	};

	let output = table(tabledata, options);
	logger.log('Source details:\r\n'+output);
}
function printPrices(prices) {
	var tabledata = [['symbol', 'backing', 'new price', 'cer', 'mean', 'median', 'wgt. avg', 'wgt. std(#)', 'blockchain', 'mssr', 'mcr', 'my last price', 'last update']];
	for (var symbol in prices) {
		var feed = prices[symbol];
		if (feed == undefined) {
			continue;
		}
		var last, age;
		let myprice = feed['price'];
		let blockchain = new Price(feed['global_feed']['settlement_price']).Float();
		if (feed['current_feed'] != undefined) {
			last = new Price(feed['current_feed']['settlement_price']).Float();
			age = moment.tz(feed['current_feed']['date'], 'UTC').fromNow();
		} else {
			last = -1;
			age = 'Unknown';
		}
		tabledata.push([
			symbol,
			feed['short_backing_symbol'],
			formatPrice(feed['price']),
			formatPrice(feed['cer']),
			formatPrice(feed['mean']) + ' (' + priceChange(myprice, feed['mean']) + ')',
			formatPrice(feed['median']) + ' (' + priceChange(myprice, feed['median']) + ')',
			formatPrice(feed['weighted']) + ' (' + priceChange(myprice, feed['weighted']) + ')',
			formatStd(feed['std']) + ' (' + feed['number'] + ')',
			formatPrice(blockchain) + ' (' + priceChange(myprice, blockchain) + ')',
			feed['mssr'],
			feed['mcr'],
			formatPrice(last) + ' (' + priceChange(myprice, last) + ')',
			age
		]);
	}

	let options = {
		drawHorizontalLine: (index, size) => {
			return index === 0 || index === 1 || index === size;
		},
		columns: {
			0: {
				alignment: 'right',
				width: 7,
				paddingLeft: 1,
				paddingRight: 1
			},
			1: {
				alignment: 'right',
				width: 7,
				paddingLeft: 1,
				paddingRight: 1
			},
			2: {
				alignment: 'right',
				width: 13,
				paddingLeft: 1,
				paddingRight: 1
			},
			3: {
				alignment: 'right',
				width: 13,
				paddingLeft: 1,
				paddingRight: 1
			},
			4: {
				alignment: 'right',
				width: 22,
				paddingLeft: 1,
				paddingRight: 1
			},
			5: {
				alignment: 'right',
				width: 22,
				paddingLeft: 1,
				paddingRight: 1
			},
			6: {
				alignment: 'right',
				width: 22,
				paddingLeft: 1,
				paddingRight: 1
			},
			7: {
				alignment: 'right',
				width: 12,
				paddingLeft: 1,
				paddingRight: 1
			},
			8: {
				alignment: 'right',
				width: 22,
				paddingLeft: 1,
				paddingRight: 1
			},
			9: {
				alignment: 'right',
				width: 5,
				paddingLeft: 1,
				paddingRight: 1
			},
			10: {
				alignment: 'right',
				width: 5,
				paddingLeft: 1,
				paddingRight: 1
			},
			11: {
				alignment: 'right',
				width: 22,
				paddingLeft: 1,
				paddingRight: 1
			},
			12: {
				alignment: 'right',
				width: 18,
				paddingLeft: 1,
				paddingRight: 1
			}
		}
	};

	let output = table(tabledata, options);
	logger.log('Pricefeed details:\r\n'+output);
}
function priceChange(newp, old) {
	if (old == 0) {
		return -1;
	} else {
		let perc = ((newp - old) / old) * 100;
		if (perc < 0) {
			return chalk.red(perc.toFixed(2) + '%');
		} else {
			return chalk.green('+' + perc.toFixed(2) + '%');
		}
	}
}
function formatStd(std) {
	return chalk.bold(Number(std).toFixed(2));
}