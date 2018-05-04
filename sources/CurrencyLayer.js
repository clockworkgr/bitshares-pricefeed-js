const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('../lib/Logger.js');
let logger= new Logger(argv['d']);

class CurrencyLayer extends FeedSource {
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
            var url = "http://apilayer.net/api/live?access_key="+this.options.api_key+"&currencies="+this.options.quotes.join()+"&source="+base+"&format=1";
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
            
            if (result.source==base){                
                feed[base]={};
            
                for (var qindex=0;qindex<this.options.quotes.length;qindex++) {
                    let quote=this.options.quotes[qindex];
                
                    if (quote==base) {
                        continue;
                    }
                    var quoteNew;
                    if((this.options.quoteNames!=undefined) && (this.options.quoteNames[quote]!=undefined)) {
                        quoteNew=this.options.quoteNames[quote];
                    }else{
                        quoteNew=quote   
                    }
                    feed[base][quoteNew]= {
                        "price": 1.0/result['quotes'][base+quote],
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
module.exports=CurrencyLayer;