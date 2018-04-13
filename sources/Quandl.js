const FeedSource =require('./FeedSource.js');
const  QuandlAPI = require("quandl");

class Quandl extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {
           
        if (this.options.api_key==undefined) {
            console.error(this.__proto__.constructor.name+' requires "api_key"');
            process.exit(1);
        }
        this.quandl=new QuandlAPI({
            auth_token: this.options.api_key,
            api_version: 3
        });
    }
    async _fetch() {
        var feed={};
        var self=this;
        for(var market in this.options.datasets) {
            let symbols=market.split(':');
            var quote=symbols[0];
            var base=symbols[1];
            if (feed[base]===undefined){
                feed[base]={};
            }
            var prices=[];
            for(var i=0;i<this.options.datasets[market].length;i++) {
                var qcode=this.options.datasets[market][i].split('/');
                let promise= new Promise(function(resolve,reject){
                    self.quandl.dataset({source: qcode[0], table: qcode[1]},{rows:1}, function(err, response){
                        if(err) {
                            reject(err);
                        }else{
                            resolve(response);
                        }
                    });
                });
                var result=await promise;
                result=JSON.parse(result);
                feed[base][quote]={price: result.dataset.data[0][1],volume: 1.0};                
            }
        }       
        
        return feed;
    }
}
module.exports=Quandl;