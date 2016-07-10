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

    if (localStorage["demo"] !== 'popghub') {
        return;
    }

    document.getElementById("demo-specific-html").innerHTML = 
            "<span id='repo'></span>";

    var graph = new Graph2D(document.getElementById("cv"));

    graph.setBackgroundRenderMethod(function (graph) {
        
        var ctx = graph.getContext();
        ctx.fillStyle = "#4078c0";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
    });

    var _setGraphWithSearch = function(searchResults){
        
        searchResults.forEach(function(result){
            
            result.color = "#FFFFFF";
            if(result.full_name === "EliCDavis/NodeView"){
                result.color = "#00ff00";
            } 
            
            if(result.owner && result.owner.avatar_url){
                var avatar = new Image();
                avatar.src = result.owner.avatar_url;
                result.avatar = avatar;
            }
            
            
            graph.createNode({
                renderData: result,
                radius: (5 * result.score) + (result.stargazers_count/20) + (result.forks_count/10)
            }).onclick = function(node){
                revealHiddenInformation();
                console.log("Result: ",result);
                console.log(node.getPosition());
                document.getElementById("repo").innerHTML = "\
                    <h3><a target='_blank' href='"+result.html_url+"'>"+result.full_name+"</a></h3>\
                    ["+result.language+"] "+result.description+"\
                    <br/>Stars: "+result.stargazers_count+"<br/>\
                    Forks: "+result.forks_count+"<br/>\n\
                    Watchers: "+result.watchers_count;
            };
            
        });
        
    };

    function searchForRepos() {
        makeHttpRequest("https://api.github.com/search/repositories?q=stars:%3E1&s=star",
            function (err) {
                alert("Something went wrong during the search! Sorry!");
                console.log(err);
            }, function (data) {
                evalResourcesLeft();
                _setGraphWithSearch(data.items);
            });
    }
    
    graph.setDefaultNodeRenderAndMouseDetection(function render (node, nodeCanvasPos, graph){
        
        var renderData = node.getRenderData();
        
        var renderingRadius = node.getRadius()*graph.getScale()*.6;
        
        var ctx = graph.getContext();
        ctx.fillStyle = renderData["color"];
        ctx.beginPath();
        ctx.arc(nodeCanvasPos[0], 
                nodeCanvasPos[1], 
                renderingRadius, 
                0, 
                2 * Math.PI);
        ctx.fill();
        
        if(renderData['$mouseOver']){
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(nodeCanvasPos[0],
                    nodeCanvasPos[1],
                    node.getRadius() * graph.getScale() * .6*.9,
                    0,
                    2 * Math.PI);
            ctx.fill();
        }
        
        if (renderData['$beingDragged']) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(nodeCanvasPos[0],
                    nodeCanvasPos[1],
                    node.getRadius() * graph.getScale() * .6*.8,
                    0,
                    2 * Math.PI);
            ctx.fill();
        }
        
        if(renderData.avatar){
            ctx.drawImage(  renderData.avatar,
                            nodeCanvasPos[0] - renderingRadius/2,
                            nodeCanvasPos[1] - renderingRadius/2,
                            renderingRadius,
                            renderingRadius);
        }
        
        
        
        
        
    }, function detection(node, graph, mousePos){
        return (node.distanceFrom(mousePos) <= node.getRadius() * .6);
    });

    searchForRepos();

    var evalResourcesLeft = function() {
    
        // Figure out how many requests the user can make.
        var coreLeft = 0;
        var searchesLeft = 0;
    
        makeHttpRequest("https://api.github.com/rate_limit",
            function (err) {
                alert("Something went wrong during the search! Sorry!");
                console.log(err);
            }, function (data) {
                console.log(data);
                coreLeft = data.resources.core.remaining;
                searchesLeft = data.resources.search.remaining;

                console.log(coreLeft, searchesLeft);

            });
    };

    
    function makeHttpRequest(url, errcb, succb) {

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var postData = JSON.parse(xmlhttp.responseText);
                succb(postData);
            } else {

                if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {

                    if (errcb !== null) {
                        errcb(xmlhttp);
                    }

                }

            }
        };

        xmlhttp.open("GET",
                url, true);

        xmlhttp.send();

    }


})();