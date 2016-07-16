/* 
 * The MIT License
 *
 * Copyright 2016 Eli Davis.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


module.exports = function DefaultNodeAttraction(node1, node2, extraData) {

    var data = extraData;
    if (data === undefined || data === null) {
        data = {};
    }

    var pos1 = node1.pos;
    var pos2 = node2.pos;
    var mass1 = node1.mass;
    var mass2 = node2.mass;

    var xDist = pos2[0] - pos1[0];
    var yDist = pos2[1] - pos1[1];
    var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

    // Yeah you know what this is.
    var masses = Math.abs(mass1 * mass2);

    // Yeah this is physics dude.
    var attraction = (masses / (dist * dist)) * 1.1;

    // If we're too close then let's reject
    if (dist < mass1 + mass2) {
        attraction *= -3.5;
    }

    if (data["$groupPos"]) {
        attraction = .05;
    }

    return attraction;

};