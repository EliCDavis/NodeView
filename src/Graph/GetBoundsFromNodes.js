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

module.exports = function (nodes) {

    var curBounds = [null, null, null, null];

    nodes.forEach(function (node) {
        curBounds = _extendBoundsForNode(node, curBounds);
    });

    return curBounds;

};


var _nodeFitsInBounds = function (node, bounds) {

    for (var i = 0; i < bounds.length; i++) {
        if (bounds[i] === null) {
            return false;
        }
    }

    var xPos = node.getPosition()[0];
    var yPos = node.getPosition()[1];
    var r = node.getRadius();

    if (bounds[0] > xPos - r) {
        return false;
    }

    if (bounds[0] + bounds[2] < xPos + r) {
        return false;
    }

    if (bounds[1] > yPos - r) {
        return false;
    }

    if (bounds[1] + bounds[3] < yPos + r) {
        return false;
    }

    return true;

};


var _extendBoundsForNode = function (node, bounds) {

    if (_nodeFitsInBounds(node, bounds)) {
        return bounds;
    }

    for (var i = 0; i < bounds.length; i++) {
        if (bounds[i] === null) {
            var r = node.getRadius();
            return [
                node.getPosition()[0] - (r / 2),
                node.getPosition()[1] - (r / 2),
                r,
                r
            ];
        }
    }

    var xPos = node.getPosition()[0];
    var yPos = node.getPosition()[1];
    var r = node.getRadius();

    if (bounds[0] > xPos - r) {
        var newBound = xPos - r;
        bounds[2] += Math.abs(bounds[0] - newBound);
        bounds[0] = newBound;
    }

    if (bounds[0] + bounds[2] < xPos + r) {
        bounds[2] = xPos + r - bounds[0];
    }

    if (bounds[1] > yPos - r) {
        bounds[3] += Math.abs(yPos - r - bounds[1]);
        bounds[1] = yPos - r;
    }

    if (bounds[1] + bounds[3] < yPos + r) {
        bounds[3] = yPos + r - bounds[1];
    }

    return bounds;
};

