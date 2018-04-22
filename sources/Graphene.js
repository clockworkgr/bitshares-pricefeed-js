const FeedSource =require('./FeedSource.js');
const {Apis} = require("bitsharesjs-ws");
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('../lib/Logger.js');
let logger= new Logger(argv['d']);


class Graphene extends FeedSource {
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
                var result=await Apis.instance(this.options.url, true).init_promise.then((res) => {                    
                    return Apis.instance().db_api().exec( "get_ticker", [base,quote] );
                });
                if((this.options.quoteNames!=undefined) && (this.options.quoteNames[quote]!=undefined)) {
                    quote=this.options.quoteNames[quote];
                }
                if ((result['latest']>0) && (result['quote_volume']>0)) {
                    feed[base][quote]= {
                        "price": result['latest'],
                        "volume": result['quote_volume']*this.options.scaleVolumeBy
                    };
                }
            }
        }
        
        return feed;
    }
}
module.exports=Graphene;