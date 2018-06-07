const FeedSource = require('./FeedSource.js');
const {
	Apis
} = require('bitsharesjs-ws');
const argv = require('minimist')(process.argv.slice(2));
const Logger = require('../lib/Logger.js');
let logger = new Logger(argv['d']);
const Price=require('../lib/Price.js');

class SettleGraphene extends FeedSource {
	constructor(config) {
		super(config);
		this.init();

	}
	init() {

	}
	async _fetch() {
		var feed = {};
		var self = this;

		for (var bindex = 0; bindex < self.options.bases.length; bindex++) {
			let base = self.options.bases[bindex];

			feed[base] = {};

			for (var qindex = 0; qindex < self.options.quotes.length; qindex++) {
				let quote = self.options.quotes[qindex];

				if (quote == base) {
					continue;
				}
				this.Api = await Apis.instance(self.options.url, true).init_promise.then(() => {
					logger.log('Connected to DEX: ' + self.options.url);
					return Apis.instance();
				});
				var asset = await this.Api.db_api().exec('lookup_asset_symbols', [
					[base]
				]).then((res) => {
					logger.transient('Got asset data...');
					let asset = res[0];
					return this.Api.db_api().exec('get_objects', [
						[asset.id]
					]);
				}).then((assetstats) => {
					logger.transient('Got asset statistics...');
					return assetstats[0];
				});
				if (asset['is_bitasset'] == false) {
					return;
				}
				asset['bitasset_data'] = await this.Api.db_api().exec('get_objects', [
					[asset['bitasset_data_id']]
				]).then((res) => {
					logger.transient('Got bitasset data...');
					return res[0];
				});

				var short_backing_asset = await this.Api.db_api().exec('lookup_asset_symbols', [
					[asset['bitasset_data']['options']['short_backing_asset']]
				]).then((res) => {
					logger.transient('Got backing asset data...');
					let asset = res[0];
					return this.Api.db_api().exec('get_objects', [
						[asset.id]
					]);
				}).then((assetstats) => {
					logger.transient('Got backing asset statistics...');
					return assetstats[0];
				});
				var backing_symbol = short_backing_asset['symbol'];
				if (quote!=backing_symbol) {
					logger.log('Supplied quote symbol does not match backing asset!');
					continue;
				}
				
				asset['short_backing_asset'] = short_backing_asset;
				var settlement_price=asset['bitasset_data']['current_feed']['settlement_price'];
				settlement_price.quote.precision=asset['short_backing_asset']['precision'];
				settlement_price.base.precision=asset['precision'];
				var quotesettlement_price=new Price(settlement_price).Float();
				
				feed[base][quote] = {
					'price': quotesettlement_price,
					'volume': 1.0
				};
			
			}
		}

		return feed;
	}
}
module.exports = SettleGraphene;