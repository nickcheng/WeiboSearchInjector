window.onload = function() {
	var feedItemList = $('dl[action-type=feed_list_item]');
	if (feedItemList.length == 0) {
		feedItemList = $('div[action-type=feed_list_item]');
	}

	feedItemList.each(function(idx, feed) {
		// Get Weibo link
		var d = $(feed).find('.date').length > 0 ? $(feed).find('.date'): $(feed).find('a[node-type="feed_list_item_date"]');
		var link = d.last().attr("href");
		// Get mid from link
		linkChips = link.split('/');
		lastChip = linkChips[linkChips.length - 1];
		mid = lastChip.substr(0, lastChip.indexOf('?'));

		//
		// var text = $(feed).find('em').first().innerText;

		// Build injection
		// var injection = '<a href="https://api.pinboard.in/v1/posts/add?url='+link+'&description='+text+'&auth_token=">Send</a>';
		var injection = $(document.createElement('button'));
		injection.text('Add This');
		injection.click({'mid':mid, 'feed':$(feed).clone()}, addOverlay);
			// {
			//	text: ,
			//	click: function() { addOverlay(mid); }
			// });

		// Inject to page under the avatar
    var injected = $(feed).children('.face');
    if (injected.length == 0)
			injected = $($(feed).find('.WB_face').get(0));
    injected.append(injection);
	});
}

function addOverlay(event) {
	// info = 'Hi again! ' + event.data.mid
	// alert(info);

	//
	mid = event.data.mid;
	feed = event.data.feed;

	// Define background overlay
	var overlay = $(document.createElement('div'));
	overlay.attr('class', 'overlay');
	overlay.click(function() {
		$(this).remove();
	});

	//
	feed.attr('class', 'feed');
	overlay.append(feed);

	// Added overlay to page
	$(document.body).append(overlay);
}