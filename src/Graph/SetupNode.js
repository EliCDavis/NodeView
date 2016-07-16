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


var Node2D = require('../Node2D');
var GetFreeSpaceForNode = require('./GetFreeSpace');

module.exports = function SetupNode(options, graph) {
    
    var node = new Node2D();
    
    if (options && options.renderData) {
        Object.keys(options.renderData).forEach(function (key, index) {
            node.setRenderDataByKey(key, options.renderData[key]);
        });
    } else {
        node.setRenderDataByKey('color', '#000000');
    }

    var setRadius = 70;

    if (options && options.radius) {
        setRadius = options.radius;
    }

    node.setRadius(setRadius);

    if (options && options.position) {
        node.setPosition(options.position);
    } else {
        if (options && options.freeSpace) {
            node.setPosition(GetFreeSpaceForNode(options.freeSpace, graph));
        } else {
            node.setPosition(GetFreeSpaceForNode(setRadius * 4, graph));
        }
    }
    
    return node;
    
};