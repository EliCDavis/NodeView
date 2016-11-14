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


module.exports = function (node, nodeCanvasPos, graph) {

    var mainColor = node.getRenderData()["color"];

    if(!mainColor){
        mainColor = "rgb(197, 23, 23)";
    }

    var ctx = graph.getContext();
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(nodeCanvasPos[0],
            nodeCanvasPos[1],
            node.getRadius() * graph.getScale() * 0.8,
            0,
            2 * Math.PI);
    ctx.fill();

    if (node.getRenderData()['$mouseOver']) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(nodeCanvasPos[0],
                nodeCanvasPos[1],
                node.getRadius() * graph.getScale() * 0.8 * 0.5,
                0,
                2 * Math.PI);
        ctx.fill();
    }

    if (node.getRenderData()['$beingDragged']) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(nodeCanvasPos[0],
                nodeCanvasPos[1],
                node.getRadius() * graph.getScale() * 0.8 * 0.3,
                0,
                2 * Math.PI);
        ctx.fill();
    }

    if (node.getRenderData().$mouseOver || node.getRenderData().$neighborMouseOver) {

        // Make sure the mouse over box is always on top of everything.
        graph.postRender(function () {

            ctx.font = "16px Monospace";
            var textDimensions = ctx.measureText(node.getRenderData()["name"]);

            // Draw a rectangle for text.
            ctx.fillStyle = mainColor;
            ctx.lineWidth = 2;
            ctx.fillRect(nodeCanvasPos[0] - 70 - textDimensions.width,
                    nodeCanvasPos[1] - 95 - 20,
                    textDimensions.width + 40, 40);

            // Draw a line coming from the node to the rectangle
            ctx.strokeStyle = mainColor;
            ctx.beginPath();
            ctx.moveTo(nodeCanvasPos[0], nodeCanvasPos[1]);
            ctx.lineTo(nodeCanvasPos[0], nodeCanvasPos[1] - 95);
            ctx.lineTo(nodeCanvasPos[0] - 50, nodeCanvasPos[1] - 95);
            ctx.stroke();

            // display the text
            ctx.fillStyle = "black";
            ctx.fillText(node.getRenderData()["name"], nodeCanvasPos[0] - 50 - textDimensions.width, nodeCanvasPos[1] - 95);

        });
    }

};
