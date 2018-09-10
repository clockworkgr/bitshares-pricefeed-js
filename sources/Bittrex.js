const FeedSource = require('./FeedSource.js');
const request = require('request-promise-native');

class Bittrex extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {

    }
    find(tickers,base,quote) {
        for(let i=0;i<tickers.length;i++){
            let ticker=tickers[i];
            if (ticker['MarketName']==base+'-'+quote) {
                return ticker;
            }
        }
        return null;
    }
    async _fetch() {
        var feed = {};
        var self = this;
        var url = 'https://bittrex.com/api/v1.1/public/getmarketsummaries';
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
                    feed[base][quote] = {
                        'price': found['Last'],
                        'volume': found['Volume']
                    };
                }
            }
        }

        return feed;
    }
}
module.exports = Bittrex;