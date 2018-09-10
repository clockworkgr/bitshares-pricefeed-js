const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');

class Coindesk extends FeedSource {
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
                if (quote!='BTC') {
                    continue;
                }
                var url = 'https://api.coindesk.com/v1/bpi/currentprice/'+base.toUpperCase()+'.json';
                var result= await request(url);
                result=JSON.parse(result);
                if((self.options.quoteNames!=undefined) && (self.options.quoteNames[quote]!=undefined)) {
                    quote=self.options.quoteNames[quote];
                }
                feed[base][quote]= {
                    'price': result.bpi['base'].rate_float,
                    'volume': 1
                };
            }
        }

        return feed;
    }
}
module.exports=Coindesk;