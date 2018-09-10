const FeedSource = require('./FeedSource.js');
const request = require('request-promise-native');

class Cointiger extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {

    }
    async _fetch() {
        var feed = {};
        var self = this;
        var url = 'https://www.cointiger.com/exchange/api/public/market/detail';
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
                
                let  found=result[''+quote+base];
                if (found!==undefined) {
                    if ((self.options.quoteNames != undefined) && (self.options.quoteNames[quote] != undefined)) {
                        quote = self.options.quoteNames[quote];
                    }
                    
                    feed[base][quote] = {
                        'price': parseFloat(found['last']),
                        'volume': parseFloat(found['baseVolume'])
                    };
                    
                }else{
                    found=result[''+base+quote];
                    if (found!==undefined) {
                        if ((self.options.quoteNames != undefined) && (self.options.quoteNames[quote] != undefined)) {
                            quote = self.options.quoteNames[quote];
                        }
                        
                        feed[base][quote] = {
                            'price': 1/parseFloat(found['last']),
                            'volume': parseFloat(found['quoteVolume'])
                        };
                        
                    }
                }
            }
        }

        return feed;
    }
}
module.exports = Cointiger;