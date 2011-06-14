/*
 *  ItemAutoSubmit plugin
 * 
 *  This Echo Submit Form plugin allows to post the content of the submit form
 *  to Echo StreamServer when the user presses the Enter key.
 *  It enables a chat-like behavior.
 *
 *  Version: 2.0 (04/29/2011)
 *  Developed by: Echo Solutions team (Kushnir Andrew)
 *  Documentation: http://wiki.aboutecho.com/Community-Developed-Plugins#ItemAutoSubmit
 *
 *  More info about Echo StreamServer: http://www.aboutecho.com/
 *
 *  Disclaimer: this software is provided by the author "AS IS" and no warranties are implied
 */

(function($) {

var plugin = Echo.createPlugin({
	"name": "ItemAutoSubmit",
	"applications": ["Submit"],
	"init": function(plugin, application) {
		plugin.extendRenderer("Submit", "text", plugin.renderers.Submit.text);
	}
});

plugin.renderers = {"Submit": {}};

plugin.renderers.Submit.text = function(element) {
	var application = this;
	var handler = plugin.get(application, "textareaKeyPressHandler");
	if (!handler) {
		handler = function(ev) {
			var code = ev.keyCode ? ev.keyCode : ev.which;
			if (code == 13) { // "Enter" key pressed
				ev.preventDefault();
				var button = application.dom.get("postButton");
				if (button) {
					button.click();
				}
			}
		};
	}
	plugin.set(application, "textareaKeyPressHandler", handler);
	element.unbind("keypress", handler).bind("keypress", handler);
	application.parentRenderer("text", arguments);
};

})(jQuery);
