const FeedSource =require('./FeedSource.js');
const request = require('request');
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('../lib/Logger.js');
let logger= new Logger(argv['d']);

class aex extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {
        
    }
    async _fetch() {
        var feed={};
        var url = "http://api.aex.com/ticker.php"
        for (var bindex=0;bindex<this.options.bases.length;bindex++) {
            let base=this.options.bases[bindex];
            feed[base]={};
            for (var qindex=0;qindex<this.options.quotes.length;qindex++) {
                let quote=this.options.quotes[qindex];
            
                if (quote==base) {
                    continue;
                }
                var params={'c': quote.toLowerCase(), 'mk_type': base.toLowerCase()};                
                var self=this;
                let promise= new Promise(function(resolve,reject){
                    
                    self.client.tickerGlobalPerSymbol(pair, function(response) {
                        
                        resolve(response);
                    }, function(error){
                        
                        reject(error);
                    });
                });
                var result=await promise;
                if((this.options.quoteNames!=undefined) && (this.options.quoteNames[quote]!=undefined)) {
                    quote=this.options.quoteNames[quote];
                }
                feed[base][quote]= {
                    "price": JSON.parse(result).last,
                    "volume": JSON.parse(result).volume,
                };
            }
        }
        
        return feed;
    }
}
module.exports=aex;