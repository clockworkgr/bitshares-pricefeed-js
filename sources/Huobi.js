const FeedSource = require('./FeedSource.js');
const request = require('request-promise-native');

class Huobi extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {

    }
    find(tickers,base,quote) {
        for(let i=0;i<tickers.length;i++){
            let ticker=tickers[i];
            if (ticker.symbol==quote.toLowerCase()+''+base.toLowerCase()) {
                return ticker;
            }
        }
        return null;
    }
    async _fetch() {
        var feed = {};
        var self = this;
        var url = 'https://api.huobi.pro/market/tickers';
        var result = await request(url);
        result = JSON.parse(result);

        for (var bindex = 0; bindex < self.options.bases.length; bindex++) {
            let base = self.options.bases[bindex];

            feed[base] = {};

            for (var qindex = 0; qindex < self.options.quotes.length; qindex++) {
                let quote = self.options.quotes[qindex];

                if (quote == base) {
                    continue;
                }
                
                let  found=self.find(result.data,base,quote);
                if (found!==null) {
                    if ((self.options.quoteNames != undefined) && (self.options.quoteNames[quote] != undefined)) {
                        quote = self.options.quoteNames[quote];
                    }
                              
                    feed[base][quote] = {
                        'price': found.close,
                        'volume': found.vol/found.close
                    };
                
                }
            }
        }

        return feed;
    }
}
module.exports = Huobi;