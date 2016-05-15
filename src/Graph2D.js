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
     * The x coordinate that is at the center of the canvas currentely.
     * This changes as the user moves around on the graph
     * 
     * @type Number
     */
    var _xPosition = 0;


    /**
     * The y coordinate that is at the center of the canvas currentely.
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
    
    
    // Only grabe the context if we have a canvas to grab from
    if(canvas !== null && canvas !== undefined){
        _canvasContext = canvas.getContext("2d");
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
     * Creates a new empty node and adds it to the graph immediately
     * @returns {Node}
     */
    self.createNode = function(){
      
        var node = new Node();
        
        _nodes.push(node);
        
        return node;
        
    };
    
    
    /**
     * Renders the given node by the default method that the canvas has set 
     * for itself.
     * 
     * @param {Node} node
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} scale
     * @param {Array} graphPos
     * @returns {undefined}
     */
    var _renderNode = function(node, ctx, scale, graphPos){
        
        // TODO: do input santizing
        
        var startPos = [node.getPosition()[0] + graphPos[0] * scale,
                        node.getPosition()[1] + graphPos[1] * scale];
                    
        ctx.fillRect(startPos[0], startPos[1], 75, 75);
        
    };
    
    
    /**
     * Draws our nodes to the canvas that the graph was initialized with
     * 
     * @returns {undefined}
     */
    self.drawFrame = function(){
      
        // Make sure we have the correct resolution
        _canvasContext.canvas.width = _canvasContext.canvas.offsetWidth;
        _canvasContext.canvas.height = _canvasContext.canvas.offsetHeight ;
      
        // Clear the canvas of anything rendered last frame
        _canvasContext.clearRect(0, 0, _canvasContext.canvas.width, _canvasContext.canvas.height);
      
        // Render all of our nodes
        for(var i = 0; i < _nodes.length; i ++){
            
            if(_nodes[i].getRenderFunction() !== null && _nodes[i].getRenderFunction() !== undefined){
                
                _nodes[i].render(self._canvasContext);
                
            } else {
                
                _renderNode(_nodes[i], _canvasContext, _scale, self.getPosition());
                
            }
            
        }
        
        window.requestAnimationFrame(self.drawFrame);
        
    };
    
    self.drawFrame();
    
}
