/*
 *  ItemPermalink plugin
 * 
 *  This Echo Stream client plugin converts static timestamp field into an item
 *  permanent URL hyperlink. Permanent URL format can be configured through
 *  the plugin parameters.
 *
 *  Version: 2.1 (08/11/2011)
 *  Developed by: Echo Solutions team (Kushnir Andrew)
 *  Documentation: http://wiki.aboutecho.com/Community-Developed-Plugins#ItemPermalink
 *
 *  More info about Echo StreamServer: http://www.aboutecho.com/
 *
 *  Disclaimer: this software is provided by the author "AS IS" and no warranties are implied
 */

(function($){

var plugin = Echo.createPlugin({
	"name": "ItemPermalink",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.extendRenderer("Item", "date", plugin.renderers.Item.date);
	}
});

plugin.renderers = {"Item": {}};

plugin.renderers.Item.date = function(element) {
	var item = this;
	item.parentRenderer("date", arguments);
	var format = plugin.config.get(item, "format");
	if (!format || plugin.get(item, "wrapped")) return;
	var href = $.isFunction(format)
		? format(item)
		: format.replace(/\[ID\]/g, item.data.object.id);
	element.wrap(item.hyperlink(
		{"href": href, "skipEscaping": true},
		{"openInNewWindow": plugin.config.get(item, "openInNewWindow", "", true)}
	));
	plugin.set(item, "wrapped", true);
};
	
})(jQuery);
