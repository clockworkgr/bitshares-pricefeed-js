const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');

class Fixer extends FeedSource {
	constructor(config) {
		super(config);
		this.init();
	}
	init() {

	}
	async _fetch() {
		var feed={};

		for (var bindex=0;bindex<this.options.bases.length;bindex++) {
			let base=this.options.bases[bindex];
			feed[base]={};
			var url = 'http://api.fixer.io/latest?base='+base;
			var result = await request(url);
			result=JSON.parse(result);
			for (var qindex=0;qindex<this.options.quotes.length;qindex++) {
				let quote=this.options.quotes[qindex];

				if (quote==base) {
					continue;
				}
				var quoteNew;
				if((this.options.quoteNames!=undefined) && (this.options.quoteNames[quote]!=undefined)) {
					quoteNew=this.options.quoteNames[quote];
				}else{
					quoteNew = quote;
				}
				feed[base][quoteNew]= {
					'price': 1.0/result['rates'][quote],
					'volume': 1.0
				};
			}
		}

		return feed;
	}
}
module.exports=Fixer;