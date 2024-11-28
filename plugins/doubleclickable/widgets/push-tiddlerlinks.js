/*\
title: $:/om/modules/widgets/pushtiddlerlinks.js
type: application/javascript
module-type: widget

Action widget that pushes any tiddler links in a double click or other event target (e.g. block of wiki text)
into a state tiddler.

This is intended for mobile devices where dragging and dropping a tiddler link to easily create 
a wiki text [[tiddler link]] is not possible.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var PushTiddlerLinksWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
PushTiddlerLinksWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
PushTiddlerLinksWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

PushTiddlerLinksWidget.prototype.execute = function(){
	this.stateTiddlerName = this.getAttribute("$$stateTiddlerName","tiddlerLinks");
	this.containingTiddler = this.getAttribute("$$containingTiddler");
}

/*
Refresh the widget by ensuring our attributes are up to date
*/
PushTiddlerLinksWidget.prototype.refresh = function(changedTiddlers) {
	this.refreshSelf();
	return true;
};

/*
Invoke the action associated with this widget
*/
PushTiddlerLinksWidget.prototype.invokeAction = function(triggeringWidget,event) {
	this.pushLinks(event.target);
	
	const coords = this.calcCoordsRelativeToContainingTiddler(event);
	const popupState = "\"$:/state/popup/tiddlerLinkStack/" + this.containingTiddler +"\"";
	this.invokeActionString("<$action-popup $state=" + popupState + " $coords=" + coords + " $floating=\"no\"/>",this,event);
	return true; // Action was invoked
};

PushTiddlerLinksWidget.prototype.pushLinks = function(target) {
	const stateTiddler = "$:/state/" + this.stateTiddlerName,
		innerHTML = target.innerHTML,
		tiddlerLinkRegex = /<a[^>]*class=["'][^"']*tc-tiddlylink[^"']*["'][^>]*>(.*?)<\/a>/g,
		tiddlerLinks = [];

	let match;

	// Iterate through all matches and capture the tiddler links
	while ((match = tiddlerLinkRegex.exec(innerHTML)) !== null) {
		tiddlerLinks.push("[[" + match[1] + "]]");
	}

	// Write to state tiddler $:/state/tiddlerLinks
	var content = tiddlerLinks.join();
	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getTiddler(stateTiddler), // Preserve existing fields, if any
		{ title: stateTiddler, text: content } // Update text
	));
}

PushTiddlerLinksWidget.prototype.calcCoordsRelativeToContainingTiddler = function(event) {
	const containingTiddlerBodyNode = event.target.closest('.tc-tiddler-body');
	const tiddlerBodyBoundingRect = containingTiddlerBodyNode.getBoundingClientRect();
	const popupX = event.clientX - tiddlerBodyBoundingRect.x;
	const popupy = event.clientY - tiddlerBodyBoundingRect.y;
	return "(" + popupX + "," + popupy + ",0,0)";
}

exports["push-tiddlerlinks"] = PushTiddlerLinksWidget;

})();
