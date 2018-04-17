const FeedSource =require('./FeedSource.js');
const request = require('request-promise-native');


class Aex extends FeedSource {
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
                var url = "http://api.aex.com/ticker.php?c="+quote.toLowerCase()+"&mk_type="+base.toLowerCase();
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
module.exports=Aex;