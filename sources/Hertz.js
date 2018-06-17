const FeedSource =require('./FeedSource.js');

class Hertz extends FeedSource {
	constructor(config) {
		super(config);
		this.init();
	}
	init() {

	}
	async _fetch() {
		var feed={};

		let base = 'HERTZ';
		let quote = 'USD';
		feed[base] = {};
		let start =Math.round((new Date(Date.UTC(2015,9,14,12,0,0,38))).valueOf()/1000);
		let now = Math.round((new Date()).valueOf()/1000);

		let period = 28*24*60*60; 

		var phase=((now-start) % period)/period;

		var price = 1 + 0.14*Math.sin(phase*2*Math.PI);
		
		feed[base][quote] = {
			'price': 1/price,
			'volume': 1.0
		};

		return feed;
	}
}
module.exports=Hertz;