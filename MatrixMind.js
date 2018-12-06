export class MatrixMind {

    constructor () {
	   this.identity();
    };
    
    translate (x, y) {
        this._tx += x * this._a + y * this._c;
        this._ty += x * this._b + y * this._d;
        return this;
    };   

    scale( sx, sy ) {        
        this._a *= sx;
        this._b *= sx;
        this._c *= sy;
        this._d *= sy;
        return this;
    };

    rotate(angle, x = 0, y = 0 ) {
        angle = 360 - angle;
        angle *= Math.PI / 180;
        let cos = Math.cos(angle),
            sin = Math.sin(angle),
            tx = x - x * cos + y * sin,
            ty = y - x * sin - y * cos,
            a = this._a,
            b = this._b,
            c = this._c,
            d = this._d;
        this._a = cos * a + sin * c;
        this._b = cos * b + sin * d;
        this._c = -sin * a + cos * c;
        this._d = -sin * b + cos * d;
        this._tx += tx * a + ty * c;
        this._ty += tx * b + ty * d;
        return this;
    };

    identity () {
        this._a = 1;
        this._b = 0;
        this._c = 0;
        this._d = 1;
        this._tx = 0;
        this._ty = 0;
    }

    transformPoint(p) {
        return {x: p.x * this._a + p.y * this._c + this._tx, y: p.x * this._b + p.y * this._d + this._ty }
    };
}