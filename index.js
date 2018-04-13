//const binance = require('node-binance-api');
//const ba = require('bitcoinaverage');
//const oxr = require('open-exchange-rates');
const yaml = require('js-yaml');
const fs   = require('fs');
const Feed = require('./pricefeed.js');
    try {
        (async function() {
        var config = yaml.safeLoad(fs.readFileSync('./fox.yaml', 'utf8'));        
     
        var feed = new Feed(config);
        await feed.init();
        await feed.fetch();
        await feed.derive([]);
        prices = await feed.get_prices();
        console.log(util.inspect(prices,true,null));
        })();
    } catch (e) {
        console.log(e);
    }