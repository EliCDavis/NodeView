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
     * Add's all the event listeners to the canvas for user interaction.
     * 
     * @param {<canvas>} cvs The canvas element on the page
     * @returns {undefined}
     */
    var _initializeGraph = function(cvs){
        
        // Figure out what Node was clicked (if any) and call their onclick function
        cvs.addEventListener('click', function(event) {
        
            var coords = cvs.relMouseCoords(event);
        
            _nodes.forEach(function(node){
                
                if(node.wasClicked(self, [coords.x, coords.y])){
                    if(node.onclick !== null && node.onclick !== undefined){
                        node.onclick();
                    }
                }
                
            });
        
        }, false);
        
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
        
        var startPos = [node.getPosition()[0] + graphPos[0] * scale,
                        node.getPosition()[1] + graphPos[1] * scale];
                    
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
        
        var startPos = [node.getPosition()[0] + graphPos[0] * scale,
                        node.getPosition()[1] + graphPos[1] * scale];
                    
        var endPos = [nodeSize[0] * scale,
                      nodeSize[1] * scale];
                  
        return pointsInsideRect([startPos[0], startPos[1], endPos[0]-startPos[0], endPos[1]-startPos[1]] , mousePos);
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


