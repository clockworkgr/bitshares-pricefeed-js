const FeedSource =require('./FeedSource.js');
const {Apis} = require('bitsharesjs-ws');
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('../lib/Logger.js');
let logger= new Logger(argv['d']);


class Graphene extends FeedSource {
	constructor(config) {
		super(config);
		this.init();

	}
	init() {

	}
	async _fetch() {
		var feed={};
		var self=this;

		for (var bindex=0;bindex<self.options.bases.length;bindex++) {
			let base=self.options.bases[bindex];

			feed[base]={};

			for (var qindex=0;qindex<self.options.quotes.length;qindex++) {
				let quote=self.options.quotes[qindex];

				if (quote==base) {
					continue;
				}
				var result = await Apis.instance(self.options.url, true).init_promise.then(() => {
					logger.log('Connected to DEX: '+self.options.url);
					return Apis.instance().db_api().exec( 'get_ticker', [base,quote] );
				});
				if((self.options.quoteNames!=undefined) && (self.options.quoteNames[quote]!=undefined)) {
					quote=self.options.quoteNames[quote];
				}
				if ((result['latest']>0) && (result['quote_volume']>0)) {
					feed[base][quote]= {
						'price': result['latest'],
						'volume': result['quote_volume']*self.options.scaleVolumeBy
					};
				}
			}
		}

		return feed;
	}
}
module.exports=Graphene;