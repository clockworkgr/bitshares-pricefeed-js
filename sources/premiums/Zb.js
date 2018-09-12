const PremiumSource =require('./PremiumSource.js');
const request = require('request-promise-native');

class Zb extends PremiumSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {

    }
    async _fetchPremium() {
        var premium=1;        

        var url = {
            uri:'http://api.zb.com/data/v1/ticker?market=BITCNY_QC',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
            }
        };
        
        var result= await request(url);                
        result=JSON.parse(result);
        if (result['ticker']==undefined) {
            return { 'premium': premium};
        }
        return { 'premium': result['ticker']['last'] };
    }
}
module.exports=Zb;