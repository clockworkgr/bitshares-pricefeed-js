const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');

class Okcoin extends FeedSource {
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
                if (base!='USD' && base!='CNY') {
                    continue;
                }
                var url;
                if (base=='USD') {
                    url = 'https://www.okcoin.com/api/v1/ticker.do?symbol='+quote.toLowerCase()+'_'+base.toLowerCase();
                }
                if (base=='CNY') {
                    url = 'https://www.okcoin.cn/api/ticker.do?symbol='+quote.toLowerCase()+'_'+base.toLowerCase();
                }
                var result= await request(url);
                result=JSON.parse(result);
                if((self.options.quoteNames!=undefined) && (self.options.quoteNames[quote]!=undefined)) {
                    quote=self.options.quoteNames[quote];
                }
                feed[base][quote]= {
                    'price': result['ticker']['last'],
                    'volume': result['ticker']['vol']
                };
            }
        }

        return feed;
    }
}
module.exports=Okcoin;