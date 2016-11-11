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


module.exports = function (g, startPos, endPos, link) {
    var ctx = g.getContext();
    var scale = g.getScale();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3 * g.getScale();
    ctx.beginPath();
    ctx.moveTo(startPos[0], startPos[1]);
    ctx.lineTo(endPos[0], endPos[1]);
    ctx.stroke();

    var center = [(startPos[0] + endPos[0]) / 2, (startPos[1] + endPos[1]) / 2];
    var direction = null;
    if (link.linkData.$directedTowards) {
        var endPoint = link.linkData.$directedTowards.getPosition();
        var startPoint = null;
        if (link.linkData.$directedTowards.getId() === link.nodes[0].getId()) {
            startPoint = link.nodes[1].getPosition();
        } else {
            startPoint = link.nodes[0].getPosition();
        }

        direction = [endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]];

        var mag = Math.sqrt((direction[0] * direction[0]) +
                (direction[1] * direction[1]));

        direction = [direction[0] / mag, direction[1] / mag];

    }

    // Draws an arrow
    for (var i = 0; i < 7; i++) {
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(center[0] + (direction[0] * i * 10 * scale),
                center[1] + (direction[1] * i * 10 * scale),
                (16 - (i * 2)) * scale,
                0,
                2 * Math.PI);

        ctx.fill();
    }

};