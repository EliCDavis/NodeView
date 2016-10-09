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