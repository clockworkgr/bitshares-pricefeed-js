const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');

class Aex extends FeedSource {
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
				var url = 'http://api.aex.com/ticker.php?c='+quote.toLowerCase()+'&mk_type='+base.toLowerCase();
				var result= await request(url);
				result=JSON.parse(result);
				if((self.options.quoteNames!=undefined) && (self.options.quoteNames[quote]!=undefined)) {
					quote=this.options.quoteNames[quote];
				}
				feed[base][quote]= {
					'price': result['ticker']['last'],
					'volume': result['ticker']['vol']*self.options.scaleVolumeBy
				};
			}
		}

		return feed;
	}
}
module.exports=Aex;