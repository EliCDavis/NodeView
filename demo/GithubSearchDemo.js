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

    if (localStorage["demo"] !== 'ghub') {
        return;
    }

    document.getElementById("demo-specific-html").innerHTML = "Search for github!\n\
        <br/>Try searching for a repository or clicking one of the nodes!\
        <br/><br/>Enter a name to search for a repository:<br/>\
        <input type='text' id='repoSearch'><br><button onclick='Window.repoSearchFromSearchBar()'>Search</button><br/><br/><span id='repo'></span>";

    var graph = new Graph2D(document.getElementById("cv"));

//    graph.setOption("applyGravity", false);


    graph.setBackgroundRenderMethod(function (graph) {
        
        var ctx = graph.getContext();
        ctx.fillStyle = "#4078c0";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
    });

    var _setGraphWithSearch = function(searchResults){
        
        graph.clearNodes();
        
        searchResults.forEach(function(result){
            
            result.color = "#FFFFFF";
            if(result.full_name === "EliCDavis/NodeView"){
                result.color = "#00ff00";
            } 
            
            graph.createNode({
                renderData: result,
                radius: (5 * result.score) + (result.stargazers_count/20) + (result.forks_count/10)
            }).onclick = function(){
                revealHiddenInformation();
                console.log("Result: ",result);
                document.getElementById("repo").innerHTML = "\
                    <h3><a target='_blank' href='"+result.html_url+"'>"+result.full_name+"</a></h3>\
                    ["+result.language+"] "+result.description+"\
                    <br/>Stars: "+result.stargazers_count+"<br/>\
                    Forks: "+result.forks_count+"<br/>\n\
                    Watchers: "+result.watchers_count;
            };
            
        });
        
    };

    function searchForRepos(searchString) {

        if (!searchString || typeof searchString !== "string" || searchString === "") {
            throw "Invalide search string! ", searchString;
        }

        makeHttpRequest("https://api.github.com/search/repositories?q="+searchString,
            function (err) {
                alert("Something went wrong during the search! Sorry!");
                console.log(err);
            }, function (data) {
                evalResourcesLeft();
                _setGraphWithSearch(data.items);
            });
    }

    searchForRepos("NodeView");

    Window.repoSearchFromSearchBar = function(){
        searchForRepos(document.getElementById("repoSearch").value);
    };

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
//                console.log(xmlhttp.responseText);
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