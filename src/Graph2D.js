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
     * @type Node2D[]
     */
    var _nodes = [];


    
    var _nodeLinks = [];


    /**
     * The method that is called when we have cleared the canvas and is about
     * to draw the next frame.
     * 
     * @type function
     */
    var _backgroundRenderMethod = null;

    
    var _linkRenderMethod = null;

    
    self.setLinkRenderMethod = function(renderMethod){
        
        if(typeof renderMethod !== "function"){
            console.error("Failure to set Link Render Method! \
                           Arguement must be typeof function!");
            return;
        }
        
        if(renderMethod.length !== 4){
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
    self.setBackgroundRenderMethod = function(method){
        
        if(typeof method !== "function"){
            console.error("Failure to set Background Render Method! \
                           Arguement must be typeof function!");
            return;
        }
        
        if(method.length !== 1){
            console.error("Failure to set Background Render Method! \
                           Method's arguement length must be 1 so it\
                           can be passed the graph being rendered!");
            return;
        }
        
        _backgroundRenderMethod = method;
    };

    
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

    
    /**
     * Returns the size of the canvas element in pixels.
     * 
     * @returns {Array}
     */
    var _getCanvasSize = function(){
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


    /**
     * 
     * @type MouseEvent
     */
    var _lastSeenMousePos = null;
    

    var _mouseUpCalled = function (event) {
        
        _lastSeenMousePos = event;
        
        if(_currentMouseState === "dragging" ){
            
            // Update their render status
            if (_itemBeingDraggedOnCanvas["itemType"] === "node") {
                _itemBeingDraggedOnCanvas["item"].setRenderDataByKey("$beingDragged", false);
            }
            
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
    
    
    var _mouseOverNode = function (node, coords) {
        
        if (node.getClickDetectionFunction() === null) {
            return _defaultNodeMouseDetection(node, self, [coords.x, coords.y]);
        } else {
            return node.wasClicked(self, [coords.x, coords.y]);
        }
        
    };
    
    
    var _mouseDownCalled = function (event) {
        
        _lastSeenMousePos = event;
        
        var coords = _mouseToGraphCoordinates(event);
        
        _currentMouseState = "hold";

        // Figure out what Node was clicked (if any) and then begin dragging appropriatlly
        _nodes.forEach(function (node) {

            var wasClicked = _mouseOverNode(node, coords);

            if(wasClicked){
                _itemBeingDraggedOnCanvas = {"item":node, "itemPos":node.getPosition(), "mousePos":[coords.x, coords.y], "itemType":"node" };
            }

        });
        
        // If we didn't grab a node then we've grabbed the canvas
        if(_itemBeingDraggedOnCanvas === null){
            _itemBeingDraggedOnCanvas = {"item":self, "itemPos":self.getPosition(), "mousePos":[coords.x, coords.y], "itemType":"graph"};
        }
        
    };
    
    
    var _mouseOutCalled = function (event) {
        
        _lastSeenMousePos = null;
        
        if(_currentMouseState === "dragging"){
            _currentMouseState = "free";
        }
        
    };
    
    
    var _mouseMoveCalled = function (event) {
        
        _lastSeenMousePos = event;
        
        if(_currentMouseState === "hold"){
            
            _currentMouseState = "dragging";
            
            // Update their render status
            if (_itemBeingDraggedOnCanvas["itemType"] === "node") {
                 _itemBeingDraggedOnCanvas["item"].setRenderDataByKey("$beingDragged", true);
            }
            
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
        if(event.deltaY > 0){
            direction = -0.05;
        } else {
            direction = 0.05;
        }
        
        newScale += direction*newScale;
        
        var canvasSize = _getCanvasSize();

        var oldCenter = [canvasSize[0] * (1/_scale) * 0.5, canvasSize[1] * (1/_scale) * 0.5];
        var newCenter = [canvasSize[0] * (1/newScale) * 0.5, canvasSize[1] * (1/newScale) * 0.5];
        
        var curPos = self.getPosition();

        // Move the position to keep what was in our center in the old scale in the center of our new scale
        self.setPosition(curPos[0] + (newCenter[0] - oldCenter[0]), curPos[1]+ (newCenter[1] - oldCenter[1]));
        
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
     * 
     * @param {type} x
     * @param {type} y
     * @returns {undefined}
     */
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
    
    
    // TODO: Optimize
    var _spaceFree = function (p, radius) {
        
        for(var i = 0; i <_nodes.length; i++){
            var np = _nodes[i].getPosition();
            
            var distance = Math.sqrt(Math.pow(np[0] - p[0],2)+ 
                                     Math.pow(np[1] - p[1],2));
                    
            if(distance < radius){
                return false;
            }
        }
        
        return true;
        
    };
    
    
    /**
     * Returns x and y coordinates that are atleast as far away as the radius
     * from all other nodes on the graph.
     * 
     * @param {Number} radius how much space you'd like between all the points
     * @returns {Array} [x, y] in graph (not canvas) coordinates
     */
    var _getFreeSpace = function(radius){
    
        if (_nodes.length === 0) {
            var graphSize = _getCanvasSize();
            var centerPos = [graphSize[0] / 2, graphSize[1] / 2];
            return [centerPos[0] * (1 / _scale), centerPos[1] * (1 / _scale)];
        }

        // Average and find center of all nodes
        var averageCenter = [0, 0];
        
        var total = [0,0];

        // Total up all the positions
        _nodes.forEach(function(node){
            total[0] += node.getPosition()[0];
            total[1] += node.getPosition()[1];
        });

        // Average the total to get center
        averageCenter[0] = total[0] / _nodes.length;
        averageCenter[1] = total[1] / _nodes.length;
            
    
        // Generate a grid extending out from center with cells 1/4 size of radius
        var stepSize = radius/4;
        var stepHpot = Math.sqrt(stepSize*stepSize*2);
        var curStep = 0;
        
        while(curStep < 10000){ // Dear god what am I doing.
            
            // Conceptually we're extending outwards in a grid fasion
            // until we find a free grid space from the center
            //       _ _ _ _ _   _
            //      |_|_|_|_|_| 4 |
            //    4 |_|     |_| 3 |__ Size of wall is 4
            //    3 |_|  X  |_| 2 |   For a 5x5 grid.
            //    2 |_|_ _ _|_| 1_|
            //    1 |_|_|_|_|_|
            //         1 2 3 4
            var sizeOfWall = (curStep*2);
            if(curStep === 0){
                sizeOfWall = 1;
            }
            
            // Create the sides of the wall
            var leftSide = [];
            var rightSide = [];
            var bottomSide = [];
            var topSide = [];
            
            // Get the offset from the center
            var offset = (curStep + .5)*stepSize;
            
            // Get the different starting positions due to offset
            // (Four corners of square)
            var bottomLeft = [averageCenter[0] - offset, averageCenter[1] - offset];
            var bottomRight = [averageCenter[0] + offset, averageCenter[1] - offset];
            var topLeft = [averageCenter[0] - offset, averageCenter[1] + offset];
            var topRight = [averageCenter[0] + offset, averageCenter[1] + offset];
            
            // Add all the potential spaces
            for(var i = 0; i < sizeOfWall; i ++){
                leftSide.push([bottomLeft[0], bottomLeft[1] + (stepSize*i)]);
                rightSide.push([topRight[0], topRight[1] - (stepSize*i)]);
                bottomSide.push([bottomRight[0] - (stepSize*i), bottomRight[1]]);
                topSide.push([topLeft[0]+ (stepSize*i), topLeft[1]]);
            }
            
            var potentialSpaces = leftSide
                                    .concat(rightSide)
                                    .concat(bottomSide)
                                    .concat(topSide);
            
            for(var i = 0; i < potentialSpaces.length; i ++){
                if(_spaceFree(potentialSpaces[i], radius)){
                    return potentialSpaces[i];
                }
            }
            
            curStep ++;
            
        }
        
        console.log("Failure to find place! Sorry dude.");
        
        return [0,0];
    
    };
    

    /**
     * The default node rendering function assigned to all nodes upon creation
     * 
     * @param {Node2D} node The node being rendered
     * @param {Array[x,y]} nodePosOnCanvas The nodes getPosition() returns it's
     * position in graph coordinates.  nodePosOnCanvas is where the node is on
     * canvas coordinates.
     * @param {Graph2D} graph The graph that the node is apart of
     * @returns {undefined}
     */
    var _defaultNodeRender = function(node, nodePosOnCanvas, graph){
        
        // TODO: do input santizing
        
        var scale = graph.getScale();
        var nodeSize = node.getRenderData()['size'];
        
        var startPos = [nodePosOnCanvas[0] - ((nodeSize[0]/2) * scale),
                        nodePosOnCanvas[1] - ((nodeSize[1]/2) * scale)];
                    
                    
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
                        (node.getPosition()[1]-(nodeSize[1]/2) ) ];
                    
        var endPos = [nodeSize[0], nodeSize[1]];
                  
        return pointsInsideRect([startPos[0], startPos[1], endPos[0], endPos[1]], mousePos);
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
     * @returns {Node2D}
     */
    self.createNode = function(){
      
        var node = new Node2D();
        
        node.setRenderDataByKey('size', [40, 40]);
        node.setRadius(70);
        node.setRenderDataByKey('color', '#FFFFFF');
        node.setPosition(_getFreeSpace(70)); 
       
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
    self.linkNodes = function(n1, n2, linkData){
    
        // Make sure the nodes are not null
        if(n1 === null || n1 === undefined){
            throw "Failure to link! The first node passed in to link was: "+n1;
        }
        
        // Make sure the nodes are not null
        if(n2 === null || n2 === undefined){
            throw "Failure to link! The second node passed in to link was: "+n2;
        }

        // TODO: Make sure the link does not already exist

        // Tell the nodes their linked
        // TODO: Review and make sure doing this even makes sense
        n1.addLink(n2);
        n2.addLink(n1);

        // Create our link for the graph to keep up with.
        _nodeLinks.push({
            "nodes": [n1, n2],
            "linkData": linkData
        });
        
    };
    
    
    var _getGravitationalPull = function(pos1, pos2, mass1, mass2){
        
        var xDist = pos2[0] - pos1[0];
        var yDist = pos2[1] - pos1[1];
        var dist = Math.sqrt( (xDist*xDist) + (yDist*yDist) );
        
        if(dist === 0){
            return [0,0];
        }

        // Yeah you know what this is.
        var masses = Math.abs(mass1 * mass2);

        // Yeah this is physics dude.
        var attraction = (masses / (dist * dist)) * 2.1;

        // If we're too close then let's reject
        if(dist < mass1+mass2){
            attraction *=-5;
        }

        // Get the angle so we can apply the fource properly in x and y
        var angle = Math.atan(yDist/xDist);

        // ¯\_(ツ)_/¯
        var direction = 1;
        if(xDist < 0 ){
            direction = -1;
        } 

        // Add to the acceleration.
        return [Math.cos(angle)*attraction*direction, 
                Math.sin(angle)*attraction*direction];
        
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

        if(_backgroundRenderMethod !== null && _backgroundRenderMethod !== undefined){
            _backgroundRenderMethod(self);
        }
        self.getContext().fillStyle = "white";
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
        _nodeLinks.forEach(function (link) {

            var startPos = [(link.nodes[0].getPosition()[0] + _xPosition) * _scale,
                            (link.nodes[0].getPosition()[1] + _yPosition) * _scale];
            
            var endPos = [(link.nodes[1].getPosition()[0] + _xPosition) * _scale,
                          (link.nodes[1].getPosition()[1] + _yPosition) * _scale];

            if(_linkRenderMethod !== null && _linkRenderMethod !== undefined){
                _linkRenderMethod(self, startPos, endPos, link);
                return;
            } 

            var ctx = self.getContext();

            ctx.beginPath();
            ctx.moveTo(startPos[0], startPos[1]);
            ctx.lineTo(endPos[0],endPos[1]);
            ctx.stroke();

        });

        // Draw the nodes them selves
        _nodes.forEach(function (n) {

            // Apply acceleration to the node based on realtive position to 
            // center and other nodes.
            var totalAcceleration = [0,0];
            _nodes.forEach(function(oN){
                
                var pull = _getGravitationalPull(
                    n.getPosition(),
                    oN.getPosition(),
                    n.getRadius(),
                    oN.getRadius()
                );
                
                // Add to the acceleration.
                totalAcceleration[0] += pull[0];
                totalAcceleration[1] += pull[1];
                
            });
            
            var pull = _getGravitationalPull(
                    n.getPosition(),
                    [0, 0],
                    n.getRadius(),
                    n.getRadius()
                    );

            totalAcceleration[0] += pull[0]*10;
            totalAcceleration[1] += pull[1]*10;

            n.accelerate(totalAcceleration[0], totalAcceleration[1]);

            // Translate the node this frame
            var moved = n.translate((Date.now() - _lastDrawFrame)/1000);

            // TODO: Need to also check if a mouse event happened this frame
            // TODO: Plenty of optimization needed
            if(moved  && _lastSeenMousePos !== null){
                
                // Check if the mouse is over the node
                if(_mouseOverNode(n, _mouseToGraphCoordinates(_lastSeenMousePos))){
                    n.setRenderDataByKey('$mouseOver', true);
                } else {
                    n.setRenderDataByKey('$mouseOver', false);
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

        _lastDrawFrame = Date.now();
        window.requestAnimationFrame(_drawFrame);

    };

    var _lastDrawFrame = Date.now();

    _drawFrame();

}