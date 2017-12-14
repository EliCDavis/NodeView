export { Vector }

/**
 * Immutable
 */
class Vector {

    constructor(private _x: number, private _y: number)
    { }

    public add(otherVector: Vector): Vector {
        return new Vector(this._x + otherVector._x, this._y + otherVector._y);
    }

    public x(){
        return this._x;
    }

    public y(){
        return this._y;
    }

}