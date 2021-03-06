TAGURL = 'https://racsubmit.nxmix.com/weibo/tags';
POSTURL = 'https://racsubmit.nxmix.com/weibo/submit'
var TAGARRAY;

//
setInterval(checkAndAddButton, 1000);

function checkAndGetTag() {
	if (!TAGARRAY)
		loadTags();
}

function loadTags() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', TAGURL, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			TAGARRAY = JSON.parse(xhr.responseText);
		}
	}
	xhr.send();
}

function doInjection(injection, injected, pageType) {
	// Check if injected
	var button = injected.find('.injectbutton');
	if (button.length > 0)
		return;

	// Do injection
	if (pageType == 'home' || pageType == 'search')
		injected.append(injection);
	else if (pageType == 'user')
		injected.prepend(injection);
}

function getInjected(feed, pageType) {
	var injected;
	if (pageType == 'home')
		injected = $(feed.find('.WB_face').get(0));
	else if (pageType == 'search')
		injected = feed.find('.face').first();
	else if (pageType == 'user')
		injected = feed.find('.WB_from').last();
	return injected;
}

function getMidFromFeedItem(feed, pageType) {
	// Get Weibo link
	var d;
	t = feed.find('div.WB_detail').children('div.WB_from')
	if (pageType == 'home')
		d = t.find('a[node-type="feed_list_item_date"]');
	else if (pageType == 'search')
		d = feed.find('.content').first().children('.feed_from').find('a[node-type="feed_list_item_date"]');
	else if (pageType == 'user')
		d = t.find('a[node-type="feed_list_item_date"]');
	var link = d.first().attr("href");
	// Get mid from link
	if (typeof link != 'string') 
		return '';
	linkChips = link.split('/');
	lastChip = linkChips[linkChips.length - 1];
	mid = lastChip;
	if (lastChip.indexOf('?') >= 0)
		mid = lastChip.substr(0, lastChip.indexOf('?'));

	return mid;
}

function getFeedList(pageType) {
	// Do not add button on overlay
	if($('div.candidatetagpanel').text().length > 0)
		return $();

	//
	return $('div[action-type=feed_list_item]');
}

function getPageType() {
	url = document.URL;
	bodyClass = $($('body')[0]).attr('class');
	var result;
	if (/^.*s.weibo.com/gi.test(url)) {
		result = 'search';
	} else if (/^(?!.*weibo\.com.*\/home).*/gi.test(url) || /^.*weibo.com\/p/gi.test(url)) { 
		result = 'user';
	} else { // /^.*\/home/gi.test(document.URL)
		result = 'home';
	}
	console.log(result, url);
	return result;
}

function checkAndAddButton() {
	checkAndGetTag();

	// Check page type
	pageType = getPageType();

	//
	var feedItemList = getFeedList(pageType);
	feedItemList.each(function(idx, feed) { 
		var feedO = $(feed).children('div.WB_feed_detail');
		mid = getMidFromFeedItem(feedO, pageType); // get Mid

		// Build injection
		var injection = $(document.createElement('button'));
		if (pageType == 'user')
			injection.attr('class', 'injectbutton injectbuttonuserpage');
		else 
			injection.attr('class', 'injectbutton');
		injection.css('background-image', 'url(' + chrome.extension.getURL("button.png") + ')');
		injection.css('background-size', '50px 20px');
		injection.click({'mid':mid, 'feed':feedO.clone(), 'pagetype':pageType}, addOverlay);

		// Inject to page under the avatar
		var injected = getInjected(feedO, pageType);
		doInjection(injection, injected, pageType);
	});
}

function addOverlay(event) {
	//
	mid = event.data.mid;
	feed = event.data.feed;
	candidateTagArray = TAGARRAY.slice(0);
	selectedTagArray = [];
	console.log(mid);

	// Overlay
	var overlay = $(document.createElement('div'));
	overlay.attr('class', 'overlay');

	// Define background 
	var bgPanel = $(document.createElement('div'));
	bgPanel.attr('class', 'bgpanel');
	bgPanel.click(function() {
		overlay.remove();
	});
	overlay.append(bgPanel);

	// Tag editor
	var editorPanel = $(document.createElement('div'));
	editorPanel.attr('class', 'editorpanel');
	overlay.append(editorPanel);
	if (candidateTagArray.length > 0) {
		// Selected tag panel
		var selectedTagPanel = $(document.createElement('div'));
		selectedTagPanel.attr('class', 'tagpanel selectedpanel');
		editorPanel.append(selectedTagPanel);
		selectedTagPanel.append('已有的标签:');
		// Selected tag list
		var selectedTagList = $(document.createElement('ul'));
		selectedTagList.attr('class', 'taglist');
		selectedTagPanel.append(selectedTagList);
		// Candidate tag panel
		var candidateTagPanel = $(document.createElement('div'));
		candidateTagPanel.attr('class', 'tagpanel candidatetagpanel');
		editorPanel.append(candidateTagPanel);
		candidateTagPanel.append('候选标签:');
		// Candidate tag list
		var candidateTagList = $(document.createElement('ul'));
		candidateTagList.attr('class', 'taglist');
		candidateTagPanel.append(candidateTagList);
		// Tag items
		$.each(candidateTagArray, function(idx,tag) {
			var tagItem = $(document.createElement('li'));
			tagItem.attr('class', 'tag');
			tagItem.append(tag);
			tagItem.click(function() {
				if (candidateTagArray.indexOf(tag) >= 0) {
					selectedTagList.append($(this));
					selectedTagArray.push(tag);
					candidateTagArray.splice(candidateTagArray.indexOf(tag), 1);
				} else {
					candidateTagList.append($(this));
					candidateTagArray.push(tag);
					selectedTagArray.splice(selectedTagArray.indexOf(tag), 1);
				}
			});
			candidateTagList.append(tagItem);
		});
	} else {
		editorPanel.append('无法获取标签, 请刷新浏览器重试.');
	}

	// Added button
	var buttonPanel = $(document.createElement('div'));
	buttonPanel.attr('class', 'buttonpanel');
	overlay.append(buttonPanel);
	// Ok button
	var buttonOk = $(document.createElement('button'));
	buttonOk.attr('class', 'buttonok');
	buttonOk.append('确认');
	buttonOk.click(function() {
		var result = {
			mid: mid,
			tags: selectedTagArray.join(',')
		};
		//
		var xhr = new XMLHttpRequest();
		xhr.open('POST', POSTURL, true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && xhr.status == 200) {
				alert('发送成功');
				overlay.remove();
			} 
			// else if (xhr.status == 400) {
			//	alert(xhr.responseText);
			// }
		}
		xhr.send(JSON.stringify(result));
	});
	buttonPanel.append(buttonOk);
	// Cancel button
	var buttonCancel = $(document.createElement('button'));
	buttonCancel.attr('class', 'buttoncancel');
	buttonCancel.append('取消');
	buttonCancel.click(function() {
		overlay.remove();
	});
	buttonPanel.append(buttonCancel);

	// Added origin feed to overlay
	var feedPanel = $(document.createElement('div'));
	feedPanel.attr('class', 'feedpanel');
	overlay.append(feedPanel);
	feed.attr('class', 'feed');
	feedPanel.append(feed);

	// Added overlay to page
	$(document.body).append(overlay);
}

// Esc key action
$(document).keyup(function(e) {
	if (e.keyCode == 27) { // Esc
		$('div.overlay').remove(); // or whatever you want
	}
});
