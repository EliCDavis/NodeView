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
var SetNodeAsBeingDragged = require('./SetNodeAsBeingDragged');
var SetNodeNotBeingDragged = require('./SetNodeNotBeingDragged');

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
     * An array of nodes that the graph renders
     * 
     * @type Node2D[]
     */
    var _nodes = [];

    var _graphOptions = new GraphOptions();
    
    self.setOption = function(optionName, value){
        _graphOptions(optionName, value);
    };

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


    var _setNodeAsHovered = function (node) {

        if (node.getRenderData().$mouseOver) {
            return;
        }

        node.setRenderDataByKey("$mouseOver", true);

        var links = node.getLinks();

        for (var i = 0; i < links.length; i++) {
            links[i].node.setRenderDataByKey("$neighborMouseOver", true);
        }

    };

    var _setNodeAsNotHovered = function (node) {

        node.setRenderDataByKey("$mouseOver", false);

        var links = node.getLinks();

        for (var i = 0; i < links.length; i++) {
            links[i].node.setRenderDataByKey("$neighborMouseOver", false);
        }

    };

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
        _nodes.forEach(function (node) {

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
        _nodes.forEach(function (node) {

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
            _setNodeAsNotHovered(_itemBeingDraggedOnCanvas["item"]);
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


    /**
     * Called whenever our mouse wheel moves.
     * Used for keeping up with zoom of the graph.
     * 
     * @param {type} event
     * @returns {undefined}
     */
    var _mouseWheelCalled = function (event) {

        var newScale = _scale;
        var direction = 0;

        // Grab the new scale.
        if (event.deltaY > 0) {
            direction = -0.05;
        } else {
            direction = 0.05;
        }

        newScale += direction * newScale;

        var canvasSize = GetCanvasSizeOfGraph(self);

        var oldCenter = [canvasSize[0] * (1 / _scale) * 0.5, canvasSize[1] * (1 / _scale) * 0.5];
        var newCenter = [canvasSize[0] * (1 / newScale) * 0.5, canvasSize[1] * (1 / newScale) * 0.5];

        var curPos = self.getPosition();

        // Move the position to keep what was in our center in the old scale in the center of our new scale
        self.setPosition(curPos[0] + (newCenter[0] - oldCenter[0]), curPos[1] + (newCenter[1] - oldCenter[1]));

        _scale = newScale;

    };


    var _doubleClickCalled = function (event) {

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
            _mouseWheelCalled(e);
        });

        cvs.addEventListener('dblclick', function (e) {
            _doubleClickCalled(e);
        });

    };


    // Only grabe the context if we have a canvas to grab from
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
        return _nodes;
    };


    self.clearLinks = function () {

        _nodes.forEach(function(node){
            node.clearLinks();
        });

        _nodeLinks = [];
    };


    self.clearNodes = function(){
        _nodes = [];
    };


    self.getNodeClosestToPoint = function (point) {

        var closestNode = null;
        var bestDist = 10000000;

        _nodes.forEach(function (node) {
            var dist = node.distanceFrom(point);
            if (dist < bestDist) {
                closestNode = node;
                bestDist = dist;
            }
        });

        return closestNode;

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
       return (node.distanceFrom(mousePos) <= node.getRadius() * .6);
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

        _nodes.push(node);

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
        if (n1 === null || n1 === undefined) {
            throw "Failure to link! The first node passed in to link was: " + n1;
        }

        // Make sure the nodes are not null
        if (n2 === null || n2 === undefined) {
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


    var _centerOnNodes = function () {

        if (!_nodes || _nodes.length === 0) {
            return;
        }
        
        var bounds = self.getBoundsFromNodes(_nodes);
        
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
                _setNodeAsHovered(n);
            }
        } else {
            if (n.getRenderData().$mouseOver) {
                _setNodeAsNotHovered(n);
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
        _nodes.forEach(function (node) {
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
            ApplyGravityOnNodes(_nodes, _nodeAttraction);
        }


        // Draw the nodes them selves
        _nodes.forEach(function (n) {

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