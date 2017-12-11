export { Vector }

/**
 * Immutable
 */
class Vector {

    constructor(private _x: number, private _y: number)
    { }

    public add(otherVector: Vector): Vector {
        return new Vector(this.x + otherVector.x, this.y + otherVector.y);
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

}