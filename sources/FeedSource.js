const fs  = require('fs-extra');
const path = require('path');
const os=require('os');
const chalk = require('chalk');
const argv = require('minimist')(process.argv.slice(2));
const Logger= require('../lib/Logger.js');
let logger= new Logger(argv['d']);

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
		logger.transient(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Initialising...');
		this.options=Object.assign(this.options,config);

	}

	async fetch() {

		try {
			logger.transient(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Getting data from source...');
			var feed = await this._fetch();
			logger.transient(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Updating cache...');
			this.updateCache(feed)
			logger.verbose(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Source loaded.');
			return feed;
		}catch(e){
			logger.warning(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Could not load live data. Trying to recover from cache.');
			if (this.options.allowFailure!=true) {
				logger.warning(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Exiting due to source importance (allowFailure is false).');
				process.exit(1);
			}
		}
		try {
			let cached=this.recoverFromCache();
			logger.verbose(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Recovered from cache.');
			return cached;
		}catch(e){
			logger.warning(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Unable to fetch live or cached data. Skipping.');
		}

	}
	today() {
		return (new Date()).toISOString().substr(0,10);
	}
	recoverFromCache() {
		var cacheFile=this.getCacheFilename();
		//console.log('this: '+cacheFile);
		try {
			return JSON.parse(fs.readFileSync(cacheFile ,'utf8'));
		}catch(e) {
			logger.warning(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Could not open cache file.');
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
		//console.log('here'+ cacheFile);
		try {
			fs.writeFileSync(cacheFile ,JSON.stringify(feed));
			logger.verbose(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Cache file updated.');
			return true;
		}catch(e) {
			logger.warning(chalk.white.bold('Source: '+this.__proto__.constructor.name)+' - Could not update cache file.');
			return false;
		}
	}
}
module.exports=FeedSource;