export { Vector }

/**
 * Immutable
 */
class Vector {

    constructor(private _x: number, private _y: number) { }

    public add(otherVector: Vector): Vector {
        return new Vector(this._x + otherVector._x, this._y + otherVector._y);
    }

    public subtract(otherVector: Vector): Vector {
        return new Vector(this._x - otherVector._x, this._y - otherVector._y);
    }

    public x() {
        return this._x;
    }

    public y() {
        return this._y;
    }

    /**
     * Scale the vector's coordinates by some amount
     * @param amount what we want to multiply the vector by
     */
    public scale(amount: number): Vector {
        return new Vector(this._x * amount, this._y * amount);
    }

}