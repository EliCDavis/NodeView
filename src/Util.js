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


module.exports = {
    "init": function () {


        // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
        // creates a global "addWheelListener" method
        // example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );
        (function (window, document) {

            var prefix = "", _addEventListener, support;

            // detect event model
            if (window.addEventListener) {
                _addEventListener = "addEventListener";
            } else {
                _addEventListener = "attachEvent";
                prefix = "on";
            }

            // detect available wheel event
            support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
                    document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
                    "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

            window.addWheelListener = function (elem, callback, useCapture) {
                _addWheelListener(elem, support, callback, useCapture);

                // handle MozMousePixelScroll in older Firefox
                if (support == "DOMMouseScroll") {
                    _addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
                }
            };

            function _addWheelListener(elem, eventName, callback, useCapture) {
                elem[ _addEventListener ](prefix + eventName, support == "wheel" ? callback : function (originalEvent) {
                    !originalEvent && (originalEvent = window.event);

                    // create a normalized event object
                    var event = {
                        // keep a ref to the original event object
                        originalEvent: originalEvent,
                        target: originalEvent.target || originalEvent.srcElement,
                        type: "wheel",
                        deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                        deltaX: 0,
                        deltaY: 0,
                        deltaZ: 0,
                        preventDefault: function () {
                            originalEvent.preventDefault ?
                                    originalEvent.preventDefault() :
                                    originalEvent.returnValue = false;
                        }
                    };

                    // calculate deltaY (and deltaX) according to the event
                    if (support == "mousewheel") {
                        event.deltaY = -1 / 40 * originalEvent.wheelDelta;
                        // Webkit also support wheelDeltaX
                        originalEvent.wheelDeltaX && (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX);
                    } else {
                        event.deltaY = originalEvent.detail;
                    }

                    // it's time to fire the callback
                    return callback(event);

                }, useCapture || false);
            }

        })(window, document);

        // IE7 and 8 support for indexOf
        Array.prototype.indexOf || (Array.prototype.indexOf = function (d, e) {
            var a;
            if (null == this)
                throw new TypeError('"this" is null or not defined');
            var c = Object(this),
                    b = c.length >>> 0;
            if (0 === b)
                return -1;
            a = +e || 0;
            Infinity === Math.abs(a) && (a = 0);
            if (a >= b)
                return -1;
            for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b; ) {
                if (a in c && c[a] === d)
                    return a;
                a++;
            }
            return -1;
        });

        /**
         * Converts global coordinates to canvas relative coordinates
         * http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
         * 
         * TODO: Optimize
         * 
         * @param {type} event
         * @returns {Util_L26.relMouseCoords.UtilAnonym$0}
         */
        function relMouseCoords(event) {

            var rect = this.getBoundingClientRect();
            return {x: event.clientX - rect.left, y: event.clientY - rect.top};
        }

        HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

    },
    // http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
    isNumeric: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    
    /**
     * @stof 105034
     * @returns {String}
     */
    generateUUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
};