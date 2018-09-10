const FeedSource =require('./FeedSource.js');

class Hero extends FeedSource {
    constructor(config) {
        super(config);
        this.init();
    }
    init() {

    }
    async _fetch() {
        var feed={};

        let base = 'HERO';
        let quote = 'USD';
        feed[base] = {};
        let now = new Date();
        let bofr = new Date('1913-12-23');
        let dd = Math.abs(now.getTime() - bofr.getTime()) / (1000 * 3600 * 24);
        let price = Math.pow(1.05, (dd / 365.425));
        feed[base][quote] = {
            'price': 1/price,
            'volume': 1.0
        };

        return feed;
    }
}
module.exports=Hero;