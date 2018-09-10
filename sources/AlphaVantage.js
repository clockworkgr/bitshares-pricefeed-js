const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');

class AlphaVantage extends FeedSource {
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
                var url = 'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency='+quote.toUpperCase()+'&to_currency='+base.toUpperCase()+'&apikey='+this.options.api_key;
                var result= await request(url);
                result=JSON.parse(result);
                if((self.options.quoteNames!=undefined) && (self.options.quoteNames[quote]!=undefined)) {
                    quote=self.options.quoteNames[quote];
                }
                feed[base][quote]= {
                    'price': result['Realtime Currency Exchange Rate']['5. Exchange Rate'],
                    'volume': 1
                };
            }
        }

        return feed;
    }
}
module.exports=AlphaVantage;