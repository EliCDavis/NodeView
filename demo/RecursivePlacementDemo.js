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


(function () {

    if (localStorage["demo"] !== 'recursive') {
        return;
    }

    document.getElementById("demo-specific-html").innerHTML = "If all the nodes \
        you added are children of others we can add nodes as a batch to be mass placed";

    var graph = new Graph2D(document.getElementById("cv"));

    document.getElementById("page-title").style.color = "rgb(233, 30, 99)";
    document.getElementById("page-subtitle").style.color = "rgb(233, 30, 99)";

    graph.setBackgroundRenderMethod(function (graph) {

        var ctx = graph.getContext();
        ctx.fillStyle = "rgb(238, 238, 238)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    });


    graph.setOption('applyGravity', false);
    graph.setOption('centerOnNodes', false);


    var parent = graph.createNode({
        renderData: {
            name: "Parent",
            color: "rgb(134, 15, 164)"
        },
        radius: 30
    });

    for (var i = 0; i < 8; i++) {
        var child = graph.createNode({
            renderData: {
                name: "Child",
                color: "rgb(249, 101, 213)"
            },
            radius: 30 + (i * 10)
        });

        graph.linkNodes(parent, child, {
            $directedTowards: child
        });

        if (i % 2 == 0) {
            graph.disableNode(child)
        }

    }

})();