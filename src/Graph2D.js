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
        
        var graphX = ((coords.x+_xPosition) / canvas.width)*(1/_scale)*canvas.width;
        var graphY = ((coords.y+_yPosition) / canvas.height)*(1/_scale)*canvas.height;
        
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
        
        // Figure out what Node was clicked (if any) and then begin dragging appropriatlly
        _nodes.forEach(function (node) {

            if (node.wasClicked(self, [coords.x, coords.y])) {

                _currentMouseState = "hold";
                _itemBeingDraggedOnCanvas = {"item":node, "itemPos":node.getPosition(), "mousePos":[coords.x, coords.y] };
                
            }

        });
        
    };
    
    
    var _mouseOutCalled = function (event) {
        
        if(_currentMouseState === "dragging"){
            _currentMouseState = "free";
        }
        
    };
    
    
    var _mouseMoveCalled = function (event) {
        
        var coords = _mouseToGraphCoordinates(event);
        
        if(_currentMouseState === "hold"){
            _currentMouseState = "dragging";
        }
        
        if(_currentMouseState === "dragging"){
            
            var orgPos = _itemBeingDraggedOnCanvas["itemPos"];
            var orgMousePos = _itemBeingDraggedOnCanvas["mousePos"];
        
            _itemBeingDraggedOnCanvas["item"].setPosition(coords.x + (orgPos[0] - orgMousePos[0]), coords.y + (orgPos[1] - orgMousePos[1]));
        
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
        
        var graphPos = graph.getPosition();
        var scale = graph.getScale();
        var nodeSize = node.getRenderData()['size'];
        
        var startPos = [node.getPosition()[0]-(nodeSize[0]/2) + graphPos[0],
                        node.getPosition()[1]-(nodeSize[1]/2) + graphPos[1]];
                    
        var endPos = [nodeSize[0],
                      nodeSize[1]];
                  
        return pointsInsideRect([startPos[0], startPos[1], endPos[0], endPos[1]] , mousePos);
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
        _canvasContext.clearRect(0, 0, _canvasContext.canvas.width, _canvasContext.canvas.height);

        // Draw the lines between nodes
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


