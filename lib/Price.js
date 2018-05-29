function gcd_iter(a, b) {
	while (a!=b) {
		if (a > b) {
			a -= b;
		} else if (b > a) {
			b -= a;
		} else {
			break;
		}
	}
	return a;
}
function precision(a) {
	if (!isFinite(a)) return 0;
	var e = 1, p = 0;
	while (Math.round(a * e) / e !== a) { e *= 10; p++; }
	return p;
}
class Price {

	constructor(config) {
		this.base=config.base;
		this.quote=config.quote;
		this._update();
	}
	static fromFloat(price,base,quote) {
		var num,den;
		if (base.precision>quote.precision) {
			num = price * Math.pow(10,precision(price)+base.precision-quote.precision);
			den = Math.pow(10,precision(price));
		}else{
			num = price * Math.pow(10,precision(price));
			den = Math.pow(10,precision(price)+quote.precision-base.precision);
		}
		var gcd=gcd_iter(num,den);
		num=num/gcd;
		den=den/gcd;
		var newprice={};
		newprice['base']={ amount: num, asset_id: base.asset_id, precision: base.precision};
		newprice['quote']={ amount: den, asset_id: quote.asset_id, precision: quote.precision};
		return new Price(newprice);
	}
	static fromFloatOld(price,base,quote) {
		var num,den;
		if (base.precision>quote.precision) {
			num = price * Math.pow(10,precision(price)+base.precision-quote.precision);
			den = Math.pow(10,precision(price));
		}else{
			num = price * Math.pow(10,precision(price));
			den = Math.pow(10,precision(price)+quote.precision-base.precision);
		}
		var newprice={};
		newprice['base']={ amount: num, asset_id: base.asset_id, precision: base.precision};
		newprice['quote']={ amount: den, asset_id: quote.asset_id, precision: quote.precision};
		return new Price(newprice);
	}
	_update() {
		if (this.quote.amount>0) {
			this.price=(this.base.amount*1.0 *Math.pow(10,this.quote.precision))/(this.quote.amount*Math.pow(10,this.base.precision));
		}else{
			this.price=Infinity;
		}
	}
	copy() {
		let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), JSON.parse(JSON.stringify(this)));
		return clone;
	}
	symbols() {
		return [this.base.asset_id,this.quote.asset_id];
	}
	as_base(base_asset_id) {
		if (base_asset_id==this.base.asset_id) {
			return this.copy();
		}else if (base_asset_id==this.quote.asset_id){
			return this.copy().invert();
		}
	}
	as_quote(quote_asset_id) {
		if (quote_asset_id==this.quote.asset_id) {
			return this.copy();
		}else if (quote_asset_id==this.base.asset_id){
			return this.copy().invert();
		}
	}
	invert() {
		var tmp =this.quote;
		this.quote=this.base;
		this.base=tmp;
		this._update();

	}
	Float() {
		return this.price;
	}
	Multiply(other) {
		var a=this.copy();
		if (other instanceof Price) {
			if ((other.symbols().indexOf(this.base.asset_id)==-1) && (other.symbols().indexOf(this.quote.asset_id)==-1)) {
				throw('Invalid Asset');
			}
			if (this.quote.asset_id==other.base.asset_id) {
				a.base={amount: 1.0*this.base.amount*other.base.amount, asset_id: this.base.asset_id, precision: this.base.precision};
				a.quote={amount: 1.0*this.quote.amount*other.quote.amount, asset_id: other.quote.asset_id, precision: other.quote.precision};

			}else if (this.base.asset_id==other.quote.asset_id) {
				a.base={amount: 1.0*this.base.amount*other.base.amount, asset_id: other.base.asset_id, precision: other.base.precision};
				a.quote={amount: 1.0*this.quote.amount*other.quote.amount, asset_id: this.quote.asset_id, precision: this.quote.precision};
			}else{
				throw('Wrong Rotation');
			}
		}else if (other instanceof Object) {
			if (other.asset_id==this.quote.asset_id) {
				a = Object.assign(Object.create(Object.getPrototypeOf(other)), other);
				a.amount=a.amount*this.Float();
				a.asset_id=this.base.asset_id;
			}
		}else{
			a.base.amount = a.base.amount * Math.round(other * Math.pow(10, precision(other)));
			a.quote.amount=a.quote.amount*Math.pow(10,precision(other));
		}
		a._update();
		return a;
	}
	Divide(other) {
		var a=this.copy();
		if (other instanceof Price) {
			if (other.symbols().sort()==this.symbols.sort()) {
				return this.as_base(this.base.asset_id).Float()/other.as_base(this.base.asset_id).Float();
			}else if(other.symbols().indexOf(this.quote.asset_id)!=-1) {
				other=other.as_base(this.quote.asset_id);
			}else if(other.symbols().indexOf(this.base.asset_id)!=-1) {
				other=other.as_base(this.base.asset_id);
			}else{
				throw('Invalid asset');
			}
			a.base={amount: 1.0*this.quote.amount/other.quote.amount, asset_id: other.quote.asset_id};
			a.quote={amount: 1.0*this.base.amount/other.base.amount, asset_id: this.quote.asset_id};
		}else if (other instanceof Object) {
			if (other.asset_id==this.quote.asset_id) {
				a = Object.assign(Object.create(Object.getPrototypeOf(other)), other);
				a.amount=1.0*a.amount/this.Float();
				a.asset_id=this.base.asset_id;
			}
		}else{
			a.base.amount=1.0*a.base.amount/other;
		}
		a._update();
		return a;
	}

}
module.exports=Price;