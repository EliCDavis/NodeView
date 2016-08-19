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


module.exports = GraphOptions;

function GraphOptions() {

    var self = this;


    var _options = {
        /*
         * Whether or not the camera will try centering over the center
         * of the nodes.
         */
        centerOnNodes: {
            value: true,
            constructor: Boolean
        },
        /* 
         * Whether or not to calculate the attraction between two
         * nodes on a render frame 
         */
        applyGravity: {
            value: true,
            constructor: Boolean
        },
        /*
         * Whether or not to actually move the nodes on the render frame
         */
        applyTranslation: {
            value: true,
            constructor: Boolean
        },
        /*
         * The max speed a node can travel via graph coordinates
         */
        maxNodeSpeed: {
            value: 30000,
            constructor: Number
        },
        /*
         * How quickly the node will decelerate over time with the absent of forces
         */
        nodeDecelerationConstant: {
            value: 2,
            constructor: Number
        },
        /*
         * The value returned by the gravity function is multiplied by this value
         * before being applied to the actual node.
         */
        nodeGravityConstant: {
            value: 1,
            constructor: Number
        }
    };
    
    
    self.setOption = function (optionName, value) {

        if (typeof optionName !== "string") {
            throw "Unable to set option:  Option name expected to be type\
                    string, received: ", optionName;
        }

        try {
            if (_options[optionName].constructor === value.constructor) {
                _options[optionName].value = value;
            } else {
                throw "Unable to set option: Variable constructor expected: "
                        , _options[optionName].constructor, ". Received: ", value.constructor;
            }
        } catch (e) {
            throw "Unable to set option: ", e;
        }

    };

    self.applyGravity = function(){
        return _options.applyGravity.value;
    };
    
    self.applyTranslation = function(){
        return _options.applyTranslation.value;
    };
    
    self.centerOnNodes = function(){
        return _options.centerOnNodes.value;
    };
    
    self.maxNodeSpeed = function(){
        return _options.maxNodeSpeed.value;
    };
    
    self.nodeDecelerationConstant = function(){
        return _options.nodeDecelerationConstant.value;
    };
    
    self.nodeGravityConstant = function (){
        return _options.nodeGravityConstant.value;
    };
}