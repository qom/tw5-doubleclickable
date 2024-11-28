/*\
title: $:/core/modules/widgets/action-popup-event-coords.js
type: application/javascript
module-type: widget

Action widget to trigger a popup at the event (e.g. mouse click) coordinates.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var Popup = require("$:/core/modules/utils/dom/popup.js");

var ActionPopupEventCoordsWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
ActionPopupEventCoordsWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
ActionPopupEventCoordsWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
ActionPopupEventCoordsWidget.prototype.execute = function() {
	this.actionState = this.getAttribute("$state");
	this.floating = this.getAttribute("$floating","no") === "yes";
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
ActionPopupEventCoordsWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$state"] || changedAttributes["$coords"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

ActionPopupEventCoordsWidget.prototype.calcCoordsRelativeToContainingTiddler = function(event) {
	const coordinates = {};
	const containingTiddlerBodyNode = event.target.closest('.tc-tiddler-body');
	const tiddlerBodyBoundingRect = containingTiddlerBodyNode.getBoundingClientRect();
	coordinates.left = event.clientX - tiddlerBodyBoundingRect.x;
	coordinates.top = event.clientY - tiddlerBodyBoundingRect.y;
	coordinates.width = 0;
	coordinates.height = 0;
	
	return coordinates;
}

/*
Invoke the action associated with this widget
*/
ActionPopupEventCoordsWidget.prototype.invokeAction = function(triggeringWidget,event) {
	// Trigger the popup
	var coordinates = this.calcCoordsRelativeToContainingTiddler(event);
	if(coordinates) {
		$tw.popup.triggerPopup({
			domNode: null,
			domNodeRect: {
				left: coordinates.left,
				top: coordinates.top,
				width: coordinates.width,
				height: coordinates.height
			},
			title: this.actionState,
			wiki: this.wiki,
			floating: this.floating,
			absolute: coordinates.absolute
		});
	} else {
		$tw.popup.cancel(0);
	}
	return true; // Action was invoked
};

exports["action-popup-event-coords"] = ActionPopupEventCoordsWidget;

})();
