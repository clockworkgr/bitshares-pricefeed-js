const FeedSource = require('./FeedSource.js');
const request = require('request-promise-native');

class BigOne extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {

    }
    find(tickers,base,quote) {
        for(let i=0;i<tickers.length;i++){
            let ticker=tickers[i];
            if (ticker.market_id==base+'-'+quote) {
                return ticker;
            }
        }
        return null;
    }
    async _fetch() {
        var feed = {};
        var self = this;
        var url = 'https://big.one/api/v2/tickers';
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
                
                let  found=self.find(result,base,quote);
                if (found!==null) {
                    if ((self.options.quoteNames != undefined) && (self.options.quoteNames[quote] != undefined)) {
                        quote = self.options.quoteNames[quote];
                    }
                    
                    if (found.volume===null) {                        
                        feed[base][quote] = {
                            'price': (found.bid.price+found.ask.price)/2,
                            'volume': 0
                        };
                    }else{                      
                        feed[base][quote] = {
                            'price': (found.bid.price+found.ask.price)/2,
                            'volume': found.volume
                        };
                    }
                }
            }
        }

        return feed;
    }
}
module.exports = BigOne;