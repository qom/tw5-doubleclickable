/*\
title: $:/om/modules/widgets/doubleclickable.js
type: application/javascript
module-type: widget

DoubleClickable widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var DoubleClickableWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
DoubleClickableWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
DoubleClickableWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	// Remember parent
	this.parentDomNode = parent;
	// Compute attributes and execute state
	this.computeAttributes();
	this.execute();
	var tag = this.parseTreeNode.isBlock ? "div" : "span";
	
	// Create element and assign classes
	var domNode = this.document.createElement(tag),
		classes = (this["class"] || "").split(" ");
	classes.push("tc-doubleclickable");
	domNode.className = classes.join(" ");
	
    /* 
    Two modes in which the widget operates:
	Add only a double click event handler to parent tiddler DOM node without 
    inserting any new DOM element, or insert a new DOM element with event listener 
    and render child elements to make a clickable area within the doubleclickable 
    widget content area (between the widget opening and closing tags). 
    */
    if (this.attachToTiddler == "true") {
        var parentTiddlerNode = this.findParentTiddlerDomNode(parent);
    	$tw.utils.addEventListeners(parentTiddlerNode,[
    		{name: "dblclick", handlerObject: this, handlerMethod: "handleDoubleClickEvent"}
      	]);         
    } else {
    	$tw.utils.addEventListeners(domNode,[
        	{name: "dblclick", handlerObject: this, handlerMethod: "handleDoubleClickEvent"}
    	]);
      	// Insert element
      	parent.insertBefore(domNode,nextSibling);
      	this.renderChildren(domNode,null);
      	this.domNodes.push(domNode);
      	// Stack of outstanding enter/leave events
      	this.currentlyEntered = [];
    }
};

DoubleClickableWidget.prototype.handleDoubleClickEvent  = function(event) {
    this.performActions(this.getVariable("currentTiddler"), event);
	return false;
};

DoubleClickableWidget.prototype.performActions = function(title,event) {
	if (this.isEventTargetTextArea(event)) {
		this.invokeActionString(this.clickInInputAreaActions,this,event,{clickedTiddler: title});
	} else if(this.doubleclickableActions) {
		this.invokeActionString(this.doubleclickableActions,this,event,{clickedTiddler: title});
	}
};

DoubleClickableWidget.prototype.isEventTargetTextArea = function(event) {
	return event.target.nodeName === "TEXTAREA";
}

/*
Compute the internal state of the widget
*/
DoubleClickableWidget.prototype.execute = function() {
	this.doubleclickableActions = this.getAttribute("actions");
	this.clickInInputAreaActions = this.getAttribute("inputAreaActions")
    this.attachToTiddler = this.getAttribute("attachToTiddler");
	// Make child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
DoubleClickableWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["class"] || changedAttributes.tag) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};
  
/*
Climb the DOM to find the tiddler that this widget has been added in.
*/    
DoubleClickableWidget.prototype.findParentTiddlerDomNode = function(currentDomNode) {
    while(!currentDomNode.classList.contains("tc-tiddler-frame")) {
    	currentDomNode = currentDomNode.parentNode;
    }
    return currentDomNode;
};

exports.doubleclickable = DoubleClickableWidget;

})();
