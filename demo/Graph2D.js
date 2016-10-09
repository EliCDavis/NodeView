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
    
    self.setOption = function(optionName, value){
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

        cvs.addEventListener('mouseup', function (e) {
            _mouseUpCalled(e);
        });

        cvs.addEventListener('mousedown', function (e) {
            _mouseDownCalled(e);
        });

        cvs.addEventListener('mouseout', function (e) {
            _mouseOutCalled(e);
        });

        cvs.addEventListener('mousemove', function (e) {
            _mouseMoveCalled(e);
        });

        cvs.addEventListener('mousewheel', function (e) {
            ScaleForScrollEvent(e, self);
        });

        cvs.addEventListener('dblclick', function (e) {
            _doubleClickCalled(e);
        });

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

        _enabledNodes.forEach(function(node){
            node.clearLinks();
        });

        _nodeLinks = [];
    };


    self.clearNodes = function(){
        _enabledNodes = [];
        self.clearLinks();
    };

    /**
     * Attempts to remove a node from the graph.
     * 
     * @param {type} node The node to be removed
     * @returns {Boolean} whether or not a node was removed
     */
    self.destroyNode = function(node){
        
        if(!node){
            return false;
        }
        
        // See if the node is in the enabled list.
        for(var i = 0; i < _enabledNodes.length; i ++){
            if(_enabledNodes[i].getId() === node.getId()){
                _enabledNodes.splice(i, 1);
                return true;
            }
        }
        
        // Now make sure it's not in the disabled nodes.
        for(var i = 0; i < _enabledNodes.length; i ++){
            if(_enabledNodes[i].getId() === node.getId()){
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
    self.disableNode = function(node){
        
        if(!node){
            return false;
        }
        
        for(var i = 0; i < _enabledNodes.length; i ++){
            if(_enabledNodes[i].getId() === node.getId()){
                _disabledNodes.push(_enabledNodes[i]);
                _enabledNodes[i].setEnabled(false);
                _enabledNodes.splice(i, 1);
                return true;
            }
        }
        
        return false;
    };
    
    self.enableNode = function(node){
        
        if(!node){
            return false;
        }
        
        for(var i = 0; i < _disabledNodes.length; i ++){
            if(_disabledNodes[i].getId() === node.getId()){
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
    self.getNodeClosestToPoint = function(point, nodes){
        
        if(!point){
            return null;
        }
        
        if(!nodes){
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
        
        if(typeof newScale !== 'number' || newScale <= 0){
            return;
        }
        
        _scale = newScale;
    };


    var _scaleToBounds = function(bounds){
        
        var desiredScale = _scale;
        
        if(GetCanvasSizeOfGraph(self)[0] < GetCanvasSizeOfGraph(self)[1]){
            
            // Scale by width
            var desiredWidth = bounds[2];
            var currentUnscaledWidth = GetCanvasSizeOfGraph(self)[0];
            
            desiredScale = currentUnscaledWidth/desiredWidth;
            
        } else {

            // Scale by height
            var desiredHeight = bounds[3];
            var currentUnscaledHeight = GetCanvasSizeOfGraph(self)[1];
            
            desiredScale = currentUnscaledHeight/desiredHeight;
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


    self.centerOverNodes = function(nodes, duration){
        
    };


    var _centerOnNodes = function () {

        if (!_enabledNodes || _enabledNodes.length === 0) {
            return;
        }
        
        var bounds = self.getBoundsFromNodes(_enabledNodes);
        
        _scaleToBounds(bounds);

        var average = [bounds[0]+(bounds[2]/2), bounds[1]+(bounds[3]/2)];
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

        // Draw lines to show child parent relationship
        _enabledNodes.forEach(function (node) {
            node.getChildren().forEach(function (link) {

                var ctx = self.getContext();

                ctx.beginPath();
                ctx.moveTo((node.getPosition()[0] + _xPosition) * _scale,
                        (node.getPosition()[1] + _yPosition) * _scale);
                ctx.lineTo((link.getPosition()[0] + _xPosition) * _scale,
                        (link.getPosition()[1] + _yPosition) * _scale);
                ctx.stroke();

            });
        });

        // Draw the lines between nodes to display links
        _nodeLinks.forEach(function (link) {

            if(!link.nodes[0].enabled() || !link.nodes[1].enabled()){
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
            if(_graphOptions.applyTranslation()){
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
        window.requestAnimationFrame(_drawFrame);

    };

    var _lastDrawFrame = Date.now();

    _drawFrame();

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
        node.setRenderDataByKey('color', '#000000');
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
     * A list of all nodes that consider this node a parent.
     * 
     * @type Array
     */
    var _children = [];


    /**
     * The current parent of the node.
     * @type Node2D
     */
    var _parent = null;


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

    /**
     * @stof 105034
     * @returns {String}
     */
    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    
    var _id = generateUUID();
    
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


    self.setParent = function (newParent) {

        // TODO: Make sure we're not setting one of our children or children childrens as our parent.

        // Make sure our parent knows we're leaving them for another..
        if (_parent !== null && _parent !== undefined) {
            _parent.removeChild(self);
        }

        _parent = newParent;

        if (_parent.getChildren().indexOf(self) === -1) {
            _parent.addChild(self);
        }

    };


    self.getParent = function () {
        return _parent;
    };


    self.addChild = function (child) {

        // TODO: Make sure this child does not exist ANYWHERE on the family tree

        // Make sure we don't already have the child
        if (_children.indexOf(child) !== -1) {
            console.log("We already have that node as a child; ", child);
            return;
        }

        _children.push(child);

        if (child.getParent() !== self) {
            child.setParent(self);
        }

    };


    self.getChildren = function () {
        return _children;
    };


    self.removeChild = function (child) {

        var index = _children.indexOf(child);

        if (index === -1) {
            throw "Failure to remove child! Trying to remove a child we don't have!";
        }

        _children.splice(index, 1);

    };

}
},{}],17:[function(require,module,exports){
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

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3 * g.getScale();
    ctx.beginPath();
    ctx.moveTo(startPos[0], startPos[1]);
    ctx.lineTo(endPos[0], endPos[1]);
    ctx.stroke();
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
        mainColor = "#777777";
    }

    var ctx = graph.getContext();
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(nodeCanvasPos[0],
            nodeCanvasPos[1],
            node.getRadius() * graph.getScale() * .8,
            0,
            2 * Math.PI);
    ctx.fill();

    if (node.getRenderData()['$mouseOver']) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(nodeCanvasPos[0],
                nodeCanvasPos[1],
                node.getRadius() * graph.getScale() * .8 * .5,
                0,
                2 * Math.PI);
        ctx.fill();
    }

    if (node.getRenderData()['$beingDragged']) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(nodeCanvasPos[0],
                nodeCanvasPos[1],
                node.getRadius() * graph.getScale() * .8 * .3,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvR3JhcGgvQXBwbHlHcmF2aXR5T25Ob2Rlcy5qcyIsInNyYy9HcmFwaC9CYXRjaFBsYWNlbWVudC5qcyIsInNyYy9HcmFwaC9EZWZhdWx0Tm9kZUF0dHJhY3Rpb24uanMiLCJzcmMvR3JhcGgvR2V0Qm91bmRzRnJvbU5vZGVzLmpzIiwic3JjL0dyYXBoL0dldEZyZWVTcGFjZS5qcyIsInNyYy9HcmFwaC9HZXROb2RlQ2VudGVyLmpzIiwic3JjL0dyYXBoL0dldE5vZGVDbG9zZXN0VG9Qb2ludC5qcyIsInNyYy9HcmFwaC9HcmFwaDJELmpzIiwic3JjL0dyYXBoL0dyYXBoT3B0aW9ucy5qcyIsInNyYy9HcmFwaC9TY2FsZUZvclNjcm9sbEV2ZW50LmpzIiwic3JjL0dyYXBoL1NldE5vZGVBc0JlaW5nRHJhZ2dlZC5qcyIsInNyYy9HcmFwaC9TZXROb2RlQXNIb3ZlcmVkLmpzIiwic3JjL0dyYXBoL1NldE5vZGVBc05vdEhvdmVyZWQuanMiLCJzcmMvR3JhcGgvU2V0Tm9kZU5vdEJlaW5nRHJhZ2dlZC5qcyIsInNyYy9HcmFwaC9TZXR1cE5vZGUuanMiLCJzcmMvTm9kZTJELmpzIiwic3JjL1JlbmRlcmluZy9EZWZhdWx0TGlua1JlbmRlci5qcyIsInNyYy9SZW5kZXJpbmcvRGVmYXVsdE5vZGVSZW5kZXIuanMiLCJzcmMvVXRpbC5qcyIsInNyYy9VdGlsL0dldENhbnZhc1NpemUuanMiLCJzcmMvVXRpbC9Nb3VzZVRvR3JhcGhDb29yZGluYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIFxyXG4gKiBUaGUgTUlUIExpY2Vuc2VcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTYgRWxpIERhdmlzLlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG4gKiBUSEUgU09GVFdBUkUuXHJcbiAqL1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5vZGVzVG9BcHBseSwgYXR0cmFjdGlvbk1ldGhvZCwgZ3Jhdml0eUNvbnN0YW50KSB7XHJcblxyXG4gICAgbm9kZXNUb0FwcGx5LmZvckVhY2goZnVuY3Rpb24gKG4pIHtcclxuXHJcbiAgICAgICAgLy8gQXBwbHkgYWNjZWxlcmF0aW9uIHRvIHRoZSBub2RlIGJhc2VkIG9uIHJlYWx0aXZlIHBvc2l0aW9uIHRvIFxyXG4gICAgICAgIC8vIGNlbnRlciBhbmQgb3RoZXIgbm9kZXMuXHJcbiAgICAgICAgdmFyIHRvdGFsQWNjZWxlcmF0aW9uID0gWzAsIDBdO1xyXG4gICAgICAgIG5vZGVzVG9BcHBseS5mb3JFYWNoKGZ1bmN0aW9uIChvTikge1xyXG5cclxuICAgICAgICAgICAgdmFyIGdhdml0YXRpb25EYXRhID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAobi5pc0xpbmtlZFdpdGgob04pKSB7XHJcbiAgICAgICAgICAgICAgICBnYXZpdGF0aW9uRGF0YS4kbGlua0RhdGEgPSBuLmdldExpbmtEYXRhKG9OKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGF0dHJhY3Rpb24gPSBhdHRyYWN0aW9uTWV0aG9kKFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NcIjogbi5nZXRQb3NpdGlvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1hc3NcIjogbi5nZXRSYWRpdXMoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJub2RlXCI6IG5cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NcIjogb04uZ2V0UG9zaXRpb24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXNzXCI6IG9OLmdldFJhZGl1cygpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5vZGVcIjogb05cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdhdml0YXRpb25EYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgKSAqIGdyYXZpdHlDb25zdGFudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBwdWxsID0gX2dldEdyYXZpdGF0aW9uYWxQdWxsKFxyXG4gICAgICAgICAgICAgICAgICAgIG4uZ2V0UG9zaXRpb24oKSxcclxuICAgICAgICAgICAgICAgICAgICBvTi5nZXRQb3NpdGlvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJhY3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRvIHRoZSBhY2NlbGVyYXRpb24uXHJcbiAgICAgICAgICAgIHRvdGFsQWNjZWxlcmF0aW9uWzBdICs9IHB1bGxbMF07XHJcbiAgICAgICAgICAgIHRvdGFsQWNjZWxlcmF0aW9uWzFdICs9IHB1bGxbMV07XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgYXR0cmFjdGlvbiA9IGF0dHJhY3Rpb25NZXRob2QoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJwb3NcIjogbi5nZXRQb3NpdGlvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWFzc1wiOiBuLmdldFJhZGl1cygpLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibm9kZVwiOiBuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicG9zXCI6IFswLCAwXSxcclxuICAgICAgICAgICAgICAgICAgICBcIm1hc3NcIjogbi5nZXRSYWRpdXMoKSAqIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJncm91cFwiOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJGdyb3VwUG9zXCI6IHRydWVcclxuICAgICAgICAgICAgICAgIH0pICogZ3Jhdml0eUNvbnN0YW50O1xyXG5cclxuICAgICAgICB2YXIgcHVsbCA9IF9nZXRHcmF2aXRhdGlvbmFsUHVsbChcclxuICAgICAgICAgICAgICAgIG4uZ2V0UG9zaXRpb24oKSxcclxuICAgICAgICAgICAgICAgIFswLDBdLFxyXG4gICAgICAgICAgICAgICAgYXR0cmFjdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdG90YWxBY2NlbGVyYXRpb25bMF0gKz0gcHVsbFswXSAqIDU7XHJcbiAgICAgICAgdG90YWxBY2NlbGVyYXRpb25bMV0gKz0gcHVsbFsxXSAqIDU7XHJcblxyXG4gICAgICAgIG4uYWNjZWxlcmF0ZSh0b3RhbEFjY2VsZXJhdGlvblswXSwgdG90YWxBY2NlbGVyYXRpb25bMV0pO1xyXG5cclxuICAgIH0pO1xyXG5cclxufTtcclxuXHJcbmZ1bmN0aW9uIF9nZXRHcmF2aXRhdGlvbmFsUHVsbChwb3MxLCBwb3MyLCBhdHRyYWN0aW9uKSB7XHJcblxyXG4gICAgdmFyIHhEaXN0ID0gcG9zMlswXSAtIHBvczFbMF07XHJcbiAgICB2YXIgeURpc3QgPSBwb3MyWzFdIC0gcG9zMVsxXTtcclxuICAgIHZhciBkaXN0ID0gTWF0aC5zcXJ0KCh4RGlzdCAqIHhEaXN0KSArICh5RGlzdCAqIHlEaXN0KSk7XHJcblxyXG4gICAgaWYgKGRpc3QgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gWzAsIDBdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB0aGUgYW5nbGUgc28gd2UgY2FuIGFwcGx5IHRoZSBmb3VyY2UgcHJvcGVybHkgaW4geCBhbmQgeVxyXG4gICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKHlEaXN0IC8geERpc3QpO1xyXG5cclxuICAgIC8vIMKvXFxfKOODhClfL8KvXHJcbiAgICB2YXIgZGlyZWN0aW9uID0gMTtcclxuICAgIGlmICh4RGlzdCA8IDApIHtcclxuICAgICAgICBkaXJlY3Rpb24gPSAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgdG8gdGhlIGFjY2VsZXJhdGlvbi5cclxuICAgIHJldHVybiBbTWF0aC5jb3MoYW5nbGUpICogYXR0cmFjdGlvbiAqIGRpcmVjdGlvbixcclxuICAgICAgICBNYXRoLnNpbihhbmdsZSkgKiBhdHRyYWN0aW9uICogZGlyZWN0aW9uXTtcclxuXHJcbn1cclxuIiwiLyogXG4gKiBUaGUgTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG4vKipcbiAqIFxuICogQHBhcmFtIHt0eXBlfSBncmFwaFxuICogQHJldHVybnMge3VuZGVmaW5lZH0gQSBCdWZmZXIgZm9yIGFkZGluZyBub2RlcyBhbmQgdGhlbiBtYXNzIHBsYWNpbmcgdGhlbVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGdyYXBoKXtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBcbiAgICBzZWxmLmdyYXBoID0gZ3JhcGg7XG4gICAgXG4gICAgdmFyIG5vZGVzVG9QbGFjZSA9IFtdO1xuICAgIFxuICAgIHNlbGYuY3JlYXRlTm9kZSA9IGZ1bmN0aW9uKG5vZGVEYXRhKXtcbiAgICAgICAgbm9kZURhdGEucG9zaXRpb24gPSBbMCwgMF07XG4gICAgICAgIHZhciBub2RlID0gc2VsZi5ncmFwaC5jcmVhdGVOb2RlKG5vZGVEYXRhKTtcbiAgICAgICAgbm9kZXNUb1BsYWNlLnB1c2gobm9kZSk7XG4gICAgICAgIGdyYXBoLmRpc2FibGVOb2RlKG5vZGUpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuICAgIFxuICAgIFxuICAgIHZhciBfcGxhY2VOb2RlID0gZnVuY3Rpb24obm9kZSwgaW5pdCwgcG9zLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYWxsTm9kZXMpe1xuICAgICAgICBcbiAgICAgICAgbm9kZS5zZXRQb3NpdGlvbihwb3MpO1xuICAgIFxuICAgICAgICBpZihhbGxOb2Rlc1tub2RlLmdldElkKCldLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdmFyIHRvdGFsUmFkaXVzID0gMDtcbiAgICAgICAgYWxsTm9kZXNbbm9kZS5nZXRJZCgpXS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKXtcbiAgICAgICAgICAgIHRvdGFsUmFkaXVzICs9IGNoaWxkLmdldFJhZGl1cygpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHZhciBsYXN0UGxhY2VtZW50ID0gc3RhcnRBbmdsZTtcbiAgICAgICAgXG4gICAgICAgIGFsbE5vZGVzW25vZGUuZ2V0SWQoKV0uY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCl7XG4gICAgICAgICAgICB2YXIgYW5nbGUgPSAoZW5kQW5nbGUgLSBzdGFydEFuZ2xlKSAqIChjaGlsZC5nZXRSYWRpdXMoKSAvIHRvdGFsUmFkaXVzKTtcbiAgICAgICAgICAgIHZhciBkaWFtZXRlciA9IGNoaWxkLmdldFJhZGl1cygpKjI7XG4gICAgICAgICAgICB2YXIgZGlzcGxhY2VtZW50ID0gZGlhbWV0ZXIvYW5nbGU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB4ID0gZGlzcGxhY2VtZW50Kk1hdGguY29zKGxhc3RQbGFjZW1lbnQgKyAoYW5nbGUvMikpICsgaW5pdFswXTtcbiAgICAgICAgICAgIHZhciB5ID0gZGlzcGxhY2VtZW50Kk1hdGguc2luKGxhc3RQbGFjZW1lbnQgKyAoYW5nbGUvMikpICsgaW5pdFsxXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgX3BsYWNlTm9kZShjaGlsZCwgaW5pdCwgW3gseV0sIGxhc3RQbGFjZW1lbnQsIGxhc3RQbGFjZW1lbnQgKyBhbmdsZSwgYWxsTm9kZXMpO1xuICAgICAgICAgICAgbGFzdFBsYWNlbWVudCArPSBhbmdsZTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBNYXNzIFBsYWNlbWVudCBvZiBub2Rlcy5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHNlbGYuZmx1c2ggPSBmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgXG4gICAgICAgIG5vZGVzd01ldGEgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8vIEEgY29sbGVjdGlvbiBvZiBub2RlcyB3ZSdyZSBub3QgZ29pbmcgdG8gdHJ5IG9yZ2FuaXppbmcgbmljZWx5LlxuICAgICAgICBub2Rlc05vdEdvbm5hVHJ5ID0gW107XG4gICAgICAgIFxuICAgICAgICBub2Rlc1dpdGhOb1BhcmVudHMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIEJ1aWxkIGxpc3Qgb2Ygbm9kZXMsIGNoaWxkcmVuLCBhbmQgcGFyZW50XG4gICAgICAgIG5vZGVzVG9QbGFjZS5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpe1xuXG4gICAgICAgICAgICB2YXIgcGFyZW50cyA9IFtdO1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGRldGVybWluZSB3aGV0aGVyIG9yIG5vdCB0aGUgbGluayBpcyBhIGNoaWxkIG9yIHBhcmVudFxuICAgICAgICAgICAgbm9kZS5nZXRMaW5rcygpLmZvckVhY2goZnVuY3Rpb24obGluayl7XG4gICAgICAgICAgICAgICAgaWYobGluay5saW5rRGF0YS4kZGlyZWN0ZWRUb3dhcmRzKXtcbiAgICAgICAgICAgICAgICAgICAgaWYobGluay5saW5rRGF0YS4kZGlyZWN0ZWRUb3dhcmRzLmdldElkKCkgPT09IG5vZGUuZ2V0SWQoKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRzLnB1c2gobGluay5saW5rRGF0YS4kZGlyZWN0ZWRUb3dhcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2gobGluay5saW5rRGF0YS4kZGlyZWN0ZWRUb3dhcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHBhcmVudHMubGVuZ3RoID4gMSl7XG4gICAgICAgICAgICAgICAgbm9kZXNOb3RHb25uYVRyeS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHBhcmVudHMubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICAgICAgICBub2Rlc1dpdGhOb1BhcmVudHMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICBwYXJlbnRzID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBub2Rlc3dNZXRhW25vZGUuZ2V0SWQoKV0gPSB7XG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgICAgICAgICAgICAgcGFyZW50OiBwYXJlbnRzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBCdWlsZCBhIHRyZWUgcmVjdXJzaXZlbHkuLi5cbiAgICAgICAgbm9kZXNXaXRoTm9QYXJlbnRzLmZvckVhY2goZnVuY3Rpb24ocm9vdCl7XG4gICAgICAgICAgICBfcGxhY2VOb2RlKHJvb3QsIFswLDBdLCBbMCwwXSwgMCwgMipNYXRoLlBJLCBub2Rlc3dNZXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBGaW5hbGx5LCByZW5kZXIgYWxsIG5vZGVzIGluIHRoZSBlbmRcbiAgICAgICAgbm9kZXNUb1BsYWNlLmZvckVhY2goZnVuY3Rpb24obm9kZSl7XG4gICAgICAgICAgICBzZWxmLmdyYXBoLmVuYWJsZU5vZGUobm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCJUb29rIFwiKyhEYXRlLm5vdygpLXN0YXJ0KStcIiBtaWxpc2Vjb25kcyB0byBwbGFjZSBcIisgbm9kZXNUb1BsYWNlLmxlbmd0aCArXCIgbm9kZXNcIik7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBJbnN0ZWFkIG9mIHRyeWluZyB0byBmaW5kIHBvc2l0aW9ucyBmb3IgdGhpcyBiYXRjaCB3ZSBpbnN0ZWFkIGRpc2NhcmRcbiAgICAgKiBhbGwgbm9kZXMgdGhhdCBoYXZlIGJlZW4gYWRkZWQuXG4gICAgICogXG4gICAgICogQHJldHVybnMge051bWJlcn0gaG93IG1hbnkgbm9kZXMgd2hlcmUgZGVsZXRlZFxuICAgICAqL1xuICAgIHNlbGYuY2xlYXIgPSBmdW5jdGlvbigpe1xuICAgICAgICBub2Rlc1RvUGxhY2UuZm9yRWFjaChmdW5jdGlvbihub2RlKXtcbiAgICAgICAgICAgIHNlbGYuZ3JhcGguZGVzdHJveU5vZGUobm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgbGVuZ3RoID0gbm9kZXNUb1BsYWNlLmxlbmd0aDtcbiAgICAgICAgbm9kZXNUb1BsYWNlID0gW107XG4gICAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfTtcbiAgICBcbn07IiwiLyogXG4gKiBUaGUgTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRGVmYXVsdE5vZGVBdHRyYWN0aW9uKG5vZGUxLCBub2RlMiwgZXh0cmFEYXRhKSB7XG5cbiAgICB2YXIgZGF0YSA9IGV4dHJhRGF0YTtcbiAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkIHx8IGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgZGF0YSA9IHt9O1xuICAgIH1cblxuICAgIHZhciBwb3MxID0gbm9kZTEucG9zO1xuICAgIHZhciBwb3MyID0gbm9kZTIucG9zO1xuICAgIHZhciBtYXNzMSA9IG5vZGUxLm1hc3M7XG4gICAgdmFyIG1hc3MyID0gbm9kZTIubWFzcztcblxuICAgIHZhciB4RGlzdCA9IHBvczJbMF0gLSBwb3MxWzBdO1xuICAgIHZhciB5RGlzdCA9IHBvczJbMV0gLSBwb3MxWzFdO1xuICAgIHZhciBkaXN0ID0gTWF0aC5zcXJ0KCh4RGlzdCAqIHhEaXN0KSArICh5RGlzdCAqIHlEaXN0KSk7XG5cbiAgICAvLyBZZWFoIHlvdSBrbm93IHdoYXQgdGhpcyBpcy5cbiAgICB2YXIgbWFzc2VzID0gTWF0aC5hYnMobWFzczEgKiBtYXNzMik7XG5cbiAgICAvLyBZZWFoIHRoaXMgaXMgcGh5c2ljcyBkdWRlLlxuICAgIHZhciBhdHRyYWN0aW9uID0gKG1hc3NlcyAvIChkaXN0ICogZGlzdCkpICogMS4xO1xuXG4gICAgLy8gSWYgd2UncmUgdG9vIGNsb3NlIHRoZW4gbGV0J3MgcmVqZWN0XG4gICAgaWYgKGRpc3QgPCBtYXNzMSArIG1hc3MyKSB7XG4gICAgICAgIGF0dHJhY3Rpb24gKj0gLTMuNTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YVtcIiRncm91cFBvc1wiXSkge1xuICAgICAgICBhdHRyYWN0aW9uID0gLjA1O1xuICAgIH1cblxuICAgIHJldHVybiBhdHRyYWN0aW9uO1xuXG59OyIsIi8qIFxuICogVGhlIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IDIwMTYgRWxpIERhdmlzLlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobm9kZXMpIHtcblxuICAgIHZhciBjdXJCb3VuZHMgPSBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF07XG5cbiAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGN1ckJvdW5kcyA9IF9leHRlbmRCb3VuZHNGb3JOb2RlKG5vZGUsIGN1ckJvdW5kcyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY3VyQm91bmRzO1xuXG59O1xuXG5cbnZhciBfbm9kZUZpdHNJbkJvdW5kcyA9IGZ1bmN0aW9uIChub2RlLCBib3VuZHMpIHtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm91bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChib3VuZHNbaV0gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB4UG9zID0gbm9kZS5nZXRQb3NpdGlvbigpWzBdO1xuICAgIHZhciB5UG9zID0gbm9kZS5nZXRQb3NpdGlvbigpWzFdO1xuICAgIHZhciByID0gbm9kZS5nZXRSYWRpdXMoKTtcblxuICAgIGlmIChib3VuZHNbMF0gPiB4UG9zIC0gcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGJvdW5kc1swXSArIGJvdW5kc1syXSA8IHhQb3MgKyByKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoYm91bmRzWzFdID4geVBvcyAtIHIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChib3VuZHNbMV0gKyBib3VuZHNbM10gPCB5UG9zICsgcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbn07XG5cblxudmFyIF9leHRlbmRCb3VuZHNGb3JOb2RlID0gZnVuY3Rpb24gKG5vZGUsIGJvdW5kcykge1xuXG4gICAgaWYgKF9ub2RlRml0c0luQm91bmRzKG5vZGUsIGJvdW5kcykpIHtcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYm91bmRzW2ldID09PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgciA9IG5vZGUuZ2V0UmFkaXVzKCk7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG5vZGUuZ2V0UG9zaXRpb24oKVswXSAtIChyIC8gMiksXG4gICAgICAgICAgICAgICAgbm9kZS5nZXRQb3NpdGlvbigpWzFdIC0gKHIgLyAyKSxcbiAgICAgICAgICAgICAgICByLFxuICAgICAgICAgICAgICAgIHJcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgeFBvcyA9IG5vZGUuZ2V0UG9zaXRpb24oKVswXTtcbiAgICB2YXIgeVBvcyA9IG5vZGUuZ2V0UG9zaXRpb24oKVsxXTtcbiAgICB2YXIgciA9IG5vZGUuZ2V0UmFkaXVzKCk7XG5cbiAgICBpZiAoYm91bmRzWzBdID4geFBvcyAtIHIpIHtcbiAgICAgICAgdmFyIG5ld0JvdW5kID0geFBvcyAtIHI7XG4gICAgICAgIGJvdW5kc1syXSArPSBNYXRoLmFicyhib3VuZHNbMF0gLSBuZXdCb3VuZCk7XG4gICAgICAgIGJvdW5kc1swXSA9IG5ld0JvdW5kO1xuICAgIH1cblxuICAgIGlmIChib3VuZHNbMF0gKyBib3VuZHNbMl0gPCB4UG9zICsgcikge1xuICAgICAgICBib3VuZHNbMl0gPSB4UG9zICsgciAtIGJvdW5kc1swXTtcbiAgICB9XG5cbiAgICBpZiAoYm91bmRzWzFdID4geVBvcyAtIHIpIHtcbiAgICAgICAgYm91bmRzWzNdICs9IE1hdGguYWJzKHlQb3MgLSByIC0gYm91bmRzWzFdKTtcbiAgICAgICAgYm91bmRzWzFdID0geVBvcyAtIHI7XG4gICAgfVxuXG4gICAgaWYgKGJvdW5kc1sxXSArIGJvdW5kc1szXSA8IHlQb3MgKyByKSB7XG4gICAgICAgIGJvdW5kc1szXSA9IHlQb3MgKyByIC0gYm91bmRzWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBib3VuZHM7XG59O1xuXG4iLCIvKiBcbiAqIFRoZSBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAyMDE2IEVsaSBEYXZpcy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cbnZhciBHZXRDYW52YXNTaXplID0gcmVxdWlyZSgnLi4vVXRpbC9HZXRDYW52YXNTaXplJyk7XG52YXIgR2V0Tm9kZUNlbnRlciA9IHJlcXVpcmUoJy4vR2V0Tm9kZUNlbnRlcicpO1xuXG4vKipcbiAqIFJldHVybnMgeCBhbmQgeSBjb29yZGluYXRlcyB0aGF0IGFyZSBhdGxlYXN0IGFzIGZhciBhd2F5IGFzIHRoZSByYWRpdXNcbiAqIGZyb20gYWxsIG90aGVyIG5vZGVzIG9uIHRoZSBncmFwaC5cbiAqIFxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZGl1cyBob3cgbXVjaCBzcGFjZSB5b3UnZCBsaWtlIGJldHdlZW4gYWxsIHRoZSBwb2ludHNcbiAqIEByZXR1cm5zIHtBcnJheX0gW3gsIHldIGluIGdyYXBoIChub3QgY2FudmFzKSBjb29yZGluYXRlc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEdldEZyZWVTcGFjZShyYWRpdXMsIGdyYXBoKSB7XG5cbiAgICB2YXIgbm9kZXMgPSBncmFwaC5nZXROb2RlcygpO1xuXG4gICAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIgZ3JhcGhTaXplID0gR2V0Q2FudmFzU2l6ZShncmFwaCk7XG4gICAgICAgIHZhciBjZW50ZXJQb3MgPSBbZ3JhcGhTaXplWzBdIC8gMiwgZ3JhcGhTaXplWzFdIC8gMl07XG4gICAgICAgIHJldHVybiBbY2VudGVyUG9zWzBdICogKDEgLyBncmFwaC5nZXRTY2FsZSgpKSxcbiAgICAgICAgICAgIGNlbnRlclBvc1sxXSAqICgxIC8gZ3JhcGguZ2V0U2NhbGUoKSldO1xuICAgIH1cblxuICAgIHZhciBhdmVyYWdlQ2VudGVyID0gR2V0Tm9kZUNlbnRlcihub2Rlcyk7XG5cbiAgICAvLyBHZW5lcmF0ZSBhIGdyaWQgZXh0ZW5kaW5nIG91dCBmcm9tIGNlbnRlciB3aXRoIGNlbGxzIDEvNCBzaXplIG9mIHJhZGl1c1xuICAgIHZhciBzdGVwU2l6ZSA9IHJhZGl1cyAvIDQ7XG4gICAgdmFyIGN1clN0ZXAgPSAwO1xuXG4gICAgd2hpbGUgKGN1clN0ZXAgPCAxMDAwMCkgeyAvLyBEZWFyIGdvZCB3aGF0IGFtIEkgZG9pbmcuXG5cbiAgICAgICAgLy8gQ29uY2VwdHVhbGx5IHdlJ3JlIGV4dGVuZGluZyBvdXR3YXJkcyBpbiBhIGdyaWQgZmFzaW9uXG4gICAgICAgIC8vIHVudGlsIHdlIGZpbmQgYSBmcmVlIGdyaWQgc3BhY2UgZnJvbSB0aGUgY2VudGVyXG4gICAgICAgIC8vICAgICAgIF8gXyBfIF8gXyAgIF9cbiAgICAgICAgLy8gICAgICB8X3xffF98X3xffCA0IHxcbiAgICAgICAgLy8gICAgNCB8X3wgICAgIHxffCAzIHxfXyBTaXplIG9mIHdhbGwgaXMgNFxuICAgICAgICAvLyAgICAzIHxffCAgWCAgfF98IDIgfCAgIEZvciBhIDV4NSBncmlkLlxuICAgICAgICAvLyAgICAyIHxffF8gXyBffF98IDFffFxuICAgICAgICAvLyAgICAxIHxffF98X3xffF98XG4gICAgICAgIC8vICAgICAgICAgMSAyIDMgNFxuICAgICAgICB2YXIgc2l6ZU9mV2FsbCA9IChjdXJTdGVwICogMik7XG4gICAgICAgIGlmIChjdXJTdGVwID09PSAwKSB7XG4gICAgICAgICAgICBzaXplT2ZXYWxsID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgc2lkZXMgb2YgdGhlIHdhbGxcbiAgICAgICAgdmFyIGxlZnRTaWRlID0gW107XG4gICAgICAgIHZhciByaWdodFNpZGUgPSBbXTtcbiAgICAgICAgdmFyIGJvdHRvbVNpZGUgPSBbXTtcbiAgICAgICAgdmFyIHRvcFNpZGUgPSBbXTtcblxuICAgICAgICAvLyBHZXQgdGhlIG9mZnNldCBmcm9tIHRoZSBjZW50ZXJcbiAgICAgICAgdmFyIG9mZnNldCA9IChjdXJTdGVwICsgLjUpICogc3RlcFNpemU7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBkaWZmZXJlbnQgc3RhcnRpbmcgcG9zaXRpb25zIGR1ZSB0byBvZmZzZXRcbiAgICAgICAgLy8gKEZvdXIgY29ybmVycyBvZiBzcXVhcmUpXG4gICAgICAgIHZhciBib3R0b21MZWZ0ID0gW2F2ZXJhZ2VDZW50ZXJbMF0gLSBvZmZzZXQsIGF2ZXJhZ2VDZW50ZXJbMV0gLSBvZmZzZXRdO1xuICAgICAgICB2YXIgYm90dG9tUmlnaHQgPSBbYXZlcmFnZUNlbnRlclswXSArIG9mZnNldCwgYXZlcmFnZUNlbnRlclsxXSAtIG9mZnNldF07XG4gICAgICAgIHZhciB0b3BMZWZ0ID0gW2F2ZXJhZ2VDZW50ZXJbMF0gLSBvZmZzZXQsIGF2ZXJhZ2VDZW50ZXJbMV0gKyBvZmZzZXRdO1xuICAgICAgICB2YXIgdG9wUmlnaHQgPSBbYXZlcmFnZUNlbnRlclswXSArIG9mZnNldCwgYXZlcmFnZUNlbnRlclsxXSArIG9mZnNldF07XG5cbiAgICAgICAgLy8gQWRkIGFsbCB0aGUgcG90ZW50aWFsIHNwYWNlc1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemVPZldhbGw7IGkrKykge1xuICAgICAgICAgICAgbGVmdFNpZGUucHVzaChbYm90dG9tTGVmdFswXSwgYm90dG9tTGVmdFsxXSArIChzdGVwU2l6ZSAqIGkpXSk7XG4gICAgICAgICAgICByaWdodFNpZGUucHVzaChbdG9wUmlnaHRbMF0sIHRvcFJpZ2h0WzFdIC0gKHN0ZXBTaXplICogaSldKTtcbiAgICAgICAgICAgIGJvdHRvbVNpZGUucHVzaChbYm90dG9tUmlnaHRbMF0gLSAoc3RlcFNpemUgKiBpKSwgYm90dG9tUmlnaHRbMV1dKTtcbiAgICAgICAgICAgIHRvcFNpZGUucHVzaChbdG9wTGVmdFswXSArIChzdGVwU2l6ZSAqIGkpLCB0b3BMZWZ0WzFdXSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcG90ZW50aWFsU3BhY2VzID0gbGVmdFNpZGVcbiAgICAgICAgICAgICAgICAuY29uY2F0KHJpZ2h0U2lkZSlcbiAgICAgICAgICAgICAgICAuY29uY2F0KGJvdHRvbVNpZGUpXG4gICAgICAgICAgICAgICAgLmNvbmNhdCh0b3BTaWRlKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvdGVudGlhbFNwYWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHNwYWNlRnJlZShub2RlcywgcG90ZW50aWFsU3BhY2VzW2ldLCByYWRpdXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvdGVudGlhbFNwYWNlc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN1clN0ZXArKztcblxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwiRmFpbHVyZSB0byBmaW5kIHBsYWNlISBTb3JyeSBkdWRlLlwiKTtcblxuICAgIHJldHVybiBbMCwgMF07XG5cbn07XG5cbi8vIFRPRE86IE9wdGltaXplXG5mdW5jdGlvbiBzcGFjZUZyZWUobm9kZXMsIHAsIHJhZGl1cykge1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbnAgPSBub2Rlc1tpXS5nZXRQb3NpdGlvbigpO1xuXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhucFswXSAtIHBbMF0sIDIpICtcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhucFsxXSAtIHBbMV0sIDIpKTtcblxuICAgICAgICBpZiAoZGlzdGFuY2UgPCByYWRpdXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuXG59XG4iLCIvKiBcbiAqIFRoZSBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAyMDE2IEVsaSBEYXZpcy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBOb2RlQ2VudGVyKG5vZGVzVG9BdmVyYWdlKSB7XG4gICAgLy8gQXZlcmFnZSBhbmQgZmluZCBjZW50ZXIgb2YgYWxsIG5vZGVzXG4gICAgdmFyIGF2ZXJhZ2VDZW50ZXIgPSBbMCwgMF07XG5cbiAgICB2YXIgdG90YWwgPSBbMCwgMF07XG5cbiAgICAvLyBUb3RhbCB1cCBhbGwgdGhlIHBvc2l0aW9uc1xuICAgIG5vZGVzVG9BdmVyYWdlLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgdG90YWxbMF0gKz0gbm9kZS5nZXRQb3NpdGlvbigpWzBdO1xuICAgICAgICB0b3RhbFsxXSArPSBub2RlLmdldFBvc2l0aW9uKClbMV07XG4gICAgfSk7XG5cbiAgICAvLyBBdmVyYWdlIHRoZSB0b3RhbCB0byBnZXQgY2VudGVyXG4gICAgYXZlcmFnZUNlbnRlclswXSA9IHRvdGFsWzBdIC8gbm9kZXNUb0F2ZXJhZ2UubGVuZ3RoO1xuICAgIGF2ZXJhZ2VDZW50ZXJbMV0gPSB0b3RhbFsxXSAvIG5vZGVzVG9BdmVyYWdlLmxlbmd0aDtcblxuICAgIHJldHVybiBhdmVyYWdlQ2VudGVyO1xufTsiLCIvKiBcbiAqIFRoZSBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAyMDE2IEVsaSBEYXZpcy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBOb2RlQ2xvc3Rlc3RUb1BvaW50KHBvaW50LCBub2Rlcykge1xuXG4gICAgdmFyIGNsb3Nlc3ROb2RlID0gbnVsbDtcbiAgICB2YXIgYmVzdERpc3QgPSAxMDAwMDAwMDtcblxuICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgdmFyIGRpc3QgPSBub2RlLmRpc3RhbmNlRnJvbShwb2ludCk7XG4gICAgICAgIGlmIChkaXN0IDwgYmVzdERpc3QpIHtcbiAgICAgICAgICAgIGNsb3Nlc3ROb2RlID0gbm9kZTtcbiAgICAgICAgICAgIGJlc3REaXN0ID0gZGlzdDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNsb3Nlc3ROb2RlO1xuXG59OyIsIi8qIFxyXG4gKiBUaGUgTUlUIExpY2Vuc2VcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTYgRWxpIERhdmlzLlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG4gKiBUSEUgU09GVFdBUkUuXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoMkQ7XHJcblxyXG52YXIgR3JhcGhPcHRpb25zID0gcmVxdWlyZSgnLi9HcmFwaE9wdGlvbnMnKTtcclxudmFyIEFwcGx5R3Jhdml0eU9uTm9kZXMgPSByZXF1aXJlKCcuL0FwcGx5R3Jhdml0eU9uTm9kZXMnKTtcclxudmFyIFV0aWwgPSByZXF1aXJlKCcuLi9VdGlsJyk7XHJcbnZhciBTZXR1cE5ld05vZGUgPSByZXF1aXJlKCcuL1NldHVwTm9kZScpO1xyXG52YXIgR2V0Q2FudmFzU2l6ZU9mR3JhcGggPSByZXF1aXJlKCcuLi9VdGlsL0dldENhbnZhc1NpemUnKTtcclxudmFyIFNjYWxlRm9yU2Nyb2xsRXZlbnQgPSByZXF1aXJlKCcuL1NjYWxlRm9yU2Nyb2xsRXZlbnQnKTtcclxuXHJcbnZhciBTZXROb2RlQXNCZWluZ0RyYWdnZWQgPSByZXF1aXJlKCcuL1NldE5vZGVBc0JlaW5nRHJhZ2dlZCcpO1xyXG52YXIgU2V0Tm9kZU5vdEJlaW5nRHJhZ2dlZCA9IHJlcXVpcmUoJy4vU2V0Tm9kZU5vdEJlaW5nRHJhZ2dlZCcpO1xyXG52YXIgU2V0Tm9kZUFzSG92ZXJlZCA9IHJlcXVpcmUoJy4vU2V0Tm9kZUFzSG92ZXJlZCcpO1xyXG52YXIgU2V0Tm9kZUFzTm90SG92ZXJlZCA9IHJlcXVpcmUoJy4vU2V0Tm9kZUFzTm90SG92ZXJlZCcpO1xyXG5cclxudmFyIEdldE5vZGVDbG9zZXN0VG9Qb2ludCA9IHJlcXVpcmUoJy4vR2V0Tm9kZUNsb3Nlc3RUb1BvaW50Jyk7XHJcblxyXG5VdGlsLmluaXQoKTtcclxuXHJcbi8qKlxyXG4gKiBBIGdyYXBoIGZvciBkaXNwbGF5aW5nIGFuZCBpbnRlcmFjdGluZyB3aXRoIG5vZGVzLlxyXG4gKiBcclxuICogVGhlIHJlbmRlciBzdGVwcyBhcmU6XHJcbiAqID4gY2xlYXJcclxuICogPiBkcmF3YmFja2dyb3VuZFxyXG4gKiA+IGRyYXcgbm9kZSBjb25uZWN0aW9uc1xyXG4gKiA+IGRyYXcgbm9kZXNcclxuICogPiBwb3N0IHJlbmRlclxyXG4gKiBcclxuICogQHBhcmFtIHs8Y2FudmFzPn0gY2FudmFzXHJcbiAqIEByZXR1cm5zIHtHcmFwaDJEfVxyXG4gKi9cclxuZnVuY3Rpb24gR3JhcGgyRChjYW52YXMpIHtcclxuXHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGF0IHdlIG11bHRpcGx5IG91ciBub2RlcyBzaXplcyBhbmQgcG9zaXRpb25zIGJ5LlxyXG4gICAgICogU29tZXRoaW5nIGxpa2Ugem9vbWluZyBpbiBhbmQgb3V0IHdvdWxkIG1vZGlmeSB0aGlzIHZhbHVlXHJcbiAgICAgKiBcclxuICAgICAqIEB0eXBlIE51bWJlclxyXG4gICAgICovXHJcbiAgICB2YXIgX3NjYWxlID0gMTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgeCBjb29yZGluYXRlIHRoYXQgaXMgYXQgdGhlIHRvcCBsZWZ0IG9mIHRoZSBjYW52YXMgY3VycmVudGVseS5cclxuICAgICAqIFRoaXMgY2hhbmdlcyBhcyB0aGUgdXNlciBtb3ZlcyBhcm91bmQgb24gdGhlIGdyYXBoXHJcbiAgICAgKiBcclxuICAgICAqIEB0eXBlIE51bWJlclxyXG4gICAgICovXHJcbiAgICB2YXIgX3hQb3NpdGlvbiA9IDA7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHkgY29vcmRpbmF0ZSB0aGF0IGlzIGF0IHRoZSB0b3AgbGVmdCBvZiB0aGUgY2FudmFzIGN1cnJlbnRlbHkuXHJcbiAgICAgKiBUaGlzIGNoYW5nZXMgYXMgdGhlIHVzZXIgbW92ZXMgYXJvdW5kIG9uIHRoZSBncmFwaFxyXG4gICAgICogXHJcbiAgICAgKiBAdHlwZSBOdW1iZXJcclxuICAgICAqL1xyXG4gICAgdmFyIF95UG9zaXRpb24gPSAwO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFuIGFycmF5IG9mIG5vZGVzIHRoYXQgdGhlIGdyYXBoIHdpbGwgcmVuZGVyLlxyXG4gICAgICogV2hlbmV2ZXIgeW91IGFkZCBhIG5vZGUgdG8gdGhlIGdyYXBoIGl0IGdvZXMgaW4gaGVyZS5cclxuICAgICAqIFxyXG4gICAgICogQHR5cGUgTm9kZTJEW11cclxuICAgICAqL1xyXG4gICAgdmFyIF9lbmFibGVkTm9kZXMgPSBbXTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIE5vZGVzIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIHRvIHRoZSBncmFwaCwgYnV0IGFyZSBub3QgYmVpbmcgcmVuZGVyZWRcclxuICAgICAqL1xyXG4gICAgdmFyIF9kaXNhYmxlZE5vZGVzID0gW107XHJcbiAgICBcclxuXHJcbiAgICB2YXIgX2dyYXBoT3B0aW9ucyA9IG5ldyBHcmFwaE9wdGlvbnMoKTtcclxuICAgIFxyXG4gICAgc2VsZi5zZXRPcHRpb24gPSBmdW5jdGlvbihvcHRpb25OYW1lLCB2YWx1ZSl7XHJcbiAgICAgICAgX2dyYXBoT3B0aW9ucy5zZXRPcHRpb24ob3B0aW9uTmFtZSwgdmFsdWUpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgc2VsZi5ub2RlRGVjZWxlcmF0aW9uQ29uc3RhbnQgPSBfZ3JhcGhPcHRpb25zLm5vZGVEZWNlbGVyYXRpb25Db25zdGFudDtcclxuICAgIHNlbGYubWF4Tm9kZVNwZWVkID0gX2dyYXBoT3B0aW9ucy5tYXhOb2RlU3BlZWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcnJheSBvZiBvYmplY3RzIHRoYXQgcmVwcmVzZW50cyB0aGUgbGlua2FnZSBvZiAyIG5vZGVzLlxyXG4gICAgICogXHJcbiAgICAgKiBAdHlwZSBBcnJheVxyXG4gICAgICovXHJcbiAgICB2YXIgX25vZGVMaW5rcyA9IFtdO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtZXRob2QgdGhhdCBpcyBjYWxsZWQgd2hlbiB3ZSBoYXZlIGNsZWFyZWQgdGhlIGNhbnZhcyBhbmQgaXMgYWJvdXRcclxuICAgICAqIHRvIGRyYXcgdGhlIG5leHQgZnJhbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEB0eXBlIGZ1bmN0aW9uXHJcbiAgICAgKi9cclxuICAgIHZhciBfYmFja2dyb3VuZFJlbmRlck1ldGhvZCA9IG51bGw7XHJcblxyXG5cclxuICAgIHZhciBfbGlua1JlbmRlck1ldGhvZCA9IHJlcXVpcmUoJy4uL1JlbmRlcmluZy9EZWZhdWx0TGlua1JlbmRlcicpO1xyXG5cclxuXHJcbiAgICBzZWxmLm5vZGVzQXJlTGlua2VkID0gZnVuY3Rpb24gKG4xLCBuMikge1xyXG4gICAgICAgIHJldHVybiBuMS5pc0xpbmtlZFdpdGgobjIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgc2VsZi5zZXRMaW5rUmVuZGVyTWV0aG9kID0gZnVuY3Rpb24gKHJlbmRlck1ldGhvZCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHJlbmRlck1ldGhvZCAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsdXJlIHRvIHNldCBMaW5rIFJlbmRlciBNZXRob2QhIFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIEFyZ3VlbWVudCBtdXN0IGJlIHR5cGVvZiBmdW5jdGlvbiFcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZW5kZXJNZXRob2QubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsdXJlIHRvIHNldCBMaW5rIFJlbmRlciBNZXRob2QhIFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIE1ldGhvZCdzIGFyZ3VlbWVudCBsZW5ndGggbXVzdCBiZSA0IHNvIGl0XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuIGJlIHBhc3NlZCB0aGUgZ3JhcGggYmVpbmcgcmVuZGVyZWQsIG5vZGUgMVxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uIG9uIGNhbnZhcywgbm9kZSAyIHBvc2l0aW9uIG9uIGNhbnZhcywgYW5kXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYW55IGxpbmsgZGF0YSBhc3NvY2lhdGVkIHdpdGggdGhlbSFcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF9saW5rUmVuZGVyTWV0aG9kID0gcmVuZGVyTWV0aG9kO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHRoZSBtZXRob2QgdGhhdCBpcyBjYWxsZWQgd2hlbiBldmVyIHRoZSBjYW52YXMgaXMgYWJvdXQgdG8gYmVcclxuICAgICAqIGRyYXduIHRvIChhZnRlciBjbGVhcmluZyBpdCBhbmQgYmVmb3JlIGRyYXdpbmcgbm9kZXMpLlxyXG4gICAgICogVGhlIG1ldGhvZCBtdXN0IGFjY2VwdCAxIGFyZ3VtZW50IGJlaW5nIHRoZSBHcmFwaDJEIG9iamVjdCB0aGF0IGlzIGRvaW5nXHJcbiAgICAgKiB0aGUgcmVuZGVyaW5nLlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtZXRob2RcclxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuc2V0QmFja2dyb3VuZFJlbmRlck1ldGhvZCA9IGZ1bmN0aW9uIChtZXRob2QpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbHVyZSB0byBzZXQgQmFja2dyb3VuZCBSZW5kZXIgTWV0aG9kISBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBBcmd1ZW1lbnQgbXVzdCBiZSB0eXBlb2YgZnVuY3Rpb24hXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWV0aG9kLmxlbmd0aCAhPT0gMSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbHVyZSB0byBzZXQgQmFja2dyb3VuZCBSZW5kZXIgTWV0aG9kISBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBNZXRob2QncyBhcmd1ZW1lbnQgbGVuZ3RoIG11c3QgYmUgMSBzbyBpdFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbiBiZSBwYXNzZWQgdGhlIGdyYXBoIGJlaW5nIHJlbmRlcmVkIVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgX2JhY2tncm91bmRSZW5kZXJNZXRob2QgPSBtZXRob2Q7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICB2YXIgX21vdXNlVG9HcmFwaENvb3JkaW5hdGVzID0gcmVxdWlyZSgnLi4vVXRpbC9Nb3VzZVRvR3JhcGhDb29yZGluYXRlcycpO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb250ZXh0IG9mIHRoZSBjYW52YXMgdGhhdCB0aGlzIGdyYXBoIHdpbGwgZHJhdyB0by5cclxuICAgICAqIFxyXG4gICAgICogQHR5cGUgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXHJcbiAgICAgKi9cclxuICAgIHZhciBfY2FudmFzQ29udGV4dCA9IG51bGw7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7R3JhcGgyRC5fY2FudmFzQ29udGV4dHxDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2NhbnZhc0NvbnRleHQ7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjdXJyZW50IHN0YXR1cyBvZiB0aGUgdXNlcidzIG1vdXNlLlxyXG4gICAgICogQ2FuIGVpdGhlciBiZTogXHJcbiAgICAgKiAgICAgIGZyZWUgICAgICAgIFRoZSB1c2VyIGlzbid0IHRyeWluZyB0byBpbnRlcmFjdCB3aXRoIHRoZSBlbGVtbnRzIG9uIHRoZSBncmFwaFxyXG4gICAgICogICAgICBkcmFnZ2luZyAgICBUaGUgdXNlciBpcyBjdXJyZW50ZWx5IGRyYWdnaW5nIHNvbWV0aGluZ1xyXG4gICAgICogICAgICBob2xkICAgICAgICBUaGUgdXNlciBoYXMgY2xpY2tlZCBkb3duIG9uIGEgbm9kZSBidXQgaGFzbid0IG1vdmVkIGl0IHlldC5cclxuICAgICAqIEB0eXBlIFN0cmluZ1xyXG4gICAgICovXHJcbiAgICB2YXIgX2N1cnJlbnRNb3VzZVN0YXRlID0gXCJmcmVlXCI7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAdHlwZSBOb2RlMkR8R3JhcGgyRFxyXG4gICAgICovXHJcbiAgICB2YXIgX2l0ZW1CZWluZ0RyYWdnZWRPbkNhbnZhcyA9IG51bGw7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAdHlwZSBNb3VzZUV2ZW50XHJcbiAgICAgKi9cclxuICAgIHZhciBfbGFzdFNlZW5Nb3VzZVBvcyA9IG51bGw7XHJcblxyXG5cclxuICAgIHZhciBfbW91c2VVcENhbGxlZCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cclxuICAgICAgICBfbGFzdFNlZW5Nb3VzZVBvcyA9IGV2ZW50O1xyXG5cclxuICAgICAgICBpZiAoX2N1cnJlbnRNb3VzZVN0YXRlID09PSBcImRyYWdnaW5nXCIpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGVpciByZW5kZXIgc3RhdHVzXHJcbiAgICAgICAgICAgIGlmIChfaXRlbUJlaW5nRHJhZ2dlZE9uQ2FudmFzW1wiaXRlbVR5cGVcIl0gPT09IFwibm9kZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBTZXROb2RlTm90QmVpbmdEcmFnZ2VkKF9pdGVtQmVpbmdEcmFnZ2VkT25DYW52YXNbXCJpdGVtXCJdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgX2l0ZW1CZWluZ0RyYWdnZWRPbkNhbnZhcyA9IG51bGw7XHJcbiAgICAgICAgICAgIF9jdXJyZW50TW91c2VTdGF0ZSA9IFwiZnJlZVwiO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGaWd1cmUgb3V0IHdoYXQgTm9kZSB3YXMgY2xpY2tlZCAoaWYgYW55KSBhbmQgY2FsbCB0aGVpciBvbmNsaWNrIGZ1bmN0aW9uXHJcbiAgICAgICAgX2VuYWJsZWROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoX21vdXNlT3Zlck5vZGUobm9kZSwgX21vdXNlVG9HcmFwaENvb3JkaW5hdGVzKGV2ZW50LCBzZWxmKSkpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUub25jbGljayhub2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgX2N1cnJlbnRNb3VzZVN0YXRlID0gXCJmcmVlXCI7XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIF9tb3VzZU92ZXJOb2RlID0gZnVuY3Rpb24gKG5vZGUsIGNvb3Jkcykge1xyXG5cclxuICAgICAgICBpZiAobm9kZS5nZXRDbGlja0RldGVjdGlvbkZ1bmN0aW9uKCkgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9kZWZhdWx0Tm9kZU1vdXNlRGV0ZWN0aW9uKG5vZGUsIHNlbGYsIFtjb29yZHMueCwgY29vcmRzLnldKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS53YXNDbGlja2VkKHNlbGYsIFtjb29yZHMueCwgY29vcmRzLnldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIF9tb3VzZURvd25DYWxsZWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHJcbiAgICAgICAgX2xhc3RTZWVuTW91c2VQb3MgPSBldmVudDtcclxuXHJcbiAgICAgICAgdmFyIGNvb3JkcyA9IF9tb3VzZVRvR3JhcGhDb29yZGluYXRlcyhldmVudCwgc2VsZik7XHJcblxyXG4gICAgICAgIF9jdXJyZW50TW91c2VTdGF0ZSA9IFwiaG9sZFwiO1xyXG5cclxuICAgICAgICAvLyBGaWd1cmUgb3V0IHdoYXQgTm9kZSB3YXMgY2xpY2tlZCAoaWYgYW55KSBhbmQgdGhlbiBiZWdpbiBkcmFnZ2luZyBhcHByb3ByaWF0bGx5XHJcbiAgICAgICAgX2VuYWJsZWROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgd2FzQ2xpY2tlZCA9IF9tb3VzZU92ZXJOb2RlKG5vZGUsIGNvb3Jkcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAod2FzQ2xpY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgX2l0ZW1CZWluZ0RyYWdnZWRPbkNhbnZhcyA9IHtcIml0ZW1cIjogbm9kZSwgXCJpdGVtUG9zXCI6IG5vZGUuZ2V0UG9zaXRpb24oKSwgXCJtb3VzZVBvc1wiOiBbY29vcmRzLngsIGNvb3Jkcy55XSwgXCJpdGVtVHlwZVwiOiBcIm5vZGVcIn07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIElmIHdlIGRpZG4ndCBncmFiIGEgbm9kZSB0aGVuIHdlJ3ZlIGdyYWJiZWQgdGhlIGNhbnZhc1xyXG4gICAgICAgIGlmIChfaXRlbUJlaW5nRHJhZ2dlZE9uQ2FudmFzID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIF9pdGVtQmVpbmdEcmFnZ2VkT25DYW52YXMgPSB7XCJpdGVtXCI6IHNlbGYsIFwiaXRlbVBvc1wiOiBzZWxmLmdldFBvc2l0aW9uKCksIFwibW91c2VQb3NcIjogW2Nvb3Jkcy54LCBjb29yZHMueV0sIFwiaXRlbVR5cGVcIjogXCJncmFwaFwifTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIF9tb3VzZU91dENhbGxlZCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlaXIgcmVuZGVyIHN0YXR1c1xyXG4gICAgICAgIGlmIChfaXRlbUJlaW5nRHJhZ2dlZE9uQ2FudmFzICE9PSBudWxsICYmIF9pdGVtQmVpbmdEcmFnZ2VkT25DYW52YXNbXCJpdGVtVHlwZVwiXSA9PT0gXCJub2RlXCIpIHtcclxuICAgICAgICAgICAgU2V0Tm9kZU5vdEJlaW5nRHJhZ2dlZChfaXRlbUJlaW5nRHJhZ2dlZE9uQ2FudmFzW1wiaXRlbVwiXSk7XHJcbiAgICAgICAgICAgIFNldE5vZGVBc05vdEhvdmVyZWQoX2l0ZW1CZWluZ0RyYWdnZWRPbkNhbnZhc1tcIml0ZW1cIl0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgX2xhc3RTZWVuTW91c2VQb3MgPSBudWxsO1xyXG4gICAgICAgIF9pdGVtQmVpbmdEcmFnZ2VkT25DYW52YXMgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoX2N1cnJlbnRNb3VzZVN0YXRlID09PSBcImRyYWdnaW5nXCIpIHtcclxuICAgICAgICAgICAgX2N1cnJlbnRNb3VzZVN0YXRlID0gXCJmcmVlXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIHZhciBfbW91c2VNb3ZlQ2FsbGVkID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcblxyXG4gICAgICAgIF9sYXN0U2Vlbk1vdXNlUG9zID0gZXZlbnQ7XHJcblxyXG4gICAgICAgIGlmIChfY3VycmVudE1vdXNlU3RhdGUgPT09IFwiaG9sZFwiKSB7XHJcblxyXG4gICAgICAgICAgICBfY3VycmVudE1vdXNlU3RhdGUgPSBcImRyYWdnaW5nXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlaXIgcmVuZGVyIHN0YXR1c1xyXG4gICAgICAgICAgICBpZiAoX2l0ZW1CZWluZ0RyYWdnZWRPbkNhbnZhc1tcIml0ZW1UeXBlXCJdID09PSBcIm5vZGVcIikge1xyXG4gICAgICAgICAgICAgICAgU2V0Tm9kZUFzQmVpbmdEcmFnZ2VkKF9pdGVtQmVpbmdEcmFnZ2VkT25DYW52YXNbXCJpdGVtXCJdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfY3VycmVudE1vdXNlU3RhdGUgPT09IFwiZHJhZ2dpbmdcIikge1xyXG5cclxuICAgICAgICAgICAgdmFyIG9yZ1BvcyA9IF9pdGVtQmVpbmdEcmFnZ2VkT25DYW52YXNbXCJpdGVtUG9zXCJdO1xyXG4gICAgICAgICAgICB2YXIgb3JnTW91c2VQb3MgPSBfaXRlbUJlaW5nRHJhZ2dlZE9uQ2FudmFzW1wibW91c2VQb3NcIl07XHJcblxyXG4gICAgICAgICAgICBpZiAoX2l0ZW1CZWluZ0RyYWdnZWRPbkNhbnZhc1tcIml0ZW1UeXBlXCJdID09PSBcIm5vZGVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjb29yZHMgPSBfbW91c2VUb0dyYXBoQ29vcmRpbmF0ZXMoZXZlbnQsIHNlbGYpO1xyXG5cclxuICAgICAgICAgICAgICAgIF9pdGVtQmVpbmdEcmFnZ2VkT25DYW52YXNbXCJpdGVtXCJdLnNldFBvc2l0aW9uKGNvb3Jkcy54ICsgKG9yZ1Bvc1swXSAtIG9yZ01vdXNlUG9zWzBdKSwgY29vcmRzLnkgKyAob3JnUG9zWzFdIC0gb3JnTW91c2VQb3NbMV0pKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChfaXRlbUJlaW5nRHJhZ2dlZE9uQ2FudmFzW1wiaXRlbVR5cGVcIl0gPT09IFwiZ3JhcGhcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjb29yZHMgPSBzZWxmLmdldENvbnRleHQoKS5jYW52YXMucmVsTW91c2VDb29yZHMoZXZlbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBncmFwaFggPSBjb29yZHMueCAvIF9zY2FsZTtcclxuICAgICAgICAgICAgICAgIHZhciBncmFwaFkgPSBjb29yZHMueSAvIF9zY2FsZTtcclxuXHJcbiAgICAgICAgICAgICAgICBfaXRlbUJlaW5nRHJhZ2dlZE9uQ2FudmFzW1wiaXRlbVwiXS5zZXRQb3NpdGlvbihncmFwaFggLSBvcmdNb3VzZVBvc1swXSwgZ3JhcGhZIC0gb3JnTW91c2VQb3NbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIHZhciBfZG91YmxlQ2xpY2tDYWxsZWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHJcbiAgICAgICAgdmFyIGNvb3JkcyA9IF9tb3VzZVRvR3JhcGhDb29yZGluYXRlcyhldmVudCwgc2VsZik7XHJcblxyXG4gICAgICAgIC8vIEZpZ3VyZSBvdXQgd2hhdCBOb2RlIHdhcyBjbGlja2VkIChpZiBhbnkpIGFuZCBjYWxsIHRoZWlyIGRvdWJsZSBjbGljayBmdW5jdGlvblxyXG4gICAgICAgIF9lbmFibGVkTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKF9tb3VzZU92ZXJOb2RlKG5vZGUsIGNvb3JkcykpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUub25kb3VibGVjbGljayhub2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCdzIGFsbCB0aGUgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBjYW52YXMgZm9yIHVzZXIgaW50ZXJhY3Rpb24uXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7PGNhbnZhcz59IGN2cyBUaGUgY2FudmFzIGVsZW1lbnQgb24gdGhlIHBhZ2VcclxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIHZhciBfaW5pdGlhbGl6ZUdyYXBoID0gZnVuY3Rpb24gKGN2cykge1xyXG5cclxuICAgICAgICBjdnMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIF9tb3VzZVVwQ2FsbGVkKGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjdnMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgX21vdXNlRG93bkNhbGxlZChlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY3ZzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgX21vdXNlT3V0Q2FsbGVkKGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjdnMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgX21vdXNlTW92ZUNhbGxlZChlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY3ZzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBTY2FsZUZvclNjcm9sbEV2ZW50KGUsIHNlbGYpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjdnMuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBfZG91YmxlQ2xpY2tDYWxsZWQoZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gT25seSBncmFiIHRoZSBjb250ZXh0IGlmIHdlIGhhdmUgYSBjYW52YXMgdG8gZ3JhYiBmcm9tXHJcbiAgICBpZiAoY2FudmFzICE9PSBudWxsICYmIGNhbnZhcyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgX2NhbnZhc0NvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgIF9pbml0aWFsaXplR3JhcGgoY2FudmFzKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGcm9tIFdpa2lwZWRpYTpcclxuICAgICAqIEtydXNrYWwncyBhbGdvcml0aG0gaXMgYSBtaW5pbXVtLXNwYW5uaW5nLXRyZWUgYWxnb3JpdGhtIHdoaWNoIGZpbmRzIGFuIFxyXG4gICAgICogZWRnZSBvZiB0aGUgbGVhc3QgcG9zc2libGUgd2VpZ2h0IHRoYXQgY29ubmVjdHMgYW55IHR3byB0cmVlcyBpbiB0aGUgZm9yZXN0XHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gc3RhcnRpbmdOb2RlXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE5vZGUsIE5vZGUpOk51bWJlcn0gd2VpZ2h0RnVuY3Rpb25cclxuICAgICAqIEByZXR1cm5zIHtOb2RlTGlua1tdfVxyXG4gICAgICovXHJcbiAgICBzZWxmLmtydXNrYWxzUGF0aCA9IGZ1bmN0aW9uIChzdGFydGluZ05vZGUsIHdlaWdodEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhyb3cgXCJub3QgeWV0IGltcGxlbWVudGVkIVwiO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgc2VsZi5nZXROb2RlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2VuYWJsZWROb2RlcztcclxuICAgIH07XHJcblxyXG5cclxuICAgIHNlbGYuY2xlYXJMaW5rcyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgX2VuYWJsZWROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpe1xyXG4gICAgICAgICAgICBub2RlLmNsZWFyTGlua3MoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgX25vZGVMaW5rcyA9IFtdO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgc2VsZi5jbGVhck5vZGVzID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBfZW5hYmxlZE5vZGVzID0gW107XHJcbiAgICAgICAgc2VsZi5jbGVhckxpbmtzKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0ZW1wdHMgdG8gcmVtb3ZlIGEgbm9kZSBmcm9tIHRoZSBncmFwaC5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBub2RlIFRoZSBub2RlIHRvIGJlIHJlbW92ZWRcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSB3aGV0aGVyIG9yIG5vdCBhIG5vZGUgd2FzIHJlbW92ZWRcclxuICAgICAqL1xyXG4gICAgc2VsZi5kZXN0cm95Tm9kZSA9IGZ1bmN0aW9uKG5vZGUpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCFub2RlKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBTZWUgaWYgdGhlIG5vZGUgaXMgaW4gdGhlIGVuYWJsZWQgbGlzdC5cclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgX2VuYWJsZWROb2Rlcy5sZW5ndGg7IGkgKyspe1xyXG4gICAgICAgICAgICBpZihfZW5hYmxlZE5vZGVzW2ldLmdldElkKCkgPT09IG5vZGUuZ2V0SWQoKSl7XHJcbiAgICAgICAgICAgICAgICBfZW5hYmxlZE5vZGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE5vdyBtYWtlIHN1cmUgaXQncyBub3QgaW4gdGhlIGRpc2FibGVkIG5vZGVzLlxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBfZW5hYmxlZE5vZGVzLmxlbmd0aDsgaSArKyl7XHJcbiAgICAgICAgICAgIGlmKF9lbmFibGVkTm9kZXNbaV0uZ2V0SWQoKSA9PT0gbm9kZS5nZXRJZCgpKXtcclxuICAgICAgICAgICAgICAgIF9lbmFibGVkTm9kZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gR3Vlc3Mgd2UgY291bGRuJ3QgZmluZCB0aGUgbm9kZS4uXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBub2RlIFRoZSBub2RlIHRvIGRpc2FibGVcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgbm9kZSB3YXMgc3VjY2VzZnVsbHkgZGlzYWJlbGRcclxuICAgICAqL1xyXG4gICAgc2VsZi5kaXNhYmxlTm9kZSA9IGZ1bmN0aW9uKG5vZGUpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCFub2RlKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgX2VuYWJsZWROb2Rlcy5sZW5ndGg7IGkgKyspe1xyXG4gICAgICAgICAgICBpZihfZW5hYmxlZE5vZGVzW2ldLmdldElkKCkgPT09IG5vZGUuZ2V0SWQoKSl7XHJcbiAgICAgICAgICAgICAgICBfZGlzYWJsZWROb2Rlcy5wdXNoKF9lbmFibGVkTm9kZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgX2VuYWJsZWROb2Rlc1tpXS5zZXRFbmFibGVkKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIF9lbmFibGVkTm9kZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgc2VsZi5lbmFibGVOb2RlID0gZnVuY3Rpb24obm9kZSl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIW5vZGUpe1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBfZGlzYWJsZWROb2Rlcy5sZW5ndGg7IGkgKyspe1xyXG4gICAgICAgICAgICBpZihfZGlzYWJsZWROb2Rlc1tpXS5nZXRJZCgpID09PSBub2RlLmdldElkKCkpe1xyXG4gICAgICAgICAgICAgICAgX2VuYWJsZWROb2Rlcy5wdXNoKF9kaXNhYmxlZE5vZGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIF9kaXNhYmxlZE5vZGVzW2ldLnNldEVuYWJsZWQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBfZGlzYWJsZWROb2Rlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBCYXRjaFBsYWNlbWVudCA9IHJlcXVpcmUoJy4vQmF0Y2hQbGFjZW1lbnQnKTtcclxuXHJcbiAgICB2YXIgX2J1ZmZlclBsYWNlbWVudCA9IG5ldyBCYXRjaFBsYWNlbWVudChzZWxmKTtcclxuXHJcbiAgICBzZWxmLmJhdGNoQ3JlYXRlTm9kZSA9IF9idWZmZXJQbGFjZW1lbnQuY3JlYXRlTm9kZTtcclxuICAgIHNlbGYuYmF0Y2hDbGVhciA9IF9idWZmZXJQbGFjZW1lbnQuY2xlYXI7XHJcbiAgICBzZWxmLmJhdGNoRmx1c2ggPSBfYnVmZmVyUGxhY2VtZW50LmZsdXNoO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0J3MgdGhlIG5vZGUgd2hvJ3MgcG9zaXRpb24gY2xvc2VzdCB0byB0aGUgcG9pbnQgc3BlY2lmaWVkXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gcG9pbnQgW3gseV1cclxuICAgICAqIEBwYXJhbSB7dHlwZX0gbm9kZXMgV2lsbCBvbmx5IGxvb2sgYXQgdGhlc2Ugbm9kZXMgd2hlbiBzZWVpbmcgd2hpY2ggb25lcyBjbG9zZXN0IHRvIHRoZSBwb2ludC4gIERlZmF1bHRzIHRvIGFsbCBub2RlcyBpbiBncmFwaFxyXG4gICAgICogQHJldHVybnMge3VucmVzb2x2ZWR9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuZ2V0Tm9kZUNsb3Nlc3RUb1BvaW50ID0gZnVuY3Rpb24ocG9pbnQsIG5vZGVzKXtcclxuICAgICAgICBcclxuICAgICAgICBpZighcG9pbnQpe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIW5vZGVzKXtcclxuICAgICAgICAgICAgcmV0dXJuIEdldE5vZGVDbG9zZXN0VG9Qb2ludChwb2ludCwgX2VuYWJsZWROb2Rlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBHZXROb2RlQ2xvc2VzdFRvUG9pbnQocG9pbnQsIG5vZGVzKTtcclxuICAgICAgICBcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY2VudGVyIG9mIHRoZSBjYW52YXMgaW4gdGhlIGZvcm0gb2YgW3gsIHldIFxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtfeFBvc2l0aW9uLCBfeVBvc2l0aW9uXTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0J3MgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGdyYXBoXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7dHlwZX0geFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSB5XHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBzZWxmLnNldFBvc2l0aW9uID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuXHJcbiAgICAgICAgaWYgKCFVdGlsLmlzTnVtZXJpYyh4KSkge1xyXG4gICAgICAgICAgICB0aHJvdyBcIkZhaWxlZCB0byBzZXQgZ3JhcGggcG9zaXRpb24hICBJbnZhbGlkIHggdmFsdWU6IFwiICsgeDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghVXRpbC5pc051bWVyaWMoeSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJGYWlsZWQgdG8gc2V0IGdyYXBoIHBvc2l0aW9uISAgSW52YWxpZCB5IHZhbHVlOiBcIiArIHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBfeFBvc2l0aW9uID0geDtcclxuICAgICAgICBfeVBvc2l0aW9uID0geTtcclxuXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgc2NhbGUgaW4gd2hpY2ggcG9zaXRpb25zIGFuZCBzaXplcyB0aGUgbm9kZXMgYXJlXHJcbiAgICAgKiB0byBiZSBtdWx0aXBsaWVkIGJ5LlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBzZWxmLmdldFNjYWxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBfc2NhbGU7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBcclxuICAgIHNlbGYuc2V0U2NhbGUgPSBmdW5jdGlvbiAobmV3U2NhbGUpIHtcclxuICAgICAgICBcclxuICAgICAgICBpZih0eXBlb2YgbmV3U2NhbGUgIT09ICdudW1iZXInIHx8IG5ld1NjYWxlIDw9IDApe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIF9zY2FsZSA9IG5ld1NjYWxlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIF9zY2FsZVRvQm91bmRzID0gZnVuY3Rpb24oYm91bmRzKXtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZGVzaXJlZFNjYWxlID0gX3NjYWxlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKEdldENhbnZhc1NpemVPZkdyYXBoKHNlbGYpWzBdIDwgR2V0Q2FudmFzU2l6ZU9mR3JhcGgoc2VsZilbMV0pe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gU2NhbGUgYnkgd2lkdGhcclxuICAgICAgICAgICAgdmFyIGRlc2lyZWRXaWR0aCA9IGJvdW5kc1syXTtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRVbnNjYWxlZFdpZHRoID0gR2V0Q2FudmFzU2l6ZU9mR3JhcGgoc2VsZilbMF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkZXNpcmVkU2NhbGUgPSBjdXJyZW50VW5zY2FsZWRXaWR0aC9kZXNpcmVkV2lkdGg7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBTY2FsZSBieSBoZWlnaHRcclxuICAgICAgICAgICAgdmFyIGRlc2lyZWRIZWlnaHQgPSBib3VuZHNbM107XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50VW5zY2FsZWRIZWlnaHQgPSBHZXRDYW52YXNTaXplT2ZHcmFwaChzZWxmKVsxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRlc2lyZWRTY2FsZSA9IGN1cnJlbnRVbnNjYWxlZEhlaWdodC9kZXNpcmVkSGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZGVzaXJlZFNjYWxlIC0gX3NjYWxlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICBfc2NhbGUgKz0gZGlyZWN0aW9uICogMC4xO1xyXG4gICAgICAgIFxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgc2VsZi5nZXRCb3VuZHNGcm9tTm9kZXMgPSByZXF1aXJlKCcuL0dldEJvdW5kc0Zyb21Ob2RlcycpO1xyXG5cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCBub2RlIHJlbmRlcmluZyBmdW5jdGlvbiBhc3NpZ25lZCB0byBhbGwgbm9kZXMgdXBvbiBjcmVhdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge05vZGUyRH0gbm9kZSBUaGUgbm9kZSBiZWluZyByZW5kZXJlZFxyXG4gICAgICogQHBhcmFtIHtBcnJheVt4LHldfSBub2RlQ2FudmFzUG9zIFRoZSBub2RlcyBnZXRQb3NpdGlvbigpIHJldHVybnMgaXQnc1xyXG4gICAgICogcG9zaXRpb24gaW4gZ3JhcGggY29vcmRpbmF0ZXMuICBub2RlUG9zT25DYW52YXMgaXMgd2hlcmUgdGhlIG5vZGUgaXMgb25cclxuICAgICAqIGNhbnZhcyBjb29yZGluYXRlcy5cclxuICAgICAqIEBwYXJhbSB7R3JhcGgyRH0gZ3JhcGggVGhlIGdyYXBoIHRoYXQgdGhlIG5vZGUgaXMgYXBhcnQgb2ZcclxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIHZhciBfZGVmYXVsdE5vZGVSZW5kZXIgPSByZXF1aXJlKCcuLi9SZW5kZXJpbmcvRGVmYXVsdE5vZGVSZW5kZXInKTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCBub2RlIG1vdXNlIGRldGVjdGlvbiBmdW5jdGlvbiBhc3NpZ25lZCB0byBhbGwgbm9kZXMgdXBvbiBjcmVhdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge05vZGUyRH0gbm9kZSBUaGUgbm9kZSBiZWluZyByZW5kZXJlZFxyXG4gICAgICogQHBhcmFtIHtHcmFwaDJEfSBncmFwaCBUaGUgZ3JhcGggdGhhdCB0aGUgbm9kZSBpcyBhcGFydCBvZlxyXG4gICAgICogQHBhcmFtIHtKU09OfSBtb3VzZVBvcyB7eDp4cG9zaXRpb24sIHk6eXBvc2l0aW9ufSBcclxuICAgICAqIEByZXR1cm5zIHt1bnJlc29sdmVkfVxyXG4gICAgICovXHJcbiAgICB2YXIgX2RlZmF1bHROb2RlTW91c2VEZXRlY3Rpb24gPSBmdW5jdGlvbiAobm9kZSwgZ3JhcGgsIG1vdXNlUG9zKSB7XHJcbiAgICAgICByZXR1cm4gKG5vZGUuZGlzdGFuY2VGcm9tKG1vdXNlUG9zKSA8PSBub2RlLmdldFJhZGl1cygpICogLjgpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgc2VsZi5zZXREZWZhdWx0Tm9kZVJlbmRlckFuZE1vdXNlRGV0ZWN0aW9uID0gZnVuY3Rpb24gKHJlbmRlcmVyLCBkZXRlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiByZW5kZXJlciAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsdXJlIHRvIHNldCBOb2RlIFJlbmRlciBNZXRob2QhIFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIEFyZ3VlbWVudCBtdXN0IGJlIGEgZnVuY3Rpb24hXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmVuZGVyZXIubGVuZ3RoICE9PSAzKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsdXJlIHRvIHNldCBOb2RlIFJlbmRlciBNZXRob2QhIFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIE1ldGhvZCdzIGFyZ3VlbWVudCBsZW5ndGggbXVzdCBiZSAzIHNvIGl0XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuIGJlIHBhc3NlZCB0aGUgbm9kZSwgaXQncyBwb3NpdGlvbiwgYW5kIGdyYXBoIGJlaW5nIHJlbmRlcmVkIVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBkZXRlY3Rpb24gIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbHVyZSB0byBzZXQgTm9kZSBDbGljayBEZXRlY3Rpb24gTWV0aG9kISBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBBcmd1ZW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uIVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRldGVjdGlvbi5sZW5ndGggIT09IDMpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWx1cmUgdG8gc2V0IE5vZGUgUmVuZGVyIE1ldGhvZCEgXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgTWV0aG9kJ3MgYXJndWVtZW50IGxlbmd0aCBtdXN0IGJlIDIgc28gaXRcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjYW4gYmUgcGFzc2VkIHRoZSBub2RlIGFuZCBncmFwaCBiZWluZyByZW5kZXJlZCFcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF9kZWZhdWx0Tm9kZVJlbmRlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIF9kZWZhdWx0Tm9kZU1vdXNlRGV0ZWN0aW9uID0gZGV0ZWN0aW9uO1xyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBlbXB0eSBub2RlIGFuZCBhZGRzIGl0IHRvIHRoZSBncmFwaCBpbW1lZGlhdGVseVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyB0byBjdXN0b21pemUgdGhlIG5vZGUgeW91IGFyZSBjcmVhdGluZ1xyXG4gICAgICogQHJldHVybnMge05vZGUyRH1cclxuICAgICAqL1xyXG4gICAgc2VsZi5jcmVhdGVOb2RlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgdmFyIG5vZGUgPSBTZXR1cE5ld05vZGUob3B0aW9ucywgc2VsZik7XHJcblxyXG4gICAgICAgIF9lbmFibGVkTm9kZXMucHVzaChub2RlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbGluayBiZXR3ZWVuIHR3byBub2Rlcy5cclxuICAgICAqIEZvciByZW5kZXJpbmcgcHVycG9zZXMgdGhpcyBkcmF3cyBhIGxpbmUgYmV0d2VlbiB0aGUgdHdvIG5vZGVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7Tm9kZTJEfSBuMVxyXG4gICAgICogQHBhcmFtIHtOb2RlMkR9IG4yXHJcbiAgICAgKiBAcGFyYW0geyp9IGxpbmtEYXRhIE9QVElPTkFMOiBhbnkgZXh0cmEgaW5mb3JtYXRpb24geW91J2QgbGlrZSB0byBzdG9yZSBhYm91dCB0aGUgXHJcbiAgICAgKiBsaW5rIChpLmUuIERpc3RhbmNlIGJldHdlZW4gdGhlIHR3bywgcmVsYXRpb25zaGlwLCBldGMuLilcclxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIHNlbGYubGlua05vZGVzID0gZnVuY3Rpb24gKG4xLCBuMiwgbGlua0RhdGEpIHtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBub2RlcyBhcmUgbm90IG51bGxcclxuICAgICAgICBpZiAoIW4xKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiRmFpbHVyZSB0byBsaW5rISBUaGUgZmlyc3Qgbm9kZSBwYXNzZWQgaW4gdG8gbGluayB3YXM6IFwiICsgbjE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIG5vZGVzIGFyZSBub3QgbnVsbFxyXG4gICAgICAgIGlmICghbjIpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJGYWlsdXJlIHRvIGxpbmshIFRoZSBzZWNvbmQgbm9kZSBwYXNzZWQgaW4gdG8gbGluayB3YXM6IFwiICsgbjI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGxpbmsgZG9lcyBub3QgYWxyZWFkeSBleGlzdFxyXG4gICAgICAgIGlmIChuMS5pc0xpbmtlZFdpdGgobjIpKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiTm9kZXMgYXJlIGFscmVhZHkgbGlua2VkIVwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVGVsbCB0aGUgbm9kZXMgdGhlaXIgbGlua2VkXHJcbiAgICAgICAgLy8gVE9ETzogUmV2aWV3IGFuZCBtYWtlIHN1cmUgZG9pbmcgdGhpcyBldmVuIG1ha2VzIHNlbnNlXHJcbiAgICAgICAgbjEuYWRkTGluayhuMiwgbGlua0RhdGEpO1xyXG4gICAgICAgIG4yLmFkZExpbmsobjEsIGxpbmtEYXRhKTtcclxuXHJcbiAgICAgICAgdmFyIGxpbmsgPSB7XHJcbiAgICAgICAgICAgIFwibm9kZXNcIjogW24xLCBuMl0sXHJcbiAgICAgICAgICAgIFwibGlua0RhdGFcIjogbGlua0RhdGFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgb3VyIGxpbmsgZm9yIHRoZSBncmFwaCB0byBrZWVwIHVwIHdpdGguXHJcbiAgICAgICAgX25vZGVMaW5rcy5wdXNoKGxpbmspO1xyXG5cclxuICAgICAgICByZXR1cm4gbGluaztcclxuXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyB1c2VycyB0byBvdmVycmlkZSBob3cgYXR0cmFjdGlvbiBiZXR3ZWVuIHR3byBub2RlcyBhcmUgY2FsY3VsYXRlZC5cclxuICAgICAqIFxyXG4gICAgICogVGhlIG5vZGVzIHBhc3NlZCBpbiB0byB0aGlzIGZ1bmN0aW9uIGFyZSBub3QgeW91ciBvcmRpbmFyeSBub2Rlcy4gIFRoZXlcclxuICAgICAqIGFyZSBpbnN0ZWFkIE9iamVjdHMgOlxyXG4gICAgICoge1xyXG4gICAgICogICAgICBcInBvc1wiOiBwb3NpdGlvbiAgICAgPC0tIFtOdW1iZXIsIE51bWJlcl1cclxuICAgICAqICAgICAgXCJtYXNzXCI6IG1hc3MgICAgICAgIDwtLSBOdW1iZXJcclxuICAgICAqICAgICAgXCJub2RlXCIgbm9kZSAgICAgICAgIDwtLSBtaWdodCBub3QgYmUgcGFzc2VkLCBpZiBwYXNzZWQsIE5vZGUyRFxyXG4gICAgICogfVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKG5vZGUxOk9iamVjdCwgbm9kZTI6b2JqZWN0LCBkYXRhOk9iamVjdCk6IE51bWJlcn0gbWV0aG9kXHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBzZWxmLnNldE5vZGVBdHRyYWN0aW9uTWV0aG9kID0gZnVuY3Rpb24gKG1ldGhvZCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsdXJlIHRvIHNldCBOb2RlIEF0dHJhY3Rpb24gTWV0aG9kISBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBBcmd1ZW1lbnQgbXVzdCBiZSB0eXBlb2YgZnVuY3Rpb24hXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWV0aG9kLmxlbmd0aCAhPT0gMykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbHVyZSB0byBzZXQgTm9kZSBBdHRyYWN0aW9uIE1ldGhvZCEgXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgTWV0aG9kJ3MgYXJndWVtZW50IGxlbmd0aCBtdXN0IGJlIDMgc28gaXRcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjYW4gYmUgcGFzc2VkIHRoZSB0d28gbm9kZXMgYmVpbmcgcmVuZGVyZWQgYW5kIGFueVxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZW0hIVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgX25vZGVBdHRyYWN0aW9uID0gbWV0aG9kO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbm9kZXMgcGFzc2VkIGluIHRvIHRoaXMgZnVuY3Rpb24gYXJlIG5vdCB5b3VyIG9yZGluYXJ5IG5vZGVzLiAgVGhleVxyXG4gICAgICogYXJlIGluc3RlYWQgT2JqZWN0cyA6XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgICAgIFwicG9zXCI6IHBvc2l0aW9uXHJcbiAgICAgKiAgICAgIFwibWFzc1wiOiBtYXNzXHJcbiAgICAgKiAgICAgIFwibm9kZVwiIG5vZGVcclxuICAgICAqICB9XHJcbiAgICAgKiBcclxuICAgICAqIFdoeSBkbyBpdCBsaWtlIHRoaXM/XHJcbiAgICAgKiBTbyB5b3UgZG9uJ3QgYWN0dWFsbHkgaGF2ZSB0byBoYXZlIG5vZGVzIGJlaW5nIHBhc3NlZCB0byB0aGlzIGZ1bmN0aW9uIVxyXG4gICAgICogeW91IGNhbiBqdXN0IHBhc3Mgb2JqZWN0cyB0aGF0IGp1c3QgaGF2ZSBwb3MgYW5kIG1hc3MgYXR0cmlidXRlcyAod2l0aG91dFxyXG4gICAgICogbm9kZSkgYW5kIHRoZSBhdHRyYWN0aW9uIG1ldGhvZCBjYW4gc3RpbGwgd29yayB3aXRoIGp1c3QgdGhvc2UgKGRlcGVuZGluZ1xyXG4gICAgICogd2hldGhlciBvciBub3QgaWYgaXQncyBiZWVuIHJlcGxhY2VkIGFuZCBpZiB0aGF0IHJlcGxhY2VtZW50IGlzIHZhbGlkXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gbm9kZTFcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gbm9kZTJcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gZXh0cmFEYXRhXHJcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB2YXIgX25vZGVBdHRyYWN0aW9uID0gcmVxdWlyZSgnLi9EZWZhdWx0Tm9kZUF0dHJhY3Rpb24nKTsgXHJcblxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEFuIGFycmF5IG9mIGZ1bmN0aW9uIGNhbGxzIHRoYXQgd2lsbCBiZSBjYWxsZWQgYW5kIHRoZW4gY2xlYXJlZFxyXG4gICAgICogYXQgdGhlIGVuZCBvZiB0aGUgZnJhbWUgcmVuZGVyXHJcbiAgICAgKiBAdHlwZSBBcnJheVtmdW5jdGlvbl1cclxuICAgICAqL1xyXG4gICAgdmFyIF9wb3N0UmVuZGVyUXVldWUgPSBbXTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgZnVuY3Rpb24gdG8gYSBxdWV1ZSB0aGF0IHdpbGwgYmUgY2FsbGVkIGFmdGVyIGFsbCB0aGUgbm9kZXNcclxuICAgICAqIGhhdmUgYmVlbiByZW5kZXJlZC5cclxuICAgICAqIFxyXG4gICAgICogVGhlIHF1ZXVlIGlzIGNsZWFyZWQgb25jZSB0aGUgZnJhbWUgaXMgZG9uZSByZW5kZXJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiXHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBzZWxmLnBvc3RSZW5kZXIgPSBmdW5jdGlvbiAoY2IpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBjYiAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiUG9zdCByZW5kZXIgb25seSBhY2NlcHRzIGZ1bmN0aW9ucyFcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF9wb3N0UmVuZGVyUXVldWUucHVzaChjYik7XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgc2VsZi5jZW50ZXJPdmVyTm9kZXMgPSBmdW5jdGlvbihub2RlcywgZHVyYXRpb24pe1xyXG4gICAgICAgIFxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIF9jZW50ZXJPbk5vZGVzID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiAoIV9lbmFibGVkTm9kZXMgfHwgX2VuYWJsZWROb2Rlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB2YXIgYm91bmRzID0gc2VsZi5nZXRCb3VuZHNGcm9tTm9kZXMoX2VuYWJsZWROb2Rlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgX3NjYWxlVG9Cb3VuZHMoYm91bmRzKTtcclxuXHJcbiAgICAgICAgdmFyIGF2ZXJhZ2UgPSBbYm91bmRzWzBdKyhib3VuZHNbMl0vMiksIGJvdW5kc1sxXSsoYm91bmRzWzNdLzIpXTtcclxuICAgICAgICB2YXIgY2FudmFzU2l6ZSA9IEdldENhbnZhc1NpemVPZkdyYXBoKHNlbGYpO1xyXG5cclxuICAgICAgICB2YXIgZGVzaXJlZFBvcyA9IFsoY2FudmFzU2l6ZVswXSAvIF9zY2FsZSAvIDIpIC0gYXZlcmFnZVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAoY2FudmFzU2l6ZVsxXSAvIF9zY2FsZSAvIDIpIC0gYXZlcmFnZVsxXV07XHJcblxyXG4gICAgICAgIHZhciBkaWZmZXJlbmNlID0gW2Rlc2lyZWRQb3NbMF0gLSBfeFBvc2l0aW9uLCBkZXNpcmVkUG9zWzFdIC0gX3lQb3NpdGlvbl07XHJcblxyXG4gICAgICAgIF94UG9zaXRpb24gKz0gZGlmZmVyZW5jZVswXSAqIDAuMTtcclxuICAgICAgICBfeVBvc2l0aW9uICs9IGRpZmZlcmVuY2VbMV0gKiAwLjE7XHJcbiAgICAgICAgXHJcbiAgICB9O1xyXG5cclxuXHJcblxyXG4gICAgdmFyIF9tb3VzZUhvdmVyQ2hlY2sgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBub2RlXHJcbiAgICAgICAgaWYgKF9tb3VzZU92ZXJOb2RlKG4sIF9tb3VzZVRvR3JhcGhDb29yZGluYXRlcyhfbGFzdFNlZW5Nb3VzZVBvcywgc2VsZikpKSB7XHJcbiAgICAgICAgICAgIGlmICghbi5nZXRSZW5kZXJEYXRhKCkuJG1vdXNlT3Zlcikge1xyXG4gICAgICAgICAgICAgICAgU2V0Tm9kZUFzSG92ZXJlZChuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChuLmdldFJlbmRlckRhdGEoKS4kbW91c2VPdmVyKSB7XHJcbiAgICAgICAgICAgICAgICBTZXROb2RlQXNOb3RIb3ZlcmVkKG4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEcmF3cyBvdXIgbm9kZXMgdG8gdGhlIGNhbnZhcyB0aGF0IHRoZSBncmFwaCB3YXMgaW5pdGlhbGl6ZWQgd2l0aFxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICB2YXIgX2RyYXdGcmFtZSA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgdGhlIGNvcnJlY3QgcmVzb2x1dGlvblxyXG4gICAgICAgIF9jYW52YXNDb250ZXh0LmNhbnZhcy53aWR0aCA9IF9jYW52YXNDb250ZXh0LmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICBfY2FudmFzQ29udGV4dC5jYW52YXMuaGVpZ2h0ID0gX2NhbnZhc0NvbnRleHQuY2FudmFzLm9mZnNldEhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gQ2xlYXIgdGhlIGNhbnZhcyBvZiBhbnl0aGluZyByZW5kZXJlZCBsYXN0IGZyYW1lXHJcbiAgICAgICAgLy8gVE9ETzogQ2xlYXIgb25seSB3aGF0J3MgYmVlbiBkcmF3biBvdmVyXHJcbiAgICAgICAgX2NhbnZhc0NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIF9jYW52YXNDb250ZXh0LmNhbnZhcy53aWR0aCwgX2NhbnZhc0NvbnRleHQuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGlmIChfYmFja2dyb3VuZFJlbmRlck1ldGhvZCAhPT0gbnVsbCAmJiBfYmFja2dyb3VuZFJlbmRlck1ldGhvZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIF9iYWNrZ3JvdW5kUmVuZGVyTWV0aG9kKHNlbGYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRHJhdyBjZW50ZXIgZm9yIGRlYnVnZ2luZyBwdXJwb3NlcyBjdXJyZW50ZWx5XHJcbi8vICAgICAgICBzZWxmLmdldENvbnRleHQoKS5maWxsU3R5bGUgPSBcIndoaXRlXCI7XHJcbi8vICAgICAgICBzZWxmLmdldENvbnRleHQoKS5maWxsUmVjdChcclxuLy8gICAgICAgICAgICAgICAgc2VsZi5nZXRQb3NpdGlvbigpWzBdICogX3NjYWxlLFxyXG4vLyAgICAgICAgICAgICAgICBzZWxmLmdldFBvc2l0aW9uKClbMV0gKiBfc2NhbGUsXHJcbi8vICAgICAgICAgICAgICAgIDEwICogX3NjYWxlLFxyXG4vLyAgICAgICAgICAgICAgICAxMCAqIF9zY2FsZVxyXG4vLyAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBEcmF3IGxpbmVzIHRvIHNob3cgY2hpbGQgcGFyZW50IHJlbGF0aW9uc2hpcFxyXG4gICAgICAgIF9lbmFibGVkTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgICAgICBub2RlLmdldENoaWxkcmVuKCkuZm9yRWFjaChmdW5jdGlvbiAobGluaykge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjdHggPSBzZWxmLmdldENvbnRleHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKChub2RlLmdldFBvc2l0aW9uKClbMF0gKyBfeFBvc2l0aW9uKSAqIF9zY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKG5vZGUuZ2V0UG9zaXRpb24oKVsxXSArIF95UG9zaXRpb24pICogX3NjYWxlKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oKGxpbmsuZ2V0UG9zaXRpb24oKVswXSArIF94UG9zaXRpb24pICogX3NjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAobGluay5nZXRQb3NpdGlvbigpWzFdICsgX3lQb3NpdGlvbikgKiBfc2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERyYXcgdGhlIGxpbmVzIGJldHdlZW4gbm9kZXMgdG8gZGlzcGxheSBsaW5rc1xyXG4gICAgICAgIF9ub2RlTGlua3MuZm9yRWFjaChmdW5jdGlvbiAobGluaykge1xyXG5cclxuICAgICAgICAgICAgaWYoIWxpbmsubm9kZXNbMF0uZW5hYmxlZCgpIHx8ICFsaW5rLm5vZGVzWzFdLmVuYWJsZWQoKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBzdGFydFBvcyA9IFsobGluay5ub2Rlc1swXS5nZXRQb3NpdGlvbigpWzBdICsgX3hQb3NpdGlvbikgKiBfc2NhbGUsXHJcbiAgICAgICAgICAgICAgICAobGluay5ub2Rlc1swXS5nZXRQb3NpdGlvbigpWzFdICsgX3lQb3NpdGlvbikgKiBfc2NhbGVdO1xyXG5cclxuICAgICAgICAgICAgdmFyIGVuZFBvcyA9IFsobGluay5ub2Rlc1sxXS5nZXRQb3NpdGlvbigpWzBdICsgX3hQb3NpdGlvbikgKiBfc2NhbGUsXHJcbiAgICAgICAgICAgICAgICAobGluay5ub2Rlc1sxXS5nZXRQb3NpdGlvbigpWzFdICsgX3lQb3NpdGlvbikgKiBfc2NhbGVdO1xyXG5cclxuICAgICAgICAgICAgaWYgKF9saW5rUmVuZGVyTWV0aG9kICE9PSBudWxsICYmIF9saW5rUmVuZGVyTWV0aG9kICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIF9saW5rUmVuZGVyTWV0aG9kKHNlbGYsIHN0YXJ0UG9zLCBlbmRQb3MsIGxpbmspO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgY3R4ID0gc2VsZi5nZXRDb250ZXh0KCk7XHJcblxyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oc3RhcnRQb3NbMF0sIHN0YXJ0UG9zWzFdKTtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbyhlbmRQb3NbMF0sIGVuZFBvc1sxXSk7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBpZiAoX2dyYXBoT3B0aW9ucy5hcHBseUdyYXZpdHkoKSkge1xyXG4gICAgICAgICAgICBBcHBseUdyYXZpdHlPbk5vZGVzKF9lbmFibGVkTm9kZXMsIF9ub2RlQXR0cmFjdGlvbiwgX2dyYXBoT3B0aW9ucy5ub2RlR3Jhdml0eUNvbnN0YW50KCkpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIERyYXcgdGhlIG5vZGVzIHRoZW0gc2VsdmVzXHJcbiAgICAgICAgX2VuYWJsZWROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgbW92ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgbm9kZSB0aGlzIGZyYW1lXHJcbiAgICAgICAgICAgIGlmKF9ncmFwaE9wdGlvbnMuYXBwbHlUcmFuc2xhdGlvbigpKXtcclxuICAgICAgICAgICAgICAgIG1vdmVkID0gbi50cmFuc2xhdGUoKERhdGUubm93KCkgLSBfbGFzdERyYXdGcmFtZSkgLyAxMDAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogTmVlZCB0byBhbHNvIGNoZWNrIGlmIGEgbW91c2UgZXZlbnQgaGFwcGVuZWQgdGhpcyBmcmFtZVxyXG4gICAgICAgICAgICAvLyBUT0RPOiBQbGVudHkgb2Ygb3B0aW1pemF0aW9uIG5lZWRlZFxyXG4gICAgICAgICAgICBpZiAoX2xhc3RTZWVuTW91c2VQb3MgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKF9ncmFwaE9wdGlvbnMuYXBwbHlHcmF2aXR5KCkgJiYgX2dyYXBoT3B0aW9ucy5hcHBseVRyYW5zbGF0aW9uKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobW92ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX21vdXNlSG92ZXJDaGVjayhuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIF9tb3VzZUhvdmVyQ2hlY2sobik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGdyYXBoUG9zID0gc2VsZi5nZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICB2YXIgc2NhbGUgPSBzZWxmLmdldFNjYWxlKCk7XHJcbiAgICAgICAgICAgIHZhciBwb3MgPSBbKG4uZ2V0UG9zaXRpb24oKVswXSArIGdyYXBoUG9zWzBdKSAqIHNjYWxlLFxyXG4gICAgICAgICAgICAgICAgKG4uZ2V0UG9zaXRpb24oKVsxXSArIGdyYXBoUG9zWzFdKSAqIHNjYWxlXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbmRlciB0aGUgbm9kZSBpZiBpdCBoYXMgYSByZW5kZXIgZnVuY3Rpb25cclxuICAgICAgICAgICAgaWYgKG4uZ2V0UmVuZGVyRnVuY3Rpb24oKSAhPT0gbnVsbCAmJiBuLmdldFJlbmRlckZ1bmN0aW9uKCkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbi5yZW5kZXIobiwgcG9zLCBzZWxmKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF9kZWZhdWx0Tm9kZVJlbmRlcihuLCBwb3MsIHNlbGYpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgYW55dGhpbmcgaW4gdGhlIHF1ZXVlLlxyXG4gICAgICAgIF9wb3N0UmVuZGVyUXVldWUuZm9yRWFjaChmdW5jdGlvbiAoY2IpIHtcclxuICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBfcG9zdFJlbmRlclF1ZXVlID0gW107XHJcblxyXG4gICAgICAgIGlmIChfZ3JhcGhPcHRpb25zLmNlbnRlck9uTm9kZXMoKSAmJiAoIV9pdGVtQmVpbmdEcmFnZ2VkT25DYW52YXMgfHwgX2l0ZW1CZWluZ0RyYWdnZWRPbkNhbnZhc1tcIml0ZW1UeXBlXCJdICE9PSBcImdyYXBoXCIpKSB7XHJcbiAgICAgICAgICAgIF9jZW50ZXJPbk5vZGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBfbGFzdERyYXdGcmFtZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShfZHJhd0ZyYW1lKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBfbGFzdERyYXdGcmFtZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgX2RyYXdGcmFtZSgpO1xyXG5cclxufSIsIi8qIFxyXG4gKiBUaGUgTUlUIExpY2Vuc2VcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTYgRWxpIERhdmlzLlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG4gKiBUSEUgU09GVFdBUkUuXHJcbiAqL1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JhcGhPcHRpb25zO1xyXG5cclxuZnVuY3Rpb24gR3JhcGhPcHRpb25zKCkge1xyXG5cclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcblxyXG4gICAgdmFyIF9vcHRpb25zID0ge1xyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogV2hldGhlciBvciBub3QgdGhlIGNhbWVyYSB3aWxsIHRyeSBjZW50ZXJpbmcgb3ZlciB0aGUgY2VudGVyXHJcbiAgICAgICAgICogb2YgdGhlIG5vZGVzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNlbnRlck9uTm9kZXM6IHtcclxuICAgICAgICAgICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBCb29sZWFuXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiBcclxuICAgICAgICAgKiBXaGV0aGVyIG9yIG5vdCB0byBjYWxjdWxhdGUgdGhlIGF0dHJhY3Rpb24gYmV0d2VlbiB0d29cclxuICAgICAgICAgKiBub2RlcyBvbiBhIHJlbmRlciBmcmFtZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBhcHBseUdyYXZpdHk6IHtcclxuICAgICAgICAgICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBCb29sZWFuXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFdoZXRoZXIgb3Igbm90IHRvIGFjdHVhbGx5IG1vdmUgdGhlIG5vZGVzIG9uIHRoZSByZW5kZXIgZnJhbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBhcHBseVRyYW5zbGF0aW9uOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogQm9vbGVhblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgbWF4IHNwZWVkIGEgbm9kZSBjYW4gdHJhdmVsIHZpYSBncmFwaCBjb29yZGluYXRlc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG1heE5vZGVTcGVlZDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogMzAwMDAsXHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBOdW1iZXJcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogSG93IHF1aWNrbHkgdGhlIG5vZGUgd2lsbCBkZWNlbGVyYXRlIG92ZXIgdGltZSB3aXRoIHRoZSBhYnNlbnQgb2YgZm9yY2VzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbm9kZURlY2VsZXJhdGlvbkNvbnN0YW50OiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAyLFxyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogTnVtYmVyXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSB2YWx1ZSByZXR1cm5lZCBieSB0aGUgZ3Jhdml0eSBmdW5jdGlvbiBpcyBtdWx0aXBsaWVkIGJ5IHRoaXMgdmFsdWVcclxuICAgICAgICAgKiBiZWZvcmUgYmVpbmcgYXBwbGllZCB0byB0aGUgYWN0dWFsIG5vZGUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbm9kZUdyYXZpdHlDb25zdGFudDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogMSxcclxuICAgICAgICAgICAgY29uc3RydWN0b3I6IE51bWJlclxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuICAgIFxyXG4gICAgc2VsZi5zZXRPcHRpb24gPSBmdW5jdGlvbiAob3B0aW9uTmFtZSwgdmFsdWUpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25OYW1lICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiVW5hYmxlIHRvIHNldCBvcHRpb246ICBPcHRpb24gbmFtZSBleHBlY3RlZCB0byBiZSB0eXBlXFxcclxuICAgICAgICAgICAgICAgICAgICBzdHJpbmcsIHJlY2VpdmVkOiBcIiwgb3B0aW9uTmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChfb3B0aW9uc1tvcHRpb25OYW1lXS5jb25zdHJ1Y3RvciA9PT0gdmFsdWUuY29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgICAgIF9vcHRpb25zW29wdGlvbk5hbWVdLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBcIlVuYWJsZSB0byBzZXQgb3B0aW9uOiBWYXJpYWJsZSBjb25zdHJ1Y3RvciBleHBlY3RlZDogXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLCBfb3B0aW9uc1tvcHRpb25OYW1lXS5jb25zdHJ1Y3RvciwgXCIuIFJlY2VpdmVkOiBcIiwgdmFsdWUuY29uc3RydWN0b3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiVW5hYmxlIHRvIHNldCBvcHRpb246IFwiLCBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHNlbGYuYXBwbHlHcmF2aXR5ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gX29wdGlvbnMuYXBwbHlHcmF2aXR5LnZhbHVlO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgc2VsZi5hcHBseVRyYW5zbGF0aW9uID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gX29wdGlvbnMuYXBwbHlUcmFuc2xhdGlvbi52YWx1ZTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIHNlbGYuY2VudGVyT25Ob2RlcyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIF9vcHRpb25zLmNlbnRlck9uTm9kZXMudmFsdWU7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBzZWxmLm1heE5vZGVTcGVlZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIF9vcHRpb25zLm1heE5vZGVTcGVlZC52YWx1ZTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIHNlbGYubm9kZURlY2VsZXJhdGlvbkNvbnN0YW50ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gX29wdGlvbnMubm9kZURlY2VsZXJhdGlvbkNvbnN0YW50LnZhbHVlO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgc2VsZi5ub2RlR3Jhdml0eUNvbnN0YW50ID0gZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgcmV0dXJuIF9vcHRpb25zLm5vZGVHcmF2aXR5Q29uc3RhbnQudmFsdWU7XHJcbiAgICB9O1xyXG59IiwiLyogXG4gKiBUaGUgTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG52YXIgR2V0Q2FudmFzU2l6ZU9mR3JhcGggPSByZXF1aXJlKCcuLi9VdGlsL0dldENhbnZhc1NpemUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXZlbnQsIGdyYXBoKSB7XG4gICAgdmFyIF9zY2FsZSA9IGdyYXBoLmdldFNjYWxlKCk7XG4gICAgdmFyIG5ld1NjYWxlID0gX3NjYWxlO1xuICAgIHZhciBkaXJlY3Rpb24gPSAwO1xuXG4gICAgLy8gR3JhYiB0aGUgbmV3IHNjYWxlLlxuICAgIGlmIChldmVudC5kZWx0YVkgPiAwKSB7XG4gICAgICAgIGRpcmVjdGlvbiA9IC0wLjA1O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRpcmVjdGlvbiA9IDAuMDU7XG4gICAgfVxuXG4gICAgbmV3U2NhbGUgKz0gZGlyZWN0aW9uICogbmV3U2NhbGU7XG5cbiAgICB2YXIgY2FudmFzU2l6ZSA9IEdldENhbnZhc1NpemVPZkdyYXBoKGdyYXBoKTtcblxuICAgIHZhciBvbGRDZW50ZXIgPSBbY2FudmFzU2l6ZVswXSAqICgxIC8gX3NjYWxlKSAqIDAuNSwgY2FudmFzU2l6ZVsxXSAqICgxIC8gX3NjYWxlKSAqIDAuNV07XG4gICAgdmFyIG5ld0NlbnRlciA9IFtjYW52YXNTaXplWzBdICogKDEgLyBuZXdTY2FsZSkgKiAwLjUsIGNhbnZhc1NpemVbMV0gKiAoMSAvIG5ld1NjYWxlKSAqIDAuNV07XG5cbiAgICB2YXIgY3VyUG9zID0gZ3JhcGguZ2V0UG9zaXRpb24oKTtcblxuICAgIC8vIE1vdmUgdGhlIHBvc2l0aW9uIHRvIGtlZXAgd2hhdCB3YXMgaW4gb3VyIGNlbnRlciBpbiB0aGUgb2xkIHNjYWxlIGluIHRoZSBjZW50ZXIgb2Ygb3VyIG5ldyBzY2FsZVxuICAgIGdyYXBoLnNldFBvc2l0aW9uKGN1clBvc1swXSArIChuZXdDZW50ZXJbMF0gLSBvbGRDZW50ZXJbMF0pLCBjdXJQb3NbMV0gKyAobmV3Q2VudGVyWzFdIC0gb2xkQ2VudGVyWzFdKSk7XG5cbiAgICBncmFwaC5zZXRTY2FsZShuZXdTY2FsZSk7XG59O1xuIiwiLyogXG4gKiBUaGUgTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2V0Tm9kZUFzQmVpbmdEcmFnZ2VkKG5vZGUpIHtcblxuICAgIG5vZGUuc2V0UmVuZGVyRGF0YUJ5S2V5KFwiJGJlaW5nRHJhZ2dlZFwiLCB0cnVlKTtcbiAgICBub2RlLnNldFZlbG9jaXR5KDAsIDApO1xuXG4gICAgdmFyIGxpbmtzID0gbm9kZS5nZXRMaW5rcygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsaW5rc1tpXS5ub2RlLnNldFJlbmRlckRhdGFCeUtleShcIiRuZWlnaGJvckJlaW5nRHJhZ2dlZFwiLCB0cnVlKTtcbiAgICB9XG5cbn07IiwiLyogXG4gKiBUaGUgTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2V0Tm9kZUFzSG92ZXJlZChub2RlKSB7XG5cbiAgICBpZiAobm9kZS5nZXRSZW5kZXJEYXRhKCkuJG1vdXNlT3Zlcikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm9kZS5zZXRSZW5kZXJEYXRhQnlLZXkoXCIkbW91c2VPdmVyXCIsIHRydWUpO1xuXG4gICAgdmFyIGxpbmtzID0gbm9kZS5nZXRMaW5rcygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsaW5rc1tpXS5ub2RlLnNldFJlbmRlckRhdGFCeUtleShcIiRuZWlnaGJvck1vdXNlT3ZlclwiLCB0cnVlKTtcbiAgICB9IFxufTsiLCIvKiBcbiAqIFRoZSBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAyMDE2IEVsaSBEYXZpcy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTZXROb2RlQXNOb3RIb3ZlcmVkKG5vZGUpIHtcblxuICAgIG5vZGUuc2V0UmVuZGVyRGF0YUJ5S2V5KFwiJG1vdXNlT3ZlclwiLCBmYWxzZSk7XG5cbiAgICB2YXIgbGlua3MgPSBub2RlLmdldExpbmtzKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpbmtzW2ldLm5vZGUuc2V0UmVuZGVyRGF0YUJ5S2V5KFwiJG5laWdoYm9yTW91c2VPdmVyXCIsIGZhbHNlKTtcbiAgICB9XG4gICAgXG59OyIsIi8qIFxuICogVGhlIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IDIwMTYgRWxpIERhdmlzLlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNldE5vZGVOb3RlQmVpbmdEcmFnZ2VkIChub2RlKSB7XG5cbiAgICBub2RlLnNldFJlbmRlckRhdGFCeUtleShcIiRiZWluZ0RyYWdnZWRcIiwgZmFsc2UpO1xuXG4gICAgdmFyIGxpbmtzID0gbm9kZS5nZXRMaW5rcygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsaW5rc1tpXS5ub2RlLnNldFJlbmRlckRhdGFCeUtleShcIiRuZWlnaGJvckJlaW5nRHJhZ2dlZFwiLCBmYWxzZSk7XG4gICAgfVxuXG59OyIsIi8qIFxuICogVGhlIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IDIwMTYgRWxpIERhdmlzLlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKi9cblxuXG52YXIgTm9kZTJEID0gcmVxdWlyZSgnLi4vTm9kZTJEJyk7XG52YXIgR2V0RnJlZVNwYWNlRm9yTm9kZSA9IHJlcXVpcmUoJy4vR2V0RnJlZVNwYWNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2V0dXBOb2RlKG9wdGlvbnMsIGdyYXBoKSB7XG4gICAgXG4gICAgdmFyIG5vZGUgPSBuZXcgTm9kZTJEKGdyYXBoKTtcbiAgICBcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlbmRlckRhdGEpIHtcbiAgICAgICAgT2JqZWN0LmtleXMob3B0aW9ucy5yZW5kZXJEYXRhKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXksIGluZGV4KSB7XG4gICAgICAgICAgICBub2RlLnNldFJlbmRlckRhdGFCeUtleShrZXksIG9wdGlvbnMucmVuZGVyRGF0YVtrZXldKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5zZXRSZW5kZXJEYXRhQnlLZXkoJ2NvbG9yJywgJyMwMDAwMDAnKTtcbiAgICB9XG5cbiAgICB2YXIgc2V0UmFkaXVzID0gNzA7XG5cbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJhZGl1cykge1xuICAgICAgICBzZXRSYWRpdXMgPSBvcHRpb25zLnJhZGl1cztcbiAgICB9XG5cbiAgICBub2RlLnNldFJhZGl1cyhzZXRSYWRpdXMpO1xuXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wb3NpdGlvbikge1xuICAgICAgICBub2RlLnNldFBvc2l0aW9uKG9wdGlvbnMucG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZnJlZVNwYWNlKSB7XG4gICAgICAgICAgICBub2RlLnNldFBvc2l0aW9uKEdldEZyZWVTcGFjZUZvck5vZGUob3B0aW9ucy5mcmVlU3BhY2UsIGdyYXBoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlLnNldFBvc2l0aW9uKEdldEZyZWVTcGFjZUZvck5vZGUoc2V0UmFkaXVzICogNCwgZ3JhcGgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gbm9kZTtcbiAgICBcbn07IiwiLyogXHJcbiAqIFRoZSBNSVQgTGljZW5zZVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcbiAqIFRIRSBTT0ZUV0FSRS5cclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTm9kZTJEO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBub2RlIHRoYXQgZXhpc3RzIG9uIHRoZSAyRCBncmFwaFxyXG4gKiBcclxuICogQHJldHVybnMge05vZGUyRH1cclxuICovXHJcbmZ1bmN0aW9uIE5vZGUyRChncmFwaCkge1xyXG5cclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAvLyBUT0RPOiBDcmVhdGUgYSByZW5kZXIgbW9kZSBlbnVtXHJcblxyXG4gICAgaWYoIWdyYXBoKXtcclxuICAgICAgICB0aHJvdyBcIkVycm9yIGNyZWF0aW5nIE5vZGUuIEEgbm9kZSBuZWVkcyB0byBrbm93IHdoYXQgZ3JhcGggaXQncyBhcGFydCBvZi5cIjtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIF9ncmFwaCA9IGdyYXBoO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXJiaXRyYXJ5IGRhdGEga2VwdCB1cCB3aXRoIGZvciByZW5kZXJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIEB0eXBlIHR5cGVcclxuICAgICAqL1xyXG4gICAgdmFyIF9yZW5kZXJpbmdEYXRhID0ge1xyXG4gICAgICAgIFwiJG1vdXNlT3ZlclwiOiBmYWxzZSxcclxuICAgICAgICBcIiRiZWluZ0RyYWdnZWRcIjogZmFsc2VcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIFggcG9zaXRpb24gb2YgdGhlIG5vZGUgcmVsYXRpdmUgdG8gdGhlIGdyYXBoXHJcbiAgICAgKiBcclxuICAgICAqIEB0eXBlIE51bWJlclxyXG4gICAgICovXHJcbiAgICB2YXIgX3hQb3NpdGlvbiA9IDA7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIFkgcG9zaXRpb24gb2YgdGhlIG5vZGUgcmVsYXRpdmUgdG8gdGhlIGdyYXBoXHJcbiAgICAgKiBcclxuICAgICAqIEB0eXBlIE51bWJlclxyXG4gICAgICovXHJcbiAgICB2YXIgX3lQb3NpdGlvbiA9IDA7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBsaXN0IG9mIGFsbCBub2RlcyB0aGF0IGNvbnNpZGVyIHRoaXMgbm9kZSBhIHBhcmVudC5cclxuICAgICAqIFxyXG4gICAgICogQHR5cGUgQXJyYXlcclxuICAgICAqL1xyXG4gICAgdmFyIF9jaGlsZHJlbiA9IFtdO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjdXJyZW50IHBhcmVudCBvZiB0aGUgbm9kZS5cclxuICAgICAqIEB0eXBlIE5vZGUyRFxyXG4gICAgICovXHJcbiAgICB2YXIgX3BhcmVudCA9IG51bGw7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBsaXN0IG9mIGFsbCBub2RlcyB0aGlzIG5vZGUgaXMgXCJjb25uZWN0ZWRcIiB0by5cclxuICAgICAqIFxyXG4gICAgICogQHR5cGUgQXJyYXlcclxuICAgICAqL1xyXG4gICAgdmFyIF9saW5rcyA9IFtdO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHR5cGUgTnVtYmVyXHJcbiAgICAgKi9cclxuICAgIHZhciBfZ3JvdXBJZCA9IG51bGw7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJhZGl1cyBvZiB0aGUgbm9kZSwgdGhlIGFtb3VudCBvZiBmcmVlIHNwYWNlIGFyb3VuZCB0aGUgbm9kZVxyXG4gICAgICogdGhhdCB3b3VsZCBiZSBrZXB0IGZyZWUgZnJvbSBvdGhlciBub2Rlc1xyXG4gICAgICogXHJcbiAgICAgKiBAdHlwZSBOdW1iZXJcclxuICAgICAqL1xyXG4gICAgdmFyIF9yYWRpdXMgPSAxO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjdXJyZW50IGRpc3BsYWNlbWVudCBvZiB0aGUgbm9kZSBwZXJmcmFtZSBvZiBhbmltYXRpb25cclxuICAgICAqIFxyXG4gICAgICogQHR5cGUgQXJyYXlcclxuICAgICAqL1xyXG4gICAgdmFyIF92ZWxvY2l0eVZlY3RvciA9IFswLCAwXTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIG9yIG5vdCB0aGUgbm9kZSBpcyBiZWluZyByZW5kZXJlZCBvbiB0aGUgZ3JhcGguXHJcbiAgICAgKiBcclxuICAgICAqIEB0eXBlIEJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgdmFyIF9lbmFibGVkID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgc2VsZi5lbmFibGVkID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gX2VuYWJsZWQ7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBzZWxmLnNldEVuYWJsZWQgPSBmdW5jdGlvbihpc0VuYWJsZWQpe1xyXG4gICAgICAgIF9lbmFibGVkID0gaXNFbmFibGVkO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBzdG9mIDEwNTAzNFxyXG4gICAgICogQHJldHVybnMge1N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xyXG4gICAgICAgIHZhciBkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgdmFyIHV1aWQgPSAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgIHZhciByID0gKGQgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xyXG4gICAgICAgICAgICBkID0gTWF0aC5mbG9vcihkIC8gMTYpO1xyXG4gICAgICAgICAgICByZXR1cm4gKGMgPT09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdXVpZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIF9pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgXHJcbiAgICBzZWxmLmdldElkID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gX2lkO1xyXG4gICAgfTtcclxuXHJcbiAgICBzZWxmLmdldEdyb3VwSWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9ncm91cElkO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgc2VsZi5zZXRWZWxvY2l0eSA9IGZ1bmN0aW9uKHgseSl7XHJcbiAgICAgICAgX3ZlbG9jaXR5VmVjdG9yID0gW3gseV07XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBzZWxmLmFjY2VsZXJhdGUgPSBmdW5jdGlvbiAoeCwgeSkge1xyXG5cclxuICAgICAgICB2YXIgbWF4U3BlZWQgPSBfZ3JhcGgubWF4Tm9kZVNwZWVkKCk7XHJcblxyXG4gICAgICAgIF92ZWxvY2l0eVZlY3RvclswXSA9IE1hdGgubWF4KE1hdGgubWluKG1heFNwZWVkLCBfdmVsb2NpdHlWZWN0b3JbMF0gKyB4KSwgLW1heFNwZWVkKTtcclxuICAgICAgICBfdmVsb2NpdHlWZWN0b3JbMV0gPSBNYXRoLm1heChNYXRoLm1pbihtYXhTcGVlZCwgX3ZlbG9jaXR5VmVjdG9yWzFdICsgeSksIC1tYXhTcGVlZCk7XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIF9kZWNlbGVyYXRlID0gZnVuY3Rpb24gKGRlbHRhVGltZSkge1xyXG5cclxuICAgICAgICB2YXIgeGRpciA9IF92ZWxvY2l0eVZlY3RvclswXSA+IDAgPyAtMSA6IDE7XHJcbiAgICAgICAgdmFyIHlkaXIgPSBfdmVsb2NpdHlWZWN0b3JbMV0gPiAwID8gLTEgOiAxO1xyXG5cclxuICAgICAgICBfdmVsb2NpdHlWZWN0b3JbMF0gKz0gTWF0aC5zcXJ0KE1hdGguYWJzKF92ZWxvY2l0eVZlY3RvclswXSkpICogZGVsdGFUaW1lICogeGRpciAqIF9ncmFwaC5ub2RlRGVjZWxlcmF0aW9uQ29uc3RhbnQoKTtcclxuICAgICAgICBfdmVsb2NpdHlWZWN0b3JbMV0gKz0gTWF0aC5zcXJ0KE1hdGguYWJzKF92ZWxvY2l0eVZlY3RvclsxXSkpICogZGVsdGFUaW1lICogeWRpciAqIF9ncmFwaC5ub2RlRGVjZWxlcmF0aW9uQ29uc3RhbnQoKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIGJ5IHRoZSBncmFwaCBldmVyeSBhbmltYXRpb24gZnJhbWUuXHJcbiAgICAgKiBOb2RlIG1vdmVzIGJhc2VkIG9uIGl0J3MgY3VycmVudCB2ZWxvY2l0eVxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbHRhVGltZSB0aGUgYW1vdW50IG9mIHRpbWUgZWxhcHNlZCBpbiBzZWNvbmRzXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbH0gd2hldGhlciBvciBub3QgdGhlIG5vZGUgYWN0dWFsbHkgbW92ZWRcclxuICAgICAqL1xyXG4gICAgc2VsZi50cmFuc2xhdGUgPSBmdW5jdGlvbiAoZGVsdGFUaW1lKSB7XHJcblxyXG4gICAgICAgIGlmIChfdmVsb2NpdHlWZWN0b3JbMF0gPT09IDAgJiYgX3ZlbG9jaXR5VmVjdG9yWzFdID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF94UG9zaXRpb24gKz0gX3ZlbG9jaXR5VmVjdG9yWzBdICogZGVsdGFUaW1lO1xyXG4gICAgICAgIF95UG9zaXRpb24gKz0gX3ZlbG9jaXR5VmVjdG9yWzFdICogZGVsdGFUaW1lO1xyXG4gICAgICAgIF9kZWNlbGVyYXRlKGRlbHRhVGltZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVdGlsaXR5IGZ1bmN0aW9uIGZvciBxdWlja2x5IGRldGVybWluaW5nIGRpc3RhbmNlXHJcbiAgICAgKiBiZXR3ZWVuIHRoZSBub2RlIGFuZCBhbm90aGVyIHBvaW50IG9uIHRoZSBncnBhaC5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSB4XHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IHlcclxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuZGlzdGFuY2VGcm9tID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuXHJcbiAgICAgICAgLy8gQWxsb3cgcGFzc2luZyBvZiAyIGVsZW1lbnQgYXJyYXkgaW5zdGVhZCBvZiAyIGFyZ3VlbWVudHMgZm9yIHBvc2l0aW9uXHJcbiAgICAgICAgaWYgKHguY29uc3RydWN0b3IgPT09IEFycmF5KSB7XHJcbiAgICAgICAgICAgIHkgPSB4WzFdO1xyXG4gICAgICAgICAgICB4ID0geFswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh4IC0gX3hQb3NpdGlvbiwgMikgKyBNYXRoLnBvdyh5IC0gX3lQb3NpdGlvbiwgMikpO1xyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0J3MgdGhlIHJhZGl1cyBvZiB0aGUgbm9kZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IHIgcmFkaXVzIHRoZSBub2RlIHdpbGwgdGFrZSBvblxyXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgc2VsZi5zZXRSYWRpdXMgPSBmdW5jdGlvbiAocikge1xyXG4gICAgICAgIF9yYWRpdXMgPSByO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHJhZGl1cyB0aGUgbm9kZSBpcyBjdXJyZW50ZWx5IG9wZXJhdGluZyBieVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7cnxOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuZ2V0UmFkaXVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBfcmFkaXVzO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXRob2QgY2FsbGVkIHdoZW4gdGhlIG5vZGUgd2FzIGNsaWNrZWQgb24gdGhlIGNhbnZhc1xyXG4gICAgICogXHJcbiAgICAgKiBVc2VycyBjYW4gZWFzaWx5IHNldCB0aGVpciBvd24gb25jbGljayBmdW5jdGlvbiBqdXN0IGJ5IGNhbGxpbmc6XHJcbiAgICAgKiBub2RlSW5zdGFuY2Uub25jbGljayA9IHNvbWVPdGhlckZ1bmN0aW9uO1xyXG4gICAgICovXHJcbiAgICBzZWxmLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkXCIpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIE1ldGhvZCBjYWxsZWQgd2hlbiB0aGUgbm9kZSB3YXMgZG91YmxlIGNsaWNrZWQgb24gdGhlIGNhbnZhc1xyXG4gICAgICogXHJcbiAgICAgKiBVc2VycyBjYW4gZWFzaWx5IHNldCB0aGVpciBvd24gb25jbGljayBmdW5jdGlvbiBqdXN0IGJ5IGNhbGxpbmc6XHJcbiAgICAgKiBub2RlSW5zdGFuY2Uub25kb3VibGVjbGljayA9IHNvbWVPdGhlckZ1bmN0aW9uO1xyXG4gICAgICovXHJcbiAgICBzZWxmLm9uZG91YmxlY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkXCIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIb3cgd2Ugd2FudCB0byBoYXZlIHRoaXMgbm9kZSByZW5kZXJlZFxyXG4gICAgICogQHR5cGUgbWV0aG9kXHJcbiAgICAgKi9cclxuICAgIHZhciBfcmVuZGVyRnVuY3Rpb24gPSBudWxsO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJvb2xlYW4gZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgeCBhbmQgeSBjb29yZGluYXRlcyBvZiB0aGUgbW91c2VcclxuICAgICAqIGFuZCBkZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IHRoZSBub2RlIHdhcyBjbGlja2VkXHJcbiAgICAgKiBAdHlwZSBtZXRob2RcclxuICAgICAqL1xyXG4gICAgdmFyIF9jbGlja0RldGVjdGlvbmZ1bmN0aW9uID0gbnVsbDtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQncyBhIHNwZWNpZmljIHByb3RlcnR5IG9mIHRoZSByZW5kZXJpbmcgZGF0YS5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBrZXkgVGhlIGtleSB0byB0aGUgZGljdGlvbmFyeVxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHN0b3JlZCBieSB0aGF0IGtleVxyXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgc2VsZi5zZXRSZW5kZXJEYXRhQnlLZXkgPSBmdW5jdGlvbiAoa2V5LCBkYXRhKSB7XHJcbiAgICAgICAgX3JlbmRlcmluZ0RhdGFba2V5XSA9IGRhdGE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYWxsIGFyYml0cmFyeSByZW5kZXJpbmcgZGF0YSB0aGF0IHRoZSBub2RlIHVzZXMgdG8gZGlzcGxheVxyXG4gICAgICogaXRzZWxmLiBcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0pTT059IFJlbmRlcmluZ0RhdGEgQXJiaXRyYXJ5IGRhdGEgc2V0IGZvciBrZWVwaW5nIHVwIGhvd1xyXG4gICAgICogdG8gcmVuZGVyIHRoZSBub2RlLlxyXG4gICAgICovXHJcbiAgICBzZWxmLmdldFJlbmRlckRhdGEgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9yZW5kZXJpbmdEYXRhO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCb29sZWFuIG1ldGhvZCBnaXZlbiBhbiB4IGFuZCB5IG1vdXNlIHBvc2l0aW9uIGRldGVybWluZXMgd2hldGhlciBvclxyXG4gICAgICogbm90IHRoZSBub2RlIHdhcyBhY3R1YWxseSBjbGlja2VkXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7R3JhcGgyRH0gZ3JhcGhcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG1vdXNlUG9zXHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgc2VsZi53YXNDbGlja2VkID0gZnVuY3Rpb24gKGdyYXBoLCBtb3VzZVBvcykge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhcImRldGVjdGlvbjogXCIsX2NsaWNrRGV0ZWN0aW9uZnVuY3Rpb24pO1xyXG5cclxuICAgICAgICBpZiAoX2NsaWNrRGV0ZWN0aW9uZnVuY3Rpb24gIT09IG51bGwgJiYgX2NsaWNrRGV0ZWN0aW9uZnVuY3Rpb24gIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IF9jbGlja0RldGVjdGlvbmZ1bmN0aW9uKHNlbGYsIGdyYXBoLCBtb3VzZVBvcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgbWV0aG9kIGFjdHVhbGx5IHJldHVybmVkIGEgYm9vbGVhbiB2YWx1ZVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlIHx8IHJlc3VsdCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPdmVycmlkZSBob3cgdGhlIG5vZGUgd2lsbCByZW5kZXIgYW5kIHdoYXQgaXMgY29uc2lkZXJlZCBhIG1vdXNlXHJcbiAgICAgKiBjbGljayBieSBwYXNzaW5nIHlvdXIgb3duIG1ldGhvZHMgZm9yIHJlbmRlcmluZyBhbmQgY2xpY2sgZGV0ZWN0aW9uLlxyXG4gICAgICogXHJcbiAgICAgKiBUaGUgcmVuZGVyIG1ldGhvZCBtdXN0IGhhdmUgYW4gYXJndW1lbnQgZm9yIHRha2luZyBpbiB0aGUgY29udGV4dCBvZiBcclxuICAgICAqIHRoZSBjYW52YXMgdGhhdCBpdCB3aWxsIHJlbmRlciB0b28uXHJcbiAgICAgKiBcclxuICAgICAqIFRoZSBjbGljayBkZXRlY3Rpb24gbWV0aG9kIG11c3QgdGFrZSA0IGFyZ3VlbWVudHMuLiBUT0RPOiBGaW5pc2guXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKX0gcmVuZGVyTWV0aG9kXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHdpdGhpbk5vZGVNZXRob2QpfSB3aXRoaW5Ob2RlTWV0aG9kIG1ldGhvZCBmb3IgXHJcbiAgICAgKiBkZXRlcm1pbmluZyB3aGV0aGVyIG9mIG5vdCBhIG5vZGUgaGFzIGJlZW4gY2xpY2tlZC5cclxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuc2V0UmVuZGVyRnVuY3Rpb24gPSBmdW5jdGlvbiAocmVuZGVyTWV0aG9kLCB3aXRoaW5Ob2RlTWV0aG9kKSB7XHJcblxyXG4gICAgICAgIGlmIChyZW5kZXJNZXRob2QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJFcnJvciBzZXR0aW5nIHJlbmRlciBmdW5jaXRvbiBmb3IgTm9kZSEgQXR0ZW1wdGluZyB0byBhZGQgYSBudWxsIHJlbmRlciBtZXRob2RcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh3aXRoaW5Ob2RlTWV0aG9kID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiRXJyb3Igc2V0dGluZyByZW5kZXIgZnVuY2l0b24gZm9yIE5vZGUhIEF0dGVtcHRpbmcgdG8gYWRkIGEgbnVsbCBjbGljayBkZXRlY3Rpb24gbWV0aG9kXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBfcmVuZGVyRnVuY3Rpb24gPSByZW5kZXJNZXRob2Q7XHJcbiAgICAgICAgX2NsaWNrRGV0ZWN0aW9uZnVuY3Rpb24gPSB3aXRoaW5Ob2RlTWV0aG9kO1xyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbWV0aG9kIGF0IHdoaWNoIHRoZSBub2RlIGlzIHJlbmRlcmVkIHdpdGhcclxuICAgICAqIEByZXR1cm5zIHttZXRob2R9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuZ2V0UmVuZGVyRnVuY3Rpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9yZW5kZXJGdW5jdGlvbjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIHNlbGYuZ2V0Q2xpY2tEZXRlY3Rpb25GdW5jdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2NsaWNrRGV0ZWN0aW9uZnVuY3Rpb247XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIHRoZSBub2RlIGFuZCBncmFwaCwgcmVuZGVycyBpdHNlbGZcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBub2RlXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGdyYXBoXHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBzZWxmLnJlbmRlciA9IGZ1bmN0aW9uIChub2RlLCBwb3MsIGdyYXBoKSB7XHJcblxyXG4gICAgICAgIGlmIChfcmVuZGVyRnVuY3Rpb24gPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJGYWlsdXJlIHRvIHJlbmRlciBub2RlISBUaGVyZSdzIG5vIHJlbmRlciBmdW5jdGlvbiBkZWZpbmVkIVwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgX3JlbmRlckZ1bmN0aW9uKG5vZGUsIHBvcywgZ3JhcGgpO1xyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIG5vZGUgaW4geCx5IGNvb3JkaW5hdGVzIG9mIHRoZSBncmFwaFxyXG4gICAgICogaW4gdGhlIGZvcm0gb2YgW3gsIHldXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAqL1xyXG4gICAgc2VsZi5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gW194UG9zaXRpb24sIF95UG9zaXRpb25dO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIG5vZGUgaW4gdGhlIGdyYXBoXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSB4IHBvc2l0aW9uIGZyb20gdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgZ3JhcGhcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSB5IHBvc2l0aW9uIGZyb20gdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgZ3JhcGhcclxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuc2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoeCwgeSkge1xyXG5cclxuICAgICAgICBpZiAoeC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcclxuICAgICAgICAgICAgX3hQb3NpdGlvbiA9IHhbMF07XHJcbiAgICAgICAgICAgIF95UG9zaXRpb24gPSB4WzFdO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBfeFBvc2l0aW9uID0geDtcclxuICAgICAgICBfeVBvc2l0aW9uID0geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIHNlbGYuYWRkTGluayA9IGZ1bmN0aW9uIChsaW5rTm9kZSwgZGF0YSkge1xyXG5cclxuICAgICAgICBpZiAobGlua05vZGUgPT09IG51bGwgfHwgbGlua05vZGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBcIkZhaWx1cmUgdG8gbGluayBub2RlISAgTGluayBub2RlIHdhczogXCIgKyBsaW5rTm9kZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgX2xpbmtzLnB1c2goe1xyXG4gICAgICAgICAgICBub2RlOiBsaW5rTm9kZSxcclxuICAgICAgICAgICAgbGlua0RhdGE6IGRhdGFcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHNlbGYuZ2V0TGlua3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9saW5rcztcclxuICAgIH07XHJcbiAgICBcclxuICAgIHNlbGYuaXNMaW5rZWRXaXRoID0gZnVuY3Rpb24obm9kZUxpbmtlZFdpdGgpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIgaSAgPSAwOyBpIDwgX2xpbmtzLmxlbmd0aDsgaSArKyl7XHJcbiAgICAgICAgICAgIGlmKF9saW5rc1tpXS5ub2RlLmdldElkKCkgPT09IG5vZGVMaW5rZWRXaXRoLmdldElkKCkpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBzZWxmLmdldExpbmtEYXRhID0gZnVuY3Rpb24obm9kZSl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBpICA9IDA7IGkgPCBfbGlua3MubGVuZ3RoOyBpICsrKXtcclxuICAgICAgICAgICAgaWYoX2xpbmtzW2ldLm5vZGUuZ2V0SWQoKSA9PT0gbm9kZS5nZXRJZCgpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfbGlua3NbaV0ubm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcbiAgICBcclxuICAgIFxyXG4gICAgc2VsZi5jbGVhckxpbmtzID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBfbGlua3MgPSBbXTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIHNlbGYuc2V0UGFyZW50ID0gZnVuY3Rpb24gKG5ld1BhcmVudCkge1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBNYWtlIHN1cmUgd2UncmUgbm90IHNldHRpbmcgb25lIG9mIG91ciBjaGlsZHJlbiBvciBjaGlsZHJlbiBjaGlsZHJlbnMgYXMgb3VyIHBhcmVudC5cclxuXHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIG91ciBwYXJlbnQga25vd3Mgd2UncmUgbGVhdmluZyB0aGVtIGZvciBhbm90aGVyLi5cclxuICAgICAgICBpZiAoX3BhcmVudCAhPT0gbnVsbCAmJiBfcGFyZW50ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgX3BhcmVudC5yZW1vdmVDaGlsZChzZWxmKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF9wYXJlbnQgPSBuZXdQYXJlbnQ7XHJcblxyXG4gICAgICAgIGlmIChfcGFyZW50LmdldENoaWxkcmVuKCkuaW5kZXhPZihzZWxmKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgX3BhcmVudC5hZGRDaGlsZChzZWxmKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgc2VsZi5nZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9wYXJlbnQ7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBzZWxmLmFkZENoaWxkID0gZnVuY3Rpb24gKGNoaWxkKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IE1ha2Ugc3VyZSB0aGlzIGNoaWxkIGRvZXMgbm90IGV4aXN0IEFOWVdIRVJFIG9uIHRoZSBmYW1pbHkgdHJlZVxyXG5cclxuICAgICAgICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIHRoZSBjaGlsZFxyXG4gICAgICAgIGlmIChfY2hpbGRyZW4uaW5kZXhPZihjaGlsZCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV2UgYWxyZWFkeSBoYXZlIHRoYXQgbm9kZSBhcyBhIGNoaWxkOyBcIiwgY2hpbGQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBfY2hpbGRyZW4ucHVzaChjaGlsZCk7XHJcblxyXG4gICAgICAgIGlmIChjaGlsZC5nZXRQYXJlbnQoKSAhPT0gc2VsZikge1xyXG4gICAgICAgICAgICBjaGlsZC5zZXRQYXJlbnQoc2VsZik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIHNlbGYuZ2V0Q2hpbGRyZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9jaGlsZHJlbjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIHNlbGYucmVtb3ZlQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGQpIHtcclxuXHJcbiAgICAgICAgdmFyIGluZGV4ID0gX2NoaWxkcmVuLmluZGV4T2YoY2hpbGQpO1xyXG5cclxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiRmFpbHVyZSB0byByZW1vdmUgY2hpbGQhIFRyeWluZyB0byByZW1vdmUgYSBjaGlsZCB3ZSBkb24ndCBoYXZlIVwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgX2NoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XHJcblxyXG4gICAgfTtcclxuXHJcbn0iLCIvKiBcbiAqIFRoZSBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAyMDE2IEVsaSBEYXZpcy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZywgc3RhcnRQb3MsIGVuZFBvcywgbGluaykge1xuICAgIHZhciBjdHggPSBnLmdldENvbnRleHQoKTtcblxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwJztcbiAgICBjdHgubGluZVdpZHRoID0gMyAqIGcuZ2V0U2NhbGUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbyhzdGFydFBvc1swXSwgc3RhcnRQb3NbMV0pO1xuICAgIGN0eC5saW5lVG8oZW5kUG9zWzBdLCBlbmRQb3NbMV0pO1xuICAgIGN0eC5zdHJva2UoKTtcbn07IiwiLyogXG4gKiBUaGUgTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5vZGUsIG5vZGVDYW52YXNQb3MsIGdyYXBoKSB7XG5cbiAgICB2YXIgbWFpbkNvbG9yID0gbm9kZS5nZXRSZW5kZXJEYXRhKClbXCJjb2xvclwiXTtcblxuICAgIGlmKCFtYWluQ29sb3Ipe1xuICAgICAgICBtYWluQ29sb3IgPSBcIiM3Nzc3NzdcIjtcbiAgICB9XG5cbiAgICB2YXIgY3R4ID0gZ3JhcGguZ2V0Q29udGV4dCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSBtYWluQ29sb3I7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5hcmMobm9kZUNhbnZhc1Bvc1swXSxcbiAgICAgICAgICAgIG5vZGVDYW52YXNQb3NbMV0sXG4gICAgICAgICAgICBub2RlLmdldFJhZGl1cygpICogZ3JhcGguZ2V0U2NhbGUoKSAqIC44LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDIgKiBNYXRoLlBJKTtcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgaWYgKG5vZGUuZ2V0UmVuZGVyRGF0YSgpWyckbW91c2VPdmVyJ10pIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHguYXJjKG5vZGVDYW52YXNQb3NbMF0sXG4gICAgICAgICAgICAgICAgbm9kZUNhbnZhc1Bvc1sxXSxcbiAgICAgICAgICAgICAgICBub2RlLmdldFJhZGl1cygpICogZ3JhcGguZ2V0U2NhbGUoKSAqIC44ICogLjUsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAyICogTWF0aC5QSSk7XG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUuZ2V0UmVuZGVyRGF0YSgpWyckYmVpbmdEcmFnZ2VkJ10pIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHguYXJjKG5vZGVDYW52YXNQb3NbMF0sXG4gICAgICAgICAgICAgICAgbm9kZUNhbnZhc1Bvc1sxXSxcbiAgICAgICAgICAgICAgICBub2RlLmdldFJhZGl1cygpICogZ3JhcGguZ2V0U2NhbGUoKSAqIC44ICogLjMsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAyICogTWF0aC5QSSk7XG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUuZ2V0UmVuZGVyRGF0YSgpLiRtb3VzZU92ZXIgfHwgbm9kZS5nZXRSZW5kZXJEYXRhKCkuJG5laWdoYm9yTW91c2VPdmVyKSB7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBtb3VzZSBvdmVyIGJveCBpcyBhbHdheXMgb24gdG9wIG9mIGV2ZXJ5dGhpbmcuXG4gICAgICAgIGdyYXBoLnBvc3RSZW5kZXIoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBjdHguZm9udCA9IFwiMTZweCBNb25vc3BhY2VcIjtcbiAgICAgICAgICAgIHZhciB0ZXh0RGltZW5zaW9ucyA9IGN0eC5tZWFzdXJlVGV4dChub2RlLmdldFJlbmRlckRhdGEoKVtcIm5hbWVcIl0pO1xuXG4gICAgICAgICAgICAvLyBEcmF3IGEgcmVjdGFuZ2xlIGZvciB0ZXh0LlxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IG1haW5Db2xvcjtcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG5vZGVDYW52YXNQb3NbMF0gLSA3MCAtIHRleHREaW1lbnNpb25zLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBub2RlQ2FudmFzUG9zWzFdIC0gOTUgLSAyMCxcbiAgICAgICAgICAgICAgICAgICAgdGV4dERpbWVuc2lvbnMud2lkdGggKyA0MCwgNDApO1xuXG4gICAgICAgICAgICAvLyBEcmF3IGEgbGluZSBjb21pbmcgZnJvbSB0aGUgbm9kZSB0byB0aGUgcmVjdGFuZ2xlXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBtYWluQ29sb3I7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKG5vZGVDYW52YXNQb3NbMF0sIG5vZGVDYW52YXNQb3NbMV0pO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhub2RlQ2FudmFzUG9zWzBdLCBub2RlQ2FudmFzUG9zWzFdIC0gOTUpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhub2RlQ2FudmFzUG9zWzBdIC0gNTAsIG5vZGVDYW52YXNQb3NbMV0gLSA5NSk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgICAgIC8vIGRpc3BsYXkgdGhlIHRleHRcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQobm9kZS5nZXRSZW5kZXJEYXRhKClbXCJuYW1lXCJdLCBub2RlQ2FudmFzUG9zWzBdIC0gNTAgLSB0ZXh0RGltZW5zaW9ucy53aWR0aCwgbm9kZUNhbnZhc1Bvc1sxXSAtIDk1KTtcblxuICAgICAgICB9KTtcbiAgICB9XG5cbn07XG4iLCIvKiBcclxuICogVGhlIE1JVCBMaWNlbnNlXHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE2IEVsaSBEYXZpcy5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuICogVEhFIFNPRlRXQVJFLlxyXG4gKi9cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFwiaW5pdFwiOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIC8vIElFNyBhbmQgOCBzdXBwb3J0IGZvciBpbmRleE9mXHJcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgfHwgKEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKGQsIGUpIHtcclxuICAgICAgICAgICAgdmFyIGE7XHJcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInRoaXNcIiBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XHJcbiAgICAgICAgICAgIHZhciBjID0gT2JqZWN0KHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBjLmxlbmd0aCA+Pj4gMDtcclxuICAgICAgICAgICAgaWYgKDAgPT09IGIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIGEgPSArZSB8fCAwO1xyXG4gICAgICAgICAgICBJbmZpbml0eSA9PT0gTWF0aC5hYnMoYSkgJiYgKGEgPSAwKTtcclxuICAgICAgICAgICAgaWYgKGEgPj0gYilcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgZm9yIChhID0gTWF0aC5tYXgoMCA8PSBhID8gYSA6IGIgLSBNYXRoLmFicyhhKSwgMCk7IGEgPCBiOyApIHtcclxuICAgICAgICAgICAgICAgIGlmIChhIGluIGMgJiYgY1thXSA9PT0gZClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYTtcclxuICAgICAgICAgICAgICAgIGErKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnZlcnRzIGdsb2JhbCBjb29yZGluYXRlcyB0byBjYW52YXMgcmVsYXRpdmUgY29vcmRpbmF0ZXNcclxuICAgICAgICAgKiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU1Njc3L2hvdy1kby1pLWdldC10aGUtY29vcmRpbmF0ZXMtb2YtYS1tb3VzZS1jbGljay1vbi1hLWNhbnZhcy1lbGVtZW50XHJcbiAgICAgICAgICogXHJcbiAgICAgICAgICogVE9ETzogT3B0aW1pemVcclxuICAgICAgICAgKiBcclxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IGV2ZW50XHJcbiAgICAgICAgICogQHJldHVybnMge1V0aWxfTDI2LnJlbE1vdXNlQ29vcmRzLlV0aWxBbm9ueW0kMH1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZWxNb3VzZUNvb3JkcyhldmVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICByZXR1cm4ge3g6IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQsIHk6IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUucmVsTW91c2VDb29yZHMgPSByZWxNb3VzZUNvb3JkcztcclxuXHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzk3MTY0NjgvaXMtdGhlcmUtYW55LWZ1bmN0aW9uLWxpa2UtaXNudW1lcmljLWluLWphdmFzY3JpcHQtdG8tdmFsaWRhdGUtbnVtYmVyc1xyXG4gICAgaXNOdW1lcmljOiBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobik7XHJcbiAgICB9XHJcbn07IiwiLyogXG4gKiBUaGUgTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIGNhbnZhcyBlbGVtZW50IGluIHBpeGVscy5cbiAqIFxuICogQHBhcmFtIHtHcmFwaDJEfSBncmFwaCB0aGUgZ3JhcGggdGhhdCB3ZSdyZSBsb29raW5nIGF0IHRoZSBjYW52YXMgb2ZcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gW2dyYXBoLmdldENvbnRleHQoKS5jYW52YXMud2lkdGgsIGdyYXBoLmdldENvbnRleHQoKS5jYW52YXMuaGVpZ2h0XTtcbn07IiwiLyogXG4gKiBUaGUgTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBFbGkgRGF2aXMuXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1vdXNlRXZlbnQsIGdyYXBoKSB7XG5cbiAgICB2YXIgY29vcmRzID0gZ3JhcGguZ2V0Q29udGV4dCgpLmNhbnZhcy5yZWxNb3VzZUNvb3Jkcyhtb3VzZUV2ZW50KTtcblxuICAgIHZhciBzY2FsZSA9IGdyYXBoLmdldFNjYWxlKCk7XG4gICAgdmFyIHBvcyA9IGdyYXBoLmdldFBvc2l0aW9uKCk7XG5cbiAgICB2YXIgZ3JhcGhYID0gKGNvb3Jkcy54IC8gc2NhbGUpIC0gcG9zWzBdO1xuICAgIHZhciBncmFwaFkgPSAoY29vcmRzLnkgLyBzY2FsZSkgLSBwb3NbMV07XG5cbiAgICByZXR1cm4ge1wieFwiOiBncmFwaFgsIFwieVwiOiBncmFwaFl9O1xufTsiXX0=
