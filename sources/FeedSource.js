
const fs  = require('fs-extra');
const path = require('path');
const os=require('os');
class FeedSource {    
    constructor(config) {
        this.options={
            scaleVolumeBy: 1.0,
            enable: true,
            allowFailure: true,
            timeout: 5,
            quotes: [],
            bases: []
        };
        this.options=Object.assign(this.options,config);
        
    }
    
    async fetch() {
        try {
            var feed = await this._fetch();
            
            this.updateCache(feed)
            return feed;
        }catch(e){
            console.error(this.__proto__.constructor.name+': Could not load live data. Trying to recover from cache.\n'+e);            
            if (this.options.allowFailure!=true) {
                console.error(this.__proto__.constructor.name+': Exiting due to exchange importance.');
                process.exit(1);
            }
        }
        try {
            return this.recoverFromCache();            
        }catch(e){
            console.error('We were unable to fetch live or cached data from '+this.__proto__.constructor.name+'. Skipping.\n'+e);
        }
        
    }
    today() {
        return (new Date()).toISOString().substr(0,10);
    }
    recoverFromCache() {
        var cacheFile=this.getCacheFilename();
        console.log('this: '+cacheFile);
        try {
            return JSON.parse(fs.readFileSync(cacheFile ,'utf8'));
        }catch(e) {
            console.error('Could not open cache file: '+this.__proto__.constructor.name);
            return {};
        }
    }
    getCacheFilename() {
        
        var cachePath=path.join(os.homedir(),'bitshares-pricefeed','cache',this.__proto__.constructor.name);
        fs.ensureDirSync(cachePath);
        return path.join(cachePath,this.today()+'.json');
    }
    updateCache(feed) {
        var cacheFile=this.getCacheFilename();
        console.log('here'+ cacheFile);
        try {
            fs.writeFileSync(cacheFile ,JSON.stringify(feed));
            return true;
        }catch(e) {
            console.error('Could not write cache file: '+this.__proto__.constructor.name);
            return false;
        }
    }
}
module.exports=FeedSource;