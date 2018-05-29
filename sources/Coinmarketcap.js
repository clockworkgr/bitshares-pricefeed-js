const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');

class Coinmarketcap extends FeedSource {
	constructor(config) {
		super(config);
		this.init();
	}
	init() {

	}
	async _fetch() {
		var feed={};
		var self=this;

		var url = 'https://api.coinmarketcap.com/v1/ticker/';
		var result= await request(url);
		result=JSON.parse(result);
		for(var aidx in result) {
			var asset=result[aidx];
			for (var qindex=0;qindex<self.options.quotes.length;qindex++) {
				let quote=self.options.quotes[qindex];
				if (asset['symbol']==quote) {
					feed['BTC'] = {};
					feed['USD'] = {};
					feed['BTC'][quote]={
						'price': asset['price_btc'],
						'volume': (asset['24h_volume_usd']/asset['price_btc'])*self.options.scaleVolumeBy
					};
					feed['USD'][quote]={
						'price': asset['price_usd'],
						'volume': asset['24h_volume_usd']*self.options.scaleVolumeBy
					};
				}
			}
		}

		return feed;
	}
}
module.exports=Coinmarketcap;