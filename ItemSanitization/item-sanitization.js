/*
 *  ItemSanitization plugin
 * 
 *  This Echo Stream plugin allows to define different sanitization rules 
 *  for item content based on a certain criteria (like user id/role/state or item state).
 *
 *  Version: 2.0 (03/04/2012)
 *  Developed by: Echo Solutions team (Kushnir Andrew)
 *  Documentation: http://wiki.aboutecho.com/Community-Developed-Plugins#ItemSanitization
 *
 *  More info about Echo StreamServer: http://www.aboutecho.com/
 *
 *  Disclaimer: this software is provided by the author "AS IS" and no warranties are implied
 */

(function($) {

var plugin = Echo.createPlugin({
	"name": "ItemSanitization",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.extendRenderer("Item", "body", function(element) {
			var item = this;
			var sanitizer = plugin.pickSanitizationMethod(item);
			item.data.object.content = sanitizer(item.data.object.content, item);
			item.parentRenderer("body", arguments);
		});
	}
});

plugin.pickSanitizationMethod = function(item) {
	var method = plugin.config.get(item, "sanitization", "none");
	var exceptions = plugin.config.get(item, "exceptions", []);
	$.map(exceptions || [], function(condition) {
		if (plugin.isConditionFulfilled(condition, item)) {
			method = condition.sanitization || "none";
			return false; // break
		}
	});
	return $.isFunction(method)
		? method
		: plugin.sanitizations[method]
			? plugin.sanitizations[method]
			: plugin.sanitizations.none;
};

plugin.isConditionFulfilled = function(condition, item) {
	var value = $.getNestedValue(condition.field, item.data);
	var _value = $.isArray(value) ? value : [value];
	var _condition = $.isArray(condition.value) ? condition.value : [condition.value]; 
	var fulfilled = false;
	$.map(_value, function(v) {
		$.map(_condition, function(c) {
			if ((v || "").toLowerCase() == (c || "").toLowerCase()) {
				fulfilled = true;
				return false; // break
			}
		});
	});
	return fulfilled;
};

plugin.sanitizations = {};

plugin.sanitizations.stripTags = function(content, item) {
	return $.stripTags(content);
};

plugin.sanitizations.none = function(content, item) {
	return content;
};

})(jQuery);
