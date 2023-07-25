/**
🎪
@file editor name column maxed
@summary Maximize the name column of the field list ui.
@license MIT
@author Violgamba (Jon Heard)

@description
This maximizes the name column of the field list ui.  Useful if often using long field names.


HOW TO USE
1. Import this plugin into your game.
2. Focus on an event.  Note the size of the field name column is about as wide as it can get.
*/

//! CODE_EDITOR

function setupEditorPlugin() {
	function addCssRuleToEnd(rule) {
		const lastSheet = document.styleSheets[document.styleSheets.length - 1];
		const newRuleIndex = lastSheet.cssRules.length;
		lastSheet.insertRule(rule, newRuleIndex);
	}
	addCssRuleToEnd('.event-line > select { flex: 0; padding: 0; padding-right: 0.5em; }');
	addCssRuleToEnd('.event-line { padding: 0; padding-right: .25em; gap: 0; }');
	addCssRuleToEnd('.event-line > input { padding-left: 0.3em; padding-right: 0;');

	// Prevent repeating this setup
	window.EDITOR.loadedEditorPlugins ||= new Set();
	window.EDITOR.loadedEditorPlugins.add('nameColumnMaxed');
}
if (!window.EDITOR.loadedEditorPlugins?.has('nameColumnMaxed')) {
	setupEditorPlugin();
}
