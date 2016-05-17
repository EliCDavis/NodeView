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
        
        if(_currentMouseState === "dragging"){
            _itemBeingDraggedOnCanvas = null;
            _currentMouseState = "free";
            return;
        }
        
        var coords = self.getContext().canvas.relMouseCoords(event);
        
        // Figure out what Node was clicked (if any) and call their onclick function
        _nodes.forEach(function (node) {

            if (node.wasClicked(self, [coords.x, coords.y])) {
                if (node.onclick !== null && node.onclick !== undefined) {
                    node.onclick();
                }
            }

        });
        
    };
    
    
    var _mouseDownCalled = function (event) {
        
        var coords = self.getContext().canvas.relMouseCoords(event);
        
        
        // Figure out what Node was clicked (if any) and then begin dragging appropriatlly
        _nodes.forEach(function (node) {

            if (node.wasClicked(self, [coords.x, coords.y])) {
                        console.log(_currentMouseState);

                _currentMouseState = "hold";
                _itemBeingDraggedOnCanvas = {"item":node, "itemPos":node.getPosition(), "mousePos":[coords.x, coords.y] };
                
            }

        });
        
    };
    
    
    var _mouseOutCalled = function (event) {
        
    };
    
    
    var _mouseMoveCalled = function (event) {
        
        var coords = self.getContext().canvas.relMouseCoords(event);
        
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
                    
                    
        graph.getContext().fillStyle=node.getRenderData()['color'];
        graph.getContext().fillRect(
                startPos[0],
                startPos[1],
                nodeSize[0] * scale,
                nodeSize[1] * scale
                );

    };
    
    
    var _defaultNodeMouseDetection = function(node, graph, mousePos){
        
        var graphPos = graph.getPosition();
        var scale = graph.getScale();
        var nodeSize = node.getRenderData()['size'];
        
        var startPos = [node.getPosition()[0]-(nodeSize[0]/2) + graphPos[0] * scale,
                        node.getPosition()[1]-(nodeSize[1]/2) + graphPos[1] * scale];
                    
        var endPos = [nodeSize[0] * scale,
                      nodeSize[1] * scale];
                  
        return pointsInsideRect([startPos[0], startPos[1], endPos[0], endPos[1]] , mousePos);
    };
    

    /**
     * Creates a new empty node and adds it to the graph immediately
     * @returns {Node2D}
     */
    self.createNode = function(){
      
        var node = new Node2D();
        
        node.setRenderDataByKey('size', [75, 75]);
        node.setRenderDataByKey('color', '#4CAF50');
        node.setRenderFunction(_defaultNodeRender, _defaultNodeMouseDetection);
        
        _nodes.push(node);
        
        return node;
        
    };
    
    
    /**
     * Draws our nodes to the canvas that the graph was initialized with
     * 
     * @returns {undefined}
     */
    var _drawFrame = function(){
      
        // Make sure we have the correct resolution
        _canvasContext.canvas.width = _canvasContext.canvas.offsetWidth;
        _canvasContext.canvas.height = _canvasContext.canvas.offsetHeight ;
      
        // Clear the canvas of anything rendered last frame
        _canvasContext.clearRect(0, 0, _canvasContext.canvas.width, _canvasContext.canvas.height);
      
        _nodes.forEach(function(node){
      
            if(node.getRenderFunction() !== null && node.getRenderFunction() !== undefined){
                node.render(node, self);
            }
        
        });
      
        window.requestAnimationFrame(_drawFrame);
        
    };
    
    _drawFrame();
    
}


