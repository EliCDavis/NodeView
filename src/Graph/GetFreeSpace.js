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

var GetCanvasSize = require('../Util/GetCanvasSize');
var GetNodeCenter = require('./GetNodeCenter');

/**
 * Returns x and y coordinates that are atleast as far away as the radius
 * from all other nodes on the graph.
 * 
 * @param {Number} radius how much space you'd like between all the points
 * @returns {Array} [x, y] in graph (not canvas) coordinates
 */
module.exports = function GetFreeSpace(radius, graph) {

    var nodes = graph.getNodes();

    if (nodes.length === 0) {
        var graphSize = GetCanvasSize(graph);
        var centerPos = [graphSize[0] / 2, graphSize[1] / 2];
        return [centerPos[0] * (1 / graph.getScale()),
            centerPos[1] * (1 / graph.getScale())];
    }

    var averageCenter = GetNodeCenter(nodes);

    // Generate a grid extending out from center with cells 1/4 size of radius
    var stepSize = radius / 4;
    var curStep = 0;

    while (curStep < 10000) { // Dear god what am I doing.

        // Conceptually we're extending outwards in a grid fasion
        // until we find a free grid space from the center
        //       _ _ _ _ _   _
        //      |_|_|_|_|_| 4 |
        //    4 |_|     |_| 3 |__ Size of wall is 4
        //    3 |_|  X  |_| 2 |   For a 5x5 grid.
        //    2 |_|_ _ _|_| 1_|
        //    1 |_|_|_|_|_|
        //         1 2 3 4
        var sizeOfWall = (curStep * 2);
        if (curStep === 0) {
            sizeOfWall = 1;
        }

        // Create the sides of the wall
        var leftSide = [];
        var rightSide = [];
        var bottomSide = [];
        var topSide = [];

        // Get the offset from the center
        var offset = (curStep + .5) * stepSize;

        // Get the different starting positions due to offset
        // (Four corners of square)
        var bottomLeft = [averageCenter[0] - offset, averageCenter[1] - offset];
        var bottomRight = [averageCenter[0] + offset, averageCenter[1] - offset];
        var topLeft = [averageCenter[0] - offset, averageCenter[1] + offset];
        var topRight = [averageCenter[0] + offset, averageCenter[1] + offset];

        // Add all the potential spaces
        for (var i = 0; i < sizeOfWall; i++) {
            leftSide.push([bottomLeft[0], bottomLeft[1] + (stepSize * i)]);
            rightSide.push([topRight[0], topRight[1] - (stepSize * i)]);
            bottomSide.push([bottomRight[0] - (stepSize * i), bottomRight[1]]);
            topSide.push([topLeft[0] + (stepSize * i), topLeft[1]]);
        }

        var potentialSpaces = leftSide
                .concat(rightSide)
                .concat(bottomSide)
                .concat(topSide);

        for (var i = 0; i < potentialSpaces.length; i++) {
            if (spaceFree(nodes, potentialSpaces[i], radius)) {
                return potentialSpaces[i];
            }
        }

        curStep++;

    }

    console.log("Failure to find place! Sorry dude.");

    return [0, 0];

};

// TODO: Optimize
function spaceFree(nodes, p, radius) {

    for (var i = 0; i < nodes.length; i++) {
        var np = nodes[i].getPosition();

        var distance = Math.sqrt(Math.pow(np[0] - p[0], 2) +
                Math.pow(np[1] - p[1], 2));

        if (distance < radius) {
            return false;
        }
    }

    return true;

}
