# Node View
Node View is a node rendering library that utilize's HTML5's canvas to allow 
developers to have full control over how they want their data represented 
without having to worry about the boring part of the rendering process.

## Install
Grab the latest version from the [dest/](https://github.com/EliCDavis/NodeView/tree/master/dist) directory.

### Bower
Nodeview can be installed via bower using:
```
bower install nodeview
```
Then in your code just reference it using:
```HTML
<script src="bower_components/nodeview/dist/nodeview.js"></script>
```

## Build And Development Setup
After cloning the repository you first need to run
```
npm install
```
to grab all the dependencies for building this project successfully.

Then if you ever want to 'compile' what changes you've made just run
```
gulp build-all
```

If you have trouble running gulp make sure it's installed globally.

## API Examples

### Creating an Instance
To start using Node View you need to create a new instance of it by passing your canvas element 
in the constructor.

*Returns Graph2D*
```js
new Graph2D(HTMLCanvasElement);
```

#### Example:
```js
var graph = new Graph2D(document.getElementById("node canvas"));
```

### Creating a Node
Nodes should be created through the graph instance to ensure their properly linked
up with it.

*Returns Node2D*

```js
graphInstance.createNode(optionalConfiguration);
```

Create Node options:

```js
{
    renderData: Object, // Any data you want to be stored in the newly created node
    radius: Number, // how big the node will apppear to other nodes
    position: Array, // [x, y], position in graph coordinates of the node
    freeSpace: Number // If position is not specified, the graph will place the node atleast this far away from all other nodes
}
```

#### Example:
```js
graphInstance.createNode({
    renderData: {my random jazz I want to store},
    radius: 50,
    freeSpace: 90
});
```

### Linking Nodes
In graph theory, nodes generally have a relationship of some sorts between one another.  In node view this relationship is known as a link.

*returns link:Object*

```js
graphInstance.linkNodes(node1:Node2D, node2:Node2D, ?linkData:Object);
```
**linkData**: Any data you would like to be associated with the link at hand.  Some properties of the object will be set/modified by the graph itself.  Any properties that *are* used specifically by the graph will always be prefaced with "$".  This data is passed back into the rendering method for links.

Current variables modified by the graph:
* **$directedTowards** *(Node2D)*: Specifies the direction of said link.  Graph2D does not modify this variable, only looks at it

#### Example:
```js
var node1 = new Node2D();
var node2 = new Node2D();
graphInstance.linkNodes(node1, node2, {
    $directedTowards: node1, // Rendering will now have an arrow pointing towards node1
    distance: 5 // My own random data I want to be associated with the link
});
```
### Change Graph Option
The graph has a few different settings for opperation that can be modified by this function.

*returns undefined*
```js
graphInstance.setOption(optionName:String, value:Object);
```

Options that exhist on the graph include:
* **centerOnNodes**:*boolean* - If true, the camera will always recenter on the center of all the nodes.
* **applyGravity**:*boolean* - If true, no gravity methods will be applied to accelerate nodes.
* **applyTranslation**:*boolean* - If true, nodes on the graph will not be moved by any internal velocity.
* **maxNodeSpeed**:*Number* - How fast a node can move per frame render.
* **nodeDecelerationConstant**:*Number* - How quickly the node decelerates.
#### Example:
```js
graphInstance.setOption('centerOnNodes', false);
```

[Source Here](https://github.com/EliCDavis/NodeView/blob/master/src/Graph/GraphOptions.js)
### Override Node's Gravity
Sometimes you want certain nodes to be attracted to others.  Any custom graviy behavior requires a new node attraction method to be defined.  **This method must return a single Number.**  The graph will take care of figuring out the correct forces to apply in the x and y direction.

*returns undefined*
```js
graphInstance.setNodeAttractionMethod(function (psuedoNode1, psuedoNode2, extraData){return 0;});
```
The function you pass in must take 3 arguments.  The first two being the nodes that we're going to be applying the attactive force to.  The third is any extra data that is associated with this attraction force.

The nodes passed in to this function are not your ordinary nodes.  They are instead Objects :
```js
{
    "pos": position //    <-- [Number, Number]
    "mass": mass    //    <-- Number
    "node" node     //    <-- might not be passed, if passed, Node2D
}
```
The reason for doing this is so that a node can be attracted to a non node object as long as a pos and mass is given.  An example of this happening is when the graph tries figuring out the force between a node and the center of the group.

The third parameter to the method (extraData) is an object that looks something like this:
```js
{
    $linkData: {},         // If the nodes have been linked then the data passed in with the link would show up here
    $groupPos: boolean     // If this is a comparison between a node and a group position this will be true
}
```

#### Example:
```js
// Makes the nodes repelled by the center of the group.
graph.setNodeAttractionMethod(function (node1, node2, extraData) {

    var data = extraData;
    if (data === undefined || data === null) {
        data = {};
    }
    // Yeah you know what this is
    var xDist = node2.pos[0] - node1.pos[0];
    var yDist = node2.pos[1] - node1.pos[1];
    var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

    // Yeah this is the gravity formula.  Welcome back terrible highschool memories.
    var masses = Math.abs(node1.mass * node2.mass);
    var attraction = (masses / (dist * dist)) * 1.1;

    // If we're too close then let's reject
    if (dist < node1.mass + node2.mass) {
        attraction *= -3.5;
    }

    // If this is a group position, reverse the direction of the attraction to go the other way
    if (data.$groupPos && attraction < 0) {
        attraction *= -4;
    }

    return attraction;
});
```

### Override Default Node Render and Mouse Detection
So you don't like the default method of rendering nodes?  Fine then.  If your going to change how a node is displayed your going to have to change how a mouse detects it also.  So overriding the rendering also overrides how it's detected.

*returns undefined*
```js
graph.setDefaultNodeRenderAndMouseDetection(
    function (node:Node2D, nodeCanvasPos:[x,y], graph:Graph2D){}, // Render Method
    function (node:Node2D, graph:Graph2D, mousePos:[x,y]){return boolean;} // Mouse Detection
);
```

#### Render Method
* **node**:*Node2D* - The node to be rendered.
* **nodeCanvasPos**:*[x, y]* - The position **(in canvas coordinates)** that the node is positioned on.
* **graph**:*Graph2D* - The graph that contains the node.

##### Something useful to know when writing your render method
A Node's render data is modified by the graph when things such as a mouse has hovered over it.  The variables modified by the graph are all prefixed with "$".  These variables include: 
```js
{
    $mouseOver: boolean, // Whether or not the user's mouse is over the node
    $neighborMouseOver: boolean, // Whether or not the user's mouse is over a node that this node it linked too
    $beingDragged: boolean, // Whether or not the user is dragging the node around
    $neighborBeingDragged: boolean // Whether or not the user is dragging a node that this node it linked too
}
```

So this means in your render method you can get info like this and use it to do more specialized rendering.
```js
if (node.getRenderData().$mouseOver){
    mouseOverRender();
}
```

#### Mouse Detection
This method must return either true or false
* **node**:*Node2D* - The node to be rendered.
* **graph**:*Graph2D* - The graph that contains the node.
* **mousePos**:*[x, y]* - The position **(in graph coordinates)** that the mouse is currntely considered.  This is the same coordinate space that nodeInstance.getPosition() returns in.  So comparing distance between a nodes position and the mouse position is valid.  The graph takes care of converting it from document coordinate space to it's own graph space.

#### Example:
Let's create a simple circle node that has a black center when moused over.
```js
graph.setDefaultNodeRenderAndMouseDetection(function(){
    var ctx = graph.getContext();
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(nodeCanvasPos[0],
            nodeCanvasPos[1],
            node.getRadius() * graph.getScale() * .6,
            0,
            2 * Math.PI);
    ctx.fill();
    
    if (node.getRenderData().$mouseOver){
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(nodeCanvasPos[0],
                nodeCanvasPos[1],
                node.getRadius() * graph.getScale() * .6 * .5,
                0,
                2 * Math.PI);
        ctx.fill();
    }
}, function (node, graph, mousePos){
    return (node.distanceFrom(mousePos) <= node.getRadius() * .6);
});
```

### Overriding Background
The background is the first thing that is called during a render step.  The only thing that is passed into the render method is the graph itself.

*Returns undefined*
```js
graphInstance.setBackgroundRenderMethod(function (graph) {});
```
#### Example:
```js
// Draw a solid colored background.
graph.setBackgroundRenderMethod(function (graph) {
    var ctx = graph.getContext();
    ctx.fillStyle = "#660000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
});
```
### Override Link Render
The graph calls a link render method for each link that exhists.

*Returns undefined*
```js
graphInstance.setLinkRenderMethod(function(graph:Graph2D, point1:Array, point2:Array, link:Object){});
```
* graph : graph that is calling the render method
* point1 : [x, y] coordinates in canvas space
* point2: [x, y] coordinates in canvas space
* link: Any data associated with the link.  Initially set when the link is created by the linkNodes() method.
    * link.nodes: Array of nodes that are in the link (generally 2)
    * link.linkData: Any data set during the linkNodes() method.

#### Example:
```js
graph.setLinkRenderMethod(function (g, point1, point2, link) {

    // Only render the line when one of the nodes are being moused over.
    if (!link.nodes[0].getRenderData().$mouseOver && !link.nodes[1].getRenderData().$mouseOver) {
        return;
    }

    var ctx = g.getContext();
    var scale = g.getScale();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5 * scale;
    ctx.beginPath();
    ctx.moveTo(point1[0], point1[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.stroke();

});
```

### Drawing Things after Main Render
Sometimes you want to make sure that what your drawing goes on top of everything else.  In order to do this, inside one of the overriden render functions (such as node renderer, line renderer, background renderer...) call the post render function.  The function passed in as an arguement is added to a queue which is then dequeued after all other render methods have been called.

*Returns undefined*
```js
graphInstance.postRender(Function);
```
#### Example:
```js
graphInstance.setBackgroundRenderMethod(function (graph) {

    var ctx = graph.getContext();
    ctx.fillStyle = "#660000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Make sure title is always drawn over everything.
    graph.postRender(function(){
        ctx.fillStyle = "black";
        ctx.fillText("Example title", 20, 20);
    });
    
});
```
