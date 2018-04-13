const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');

class OpenExchangeRates extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {
        
        if ((this.options.api_key==undefined) || (this.options.free_subscription===undefined)) {
            console.error(this.__proto__.constructor.name+' requires "api_key" and "free_subscription"');
            process.exit(1);
        }

    }
    async _fetch() {
        var feed={};
        
        for (var bindex=0;bindex<this.options.bases.length;bindex++) {
            let base=this.options.bases[bindex];
            var url = "https://openexchangerates.org/api/latest.json?app_id="+this.options.api_key+"&base="+base;
            var result;
            if (this.options.free_subscription) {
                if (base=='USD') {
                    result = await request(url);                    
                }else{
                    continue;
                }
            }else{
                result = await request(url);
            }
            result=JSON.parse(result);
            
            if (result.base==base){                
                feed[base]={};
            
                for (var qindex=0;qindex<this.options.quotes.length;qindex++) {
                    let quote=this.options.quotes[qindex];
                
                    if (quote==base) {
                        continue;
                    }
                    
                    if((this.options.quoteNames!=undefined) && (this.options.quoteNames[quote]!=undefined)) {
                        quote=this.options.quoteNames[quote];
                    }
                    feed[base][quote]= {
                        "price": 1.0/result['rates'][quote],
                        "volume": 1.0
                    };
                }
            }else{
                throw('Error fetching from URL');
            }
        }
        
        return feed;
    }
}
module.exports=OpenExchangeRates;