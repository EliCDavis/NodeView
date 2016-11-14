(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Graph2D = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


module.exports = function (nodesToApply, attractionMethod, gravityConstant) {

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
                    ) * gravityConstant;

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
                }) * gravityConstant;

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

},{}],2:[function(require,module,exports){
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

/**
 * 
 * @param {type} graph
 * @returns {undefined} A Buffer for adding nodes and then mass placing them
 */
module.exports = function(graph){

    var self = this;
    
    self.graph = graph;
    
    var nodesToPlace = [];
    
    self.createNode = function(nodeData){
        nodeData.position = [0, 0];
        var node = self.graph.createNode(nodeData);
        nodesToPlace.push(node);
        graph.disableNode(node);
        return node;
    };
    
    
    var _placeNode = function(node, init, pos, startAngle, endAngle, allNodes){
        
        node.setPosition(pos);
    
        if(allNodes[node.getId()].children.length === 0){
            return;
        }
    
        var totalRadius = 0;
        allNodes[node.getId()].children.forEach(function(child){
            totalRadius += child.getRadius();
        });
        
        var lastPlacement = startAngle;
        
        allNodes[node.getId()].children.forEach(function(child){
            var angle = (endAngle - startAngle) * (child.getRadius() / totalRadius);
            var diameter = child.getRadius()*2;
            var displacement = diameter/angle;
            
            var x = displacement*Math.cos(lastPlacement + (angle/2)) + init[0];
            var y = displacement*Math.sin(lastPlacement + (angle/2)) + init[1];
            
            _placeNode(child, init, [x,y], lastPlacement, lastPlacement + angle, allNodes);
            lastPlacement += angle;
        });
    
    };
    
    
    /**
     * Mass Placement of nodes.
     * 
     * @returns {undefined}
     */
    self.flush = function(){
        
        var start = Date.now();
        
        nodeswMeta = {};
        
        // A collection of nodes we're not going to try organizing nicely.
        nodesNotGonnaTry = [];
        
        nodesWithNoParents = [];
        
        // Build list of nodes, children, and parent
        nodesToPlace.forEach(function(node){

            var parents = [];
            var children = [];
            
            // determine whether or not the link is a child or parent
            node.getLinks().forEach(function(link){
                if(link.linkData.$directedTowards){
                    if(link.linkData.$directedTowards.getId() === node.getId()){
                        parents.push(link.linkData.$directedTowards);
                    } else {
                        children.push(link.linkData.$directedTowards);
                    }
                }
            });
            
            
            if(parents.length > 1){
                nodesNotGonnaTry.push(node);
            } else if(parents.length === 0){
                nodesWithNoParents.push(node);
                parents = null;
            }
            
            
            nodeswMeta[node.getId()] = {
                node: node,
                children: children,
                parent: parents
            };
        });
        
        
        // Build a tree recursively...
        nodesWithNoParents.forEach(function(root){
            _placeNode(root, [0,0], [0,0], 0, 2*Math.PI, nodeswMeta);
        });
       
        
        // Finally, render all nodes in the end
        nodesToPlace.forEach(function(node){
            self.graph.enableNode(node);
        });
        
        console.log("Took "+(Date.now()-start)+" miliseconds to place "+ nodesToPlace.length +" nodes");
    };
    
    
    /**
     * Instead of trying to find positions for this batch we instead discard
     * all nodes that have been added.
     * 
     * @returns {Number} how many nodes where deleted
     */
    self.clear = function(){
        nodesToPlace.forEach(function(node){
            self.graph.destroyNode(node);
        });
        var length = nodesToPlace.length;
        nodesToPlace = [];
        return length;
    };
    
};
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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


},{}],5:[function(require,module,exports){
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

},{"../Util/GetCanvasSize":20,"./GetNodeCenter":6}],6:[function(require,module,exports){
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


module.exports = function NodeCenter(nodesToAverage) {
    // Average and find center of all nodes
    var averageCenter = [0, 0];

    var total = [0, 0];

    // Total up all the positions
    nodesToAverage.forEach(function (node) {
        total[0] += node.getPosition()[0];
        total[1] += node.getPosition()[1];
    });

    // Average the total to get center
    averageCenter[0] = total[0] / nodesToAverage.length;
    averageCenter[1] = total[1] / nodesToAverage.length;

    return averageCenter;
};
},{}],7:[function(require,module,exports){
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


module.exports = function NodeClostestToPoint(point, nodes) {

    var closestNode = null;
    var bestDist = 10000000;

    nodes.forEach(function (node) {
        var dist = node.distanceFrom(point);
        if (dist < bestDist) {
            closestNode = node;
            bestDist = dist;
        }
    });

    return closestNode;

};
},{}],8:[function(require,module,exports){
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

"use strict";

module.exports = Graph2D;

var GraphOptions = require('./GraphOptions');
var ApplyGravityOnNodes = require('./ApplyGravityOnNodes');
var Util = require('../Util');
var SetupNewNode = require('./SetupNode');
var GetCanvasSizeOfGraph = require('../Util/GetCanvasSize');
var ScaleForScrollEvent = require('./ScaleForScrollEvent');

var SetNodeAsBeingDragged = require('./SetNodeAsBeingDragged');
var SetNodeNotBeingDragged = require('./SetNodeNotBeingDragged');
var SetNodeAsHovered = require('./SetNodeAsHovered');
var SetNodeAsNotHovered = require('./SetNodeAsNotHovered');

var GetNodeClosestToPoint = require('./GetNodeClosestToPoint');

Util.init();

/**
 * A graph for displaying and interacting with nodes.
 * 
 * The render steps are:
 * > clear
 * > drawbackground
 * > draw node connections
 * > draw nodes
 * > post render
 * 
 * @param {<canvas>} canvas
 * @returns {Graph2D}
 */
function Graph2D(canvas) {

    var self = this;

    /**
     * What we multiply our nodes sizes and positions by.
     * Something like zooming in and out would modify this value
     * 
     * @type Number
     */
    var _scale = 1;


    /**
     * The x coordinate that is at the top left of the canvas currentely.
     * This changes as the user moves around on the graph
     * 
     * @type Number
     */
    var _xPosition = 0;


    /**
     * The y coordinate that is at the top left of the canvas currentely.
     * This changes as the user moves around on the graph
     * 
     * @type Number
     */
    var _yPosition = 0;


    /**
     * An array of nodes that the graph will render.
     * Whenever you add a node to the graph it goes in here.
     * 
     * @type Node2D[]
     */
    var _enabledNodes = [];


    /**
     * Nodes that have been added to the graph, but are not being rendered
     */
    var _disabledNodes = [];


    var _graphOptions = new GraphOptions();

    self.setOption = function (optionName, value) {
        _graphOptions.setOption(optionName, value);
    };

    self.nodeDecelerationConstant = _graphOptions.nodeDecelerationConstant;
    self.maxNodeSpeed = _graphOptions.maxNodeSpeed;

    /**
     * Array of objects that represents the linkage of 2 nodes.
     * 
     * @type Array
     */
    var _nodeLinks = [];


    /**
     * The method that is called when we have cleared the canvas and is about
     * to draw the next frame.
     * 
     * @type function
     */
    var _backgroundRenderMethod = null;


    var _linkRenderMethod = require('../Rendering/DefaultLinkRender');


    self.nodesAreLinked = function (n1, n2) {
        return n1.isLinkedWith(n2);
    };


    self.setLinkRenderMethod = function (renderMethod) {

        if (typeof renderMethod !== "function") {
            console.error("Failure to set Link Render Method! \
                           Arguement must be typeof function!");
            return;
        }

        if (renderMethod.length !== 4) {
            console.error("Failure to set Link Render Method! \
                           Method's arguement length must be 4 so it\
                           can be passed the graph being rendered, node 1\
                           position on canvas, node 2 position on canvas, and\
                           any link data associated with them!");
            return;
        }

        _linkRenderMethod = renderMethod;

    };

    /**
     * Set the the method that is called when ever the canvas is about to be
     * drawn to (after clearing it and before drawing nodes).
     * The method must accept 1 argument being the Graph2D object that is doing
     * the rendering.
     * 
     * @param {function} method
     * @returns {undefined}
     */
    self.setBackgroundRenderMethod = function (method) {

        if (typeof method !== "function") {
            console.error("Failure to set Background Render Method! \
                           Arguement must be typeof function!");
            return;
        }

        if (method.length !== 1) {
            console.error("Failure to set Background Render Method! \
                           Method's arguement length must be 1 so it\
                           can be passed the graph being rendered!");
            return;
        }

        _backgroundRenderMethod = method;
    };


    var _mouseToGraphCoordinates = require('../Util/MouseToGraphCoordinates');


    /**
     * The context of the canvas that this graph will draw to.
     * 
     * @type CanvasRenderingContext2D
     */
    var _canvasContext = null;


    /**
     * 
     * @returns {Graph2D._canvasContext|CanvasRenderingContext2D}
     */
    self.getContext = function () {
        return _canvasContext;
    };


    /**
     * The current status of the user's mouse.
     * Can either be: 
     *      free        The user isn't trying to interact with the elemnts on the graph
     *      dragging    The user is currentely dragging something
     *      hold        The user has clicked down on a node but hasn't moved it yet.
     * @type String
     */
    var _currentMouseState = "free";


    /**
     * 
     * @type Node2D|Graph2D
     */
    var _itemBeingDraggedOnCanvas = null;


    /**
     * 
     * @type MouseEvent
     */
    var _lastSeenMousePos = null;


    var _mouseUpCalled = function (event) {

        _lastSeenMousePos = event;

        if (_currentMouseState === "dragging") {

            // Update their render status
            if (_itemBeingDraggedOnCanvas["itemType"] === "node") {
                SetNodeNotBeingDragged(_itemBeingDraggedOnCanvas["item"]);
            }

            _itemBeingDraggedOnCanvas = null;
            _currentMouseState = "free";
            return;
        }

        // Figure out what Node was clicked (if any) and call their onclick function
        _enabledNodes.forEach(function (node) {

            if (_mouseOverNode(node, _mouseToGraphCoordinates(event, self))) {
                node.onclick(node);
            }

        });

        _currentMouseState = "free";

    };


    var _mouseOverNode = function (node, coords) {

        if (node.getClickDetectionFunction() === null) {
            return _defaultNodeMouseDetection(node, self, [coords.x, coords.y]);
        } else {
            return node.wasClicked(self, [coords.x, coords.y]);
        }

    };


    var _mouseDownCalled = function (event) {

        console.log(event);

        _lastSeenMousePos = event;

        var coords = _mouseToGraphCoordinates(event, self);

        _currentMouseState = "hold";

        // Figure out what Node was clicked (if any) and then begin dragging appropriatlly
        _enabledNodes.forEach(function (node) {

            var wasClicked = _mouseOverNode(node, coords);

            if (wasClicked) {
                _itemBeingDraggedOnCanvas = {"item": node, "itemPos": node.getPosition(), "mousePos": [coords.x, coords.y], "itemType": "node"};
            }

        });

        // If we didn't grab a node then we've grabbed the canvas
        if (_itemBeingDraggedOnCanvas === null) {
            _itemBeingDraggedOnCanvas = {"item": self, "itemPos": self.getPosition(), "mousePos": [coords.x, coords.y], "itemType": "graph"};
        }

    };


    var _mouseOutCalled = function (event) {

        // Update their render status
        if (_itemBeingDraggedOnCanvas !== null && _itemBeingDraggedOnCanvas["itemType"] === "node") {
            SetNodeNotBeingDragged(_itemBeingDraggedOnCanvas["item"]);
            SetNodeAsNotHovered(_itemBeingDraggedOnCanvas["item"]);
        }

        _lastSeenMousePos = null;
        _itemBeingDraggedOnCanvas = null;

        if (_currentMouseState === "dragging") {
            _currentMouseState = "free";
        }

    };


    var _mouseMoveCalled = function (event) {

        _lastSeenMousePos = event;

        if (_currentMouseState === "hold") {

            _currentMouseState = "dragging";

            // Update their render status
            if (_itemBeingDraggedOnCanvas["itemType"] === "node") {
                SetNodeAsBeingDragged(_itemBeingDraggedOnCanvas["item"]);
            }

        }

        if (_currentMouseState === "dragging") {

            var orgPos = _itemBeingDraggedOnCanvas["itemPos"];
            var orgMousePos = _itemBeingDraggedOnCanvas["mousePos"];

            if (_itemBeingDraggedOnCanvas["itemType"] === "node") {

                var coords = _mouseToGraphCoordinates(event, self);

                _itemBeingDraggedOnCanvas["item"].setPosition(coords.x + (orgPos[0] - orgMousePos[0]), coords.y + (orgPos[1] - orgMousePos[1]));

            }

            if (_itemBeingDraggedOnCanvas["itemType"] === "graph") {

                var coords = self.getContext().canvas.relMouseCoords(event);

                var graphX = coords.x / _scale;
                var graphY = coords.y / _scale;

                _itemBeingDraggedOnCanvas["item"].setPosition(graphX - orgMousePos[0], graphY - orgMousePos[1]);
            }
        }

    };


    var _doubleClickCalled = function (event) {

        var coords = _mouseToGraphCoordinates(event, self);

        // Figure out what Node was clicked (if any) and call their double click function
        _enabledNodes.forEach(function (node) {

            if (_mouseOverNode(node, coords)) {
                node.ondoubleclick(node);
            }

        });

    };


    /**
     * Add's all the event listeners to the canvas for user interaction.
     * 
     * @param {<canvas>} cvs The canvas element on the page
     * @returns {undefined}
     */
    var _initializeGraph = function (cvs) {

        // Desktop mouse listeners
        cvs.addEventListener('mouseup', _mouseUpCalled);
        cvs.addEventListener('mousedown', _mouseDownCalled);
        cvs.addEventListener('mouseout', _mouseOutCalled);
        cvs.addEventListener('mousemove', _mouseMoveCalled);
        cvs.addEventListener('dblclick', _doubleClickCalled);

        // Special function made for cross browser support of wheel event.
        addWheelListener(cvs, function (e) {
            ScaleForScrollEvent(e, self);
        });

        var _touchToClick = function(e){
            var n = {};
            for(var k in e.touches[0]) n[k]=e.touches[0][k];
            return n;
        };

        cvs.addEventListener("touchstart", function(e){
            _mouseDownCalled(_touchToClick(e));
        }, false);
        
        cvs.addEventListener("touchend", function(e){
            _mouseUpCalled(_touchToClick(e));
        }, false);
        
        cvs.addEventListener("touchcancel", function(e){
            _mouseOutCalled(_touchToClick(e));
        }, false);
        
        cvs.addEventListener("touchmove", function(e){
            _mouseMoveCalled(_touchToClick(e));
        }, false);

    };


    // Only grab the context if we have a canvas to grab from
    if (canvas !== null && canvas !== undefined) {
        _canvasContext = canvas.getContext("2d");
        _initializeGraph(canvas);
    }


    /**
     * From Wikipedia:
     * Kruskal's algorithm is a minimum-spanning-tree algorithm which finds an 
     * edge of the least possible weight that connects any two trees in the forest
     * 
     * @param {type} startingNode
     * @param {function(Node, Node):Number} weightFunction
     * @returns {NodeLink[]}
     */
    self.kruskalsPath = function (startingNode, weightFunction) {
        throw "not yet implemented!";
    };


    self.getNodes = function () {
        return _enabledNodes;
    };


    self.clearLinks = function () {

        _enabledNodes.forEach(function (node) {
            node.clearLinks();
        });

        _nodeLinks = [];
    };


    self.clearNodes = function () {
        _enabledNodes = [];
        self.clearLinks();
    };

    /**
     * Attempts to remove a node from the graph.
     * 
     * @param {type} node The node to be removed
     * @returns {Boolean} whether or not a node was removed
     */
    self.destroyNode = function (node) {

        if (!node) {
            return false;
        }

        // See if the node is in the enabled list.
        for (var i = 0; i < _enabledNodes.length; i++) {
            if (_enabledNodes[i].getId() === node.getId()) {
                _enabledNodes.splice(i, 1);
                return true;
            }
        }

        // Now make sure it's not in the disabled nodes.
        for (var i = 0; i < _enabledNodes.length; i++) {
            if (_enabledNodes[i].getId() === node.getId()) {
                _enabledNodes.splice(i, 1);
                return true;
            }
        }

        // Guess we couldn't find the node..
        return false;
    };


    /**
     * 
     * @param {type} node The node to disable
     * @returns {Boolean} Whether or not the node was succesfully disabeld
     */
    self.disableNode = function (node) {

        if (!node) {
            return false;
        }

        for (var i = 0; i < _enabledNodes.length; i++) {
            if (_enabledNodes[i].getId() === node.getId()) {
                _disabledNodes.push(_enabledNodes[i]);
                _enabledNodes[i].setEnabled(false);
                _enabledNodes.splice(i, 1);
                return true;
            }
        }

        return false;
    };

    self.enableNode = function (node) {

        if (!node) {
            return false;
        }

        for (var i = 0; i < _disabledNodes.length; i++) {
            if (_disabledNodes[i].getId() === node.getId()) {
                _enabledNodes.push(_disabledNodes[i]);
                _disabledNodes[i].setEnabled(true);
                _disabledNodes.splice(i, 1);
                return true;
            }
        }

        return false;
    };

    var BatchPlacement = require('./BatchPlacement');

    var _bufferPlacement = new BatchPlacement(self);

    self.batchCreateNode = _bufferPlacement.createNode;
    self.batchClear = _bufferPlacement.clear;
    self.batchFlush = _bufferPlacement.flush;

    /**
     * Get's the node who's position closest to the point specified
     * 
     * @param {type} point [x,y]
     * @param {type} nodes Will only look at these nodes when seeing which ones closest to the point.  Defaults to all nodes in graph
     * @returns {unresolved}
     */
    self.getNodeClosestToPoint = function (point, nodes) {

        if (!point) {
            return null;
        }

        if (!nodes) {
            return GetNodeClosestToPoint(point, _enabledNodes);
        }

        return GetNodeClosestToPoint(point, nodes);

    };


    /**
     * Returns the center of the canvas in the form of [x, y] 
     * 
     * @returns {Array}
     */
    self.getPosition = function () {
        return [_xPosition, _yPosition];
    };


    /**
     * Set's the current position of the graph
     * 
     * @param {type} x
     * @param {type} y
     * @returns {undefined}
     */
    self.setPosition = function (x, y) {

        if (!Util.isNumeric(x)) {
            throw "Failed to set graph position!  Invalid x value: " + x;
        }

        if (!Util.isNumeric(y)) {
            throw "Failed to set graph position!  Invalid y value: " + y;
        }

        _xPosition = x;
        _yPosition = y;

    };


    /**
     * Returns the current scale in which positions and sizes the nodes are
     * to be multiplied by.
     * 
     * @returns {Number}
     */
    self.getScale = function () {
        return _scale;
    };


    self.setScale = function (newScale) {

        if (typeof newScale !== 'number' || newScale <= 0) {
            return;
        }

        _scale = newScale;
    };


    var _scaleToBounds = function (bounds) {

        var desiredScale = _scale;

        if (GetCanvasSizeOfGraph(self)[0] < GetCanvasSizeOfGraph(self)[1]) {

            // Scale by width
            var desiredWidth = bounds[2];
            var currentUnscaledWidth = GetCanvasSizeOfGraph(self)[0];

            desiredScale = currentUnscaledWidth / desiredWidth;

        } else {

            // Scale by height
            var desiredHeight = bounds[3];
            var currentUnscaledHeight = GetCanvasSizeOfGraph(self)[1];

            desiredScale = currentUnscaledHeight / desiredHeight;
        }

        var direction = desiredScale - _scale;

        _scale += direction * 0.1;

    };


    self.getBoundsFromNodes = require('./GetBoundsFromNodes');


    /**
     * The default node rendering function assigned to all nodes upon creation
     * 
     * @param {Node2D} node The node being rendered
     * @param {Array[x,y]} nodeCanvasPos The nodes getPosition() returns it's
     * position in graph coordinates.  nodePosOnCanvas is where the node is on
     * canvas coordinates.
     * @param {Graph2D} graph The graph that the node is apart of
     * @returns {undefined}
     */
    var _defaultNodeRender = require('../Rendering/DefaultNodeRender');


    /**
     * The default node mouse detection function assigned to all nodes upon creation
     * 
     * @param {Node2D} node The node being rendered
     * @param {Graph2D} graph The graph that the node is apart of
     * @param {JSON} mousePos {x:xposition, y:yposition} 
     * @returns {unresolved}
     */
    var _defaultNodeMouseDetection = function (node, graph, mousePos) {
        return (node.distanceFrom(mousePos) <= node.getRadius() * .8);
    };


    self.setDefaultNodeRenderAndMouseDetection = function (renderer, detection) {

        if (typeof renderer !== "function") {
            console.error("Failure to set Node Render Method! \
                           Arguement must be a function!");
            return;
        }

        if (renderer.length !== 3) {
            console.error("Failure to set Node Render Method! \
                           Method's arguement length must be 3 so it\
                           can be passed the node, it's position, and graph being rendered!");
            return;
        }

        if (typeof detection !== "function") {
            console.error("Failure to set Node Click Detection Method! \
                           Arguement must be a function!");
            return;
        }

        if (detection.length !== 3) {
            console.error("Failure to set Node Render Method! \
                           Method's arguement length must be 2 so it\
                           can be passed the node and graph being rendered!");
            return;
        }

        _defaultNodeRender = renderer;
        _defaultNodeMouseDetection = detection;

    };


    /**
     * Creates a new empty node and adds it to the graph immediately
     * @param {Object} options Options to customize the node you are creating
     * @returns {Node2D}
     */
    self.createNode = function (options) {

        var node = SetupNewNode(options, self);

        _enabledNodes.push(node);

        return node;

    };


    /**
     * Creates a link between two nodes.
     * For rendering purposes this draws a line between the two nodes
     * 
     * @param {Node2D} n1
     * @param {Node2D} n2
     * @param {*} linkData OPTIONAL: any extra information you'd like to store about the 
     * link (i.e. Distance between the two, relationship, etc..)
     * @returns {undefined}
     */
    self.linkNodes = function (n1, n2, linkData) {

        // Make sure the nodes are not null
        if (!n1) {
            throw "Failure to link! The first node passed in to link was: " + n1;
        }

        // Make sure the nodes are not null
        if (!n2) {
            throw "Failure to link! The second node passed in to link was: " + n2;
        }

        // Make sure the link does not already exist
        if (n1.isLinkedWith(n2)) {
            throw "Nodes are already linked!";
        }

        if(!linkData){
            linkData = {};
        }

        // Tell the nodes their linked
        // TODO: Review and make sure doing this even makes sense
        n1.addLink(n2, linkData);
        n2.addLink(n1, linkData);

        var link = {
            "nodes": [n1, n2],
            "linkData": linkData
        };

        // Create our link for the graph to keep up with.
        _nodeLinks.push(link);

        return link;

    };


    /**
     * Allows users to override how attraction between two nodes are calculated.
     * 
     * The nodes passed in to this function are not your ordinary nodes.  They
     * are instead Objects :
     * {
     *      "pos": position     <-- [Number, Number]
     *      "mass": mass        <-- Number
     *      "node" node         <-- might not be passed, if passed, Node2D
     * }
     * 
     * @param {function(node1:Object, node2:object, data:Object): Number} method
     * @returns {undefined}
     */
    self.setNodeAttractionMethod = function (method) {

        if (typeof method !== "function") {
            console.error("Failure to set Node Attraction Method! \
                           Arguement must be typeof function!");
            return;
        }

        if (method.length !== 3) {
            console.error("Failure to set Node Attraction Method! \
                           Method's arguement length must be 3 so it\
                           can be passed the two nodes being rendered and any\
                           data associated with them!!");
            return;
        }

        _nodeAttraction = method;
    };


    /**
     * The nodes passed in to this function are not your ordinary nodes.  They
     * are instead Objects :
     * {
     *      "pos": position
     *      "mass": mass
     *      "node" node
     *  }
     * 
     * Why do it like this?
     * So you don't actually have to have nodes being passed to this function!
     * you can just pass objects that just have pos and mass attributes (without
     * node) and the attraction method can still work with just those (depending
     * whether or not if it's been replaced and if that replacement is valid
     * 
     * @param {type} node1
     * @param {type} node2
     * @param {type} extraData
     * @returns {Number}
     */
    var _nodeAttraction = require('./DefaultNodeAttraction');


    /**
     * An array of function calls that will be called and then cleared
     * at the end of the frame render
     * @type Array[function]
     */
    var _postRenderQueue = [];


    /**
     * Adds a function to a queue that will be called after all the nodes
     * have been rendered.
     * 
     * The queue is cleared once the frame is done rendering.
     * 
     * @param {function} cb
     * @returns {undefined}
     */
    self.postRender = function (cb) {

        if (typeof cb !== "function") {
            throw "Post render only accepts functions!";
        }

        _postRenderQueue.push(cb);

    };


    self.centerOverNodes = function (nodes, duration) {

    };


    var _centerOnNodes = function () {

        if (!_enabledNodes || _enabledNodes.length === 0) {
            return;
        }

        var bounds = self.getBoundsFromNodes(_enabledNodes);

        _scaleToBounds(bounds);

        var average = [bounds[0] + (bounds[2] / 2), bounds[1] + (bounds[3] / 2)];
        var canvasSize = GetCanvasSizeOfGraph(self);

        var desiredPos = [(canvasSize[0] / _scale / 2) - average[0],
            (canvasSize[1] / _scale / 2) - average[1]];

        var difference = [desiredPos[0] - _xPosition, desiredPos[1] - _yPosition];

        _xPosition += difference[0] * 0.1;
        _yPosition += difference[1] * 0.1;

    };



    var _mouseHoverCheck = function (n) {
        // Check if the mouse is over the node
        if (_mouseOverNode(n, _mouseToGraphCoordinates(_lastSeenMousePos, self))) {
            if (!n.getRenderData().$mouseOver) {
                SetNodeAsHovered(n);
            }
        } else {
            if (n.getRenderData().$mouseOver) {
                SetNodeAsNotHovered(n);
            }
        }
    };


    /**
     * Draws our nodes to the canvas that the graph was initialized with
     * 
     * @returns {undefined}
     */
    var _drawFrame = function () {

        // Make sure we have the correct resolution
        _canvasContext.canvas.width = _canvasContext.canvas.offsetWidth;
        _canvasContext.canvas.height = _canvasContext.canvas.offsetHeight;

        // Clear the canvas of anything rendered last frame
        // TODO: Clear only what's been drawn over
        _canvasContext.clearRect(0, 0, _canvasContext.canvas.width, _canvasContext.canvas.height);

        if (_backgroundRenderMethod !== null && _backgroundRenderMethod !== undefined) {
            _backgroundRenderMethod(self);
        }

        // Draw center for debugging purposes currentely
//        self.getContext().fillStyle = "white";
//        self.getContext().fillRect(
//                self.getPosition()[0] * _scale,
//                self.getPosition()[1] * _scale,
//                10 * _scale,
//                10 * _scale
//                );

        // Draw the lines between nodes to display links
        _nodeLinks.forEach(function (link) {

            if (!link.nodes[0].enabled() || !link.nodes[1].enabled()) {
                return;
            }

            var startPos = [(link.nodes[0].getPosition()[0] + _xPosition) * _scale,
                (link.nodes[0].getPosition()[1] + _yPosition) * _scale];

            var endPos = [(link.nodes[1].getPosition()[0] + _xPosition) * _scale,
                (link.nodes[1].getPosition()[1] + _yPosition) * _scale];

            if (_linkRenderMethod !== null && _linkRenderMethod !== undefined) {
                _linkRenderMethod(self, startPos, endPos, link);
                return;
            }

            var ctx = self.getContext();

            ctx.beginPath();
            ctx.moveTo(startPos[0], startPos[1]);
            ctx.lineTo(endPos[0], endPos[1]);
            ctx.stroke();

        });


        if (_graphOptions.applyGravity()) {
            ApplyGravityOnNodes(_enabledNodes, _nodeAttraction, _graphOptions.nodeGravityConstant());
        }


        // Draw the nodes them selves
        _enabledNodes.forEach(function (n) {

            var moved = false;

            // Translate the node this frame
            if (_graphOptions.applyTranslation()) {
                moved = n.translate((Date.now() - _lastDrawFrame) / 1000);
            }

            // TODO: Need to also check if a mouse event happened this frame
            // TODO: Plenty of optimization needed
            if (_lastSeenMousePos !== null) {

                if (_graphOptions.applyGravity() && _graphOptions.applyTranslation()) {
                    if (moved) {
                        _mouseHoverCheck(n);
                    }
                } else {
                    _mouseHoverCheck(n);
                }

            }

            var graphPos = self.getPosition();
            var scale = self.getScale();
            var pos = [(n.getPosition()[0] + graphPos[0]) * scale,
                (n.getPosition()[1] + graphPos[1]) * scale];

            // Render the node if it has a render function
            if (n.getRenderFunction() !== null && n.getRenderFunction() !== undefined) {
                n.render(n, pos, self);
            } else {
                _defaultNodeRender(n, pos, self);
            }

        });

        // render anything in the queue.
        _postRenderQueue.forEach(function (cb) {
            cb();
        });
        _postRenderQueue = [];

        if (_graphOptions.centerOnNodes() && (!_itemBeingDraggedOnCanvas || _itemBeingDraggedOnCanvas["itemType"] !== "graph")) {
            _centerOnNodes();
        }

        _lastDrawFrame = Date.now();
        _requestAnimationFrameId = window.requestAnimationFrame(_drawFrame);

    };

    var _requestAnimationFrameId = null;
    var _lastDrawFrame = Date.now();

    _drawFrame();

    self.forceDrawFrame = function() {
        if(_requestAnimationFrameId){
            window.cancelAnimationFrame(_requestAnimationFrameId);
        }
        _drawFrame();
    };

}
},{"../Rendering/DefaultLinkRender":17,"../Rendering/DefaultNodeRender":18,"../Util":19,"../Util/GetCanvasSize":20,"../Util/MouseToGraphCoordinates":21,"./ApplyGravityOnNodes":1,"./BatchPlacement":2,"./DefaultNodeAttraction":3,"./GetBoundsFromNodes":4,"./GetNodeClosestToPoint":7,"./GraphOptions":9,"./ScaleForScrollEvent":10,"./SetNodeAsBeingDragged":11,"./SetNodeAsHovered":12,"./SetNodeAsNotHovered":13,"./SetNodeNotBeingDragged":14,"./SetupNode":15}],9:[function(require,module,exports){
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


module.exports = GraphOptions;

function GraphOptions() {

    var self = this;


    var _options = {
        /*
         * Whether or not the camera will try centering over the center
         * of the nodes.
         */
        centerOnNodes: {
            value: true,
            constructor: Boolean
        },
        /* 
         * Whether or not to calculate the attraction between two
         * nodes on a render frame 
         */
        applyGravity: {
            value: true,
            constructor: Boolean
        },
        /*
         * Whether or not to actually move the nodes on the render frame
         */
        applyTranslation: {
            value: true,
            constructor: Boolean
        },
        /*
         * The max speed a node can travel via graph coordinates
         */
        maxNodeSpeed: {
            value: 30000,
            constructor: Number
        },
        /*
         * How quickly the node will decelerate over time with the absent of forces
         */
        nodeDecelerationConstant: {
            value: 2,
            constructor: Number
        },
        /*
         * The value returned by the gravity function is multiplied by this value
         * before being applied to the actual node.
         */
        nodeGravityConstant: {
            value: 1,
            constructor: Number
        }
    };
    
    
    self.setOption = function (optionName, value) {

        if (typeof optionName !== "string") {
            throw "Unable to set option:  Option name expected to be type\
                    string, received: ", optionName;
        }

        try {
            if (_options[optionName].constructor === value.constructor) {
                _options[optionName].value = value;
            } else {
                throw "Unable to set option: Variable constructor expected: "
                        , _options[optionName].constructor, ". Received: ", value.constructor;
            }
        } catch (e) {
            throw "Unable to set option: ", e;
        }

    };

    self.applyGravity = function(){
        return _options.applyGravity.value;
    };
    
    self.applyTranslation = function(){
        return _options.applyTranslation.value;
    };
    
    self.centerOnNodes = function(){
        return _options.centerOnNodes.value;
    };
    
    self.maxNodeSpeed = function(){
        return _options.maxNodeSpeed.value;
    };
    
    self.nodeDecelerationConstant = function(){
        return _options.nodeDecelerationConstant.value;
    };
    
    self.nodeGravityConstant = function (){
        return _options.nodeGravityConstant.value;
    };
}
},{}],10:[function(require,module,exports){
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

var GetCanvasSizeOfGraph = require('../Util/GetCanvasSize');

module.exports = function (event, graph) {
    

    var _scale = graph.getScale();
    var newScale = _scale;
    var direction = 0;

    // Grab the new scale.
    if (event.deltaY > 0) {
        direction = -0.05;
    } else {
        direction = 0.05;
    }

    newScale += direction * newScale;

    var canvasSize = GetCanvasSizeOfGraph(graph);

    var oldCenter = [canvasSize[0] * (1 / _scale) * 0.5, canvasSize[1] * (1 / _scale) * 0.5];
    var newCenter = [canvasSize[0] * (1 / newScale) * 0.5, canvasSize[1] * (1 / newScale) * 0.5];

    var curPos = graph.getPosition();

    // Move the position to keep what was in our center in the old scale in the center of our new scale
    graph.setPosition(curPos[0] + (newCenter[0] - oldCenter[0]), curPos[1] + (newCenter[1] - oldCenter[1]));

    graph.setScale(newScale);
};

},{"../Util/GetCanvasSize":20}],11:[function(require,module,exports){
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


module.exports = function SetNodeAsBeingDragged(node) {

    node.setRenderDataByKey("$beingDragged", true);
    node.setVelocity(0, 0);

    var links = node.getLinks();

    for (var i = 0; i < links.length; i++) {
        links[i].node.setRenderDataByKey("$neighborBeingDragged", true);
    }

};
},{}],12:[function(require,module,exports){
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


module.exports = function SetNodeAsHovered(node) {

    if (node.getRenderData().$mouseOver) {
        return;
    }

    node.setRenderDataByKey("$mouseOver", true);

    var links = node.getLinks();

    for (var i = 0; i < links.length; i++) {
        links[i].node.setRenderDataByKey("$neighborMouseOver", true);
    } 
};
},{}],13:[function(require,module,exports){
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


module.exports = function SetNodeAsNotHovered(node) {

    node.setRenderDataByKey("$mouseOver", false);

    var links = node.getLinks();

    for (var i = 0; i < links.length; i++) {
        links[i].node.setRenderDataByKey("$neighborMouseOver", false);
    }
    
};
},{}],14:[function(require,module,exports){
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


module.exports = function SetNodeNoteBeingDragged (node) {

    node.setRenderDataByKey("$beingDragged", false);

    var links = node.getLinks();

    for (var i = 0; i < links.length; i++) {
        links[i].node.setRenderDataByKey("$neighborBeingDragged", false);
    }

};
},{}],15:[function(require,module,exports){
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


var Node2D = require('../Node2D');
var GetFreeSpaceForNode = require('./GetFreeSpace');

module.exports = function SetupNode(options, graph) {
    
    var node = new Node2D(graph);
    
    if (options && options.renderData) {
        Object.keys(options.renderData).forEach(function (key, index) {
            node.setRenderDataByKey(key, options.renderData[key]);
        });
    } else {
        node.setRenderDataByKey('color', 'rgb(197, 23, 23)');
    }

    var setRadius = 70;

    if (options && options.radius) {
        setRadius = options.radius;
    }

    node.setRadius(setRadius);

    if (options && options.position) {
        node.setPosition(options.position);
    } else {
        if (options && options.freeSpace) {
            node.setPosition(GetFreeSpaceForNode(options.freeSpace, graph));
        } else {
            node.setPosition(GetFreeSpaceForNode(setRadius * 4, graph));
        }
    }
    
    return node;
    
};
},{"../Node2D":16,"./GetFreeSpace":5}],16:[function(require,module,exports){
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

"use strict";

var Util = require('./Util');

module.exports = Node2D;

/**
 * The node that exists on the 2D graph
 * 
 * @returns {Node2D}
 */
function Node2D(graph) {

    var self = this;

    // TODO: Create a render mode enum

    if(!graph){
        throw "Error creating Node. A node needs to know what graph it's apart of.";
        return;
    }

    var _graph = graph;

    /**
     * Arbitrary data kept up with for rendering.
     * 
     * @type type
     */
    var _renderingData = {
        "$mouseOver": false,
        "$beingDragged": false
    };


    /**
     * The X position of the node relative to the graph
     * 
     * @type Number
     */
    var _xPosition = 0;


    /**
     * The Y position of the node relative to the graph
     * 
     * @type Number
     */
    var _yPosition = 0;


    /**
     * A list of all nodes this node is "connected" to.
     * 
     * @type Array
     */
    var _links = [];


    /**
     * 
     * @type Number
     */
    var _groupId = null;


    /**
     * The radius of the node, the amount of free space around the node
     * that would be kept free from other nodes
     * 
     * @type Number
     */
    var _radius = 1;


    /**
     * The current displacement of the node perframe of animation
     * 
     * @type Array
     */
    var _velocityVector = [0, 0];


    /**
     * Whether or not the node is being rendered on the graph.
     * 
     * @type Boolean
     */
    var _enabled = true;
    
    self.enabled = function(){
        return _enabled;
    };
    
    self.setEnabled = function(isEnabled){
        _enabled = isEnabled;
    };

    var _id = Util.generateUUID();
    
    self.getId = function(){
        return _id;
    };

    self.getGroupId = function () {
        return _groupId;
    };


    self.setVelocity = function(x,y){
        _velocityVector = [x,y];
    };


    self.accelerate = function (x, y) {

        var maxSpeed = _graph.maxNodeSpeed();

        _velocityVector[0] = Math.max(Math.min(maxSpeed, _velocityVector[0] + x), -maxSpeed);
        _velocityVector[1] = Math.max(Math.min(maxSpeed, _velocityVector[1] + y), -maxSpeed);

    };


    var _decelerate = function (deltaTime) {

        var xdir = _velocityVector[0] > 0 ? -1 : 1;
        var ydir = _velocityVector[1] > 0 ? -1 : 1;

        _velocityVector[0] += Math.sqrt(Math.abs(_velocityVector[0])) * deltaTime * xdir * _graph.nodeDecelerationConstant();
        _velocityVector[1] += Math.sqrt(Math.abs(_velocityVector[1])) * deltaTime * ydir * _graph.nodeDecelerationConstant();
    };


    /**
     * Called by the graph every animation frame.
     * Node moves based on it's current velocity
     * @param {Number} deltaTime the amount of time elapsed in seconds
     * @returns {bool} whether or not the node actually moved
     */
    self.translate = function (deltaTime) {

        if (_velocityVector[0] === 0 && _velocityVector[1] === 0) {
            return false;
        }

        _xPosition += _velocityVector[0] * deltaTime;
        _yPosition += _velocityVector[1] * deltaTime;
        _decelerate(deltaTime);

        return true;
    };


    /**
     * Utility function for quickly determining distance
     * between the node and another point on the grpah.
     * 
     * @param {type} x
     * @param {type} y
     * @returns {Number}
     */
    self.distanceFrom = function (x, y) {

        // Allow passing of 2 element array instead of 2 arguements for position
        if (x.constructor === Array) {
            y = x[1];
            x = x[0];
        }
        return Math.sqrt(Math.pow(x - _xPosition, 2) + Math.pow(y - _yPosition, 2));

    };


    /**
     * Set's the radius of the node
     * 
     * @param {type} r radius the node will take on
     * @returns {undefined}
     */
    self.setRadius = function (r) {
        _radius = r;
    };


    /**
     * Get the radius the node is currentely operating by
     * 
     * @returns {r|Number}
     */
    self.getRadius = function () {
        return _radius;
    };


    /**
     * Method called when the node was clicked on the canvas
     * 
     * Users can easily set their own onclick function just by calling:
     * nodeInstance.onclick = someOtherFunction;
     */
    self.onclick = function () {
        console.log("Clicked");
    };
    
    
    /**
     * Method called when the node was double clicked on the canvas
     * 
     * Users can easily set their own onclick function just by calling:
     * nodeInstance.ondoubleclick = someOtherFunction;
     */
    self.ondoubleclick = function () {
        console.log("Clicked");
    };


    /**
     * How we want to have this node rendered
     * @type method
     */
    var _renderFunction = null;


    /**
     * Boolean function that takes the x and y coordinates of the mouse
     * and determines whether or not the node was clicked
     * @type method
     */
    var _clickDetectionfunction = null;


    /**
     * Set's a specific proterty of the rendering data.
     * 
     * @param {type} key The key to the dictionary
     * @param {type} data The data to be stored by that key
     * @returns {undefined}
     */
    self.setRenderDataByKey = function (key, data) {
        _renderingData[key] = data;
    };


    /**
     * Returns all arbitrary rendering data that the node uses to display
     * itself. 
     * 
     * @returns {JSON} RenderingData Arbitrary data set for keeping up how
     * to render the node.
     */
    self.getRenderData = function () {
        return _renderingData;
    };


    /**
     * Boolean method given an x and y mouse position determines whether or
     * not the node was actually clicked
     * 
     * @param {Graph2D} graph
     * @param {Array} mousePos
     * @returns {Boolean}
     */
    self.wasClicked = function (graph, mousePos) {

        console.log("detection: ",_clickDetectionfunction);

        if (_clickDetectionfunction !== null && _clickDetectionfunction !== undefined) {

            var result = _clickDetectionfunction(self, graph, mousePos);

            // If the method actually returned a boolean value
            if (result === true || result === false) {
                return result;
            }

        }

        return false;

    };


    /**
     * Override how the node will render and what is considered a mouse
     * click by passing your own methods for rendering and click detection.
     * 
     * The render method must have an argument for taking in the context of 
     * the canvas that it will render too.
     * 
     * The click detection method must take 4 arguements.. TODO: Finish.
     * 
     * @param {function(CanvasRenderingContext2D)} renderMethod
     * @param {function(withinNodeMethod)} withinNodeMethod method for 
     * determining whether of not a node has been clicked.
     * @returns {undefined}
     */
    self.setRenderFunction = function (renderMethod, withinNodeMethod) {

        if (renderMethod === null) {
            throw "Error setting render funciton for Node! Attempting to add a null render method";
        }

        if (withinNodeMethod === null) {
            throw "Error setting render funciton for Node! Attempting to add a null click detection method";
        }

        _renderFunction = renderMethod;
        _clickDetectionfunction = withinNodeMethod;

    };


    /**
     * Returns the method at which the node is rendered with
     * @returns {method}
     */
    self.getRenderFunction = function () {
        return _renderFunction;
    };


    self.getClickDetectionFunction = function () {
        return _clickDetectionfunction;
    };


    /**
     * Given the node and graph, renders itself
     * 
     * @param {type} node
     * @param {type} graph
     * @returns {undefined}
     */
    self.render = function (node, pos, graph) {

        if (_renderFunction === null) {
            throw "Failure to render node! There's no render function defined!";
        }

        _renderFunction(node, pos, graph);

    };


    /**
     * returns the position of the node in x,y coordinates of the graph
     * in the form of [x, y]
     * 
     * @returns {Array}
     */
    self.getPosition = function () {
        return [_xPosition, _yPosition];
    };


    /**
     * Set the current position of the node in the graph
     * 
     * @param {Number} x The x position from the top left corner of the graph
     * @param {Number} y The y position from the top left corner of the graph
     * @returns {undefined}
     */
    self.setPosition = function (x, y) {

        if (x.constructor === Array) {
            _xPosition = x[0];
            _yPosition = x[1];
            return;
        }

        _xPosition = x;
        _yPosition = y;
    };


    self.addLink = function (linkNode, data) {

        if (linkNode === null || linkNode === undefined) {
            throw "Failure to link node!  Link node was: " + linkNode;
            return;
        }

        _links.push({
            node: linkNode,
            linkData: data
        });

    };

    self.getLinks = function () {
        return _links;
    };
    
    self.isLinkedWith = function(nodeLinkedWith){
        
        for(var i  = 0; i < _links.length; i ++){
            if(_links[i].node.getId() === nodeLinkedWith.getId()){
                return true;
            }
        }
        
        return false;
    };
    
    
    self.getLinkData = function(node){
        
        for(var i  = 0; i < _links.length; i ++){
            if(_links[i].node.getId() === node.getId()){
                return _links[i].node;
            }
        }
        
        return null;
    };
    
    
    self.clearLinks = function(){
        _links = [];
    };

}
},{"./Util":19}],17:[function(require,module,exports){
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
    if (direction) {
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
    }

};
},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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


module.exports = {
    "init": function () {


        // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
        // creates a global "addWheelListener" method
        // example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );
        (function (window, document) {

            var prefix = "", _addEventListener, support;

            // detect event model
            if (window.addEventListener) {
                _addEventListener = "addEventListener";
            } else {
                _addEventListener = "attachEvent";
                prefix = "on";
            }

            // detect available wheel event
            support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
                    document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
                    "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

            window.addWheelListener = function (elem, callback, useCapture) {
                _addWheelListener(elem, support, callback, useCapture);

                // handle MozMousePixelScroll in older Firefox
                if (support == "DOMMouseScroll") {
                    _addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
                }
            };

            function _addWheelListener(elem, eventName, callback, useCapture) {
                elem[ _addEventListener ](prefix + eventName, support == "wheel" ? callback : function (originalEvent) {
                    !originalEvent && (originalEvent = window.event);

                    // create a normalized event object
                    var event = {
                        // keep a ref to the original event object
                        originalEvent: originalEvent,
                        target: originalEvent.target || originalEvent.srcElement,
                        type: "wheel",
                        deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                        deltaX: 0,
                        deltaY: 0,
                        deltaZ: 0,
                        preventDefault: function () {
                            originalEvent.preventDefault ?
                                    originalEvent.preventDefault() :
                                    originalEvent.returnValue = false;
                        }
                    };

                    // calculate deltaY (and deltaX) according to the event
                    if (support == "mousewheel") {
                        event.deltaY = -1 / 40 * originalEvent.wheelDelta;
                        // Webkit also support wheelDeltaX
                        originalEvent.wheelDeltaX && (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX);
                    } else {
                        event.deltaY = originalEvent.detail;
                    }

                    // it's time to fire the callback
                    return callback(event);

                }, useCapture || false);
            }

        })(window, document);

        // IE7 and 8 support for indexOf
        Array.prototype.indexOf || (Array.prototype.indexOf = function (d, e) {
            var a;
            if (null == this)
                throw new TypeError('"this" is null or not defined');
            var c = Object(this),
                    b = c.length >>> 0;
            if (0 === b)
                return -1;
            a = +e || 0;
            Infinity === Math.abs(a) && (a = 0);
            if (a >= b)
                return -1;
            for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b; ) {
                if (a in c && c[a] === d)
                    return a;
                a++;
            }
            return -1;
        });

        /**
         * Converts global coordinates to canvas relative coordinates
         * http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
         * 
         * TODO: Optimize
         * 
         * @param {type} event
         * @returns {Util_L26.relMouseCoords.UtilAnonym$0}
         */
        function relMouseCoords(event) {

            var rect = this.getBoundingClientRect();
            return {x: event.clientX - rect.left, y: event.clientY - rect.top};
        }

        HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

    },
    // http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
    isNumeric: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    
    /**
     * @stof 105034
     * @returns {String}
     */
    generateUUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
};
},{}],20:[function(require,module,exports){
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

/**
 * Returns the size of the canvas element in pixels.
 * 
 * @param {Graph2D} graph the graph that we're looking at the canvas of
 * @returns {Array}
 */
module.exports = function (graph) {
    return [graph.getContext().canvas.width, graph.getContext().canvas.height];
};
},{}],21:[function(require,module,exports){
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


module.exports = function (mouseEvent, graph) {

    var coords = graph.getContext().canvas.relMouseCoords(mouseEvent);

    var scale = graph.getScale();
    var pos = graph.getPosition();

    var graphX = (coords.x / scale) - pos[0];
    var graphY = (coords.y / scale) - pos[1];

    return {"x": graphX, "y": graphY};
};
},{}]},{},[8])(8)
});