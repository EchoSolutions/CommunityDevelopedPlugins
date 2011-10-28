/*
 *  ItemConditionalCSSClasses plugin
 * 
 *  This Echo Stream client plugin allows to assign extra CSS classes to the item
 *  container DOM element based on a certain criteria (like a user id/role/state
 *  or item state). It allows to apply specific look and feel for the item in the stream.
 *
 *  Version: 2.1 (10/28/2011)
 *  Developed by: Echo Solutions team (Kushnir Andrew)
 *  Documentation: http://wiki.aboutecho.com/Community-Developed-Plugins#ItemConditionalCSSClasses
 *
 *  More info about Echo StreamServer: http://www.aboutecho.com/
 *
 *  Disclaimer: this software is provided by the author "AS IS" and no warranties are implied
 */

(function($) {

var plugin = Echo.createPlugin({
	"name": "ItemConditionalCSSClasses",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.extendRenderer("Item", "content", plugin.renderers.Item.content);
	}
});

plugin.renderers = {"Item": {}};

plugin.renderers.Item.content = function(element) {
	var item = this;
	item.parentRenderer("content", arguments);
	var conditions = plugin.config.get(item, "conditions");
	if (!conditions || !conditions.length) return;
	$.map(conditions, function(condition) {
		var value = $.getNestedValue(condition.field, item.data);
		var isCaseInsensitive = plugin.config.get(item, "caseInsensitive") == true;
		if ($.isArray(value)) {
			$.each(value, function(_id, _value) {
				if (plugin.areEqual(_value, condition.value, isCaseInsensitive)) {
					element.addClass(condition.className);
					return false; // break
				}
			});
		} else if (plugin.areEqual(condition.value, value, isCaseInsensitive)) {
			element.addClass(condition.className);
		}
	});
};

plugin.areEqual = function(string1, string2, isCaseInsensitive) {
	if (isCaseInsensitive) {
		string1 = (string1 || "").toLowerCase();
		string2 = (string2 || "").toLowerCase();
	}
	return string1 == string2;
};

})(jQuery);
