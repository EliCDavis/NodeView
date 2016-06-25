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

    // http://reactivex.io/learnrx/
    Array.prototype.map = function (projectionFunction) {
        var results = [];
        this.forEach(function (itemInArray) {
            results.push(projectionFunction(itemInArray));

        });

        return results;
    };

    var seniorStatus = false;

    var seCourses = [
        {
            "id": "CSE-1002",
            "name": "Intro CSE",
            "completed": true,
            "hours": 2,
            "lab": false
        },
        {
            "id": "CSE-1284",
            "name": "Intro Comp Prog",
            "completed": true,
            "hours": 4,
            "lab": true
        },
        {
            "id": "CSE-1384",
            "name": "Intermed Comp Prog",
            "completed": true,
            "prereq": [{"CSE-1284": "C"}],
            "hours": 4,
            "lab": true
        },
        {
            "id": "CSE-2383",
            "name": "Data Struc & Anal of Alg",
            "completed": true,
            "prereq": [{"CSE-1384": "C"}],
            "hours": 3,
            "lab": true
        },
        {
            "id": "CSE-2813",
            "name": "Discrete Structures",
            "completed": true,
            "prereq": [{"CSE-1284": "C"}],
            "hours": 3,
            "lab": true
        },
        {
            "id": "CSE-3324",
            "name": "Dist Client/Server Prog",
            "completed": true,
            "prereq": [{"CSE-2383": "C"}],
            "hours": 4,
            "lab": true
        },
        {
            "id": "CSE-4214",
            "name": "Intro to Software Eng",
            "completed": true,
            "prereq": [{"CSE-2383": "C"}],
            "hours": 4,
            "lab": true
        },
        {
            "id": "ECE-3714",
            "name": "Digital Devices",
            "completed": true,
            "prereq": [{"CSE-1284": "C"}],
            "hours": 4,
            "lab": true
        },
        {
            "id": "ECE-3724",
            "name": "Microprocessors",
            "completed": true,
            "prereq": [{"CSE-1284": "C"}],
            "hours": 4,
            "lab": true
        },
        {
            "id": "CSE-3213",
            "name": "Software Eng Sr Project I",
            "completed": false,
            "prereq": [{"CSE-4214": "C"}],
            "hours": 3,
            "lab": true
        },
        {
            "id": "CSE-3223",
            "name": "Software Eng Sr Project II",
            "completed": false,
            "prereq": [{"CSE-4214": "C"}],
            "hours": 3,
            "lab": true
        },
        {
            "id": "CSE-3981",
            "name": "Computer Ethics",
            "completed": false,
            "prereq": ["Senior standing"],
            "hours": 1,
            "lab": false
        },
        {
            "id": "CSE-4153",
            "name": "Data Comm Networks",
            "completed": false,
            "prereq": [{"CSE-1384": "C"}],
            "hours": 3,
            "lab": false
        },
        {
            "id": "CSE-4233",
            "name": "SW Arch & Design",
            "completed": false,
            "prereq": [{"CSE-4214": "C"}],
            "hours": 3,
            "lab": false
        },
        {
            "id": "CSE-4283",
            "name": "Software Testing and QA",
            "completed": false,
            "prereq": [{"CSE-4214": "C"}],
            "hours": 3,
            "lab": false
        },
        {
            "id": "CSE-4503",
            "name": "Database Management Systems",
            "completed": false,
            "prereq": [{"CSE-2383": "C"}, {"CSE-2813": "C"}],
            "hours": 3,
            "lab": false
        },
        {
            "id": "CSE-4733",
            "name": "Operating Systems I",
            "completed": false,
            "prereq": [{"CSE-2383": "C"}, {"ECE-3724": "C"}],
            "hours": 3,
            "lab": false
        },
        {
            "id": "CSE-4833",
            "name": "Intro to Algorithms",
            "completed": false,
            "prereq": [{"CSE-2383": "C"}, {"CSE-2813": "C"}],
            "hours": 3,
            "lab": false
        }
    ];

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

        throw ("Can't find " + courseId);
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


    var backgroundRender = function (graph) {
        var ctx = graph.getContext();
        ctx.fillStyle = "#660000";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    graph.setBackgroundRenderMethod(backgroundRender);


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

                        graph.linkNodes(nodes[nodeKey].node, nodes[key].node);

                    });
                }
            }

            if (prereq.constructor === Object) {
                Object.keys(prereq).forEach(function (key) {

                    graph.linkNodes(nodes[nodeKey].node, nodes[key].node);

                });

            }

        });


    });

})();