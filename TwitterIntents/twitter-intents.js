/*
 *  TwitterIntents plugin
 * 
 *  This Echo Stream client plugin adds the Twitter intents controls into the item UI
 *  and updates the item UI to look like a Twitter item. The item UI update includes:
 *    - by clicking on the avatar or the user name - the user account on Twitter will be opened
 *    - the item timestamp transforms from a static field to a permanent item link on Twitter
 *
 *  Version: 2.0 (11/08/2011)
 *  Developed by: Echo Solutions team
 *  Documentation:
 *    http://wiki.aboutecho.com/Echo%20Application%20-%20Echo%20Stream%20Client#TwitterIntents
 *
 *  More info about Echo StreamServer: http://www.aboutecho.com/
 *  More info about Twitter Intents: https://dev.twitter.com/docs/intents
 *
 */

(function($) {

var plugin = Echo.createPlugin({
	"name": "TwitterIntents",
	"applications": ["Stream"],
	"dependencies": [{
		"loaded": function() { return !!window.twttr; },
		"url": "//platform.twitter.com/widgets.js"
	}],
	"init": function(plugin, application) {
		// rename "Reply" -> "Comment"
		Echo.Localization.extend({"Plugins.Reply.replyControl": "Comment"});
		plugin.extendTemplate("Item", plugin.template(),
			"insertBefore", "echo-item-controls");
		plugin.extendRenderer("Item", "body",
			plugin.renderers.Item.body);
		plugin.extendRenderer("Item", "container",
			plugin.renderers.Item.container);
		plugin.extendRenderer("Item", "twitterIntents",
			plugin.renderers.Item.twitterIntents);
		plugin.extendRenderer("Item", "controls",
			plugin.renderers.Item.controls);
		plugin.extendRenderer("Item", "date",
			plugin.renderers.Item.date);
		plugin.extendRenderer("Item", "authorName",
			plugin.renderers.Item.authorName);
		plugin.extendRenderer("Item", "avatar",
			plugin.renderers.Item.avatar);
		plugin.extendRenderer("Item", "replyForm",
			plugin.renderers.Item.replyForm);
		$.map(["tweet", "retweet", "favorite"], function(action) {
			plugin.extendRenderer("Item", action + "Intents",
				plugin.renderers.Item.intent(action));
		});
		plugin.addCss(plugin.css);
	}
});

plugin.renderers = {"Item": {}};

plugin.addLabels({
	"reply": "Reply",
	"retweet": "Retweet",
	"favorite": "Favorite"
});

plugin.template = function() {
	return '<div class="echo-item-twitterIntents">' +
		'<a class="echo-item-intentControl echo-item-tweetIntents">' +
			'<span class="echo-item-twitterIntentsIcon echo-item-twitterIntentsIconReply">&nbsp;</span>' +
			'<span class="echo-clickable echo-secondaryFont echo-secondaryColor echo-item-control">' + plugin.label("reply") + '</span>' +
		'</a>' +
		'<a class="echo-item-intentControl echo-item-retweetIntents">' +
			'<span class="echo-item-twitterIntentsIcon echo-item-twitterIntentsIconRetweet">&nbsp;</span>' +
			'<span class="echo-clickable echo-secondaryFont echo-secondaryColor echo-item-control">' + plugin.label("retweet") + '</span>' +
		'</a>' +
		'<a class="echo-item-intentControl echo-item-favoriteIntents">' +
			'<span class="echo-item-twitterIntentsIcon echo-item-twitterIntentsIconFavorite">&nbsp;</span>' +
			'<span class="echo-clickable echo-secondaryFont echo-secondaryColor echo-item-control">' + plugin.label("favorite") + '</span>' +
		'</a>' +
		'<span class="echo-item-intentControlDelimiter echo-secondaryFont"> | </span>' +
	'</div>';
};

plugin.renderers.Item.body = function() {
	var item = this;
	// disable hashtag icons for tweets even if defined by the user
	var key = "contentTransformations." + item.data.object.content_type + ".hashtags";
	if (plugin.isTweet(item) && item.config.get(key)) {
		item.config.set(key, false);
		item.parentRenderer("body", arguments);
		item.config.set(key, true);
	} else {
		item.parentRenderer("body", arguments);
	}
};

plugin.renderers.Item.container = function(element) {
	var item = this;
	item.parentRenderer("container", arguments);
	if (!plugin.isTweet(item)) return;
	var switchClasses = function(action) {
		$.each(plugin.get(item, "controls"), function(id, control) {
			control[action + "Class"]("echo-linkColor");
		});
	};
	if (!$.isMobileDevice()) {
		element.hover(
			function() { switchClasses("add"); },
			function() { switchClasses("remove"); });
	}
};

plugin.renderers.Item.twitterIntents = function(element) {
	var item = this;
	if (!plugin.isTweet(item)) element.hide();
};

plugin.renderers.Item.controls = function(element, dom) {
	var item = this;
	var args = arguments;
	if (!plugin.isTweet(item)) {
		item.parentRenderer("controls", arguments);
		return;
	}
	// exclude Reply and Like plugin UI for tweets
	plugin.executeWhileInteractionDisabled(item, function() {
		item.parentRenderer("controls", args);
		// hide first controls delimiter
		$(".echo-item-control-delim", element).first().hide();
		// hide delimiter if no more controls is available
		var hasControls = false;
		$.map(item.controlsOrder, function(name) {
			var data = item.controls[name];
			if (data && data.visible()) {
				hasControls = true;
				return false; // break
			}
		});
		if (!hasControls) dom.get("intentControlDelimiter").hide();
	});
};

plugin.renderers.Item.intent = function(action) {
	return function(element) {
		var item = this;
		if (!plugin.isTweet(item)) return;
		var match = item.data.object.id.match(/\/(\d+)$/);
		if (!match) return;
		element.attr("href", "https://twitter.com/intent/" +
			action + "?in_reply_to=" + match[1] +
					"&tweet_id=" + match[1]);
		// save references to controls...
		plugin.rememberControl(item, action, $(".echo-clickable", element));
		// assign hover actions
		var activeClass = "echo-item-intentControlActive";
		element.hover(
			function() { element.addClass(activeClass); },
			function() { element.removeClass(activeClass); });
		// append delimiter
		element.before(item.render("controlsDelimiter"));
	};
};

plugin.renderers.Item.date = function(element) {
	var item = this;
	item.parentRenderer("date", arguments);
	if (!plugin.isTweet(item) || plugin.get(item, "wrapped")) return;
	element.wrap(item.hyperlink(
		{"href": item.data.object.id, "skipEscaping": true,
			"class": "echo-item-twitterPermalink echo-clickable " +
				"echo-secondaryFont echo-item-control echo-secondaryColor"},
		{"openInNewWindow": plugin.config.get(item, "openInNewWindow", "", true)}
	));
	plugin.rememberControl(item, "date", element);
	plugin.set(item, "wrapped", true);
};

plugin.renderers.Item.authorName = function(element) {
	var item = this;
	var authorName = item.parentRenderer("authorName", arguments);
	if (!plugin.isTweet(item)) return authorName;
	var template =
		'<div class="echo-item-tweetAuthor">' +
			'<span class="echo-item-tweetUserName"></span>' +
			'<span class="echo-item-tweetScreenName echo-secondaryFont echo-secondaryColor"></span>' +
		'</div>';
	var descriptors = {
		"tweetUserName": function() {
			return item.hyperlink(
				{"href": item.data.actor.id, "skipEscaping": true,
					"caption": plugin.extractTwitterID(item)},
				{"openInNewWindow":
					plugin.config.get(item, "openInNewWindow", "", true)}
			);
		},
		"tweetScreenName": function() {
			return authorName;
		}
	};
	return $.toDOM(template, "echo-item-", descriptors).content;
};

plugin.renderers.Item.avatar = function(element) {
	var item = this;
	var avatar = item.parentRenderer("avatar", arguments);
	if (!plugin.isTweet(item)) return avatar;
	return $(item.hyperlink(
		{"href": item.data.actor.id, "skipEscaping": true},
		{"openInNewWindow": plugin.config.get(item, "openInNewWindow", "", true)}
	)).append(avatar);
};

plugin.renderers.Item.replyForm = function(element) {
	var item = this;
	var args = arguments;
	if (plugin.isTweet(item)) {
		plugin.executeWhileInteractionDisabled(item, function() {
			item.parentRenderer("replyForm", args);
		});
		return;
	}
	item.parentRenderer("replyForm", args);
};

plugin.executeWhileInteractionDisabled = function(item, func) {
	var plugins = ["Reply", "Like"];
	var states = {};
	$.map(plugins, function(plugin) {
		states[plugin] = item.config.get("plugins." + plugin + ".enabled");
		item.config.set("plugins." + plugin + ".enabled", false);
	});
	func();
	$.map(plugins, function(plugin) {
		item.config.set("plugins." + plugin + ".enabled", states[plugin]);
	});
};

plugin.isTweet = function(item) {
	return item.data.source.name == "Twitter";
};

plugin.rememberControl = function(item, key, element) {
	var controls = plugin.get(item, "controls") || {};
	controls[key] = element;
	plugin.set(item, "controls", controls);
};

plugin.extractTwitterID = function(item) {
	var match = item.data.actor.id.match(/twitter.com\/(.*)/);
	return match ? match[1] : item.data.actor.id;
};

plugin.css =
	".echo-item-tweetUserName a { text-decoration: none !important; }" +
	".echo-item-tweetScreenName { margin-left: 4px; }" +
	".echo-item-twitterPermalink { float: left; text-decoration: none; }" +
	".echo-item-twitterPermalink .echo-item-date { float: none; }" +
	".echo-item-twitterIntentsIcon { margin-right: 3px; background: url('https://si0.twimg.com/images/dev/cms/intents/icons/sprites/everything-spritev2.png') no-repeat; }" +
	".echo-item-twitterIntentsIconReply { background-position: 0px -2px; }" +
	".echo-item-twitterIntentsIconRetweet { background-position: -80px -2px; }" +
	".echo-item-twitterIntentsIconFavorite { background-position: -32px -2px; }" +
	".echo-item-intentControlActive .echo-item-twitterIntentsIconReply { background-position: -16px -2px; }" +
	".echo-item-intentControlActive .echo-item-twitterIntentsIconRetweet { background-position: -96px -2px; }" +
	".echo-item-intentControlActive .echo-item-twitterIntentsIconFavorite { background-position: -48px -2px; }" +
	".echo-item-twitterIntentsIcon { width: 15px; height: 15px; display: inline-block; }" +
	".echo-item-intentControlDelimiter { margin: 0px 5px; }" +
	".echo-item-intentControl  { text-decoration: none; }" +
	".echo-item-twitterIntents { float: left; margin-left: 5px; }";

})(jQuery);
