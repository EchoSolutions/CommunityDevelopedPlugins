/*
 *  StreamRootItemsLimiter plugin
 * 
 *  This Echo Stream client plugin allows to limit the amount of visible items in the stream
 *  when a live update reaches the client side. When new items are rendered, the old ones
 *  are removed from the visual part of the stream.
 *
 *  Version: 2.0 (07/18/2011)
 *  Developed by: Echo Solutions team (Kushnir Andrew)
 *  Documentation: http://wiki.aboutecho.com/Community-Developed-Plugins#StreamRootItemsLimiter
 *
 *  More info about Echo StreamServer: http://www.aboutecho.com/
 *
 *  Disclaimer: this software is provided by the author "AS IS" and no warranties are implied
 */

(function($) {

var plugin = Echo.createPlugin({
	"name": "StreamRootItemsLimiter",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		application.subscribe("Stream.Item.onRender", function() {
			var maxItemsCount = plugin.get(application, "maxItemsCount");
			$.map(application.threads.slice(maxItemsCount), function(item) {
				application.deleteItemSpotUpdate(item);
				application.applyStructureUpdates("delete", item);
				plugin.updateNextPageAfter(application);
			});
		});
		application.subscribe("Stream.onRerender", function() {
			plugin.setMaxItemsCount(application);
		});
		application.subscribe("Stream.onDataReceive", function(topic, args) {
			plugin.setMaxItemsCount(application, !args.initial);
		});
		plugin.extendRenderer("Stream", "more", function(element) {
			var application = this;
			if (!plugin.config.get(application, "moreButton")) {
				element.empty().hide();
				return;
			}
			application.parentRenderer("more", arguments);
		});
	}
});

plugin.setMaxItemsCount = function(application, increment) {
	var itemsPerPage = parseInt(application.config.get("itemsPerPage"));
	if (increment) {
		itemsPerPage += plugin.get(application, "maxItemsCount");
	}
	plugin.set(application, "maxItemsCount", itemsPerPage);
};

plugin.updateNextPageAfter = function(application) {
	var pageAfter = application.threads[application.threads.length - 1];
	var acc = application.getRespectiveAccumulator(pageAfter,
					application.config.get("sortOrder"));
	application.nextPageAfter = pageAfter.timestamp + (acc ? "|" + acc : "");
};

})(jQuery);
