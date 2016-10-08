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