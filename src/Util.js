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

    /**
     * Converts global coordinates to canvas relative coordinates
     * http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
     * 
     * TODO: Check validity of function, (test)
     * TODO: Optimize
     * 
     * @param {type} event
     * @returns {Util_L26.relMouseCoords.UtilAnonym$0}
     */
    function relMouseCoords(event) {
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement = this;

        do {
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        } while (currentElement = currentElement.offsetParent)

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        return {x: canvasX, y: canvasY}
    }
    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

})();


/**
 * Determines whether or not the point falls within the given rect
 * 
 * @param {type} rect [x, y, width, height]
 * @param {type} point [x, y]
 * @returns {Boolean} 
 */
function pointsInsideRect(rect, point) {

    // Make sure rect is valid
    if(rect === null || rect === undefined || rect.length === null || 
       rect.length === undefined || rect.length !== 4){
        throw "Invalid rect argument! Expecting array in format [x, y, width, \
                height].  Instead recieved: "+rect;
    }
    
    // Make sure point is valid
    if(point === null || point === undefined || point.length === null || 
       point.length === undefined || point.length !== 2){
        throw "Invalid point argument! Expecting array in format [x, y]. \
                Instead recieved: "+point;
    }

    if (rect[0] <= point[0] && point[0] <= rect[0] + rect[2]) {
        if (rect[1] <= point[1] && point[1] <= rect[1] + rect[3]) {
            return true;
        }
    }

    // console.log(point +" not in "+rect);

    return false;

}