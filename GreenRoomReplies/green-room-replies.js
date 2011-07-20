/*
 *  GreenRoomReplies plugin
 * 
 *  This Echo Stream client plugin provides additional logic for the Green Room use case. 
 *  This use case was designed to achieve better communication experience between the VIP
 *  guests and site regular audience. Additional information about the Green Room use case
 *  can be found on the following page:
 *
 *  http://wiki.aboutecho.com/Use%20Case%20-%20Green%20Room
 *
 *  Version: 2.0 (07/19/2011)
 *  Developed by: Echo Solutions team (Kushnir Andrew)
 *  Documentation: http://wiki.aboutecho.com/Community-Developed-Plugins#GreenRoomReplies
 *
 *  More info about Echo StreamServer: http://www.aboutecho.com/
 *
 *  Disclaimer: this software is provided by the author "AS IS" and no warranties are implied
 */

(function($) {

var plugin = Echo.createPlugin({
	"name": "GreenRoomReplies",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.addCss(plugin.css);
		if (plugin.config.get(application, "view") == "public") return;
		plugin.subscribe(application, "Submit.onPostComplete", function(topic, args) {
			var question = args.inReplyTo;
			if (!question) return;
			plugin.markQuestionAsAnswered(question, application);
			plugin.copyAnswer(question, args.postData, application);
		});
	}
});

plugin.request = function(application, data) {
	$.get(plugin.config.get(application, "submissionProxyURL", "", true), {
		"appkey": application.config.get("appkey"),
		"content": $.object2JSON(data),
		"sessionID": application.user.get("sessionID", "")
	}, function() {}, "jsonp");
};

plugin.markQuestionAsAnswered = function(question, application) {
	plugin.request(application, {
		"verb": "mark",
		"target": question.object.id,
		"markers": plugin.config.get(application, "answeredQuestionMarker", "answered")
	});
};

plugin.copyAnswer = function(question, answer, application) {
	var copyTo = plugin.config.get(application, "copyTo");
	if (!copyTo) return;
	var title =  question.actor.title || "Guest";
	var avatar = question.actor.avatar || application.user.get("defaultAvatar");
	var content =
		'<div class="special-quest-reply">' +
			'<div class="reply">' + answer.content + '</div>' +
			'<blockquote class="question-quote"><div class="question">' +
				'<div class="avatar"><img src="' + avatar + '"></div>' +
				'<div class="content">' +
					'<div class="author">' + title + '</div>' +
					'<div class="text">' + $.stripTags(question.object.content) + '</div>' +
				'</div>' +
				'<div class="footer"></div>' +
			'</div></blockquote>' +
		'</div>';
	plugin.request(application, $.extend({"verb": "post", "content": content}, copyTo));
};

plugin.css =
	".echo-item-data .special-quest-reply .reply { font-size: 14px; margin-bottom: 10px; }" +
	".echo-item-data blockquote.question-quote .avatar { width:24px; height:24px; float:left; margin-right: -30px; }" +
	".echo-item-data blockquote.question-quote .avatar img { width:24px; height:24px; }" +
	".echo-item-data blockquote.question-quote .content { margin-left: 30px; }" +
	".echo-item-data blockquote.question-quote .footer { clear:both; margin: 0px !important; padding: 0px !important; }" +
	".echo-item-data blockquote.question-quote { margin: 3px 10px 10px !important; padding: 3px 0px 3px 10px !important; border-left: 3px solid #C6C6C6; }" +
	".echo-item-data blockquote.question-quote .text { font-style: italic; }" +
	".echo-item-data blockquote.question-quote .author { margin-bottom: 5px; color:#476CB8; }";

})(jQuery);
