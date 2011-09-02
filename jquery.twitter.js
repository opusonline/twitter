/*!
 * jQuery Twitter plugin
 *
 * Copyright (c) 2011 Stefan Benicke
 *
 * Dual licensed under the MIT and GPL licenses
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($) {
	
	var defaults = {
		username: 'user',
		speed: 'normal',
		nextInterval: (5 * 1000), // 5s
		loadInterval: (30 * 1000) // 30s
	};
	
	$.fn.twitter = function(options) {
		
		options = $.extend({}, defaults, options);
		
		var url = 'https://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + options.username + '&trim_user=1';
		
		return this.each(function() {
			
			var $board = $(this).css('overflow', 'hidden');
			var size = {
				width: $board.width(),
				height: $board.height()
			};
			var tweets = [];
			var latest_tweet_id = 0;
			var active_tweet;
			var load_timer, show_timer;
			var $tweet;
			
			var _getAllTweets = function() {
				$.ajax({
					url: url,
					cache: false,
					dataType: 'jsonp',
					success: _saveTweets
				});
			};
			var _getLastTweets = function() {
				$.ajax({
					url: url + '&since_id=' + latest_tweet_id,
					cache: false,
					dataType: 'jsonp',
					success: _saveTweets
				});
			};
			var _saveTweets = function(data) {
				if ( ! data || ! data.length || data.error) return;
				latest_tweet_id = data[0].id_str;
				$.each(data, function(index, tweet) {
					tweets.push({
						id: tweet.id_str,
						date: tweet.created_at,
						text: _optimizeText(tweet.text)
					});
				});
				_startTimer();
			};
			var _showTweets = function() {
				if ( ! active_tweet) {
					active_tweet = tweets.length - 1; // last entry is first
				}
				$tweet.slideUp(options.speed, function() {
					$tweet.html(tweets[active_tweet].text).slideDown(options.speed);
				});
				active_tweet--;
			};
			var _pauseTimer = function() {
				clearInterval(show_timer);
				show_timer = null;
			};
			var _startTimer = function() {
				if ( ! show_timer) {
					_showTweets();
					show_timer = setInterval(_showTweets, options.nextInterval);
				}
				if ( ! load_timer) {
					load_timer = setInterval(_getLastTweets, options.loadInterval);
				}
			};
			var _optimizeText = function(text) {
				// Add Links
				text = text.replace(/(http:\/\/|(www\.))(([^\s<]{4,68})[^\s<]*)/, "<a href=\"http://$2$3\" target=\"_blank\">$1$2$4</a>");
				// Add Usernames
				text = text.replace(/@(\w+)/, "@<a href=\"http://www.twitter.com/$1\" target=\"_blank\">$1</a>");
				// Add Keywords
				text = text.replace(/#(\w+)/, "<a href=\"http://search.twitter.com/search?q=$1\" target=\"_blank\">#$1</a>");
				// Cleanup Long Dash
				text = text.replace(/&#8211;/g, "&mdash;");
				return text;
			};
			var _init = function() {
				$tweet = $('<div style="display:none;width:' + size.width + 'px;height:' + size.height + 'px"/>').bind('mouseenter', _pauseTimer).bind('mouseleave', _startTimer).appendTo($board);
				_getAllTweets();
			};
			
			_init();
			
		});
		
	};
	
})(jQuery);
