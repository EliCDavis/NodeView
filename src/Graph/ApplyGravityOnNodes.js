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


module.exports = function (nodesToApply, attractionMethod) {

    nodesToApply.forEach(function (n) {

        // Apply acceleration to the node based on realtive position to 
        // center and other nodes.
        var totalAcceleration = [0, 0];
        nodesToApply.forEach(function (oN) {

            var gavitationData = {};

            if (n.isLinkedWith(oN)) {
                gavitationData.$linkData = n.getLinkData(oN);
            }

            var attraction = attractionMethod(
                    {
                        "pos": n.getPosition(),
                        "mass": n.getRadius(),
                        "node": n
                    },
                    {
                        "pos": oN.getPosition(),
                        "mass": oN.getRadius(),
                        "node": oN
                    },
                    gavitationData
                    );

            var pull = _getGravitationalPull(
                    n.getPosition(),
                    oN.getPosition(),
                    attraction);

            // Add to the acceleration.
            totalAcceleration[0] += pull[0];
            totalAcceleration[1] += pull[1];

        });

        var attraction = attractionMethod(
                {
                    "pos": n.getPosition(),
                    "mass": n.getRadius(),
                    "node": n
                },
                {
                    "pos": [0, 0],
                    "mass": n.getRadius() * 2,
                    "group": true
                },
                {
                    "$groupPos": true
                });

        var pull = _getGravitationalPull(
                n.getPosition(),
                [0,0],
                attraction
                );

        totalAcceleration[0] += pull[0] * 5;
        totalAcceleration[1] += pull[1] * 5;

        n.accelerate(totalAcceleration[0], totalAcceleration[1]);

    });

};

function _getGravitationalPull(pos1, pos2, attraction) {

    var xDist = pos2[0] - pos1[0];
    var yDist = pos2[1] - pos1[1];
    var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

    if (dist === 0) {
        return [0, 0];
    }

    // Get the angle so we can apply the fource properly in x and y
    var angle = Math.atan(yDist / xDist);

    // ¯\_(ツ)_/¯
    var direction = 1;
    if (xDist < 0) {
        direction = -1;
    }

    // Add to the acceleration.
    return [Math.cos(angle) * attraction * direction,
        Math.sin(angle) * attraction * direction];

}
