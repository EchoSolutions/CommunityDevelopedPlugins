/*
 *  ItemHoverCard plugin
 * 
 *  This Echo Stream client plugin allows to create tooltips for the item UI components.
 *  This plugin can be used for example to create mini-profile popup badges.
 *  The content of the popup is defined in the plugin configuration and it can be
 *  either an iframe or a function which should return DOM element.
 *
 *  Version: 2.0 (07/12/2011)
 *  Developed by: Echo Solutions team (Kushnir Andrew)
 *  Documentation: http://wiki.aboutecho.com/Community-Developed-Plugins#ItemHoverCard
 *
 *  More info about Echo StreamServer: http://www.aboutecho.com/
 *
 *  Disclaimer: this software is provided by the author "AS IS" and no warranties are implied
 */

(function($) {

var plugin = Echo.createPlugin({
	"name": "ItemHoverCard",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.vars = plugin.vars || {};
		if (!plugin.checkDependencies(application)) return;
		$.map(plugin.config.get(application, "attachTo", ["avatar", "authorName"]),
			function(block) {
				plugin.extendRenderer("Item", block, function(element) {
					plugin.initTooltip(this, element);
					return this.parentRenderer(block, arguments);
				});
			});
		plugin.addCss(plugin.css);
	}
});

plugin.initTooltip = function(item, element) {
	plugin.loadDependencies(item, function() {
		if (!element) return;
		element.addClass("echo-clickable");
		var defaults = {
			"width": plugin.config.get(item, "content.width", 300),
			"content": {
				"text": plugin.prepareCardContent(item)
			},
			"position": {
				"my": "bottom center",
				"at": "top center",
				"target": "event",
				"viewport": $(window),
				"adjust": {"mouse": false}
			},
			"show": {"solo": true, "delay": 300},
			"hide": {"fixed": true, "delay": 700},
			"style": {"classes": "echo-qtip-container ui-tooltip-shadow ui-tooltip-tipped"}
		};
		var config = plugin.config.get(item, "qtip.config");
		element.qtip(config ? $.extend(true, defaults, config) : defaults);
	});
};

plugin.checkDependencies = function(application) {
	return !!($().qtip || plugin.config.get(application, "qtip.source.js"));
};

plugin.loadDependencies = function(item, callback) {
	if (!plugin.get(plugin, "cssReady") && plugin.config.get(item, "qtip.source.css")) {
		plugin.set(plugin, "cssReady", true);
		var container = document.getElementsByTagName("head")[0] ||
				document.documentElement;
		$(container).prepend('<link rel="stylesheet" id="echo-qtip-css" type="text/css" href="' + plugin.config.get(item, "qtip.source.css") + '">');
	}
	if (!$().qtip) {
		$.loadScriptContent(plugin.config.get(item, "qtip.source.js"), callback);
	} else {
		callback();
	}
};

plugin.prepareCardContent = function(item) {
	var content = plugin.config.get(item, "content");
	var dom = content.type == "iframe"
		? $('<iframe class="echo-plugin-ActorHoverCard-iframe" src="' + plugin.prepareURL(content.url, item) + '"></iframe>')
		: content.assemble(item);
	$.map(["width", "height"], function(dim) {
		if (!content[dim]) return;
		dom.css(dim, content[dim] + "px");
	});
	return dom;
};

plugin.prepareURL = function(url, item) {
	return url.replace(/{(.*?)}/g, function($0, $1) {
		var value = $.getNestedValue($1, item.data, "");
		return encodeURIComponent($.object2JSON(value));
	});
};

plugin.css =
	'.echo-plugin-ActorHoverCard-iframe { margin: 0px; padding: 0px; border: 0px; }' +
	'.echo-qtip-container { max-width: none !important; }' +
	'.echo-qtip-container .ui-tooltip-content { padding: 0px; }';

})(jQuery);
