// TODO : Helper price class to keep price in base:amount/quote:amount format . implement Add() Multiply() etc. methods since JS doesn't allow op overloading. toString() -> float representation

class Price {

    constructor(config) {
       this.base=config.base;
       this.quote=config.quote;
       this._upodate();
    }
    _upodate() {
        if (this.quote.amount>0) {
        this.price=this.base.amount*1.0/this.quote.amount;
        }else{
            this.price=Infinity;
        }
    }
    copy() {
        let clone = Object.assign( Object.create( Object.getPrototypeOf(this)), this)
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
    toJSON() {
        return { base: this.base, quote: this.quote};
    }
    invert() {
        var tmp =this.quote;
        this.quote=this.base;
        this.base=tmp;
        this._update();
        delete(tmp);
    }
    Float() {
        return this.price();
    }
    Multiply(other) {
        var a=this.copy();
        if (other instanceof Price) {
            if ((other.symbols().indexOf(this.base.asset_id)==-1) && (other.symbols().indexOf(this.quote.asset_id)==-1)) {
                throw('Invalid Asset');
            }
            if (this.quote.asset_id==other.base.asset_id) {
                a.base={amount: 1.0*this.base.amount*other.base.amount, asset_id: this.base.asset_id};
                a.quote={amount: 1.0*this.quote.amount*other.quote.amount, asset_id: other.quote.asset_id};
                a.update();
            }else if (this.base.asset_id==other.quote.asset_id) {
                a.base={amount: 1.0*this.base.amount*other.base.amount, asset_id: other.base.asset_id};
                a.quote={amount: 1.0*this.quote.amount*other.quote.amount, asset_id: this.quote.asset_id};
                a.update();         
            }else{
                throw('Wrong Rotation');
            }
        }else if (other instanceof Object) {
            if (other.asset_id==this.quote.asset_id) {
                a = Object.assign( Object.create( Object.getPrototypeOf(other)), other)
                a.amount=a.amount*this.Float();
                a.asset_id=this.base.asset_id;
            }
        }else{
            a.base.amount=a.base.amount*other;
        }
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
            a.update();
        }else if (other instanceof Object) {
            if (other.asset_id==this.quote.asset_id) {
                a = Object.assign( Object.create( Object.getPrototypeOf(other)), other)
                a.amount=1.0*a.amount/this.Float();
                a.asset_id=this.base.asset_id;
            }
        }else{
            a.base.amount=1.0*a.base.amount/other;
        }
        return a;
    }
    
}
module.exports=Price;