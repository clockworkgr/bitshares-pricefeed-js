const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('../lib/Logger.js');
let logger= new Logger(argv['d']);


class Zb extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {           
      
    }
    async _fetch() {
        var feed={};
        var self=this;

        for (var bindex=0;bindex<this.options.bases.length;bindex++) {
            let base=this.options.bases[bindex];          
            
            feed[base]={};
        
            for (var qindex=0;qindex<this.options.quotes.length;qindex++) {
                let quote=this.options.quotes[qindex];
            
                if (quote==base) {
                    continue;
                }
                var url = "http://api.zb.com/data/v1/ticker?market="+quote+"_"+base;
                var result= await request(url);                
                result=JSON.parse(result);
                if((this.options.quoteNames!=undefined) && (this.options.quoteNames[quote]!=undefined)) {
                    quote=this.options.quoteNames[quote];
                }
                feed[base][quote]= {
                    "price": result['ticker']['last'],
                    "volume": result['ticker']['vol']*this.options.scaleVolumeBy
                };
            }
        }
        
        return feed;
    }
}
module.exports=Zb;