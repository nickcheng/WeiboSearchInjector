window.onload = function() {
	checkAndAddButton();
}

function getInjected(feed, isMain) {
  var injected = isMain ? $(feed.find('.WB_face').get(0)): feed.children('.face');
  return injected;
}

function getMidFromFeedItem(feed, isMain) {
	// Get Weibo link
	var d = isMain ? feed.find('a[node-type="feed_list_item_date"]'): feed.find('.date');
	var link = d.last().attr("href");
	// Get mid from link
	linkChips = link.split('/');
	lastChip = linkChips[linkChips.length - 1];
	mid = lastChip.substr(0, lastChip.indexOf('?'));

	return mid;
}

function getFeedList(isMain) {
	if (isMain)
		return $('div[action-type=feed_list_item]');
	else
		return $('dl[action-type=feed_list_item]');
}

function checkAndAddButton() {
	// Check if in main page
	url = document.URL;
	isMain = url.toLowerCase().indexOf('s.weibo.com') < 0;

	//
	var feedItemList = getFeedList(isMain);
	feedItemList.each(function(idx, feed) { 
		feedO = $(feed);
		mid = getMidFromFeedItem(feedO, isMain); // get Mid

		//
		// var text = $(feed).find('em').first().innerText;

		// Build injection
		var injection = $(document.createElement('button'));
		injection.text('Add This');
		injection.click({'mid':mid, 'feed':feedO.clone()}, addOverlay);

		// Inject to page under the avatar
		var injected = getInjected(feedO, isMain);
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