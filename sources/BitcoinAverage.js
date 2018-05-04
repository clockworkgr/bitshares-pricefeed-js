const FeedSource =require('./FeedSource.js');
const ba = require('bitcoinaverage');
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('../lib/Logger.js');
let logger= new Logger(argv['d']);

class BitcoinAverage extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {
        
        if ((this.options.secret_key==undefined) || (this.options.public_key==undefined)) {
            console.error(this.__proto__.constructor.name+' needs secret key and public key.');
            process.exit(1);
        }else{
            this.client= ba.restfulClient(this.options.public_key, this.options.secret_key);
        }
    }
    async _fetch() {
        var feed={};
        for (var bindex=0;bindex<this.options.bases.length;bindex++) {
            let base=this.options.bases[bindex];
            feed[base]={};
            for (var qindex=0;qindex<this.options.quotes.length;qindex++) {
                let quote=this.options.quotes[qindex];
            
                if (quote==base) {
                    continue;
                }
                var pair=quote.toUpperCase()+base.toUpperCase();
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
module.exports=BitcoinAverage;