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
 * @returns {Node}
 */
function Node() {
    
        var self = this;

        // TODO: Create a render mode

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
         * Method called when the node was clicked on the canvas
         */
        self.onclick = null;
        
        
        /**
         * How we want to have this node rendered
         * @type method
         */
        var _renderFunction = null;


        /**
         * Override how the node will render by passing in your own method
         * for rendering.
         * 
         * The method must have an argument for taking in the context of the
         * canvas that it will render too.
         * 
         * @param {function(CanvasRenderingContext2D)} method
         * @returns {undefined}
         */
        self.setRenderFunction = function(method){
            
            if(method === null){
                throw "Error setting render functino for Node! Attempting to add a null method";
            }
            
            _renderFunction = method;
        
        };
        
        
        /**
         * Returns the method at which the node is rendered with
         * @returns {method}
         */
        self.getRenderFunction = function(){
            return _renderFunction;
        };

        
        /**
         * Given a context, renders the node to that context
         * 
         * @param {type} canvasContext
         * @returns {undefined}
         */
       self.render = function(canvasContext){
           
           if(_renderFunction === null){
               throw "Failure to render node! There's no render function defined!";
           }
           
           _renderFunction(canvasContext);
           
       };


       /**
        * returns the position of the node in x,y coordinates of the graph
        * in the form of [x, y]
        * 
        * @returns {Array}
        */
       self.getPosition = function(){
           return [_xPosition, _yPosition];
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
        
    }
