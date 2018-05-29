const chalk = require('chalk');

function lpad(str, padString, length) {
	while (str.toString().length < length) {
		str = padString + ''+str;
	}
	return str;
}

class Logger {

	constructor(log_level) {
		this.log_level=log_level;
	}
	/*
	Logging Levels
	0: Minimum - Explicit logging & Errors
	1: Info - 0 + Basic logging
	2: Verbose - 1 + Verbose logging
	3: Transient - 2 + Transient messages
	*/
	timestamp() {

		let date=new Date();
		var month = '' + (date.getMonth() + 1),
			day = '' + date.getDate(),
			year = date.getFullYear();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;
		var offset;
		if (date.getTimezoneOffset()<0) {
			offset ='+'+(0-date.getTimezoneOffset())/60;
		}else{
			if (date.getTimezoneOffset()>0) {
				offset ='+'+date.getTimezoneOffset()/60;
			}
		}
		return [year, month, day].join('-')+' '+lpad(date.getHours(),'0',2)+ ':' + lpad(date.getMinutes(),'0',2) + ':' + lpad(date.getSeconds(),'0',2)+' GMT'+ offset;
	}
	log(msg) {
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(chalk.white(this.timestamp())+' - '+chalk.magenta('[LOG]')+' '+msg+'\n');
	}
	info(msg) {
		if (this.log_level>0) {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(chalk.white(this.timestamp())+' - '+chalk.cyan('[INFO]')+' '+msg+'\n');
		}
	}
	warning(msg) {
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(chalk.white(this.timestamp())+' - '+chalk.yellow('[WARNING]')+' '+msg+'\n');
	}
	error(msg) {
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(chalk.white(this.timestamp())+' - '+chalk.red('[ERROR]')+' '+msg+'\n');
	}
	verbose(msg) {
		if (this.log_level>1) {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(chalk.white(this.timestamp())+' - '+chalk.blue('[VERBOSE]')+' '+msg+'\n');
		}
	}
	transient(msg) {
		if (this.log_level>2) {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(chalk.white(msg));
		}
	}

}
module.exports=Logger;