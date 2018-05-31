const FeedSource =require('./FeedSource.js');

class Testnet extends FeedSource {
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
		
				let now = new Date();	
				let h=now.getMinutes();
				let p = Math.sin(h/12);
				let price =1+ (0.10*p);
				feed[base][quote] = {
					'price': price,
					'volume': 1.0
				};
			}
		}

		return feed;
	}
}
module.exports=Testnet;