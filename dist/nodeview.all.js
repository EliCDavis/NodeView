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

/**
 * A graph for displaying and interacting with nodes.
 * 
 * @param {<canvas>} canvas
 * @returns {Graph2D}
 */
function Graph2D(canvas){

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
     * @type Array
     */
    var _nodes = [];


    var _mouseToGraphCoordinates = function(mouseEvent){
        
        var coords = self.getContext().canvas.relMouseCoords(mouseEvent);
        
        var graphX = (coords.x/_scale) - _xPosition;
        var graphY = (coords.y/_scale) - _yPosition;
        
        return {"x":graphX, "y":graphY};
    };
    
    
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
    self.getContext = function(){
        return _canvasContext;
    };

    
    var _getSize = function(){
        return [self.getContext().canvas.width, self.getContext().canvas.height];
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


    var _mouseUpCalled = function (event) {
        
        if(_currentMouseState === "dragging" ){
            _itemBeingDraggedOnCanvas = null;
            _currentMouseState = "free";
            return;
        }
        
        var coords = _mouseToGraphCoordinates(event);
        
        // Figure out what Node was clicked (if any) and call their onclick function
        _nodes.forEach(function (node) {

            if (node.wasClicked(self, [coords.x, coords.y])) {
                if (node.onclick !== null && node.onclick !== undefined) {
                    node.onclick();
                }
            }

        });
        
        _currentMouseState = "free";
        
    };
    
    
    var _mouseDownCalled = function (event) {
        
        var coords = _mouseToGraphCoordinates(event);
        
        _currentMouseState = "hold";

        // Figure out what Node was clicked (if any) and then begin dragging appropriatlly
        _nodes.forEach(function (node) {

            if (node.wasClicked(self, [coords.x, coords.y])) {

                _itemBeingDraggedOnCanvas = {"item":node, "itemPos":node.getPosition(), "mousePos":[coords.x, coords.y], "itemType":"node" };
                console.log("Clicked");
            }

        });
        
        // If we didn't grab a node then we've grabbed the canvas
        if(_itemBeingDraggedOnCanvas === null){
            _itemBeingDraggedOnCanvas = {"item":self, "itemPos":self.getPosition(), "mousePos":[coords.x, coords.y], "itemType":"graph"};
        }
        
    };
    
    
    var _mouseOutCalled = function (event) {
        
        if(_currentMouseState === "dragging"){
            _currentMouseState = "free";
        }
        
    };
    
    
    var _mouseMoveCalled = function (event) {
        
        
        if(_currentMouseState === "hold"){
            _currentMouseState = "dragging";
        }
        
        if(_currentMouseState === "dragging"){
            
            var orgPos = _itemBeingDraggedOnCanvas["itemPos"];
            var orgMousePos = _itemBeingDraggedOnCanvas["mousePos"];
        
            if (_itemBeingDraggedOnCanvas["itemType"] === "node") {
                
                var coords = _mouseToGraphCoordinates(event);

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
    
    
    var _mouseWheelCalled = function (event) {
        
        if(event.deltaY > 0){
            _scale -=.05;
        } else {
            _scale +=.05;
        }
        
    };
    
    
    var _doubleClickCalled = function (event) {
        
    };
    
    
    /**
     * Add's all the event listeners to the canvas for user interaction.
     * 
     * @param {<canvas>} cvs The canvas element on the page
     * @returns {undefined}
     */
    var _initializeGraph = function(cvs){
        
        cvs.addEventListener('mouseup', function(e) {
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
        
        cvs.addEventListener('dblclick',function(e){
            _doubleClickCalled(e);
        });
        
    };
    
    
    // Only grabe the context if we have a canvas to grab from
    if(canvas !== null && canvas !== undefined){
        _canvasContext = canvas.getContext("2d");
        _initializeGraph(canvas);
    }


    /**
     * Returns the center of the canvas in the form of [x, y] 
     * 
     * @returns {Array}
     */
    self.getPosition = function(){
        return [_xPosition, _yPosition];
    };


    self.setPosition = function(x, y){
        
        if(!isNumeric(x)){
            throw "Failed to set graph position!  Invalid x value: " + x;
        }
        
        if(!isNumeric(y)){
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
    self.getScale = function(){
        return _scale;
    };
    

    /**
     * The default node rendering function assigned to all nodes upon creation
     * 
     * @param {Node2D} node The node being rendered
     * @param {Graph2D} graph The graph that the node is apart of
     * @returns {undefined}
     */
    var _defaultNodeRender = function(node, graph){
        
        // TODO: do input santizing
        
        var graphPos = graph.getPosition();
        var scale = graph.getScale();
        var nodeSize = node.getRenderData()['size'];
        
        var startPos = [(node.getPosition()[0]-(nodeSize[0]/2) + graphPos[0]) * scale,
                        (node.getPosition()[1]-(nodeSize[1]/2) + graphPos[1]) * scale];
                    
                    
        graph.getContext().fillStyle = node.getRenderData()['color'];
        graph.getContext().fillRect(
                startPos[0],
                startPos[1],
                nodeSize[0] * scale,
                nodeSize[1] * scale
                );

    };
    
    
    /**
     * The default node mouse detection function assigned to all nodes upon creation
     * 
     * @param {Node2D} node The node being rendered
     * @param {Graph2D} graph The graph that the node is apart of
     * @param {JSON} mousePos {x:xposition, y:yposition} 
     * @returns {unresolved}
     */
    var _defaultNodeMouseDetection = function(node, graph, mousePos){
        
        var nodeSize = node.getRenderData()['size'];
        
        var startPos = [(node.getPosition()[0]-(nodeSize[0]/2) ),
                        (node.getPosition()[1]-(nodeSize[1]/2) )];
                    
        var endPos = [nodeSize[0], nodeSize[1]];
                  
        return pointsInsideRect([startPos[0], startPos[1], endPos[0], endPos[1]], mousePos);
    };
    

    /**
     * Creates a new empty node and adds it to the graph immediately
     * @returns {Node2D}
     */
    self.createNode = function(){
      
        var node = new Node2D();
        
        node.setRenderDataByKey('size', [40, 40]);
        node.setRenderDataByKey('color', '#6991AC');
        node.setRenderFunction(_defaultNodeRender, _defaultNodeMouseDetection);
        
        var graphSize = _getSize();
        var centerPos = [graphSize[0]/2, graphSize[1]/2];
        node.setPosition(centerPos[0], centerPos[1]); 
       
        _nodes.push(node);
        
        return node;
        
    };
    
    
    /**
     * Creates a link between two nodes.
     * For rendering purposes this draws a line between the two nodes
     * 
     * @param {Node2D} n1
     * @param {Node2D} n2
     * @returns {undefined}
     */
    self.linkNodes = function(n1, n2){
      
        if(n1 === null || n1 === undefined){
            throw "Failure to link! The first node passed in to link was: "+n1;
        }
        
        if(n2 === null || n2 === undefined){
            throw "Failure to link! The second node passed in to link was: "+n2;
        }
        
        n1.addLink(n2);
        n2.addLink(n1);
        
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


        // Draw center for debugging purposes currentely
        self.getContext().fillRect(
                self.getPosition()[0]*_scale,
                self.getPosition()[1]*_scale,
                10*_scale,
                10*_scale
                );

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
        _nodes.forEach(function (node) {
            node.getLinks().forEach(function (link) {

                var ctx = self.getContext();

                ctx.beginPath();
                ctx.moveTo((node.getPosition()[0] + _xPosition) * _scale,
                            (node.getPosition()[1] + _yPosition) * _scale);
                ctx.lineTo((link.getPosition()[0] + _xPosition) * _scale,
                            (link.getPosition()[1] + _yPosition) * _scale);
                ctx.stroke();

            });
        });

        // Draw the nodes them selves
        _nodes.forEach(function (node) {

            if (node.getRenderFunction() !== null && node.getRenderFunction() !== undefined) {
                node.render(node, self);
            }

        });

        window.requestAnimationFrame(_drawFrame);

    };

    _drawFrame();

}



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

/**
 * The node that exists on the 2D graph
 * 
 * @returns {Node2D}
 */
function Node2D() {

    var self = this;

    // TODO: Create a render mode enum

    /**
     * The name of the node, how we will refer to it as short hand.
     * 
     * @type String
     */
    var _name = "Node Name";


    /**
     * Whatever data we want to keep up with inside the node for safe
     * keepings.
     * 
     * @type Object
     */
    var _data = "Data";


    /**
     * Arbitrary data kept up with for rendering.
     * 
     * @type type
     */
    var _renderingData = {};


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
     * A list of all nodes that this node is considered in a "group" with.
     * 
     * TODO: Determine best method of dealing with nodes.
     * 
     * @type Array
     */
    var _groupNodes = [];
    
    
    /**
     * The radius of the node, the amount of free space around the node
     * that would be kept free from other nodes
     * 
     * @type Number
     */
    var _radius = 1;

    
    /**
     * Set's the radius of the node
     * 
     * @param {type} r radius the node will take on
     * @returns {undefined}
     */
    self.setRadius = function(r){
        _radius = r;
    };
    
    
    /**
     * Get the radius the node is currentely operating by
     * 
     * @returns {r|Number}
     */
    self.getRadius = function(){
        return _radius;
    };
    

    /**
     * Method called when the node was clicked on the canvas
     */
    self.onclick = function(){
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


    /**
     * Given the node and graph, renders itself
     * 
     * @param {type} node
     * @param {type} graph
     * @returns {undefined}
     */
    self.render = function (node, graph) {

        if (_renderFunction === null) {
            throw "Failure to render node! There's no render function defined!";
        }

        _renderFunction(node, graph);

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
    self.setPosition = function(x, y){
        _xPosition = x;
        _yPosition = y;
    };


    /**
     * For testing at the moment, will eventually be removed
     * TODO: Remove
     * 
     * @returns {String}
     */
    self.getContents = function () {
        return _name + " - " + _data;
    };


    self.addLink = function(linkNode){
        
        if(linkNode === null || linkNode === undefined){
            throw "Failure to link node!  Link node was: "+linkNode;
            return;
        }
        
        _links.push(linkNode);
        
    };
    
    self.getLinks = function(){
        return _links;
    };
    
    self.setParent = function(newParent){
        
        // TODO: Make sure we're not setting one of our children or children childrens as our parent.
        
        // Make sure our parent knows we're leaving them for another..
        if(_parent !== null && _parent !== undefined){
            _parent.removeChild(self);
        }
        
        _parent = newParent;
        
        if(_parent.getChildren().indexOf(self) === -1){
            _parent.addChild(self);
        }
        
    };
    
    
    self.getParent = function(){
        return _parent;
    };
    
    
    self.addChild = function(child){
        
        // TODO: Make sure this child does not exist ANYWHERE on the family tree
        
        // Make sure we don't already have the child
        if(_children.indexOf(child) !== -1){
            console.log("We already have that node as a child; ",child);
            return;
        }
        
        _children.push(child);
        
        if(child.getParent() !== self){
            child.setParent(self);
        }
        
    };
    
    
    self.getChildren = function(){
        return _children;
    };
    
    
    self.removeChild = function(child){
        
        var index = _children.indexOf(child);
        
        if(index === -1){
            throw "Failure to remove child! Trying to remove a child we don't have!";
        }
        
        _children.splice(index, 1);
        
    };
    
}

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
        return {x: event.clientX  - rect.left, y: event.clientY  - rect.top};
    }
    
    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
    
})();


/**
 * Determines whether or not the point falls within the given rect
 * 
 * @param {type} rect [x, y, width, height]
 * @param {type} point [x, y]
 * @returns {Boolean} 
 */
function pointsInsideRect(rect, point) {

    // Make sure rect is valid
    if (rect === null || rect === undefined || rect.length === null ||
            rect.length === undefined || rect.length !== 4) {
        throw "Invalid rect argument! Expecting array in format [x, y, width, height].  Instead recieved: " + rect;
    }

    // Make sure point is valid
    if (point === null || point === undefined || point.length === null ||
            point.length === undefined || point.length !== 2) {
        throw "Invalid point argument! Expecting array in format [x, y].  Instead recieved: " + point;
    }

    if (rect[0] <= point[0] && point[0] <= rect[0] + rect[2]) {
        if (rect[1] <= point[1] && point[1] <= rect[1] + rect[3]) {
            return true;
        }
    }
    
    //console.log(rect +" does not contain the point: "+point);
    
    return false;

}

// http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}