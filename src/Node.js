/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Node(){
    
    var self = this;
    
    var title = "Title";
    var contents = "Contents";
    
    self.toString = function(){
      
        return title + " - " + contents;
        
    };
    
};