const PremiumSource =require('./PremiumSource.js');
const {Apis} = require('bitsharesjs-ws');
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('../lib/Logger.js');
let logger= new Logger(argv['d']);


class Bitshares extends PremiumSource {
    constructor(config) {
        super(config);
        this.init();

    }
    init() {

    }
    async _fetchPremium() {
        var premium=1;
        var self=this;
        
        var result = await Apis.instance(self.options.url, true).init_promise.then(() => {
            logger.log('Connected to DEX: '+self.options.url);
            return Apis.instance().db_api().exec( 'get_ticker', [base,quote] );
        });

        if ((result['latest']>0) && (result['quote_volume']>0)) {
            return { 'premium': result['latest'] };
        }else{
            return { 'premium': premium };
        }
    }
}
module.exports=Bitshares;