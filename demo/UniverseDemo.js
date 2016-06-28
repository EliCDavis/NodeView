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


(function(){
    
    if(localStorage["demo"] !== 'galaxy'){
        return;
    }
    
   document.getElementById("demo-specific-html").innerHTML = "I got the idea for\
        this demo when writing the node attraction and translation methods.  I \
        overrode the attraction method function in this demo to cause chaos.  Zooming\
        out kinda makes it look like stars.  So I made a small star name generator\
        and implemented a clustering libary I found to create clusters.<br/><br/>\
        <h3>Warning! This will cause your tab to freeze for a few seconds!</h3>\
        <button onclick='Window.clusterStars()'>Click Here To Generate Constellations</button>";
    
    var starSyllables = [
        "aca",
        "crux",
        "far",
        "ain",
        "bali",
        "baran",
        "alde",
        "gol",
        "bore",
        "kab",
        "scell",
        "mos",
        "pella",
        "cast",
        "tor",
        "gedi",
        "gem",
        "had",
        "dus",
        "hoe",
        "bah",
        "drus",
        "heka",
        "jab",
        "mir",
        "ram",
        "zim",
        "scid",
        "ran",
        "nez",
        "sab",
        "sar",
        "sham",
        "tab",
        "aus",
        "ma",
        "veg",
        "wez",
        "yid",
        "dun"
    ];
    
    function createRandomStarName(){
        var output = "";
        for (var i = 0; i < 2 + Math.floor((Math.random() * 2)); i++) {
            output += starSyllables[Math.floor((Math.random() * starSyllables.length))];
        }
        
        return output.charAt(0).toUpperCase() + output.slice(1);
    }
    
    var graph = new Graph2D(document.getElementById("cv"));
    
    var galaxyColors = ["#00CED1","#8A2BE2","#00FA9A","#DC143C","#FA8072","#FFD700", "#FF00FF"];
    
    var backgroundRender = function(graph){
        
        var ctx = graph.getContext();
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
    };

    var linkRender = function (g, startPos, endPos, link) {
        var ctx = g.getContext();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 40*g.getScale();
        ctx.beginPath();
        ctx.moveTo(startPos[0], startPos[1]);
        ctx.lineTo(endPos[0],endPos[1]);
        ctx.stroke();
    };

    var nodeRender = function (node, nodeCanvasPos, graph) {

        var ctx = graph.getContext();
        ctx.fillStyle = node.getRenderData()["color"];
        ctx.beginPath();
        ctx.arc(nodeCanvasPos[0], 
                nodeCanvasPos[1], 
                node.getRadius()*graph.getScale()*.8, 
                0, 
                2 * Math.PI);
        ctx.fill();
        
        if(node.getRenderData()['$mouseOver']){
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(nodeCanvasPos[0],
                    nodeCanvasPos[1],
                    node.getRadius() * graph.getScale() * .8*.5,
                    0,
                    2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = "#00FF00";
            ctx.lineWidth = 2;
            ctx.rect(nodeCanvasPos[0]-200, nodeCanvasPos[1]-150, 150, 90);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(nodeCanvasPos[0], nodeCanvasPos[1]);
            ctx.lineTo(nodeCanvasPos[0], nodeCanvasPos[1]-95);
            ctx.lineTo(nodeCanvasPos[0]-50, nodeCanvasPos[1]-95);
            ctx.stroke();
            
            ctx.font = "16px Monospace";
            ctx.fillText(node.getRenderData()["name"],nodeCanvasPos[0]-190, nodeCanvasPos[1]-130);
            ctx.fillText("Lightyears Away",nodeCanvasPos[0]-190, nodeCanvasPos[1]-100);
            ctx.fillText(Math.round(node.getRadius()*1000000)/100000,nodeCanvasPos[0]-190, nodeCanvasPos[1]-80);
        }
        
        if (node.getRenderData()['$beingDragged']) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(nodeCanvasPos[0],
                    nodeCanvasPos[1],
                    node.getRadius() * graph.getScale() * .8*.3,
                    0,
                    2 * Math.PI);
            ctx.fill();
        } 
        
    };
    
    var nodeDetection = function(node, graph, mousePos){
        
        return (node.distanceFrom(mousePos) <= node.getRadius()*2);
             
    };
    
    graph.setBackgroundRenderMethod(backgroundRender);
    graph.setLinkRenderMethod(linkRender);
    graph.setDefaultNodeRenderAndMouseDetection(nodeRender, nodeDetection);
    
    
    graph.setNodeAttractionMethod(function (node1, node2, extraData) {

        var data = extraData;
        if (data === undefined || data === null) {
            data = {};
        }

        var pos1 = node1.pos;
        var pos2 = node2.pos;
        var mass1 = node1.mass;
        var mass2 = node2.mass;

        var xDist = pos2[0] - pos1[0];
        var yDist = pos2[1] - pos1[1];
        var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

        // Yeah you know what this is.
        var masses = Math.abs(mass1 * mass2);

        // Yeah this is physics dude.
        var attraction = (masses / (dist * dist)) * 3.1;

        // If we're too close then let's reject
        if (dist < mass1 + mass2) {
            attraction *= -0.8;
        }

        if (data["$groupPos"]) {
            attraction = .05;
        }

        return attraction;

    });
    
    
    for (var i = 0; i < 400; i++) {
        var node = graph.createNode();
        //node.setRenderDataByKey('color', galaxyColors[i%galaxyColors.length]);
        node.setRenderDataByKey('color', "#FFFFFF");
        node.setRadius(Math.random()*400 + 80);
        node.setRenderDataByKey('name',createRandomStarName());
    }


    Window.clusterStars = function(){
        
        graph.clearLinks();
        
        //number of clusters, defaults to undefined
        clusterMaker.k(50);

        //number of iterations (higher number gives more time to converge), defaults to 1000
        clusterMaker.iterations(500);

        //data from which to identify clusters, defaults to []
        var nodes = graph.getNodes();
        var nodePositionData = [];
        nodes.forEach(function(node){
            nodePositionData.push(node.getPosition());
        });
        
        clusterMaker.data(nodePositionData);

        var clusters = clusterMaker.clusters();
        
        clusters.forEach(function(cluster){
            
            var nodesInCluster = [];
            
            cluster.points.forEach(function(point){
                nodesInCluster.push(graph.getNodeClosestToPoint(point));
            });
            
            for(var i = 0; i < nodesInCluster.length; i ++){
                graph.linkNodes(nodesInCluster[i], 
                                nodesInCluster[Math.floor((Math.random() * nodesInCluster.length))]);
            }
            
        });
        
    };

//    setInterval(function () {
//        graph.createNode();
//    }, 10);
    
})();

