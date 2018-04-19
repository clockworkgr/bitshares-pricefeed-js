//const binance = require('node-binance-api');
//const ba = require('bitcoinaverage');
//const oxr = require('open-exchange-rates');
const yaml = require('js-yaml');
const fs   = require('fs');
const Feed = require('./pricefeed.js');
const util = require('util');
const table =require('table').table;
const chalk = require('chalk');
const moment = require('moment');
const Price = require('./lib/Price.js');

    try {
        (async function() {
        var config = yaml.safeLoad(fs.readFileSync('./fox.yaml', 'utf8'));        
     
        var feed = new Feed(config);
        await feed.init();
        await feed.fetch();
        await feed.derive([]);
        prices = await feed.get_prices();
        printLog(prices);
        printPrices(prices);
        //console.log(util.inspect(prices,true,null));
        })();
    } catch (e) {
        console.log(e);
    }

    function formatPrice(price) {
        return chalk.yellow(Number(price).toFixed(9));
    }
    function highlightlargeDeviation(d,p) {
        perc=((d-p)/p)*100;
        if (perc<0){
            return chalk.red(perc.toFixed(2)+'%');
        }else{
            return chalk.green('+'+perc.toFixed(2)+'%');
        }
    }
    function printLog(prices) {
        var tabledata=[['base','quote','price','diff','volume','source']];
        for (var symbol in prices) {
            var backing_symbol=prices[symbol]['short_backing_symbol'];
            var data=prices[symbol]['log'];
            var price =data[symbol];
            if (price==undefined) {
                continue;
            }
            for (var didx in price[backing_symbol]) {
                var d=price[backing_symbol][didx];
                tabledata.push([symbol,backing_symbol,formatPrice(d['price']),highlightlargeDeviation(d['price'],prices[symbol]['price']),d['volume'],JSON.stringify(d['sources'])]);
            }

        }
        
        options = {
            drawHorizontalLine: (index, size) => {
                return index === 0 || index === 1 || index === size;
            },            
            columns: {
                0: {
                    alignment: 'center'
                },
                1: {
                    alignment: 'center'
                },
                2: {
                    alignment: 'right'
                },
                3: {
                    alignment: 'center'
                },
                4: {
                    alignment: 'right'
                },
                5: {
                    alignment: 'left'
                }
            }
        };
        
        output = table(tabledata, options);        
        console.log(output);
    }
    function printPrices(prices) {
        var tabledata=[['symbol','collateral','new price','cer','mean','median','wgt. avg','wgt. std(#)','blockchain','mssr','mcr','my last price','last update']];
        for (var symbol in prices) {
            var feed=prices[symbol];
            if (feed==undefined) {
                continue;
            }
            myprice=feed['price'];
            blockchain=new Price(feed['global_feed']['settlement_price']).Float();
            if (feed['current_feed']!=undefined) {
                last=new Price(feed['current_feed']['settlement_price']).Float();
                age=moment(feed['current_feed']['date']).fromNow();
            }else{
                last= -1;
                age='Unknown';
            }
            tabledata.push([
                symbol,
                feed['short_backing_symbol'],
                formatPrice(feed['price']),
                formatPrice(feed['cer']),
                formatPrice(feed['mean'])+' ('+priceChange(myprice,feed['mean'])+')',
                formatPrice(feed['median'])+' ('+priceChange(myprice,feed['median'])+')',
                formatPrice(feed['weighted'])+' ('+priceChange(myprice,feed['weighted'])+')',
                formatStd(feed['std'])+' ('+feed['number']+')',
                formatPrice(blockchain)+' ('+priceChange(myprice,blockchain)+')',
                feed['mssr'],
                feed['mcr'],
                formatPrice(last)+' ('+priceChange(myprice,last)+')',
                age
            ])
        }
        
        options = {
            drawHorizontalLine: (index, size) => {
                return index === 0 || index === 1 || index === size;
            },            
            columns: {
                0: {
                    alignment: 'center'
                },
                1: {
                    alignment: 'center'
                },
                2: {
                    alignment: 'right'
                },
                3: {
                    alignment: 'center'
                },
                4: {
                    alignment: 'right'
                },
                5: {
                    alignment: 'left'
                }
            }
        };
        
        output = table(tabledata, options);        
        console.log(output);
    }
    function priceChange(newp,old) {
        if (old==0) {
            return -1;
        }else{
            perc=((newp-old)/old)*100;
            if (perc<0){
                return chalk.red(perc.toFixed(2)+'%');
            }else{
                return chalk.green('+'+perc.toFixed(2)+'%');
            }   
        }
    }
    function formatStd(std) {
        return chalk.bold(Number(std).toFixed(2));
    }