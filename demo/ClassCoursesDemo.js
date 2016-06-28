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

    if(localStorage["demo"] !== 'se' && localStorage["demo"]){
        return;
    }

     document.getElementById("demo-specific-html").innerHTML = "The nodes in this\
        demo represent the different CSE related courses that software engineers\
        must take to complete their undergrad.  Green nodes are courses I have\
        completed.  Yellow ones are those I can take, and red are courses that I\
        don't lack the prequisites to take.  You can look at the data I used to\
        generate theses nodes <a href='/SECourses.js'>here</a>.  Classes with more\
        hours are larger, and those with labs have their size multiplied by a constant\
        to become even larger.";

    // http://reactivex.io/learnrx/
    Array.prototype.map = function (projectionFunction) {
        var results = [];
        this.forEach(function (itemInArray) {
            results.push(projectionFunction(itemInArray));

        });

        return results;
    };

    var seniorStatus = false;

    var graph = new Graph2D(document.getElementById("cv"));

    var colorForCompleted = "#8F993E";
    var colorForAvailable = "#C99700";
    var colorForUncompleted = "#A9431E";

    function completedCourse(courses, courseId) {

        for (var i = 0; i < courses.length; i++) {
            if (courses[i].id === courseId) {


                return courses[i].completed;
            }
        }

        throw "Can't find ", courseId;
        return false;
    }

    var renderResults = seCourses.map(function (course) {

        // Deep Copy
        var result = JSON.parse(JSON.stringify(course));

        result.color = course.completed ? colorForCompleted : colorForUncompleted;


        if (result.prereq) {

            var reqsSatsified = true;

            result.prereq.forEach(function (prereq) {

                // Some prereqs require us to be a seniour
                if (prereq === "Senior standing") {
                    if (!seniorStatus) {
                        reqsSatsified = false;
                    }
                }

                // An array means we only have to complete one of the courses.
                if (prereq.constructor === Array) {
                    for (var i = 0; i < prereq.length; i++) {
                        Object.keys(prereq[i]).forEach(function (key) {

                            if (!completedCourse(seCourses, key)) {
                                reqsSatsified = false;
                            }

                        });
                    }
                }

                if (prereq.constructor === Object) {
                    Object.keys(prereq).forEach(function (key) {

                        if (!completedCourse(seCourses, key)) {
                            reqsSatsified = false;
                        }

                    });

                }

            });

            if (!course.completed && reqsSatsified) {
                result.color = colorForAvailable;
            }
        }

        // Make course larger based on it's difficulty
        result.radius = 40 * course.hours;
        if (result.lab) {
            result.radius *= 1.2;
        }

        return result;

    });


    graph.setBackgroundRenderMethod(function (graph) {
        var ctx = graph.getContext();
        ctx.fillStyle = "#660000";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });


    graph.setNodeAttractionMethod(function (node1, node2, extraData) {

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

        var masses = Math.abs(mass1 * mass2);
        var attraction = (masses / (dist * dist)) * 1.1;

        // If we're too close then let's reject
        if (dist < mass1 + mass2) {
            attraction *= -3.5;
        }


        if (data.$groupPos) {
            attraction = .05;
        }


        if (node1.node && node2.node) {

            if (node1.node.isLinkedWith(node2.node)) {
                attraction *= 2;

                if (extraData.$linkData.$directedTowards) {

                    if (node1.getId() === extraData.$linkData.$directedTowards.getId()) {
                        attraction = 0;
                    }

                }

            } else {
                attraction = attraction < 0 ? attraction : 0;
            }

        }

        return attraction;
    });

    var nodeRender = function (node, nodeCanvasPos, graph) {

        var mainColor = node.getRenderData()["color"];

        // Well that's a magic number if I've ever seen one. (0x202020)
        var tinted = "#" + (Math.floor(parseInt("0x" + mainColor.slice(1, 7)) + 2105376)).toString(16);

        var ctx = graph.getContext();
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(nodeCanvasPos[0],
                nodeCanvasPos[1],
                node.getRadius() * graph.getScale() * .6,
                0,
                2 * Math.PI);
        ctx.fill();

        if (node.getRenderData().$mouseOver || node.getRenderData().$neighborMouseOver) {

            if (!node.getRenderData().$neighborMouseOver) {
                // Draw a black circle in the middle..
                ctx.fillStyle = "black";
                ctx.beginPath();
                ctx.arc(nodeCanvasPos[0],
                        nodeCanvasPos[1],
                        node.getRadius() * graph.getScale() * .6 * .5,
                        0,
                        2 * Math.PI);
                ctx.fill();
            }

            // Make sure the mouse over box is always on top of everything.
            graph.postRender(function () {

                ctx.font = "16px Monospace";
                var textDimensions = ctx.measureText(node.getRenderData()["name"]);

                // Draw a rectangle for text.
                ctx.fillStyle = tinted;
                ctx.lineWidth = 2;
                ctx.fillRect(nodeCanvasPos[0] - 70 - textDimensions.width,
                        nodeCanvasPos[1] - 95 - 20,
                        textDimensions.width + 40, 40);

                // Draw a line coming from the node to the rectangle
                ctx.strokeStyle = tinted;
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

        if (node.getRenderData()['$beingDragged']) {
            ctx.fillStyle = tinted;
            ctx.beginPath();
            ctx.arc(nodeCanvasPos[0],
                    nodeCanvasPos[1],
                    node.getRadius() * graph.getScale() * .6 * .3,
                    0,
                    2 * Math.PI);
            ctx.fill();
        }

    };

    var nodeDetection = function (node, graph, mousePos) {
        return (node.distanceFrom(mousePos) <= node.getRadius() * .6);
    };

    graph.setDefaultNodeRenderAndMouseDetection(nodeRender, nodeDetection);


    graph.setLinkRenderMethod(function (g, point1, point2, link) {

        if (!link.nodes[0].getRenderData().$mouseOver && !link.nodes[1].getRenderData().$mouseOver) {
            return;
        }

        g.postRender(function () {
            var ctx = g.getContext();
            var scale = g.getScale();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5 * scale;
            ctx.beginPath();
            ctx.moveTo(point1[0], point1[1]);
            ctx.lineTo(point2[0], point2[1]);
            ctx.stroke();

            var center = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];

            // Figure out the direction of the link
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
        });
    });


    var nodes = {};



    renderResults.forEach(function (course) {
        nodes[course.id] = {
            "course": course,
            "node": graph.createNode({
                renderData: course,
                radius: course.radius
            })};
    });

    Object.keys(nodes).forEach(function (nodeKey) {

        if (!nodes[nodeKey].course.prereq) {
            return;
        }

        nodes[nodeKey].course.prereq.forEach(function (prereq) {

            // Some prereqs require us to be a seniour
            if (prereq === "Senior standing") {
                return;
            }

            // An array means we only have to complete one of the courses.
            if (prereq.constructor === Array) {
                for (var i = 0; i < prereq.length; i++) {
                    Object.keys(prereq[i]).forEach(function (key) {

                        graph.linkNodes(nodes[nodeKey].node, nodes[key].node, {
                            $directedTowards: nodes[key].node
                        });

                    });
                }
            }

            if (prereq.constructor === Object) {
                Object.keys(prereq).forEach(function (key) {

                    graph.linkNodes(nodes[nodeKey].node, nodes[key].node, {
                        $directedTowards: nodes[key].node
                    });

                });

            }

        });


    });

})();