TAGURL = 'https://racsubmit.nxmix.com/weibo/tags';
POSTURL = 'https://racsubmit.nxmix.com/weibo/submit'
var TAGARRAY;

window.onload = function() {
	// Load tags
	loadTags();

	//
	setInterval(checkAndAddButton, 1000);
	// checkAndAddButton();
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

function doInjection(injection, injected) {
	// Check if injected
	var button = injected.find('.injectbutton');
	if (button.length > 0)
		return;

	// Do injection
	injected.append(injection);
}

function getInjected(feed, isMain) {
	var injected = isMain ? $(feed.find('.WB_face').get(0)): feed.children('.face');
	return injected;
}

function getMidFromFeedItem(feed, isMain) {
	// Get Weibo link
	var d = isMain ? feed.find('a[node-type="feed_list_item_date"][class="S_link2 WB_time"]'): feed.find('.date');
	var link = d.first().attr("href");
	// Get mid from link
	linkChips = link.split('/');
	lastChip = linkChips[linkChips.length - 1];
	mid = lastChip;
	if (lastChip.indexOf('?') >= 0)
		mid = lastChip.substr(0, lastChip.indexOf('?'));

	return mid;
}

function getFeedList(isMain) {
	// Do not add button on overlay
	if($('div.candidatetagpanel').text().length > 0)
		return;

	//
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

		// Build injection
		var injection = $(document.createElement('button'));
		injection.attr('class', 'injectbutton');
		injection.css('background-image', 'url(' + chrome.extension.getURL("sbt64.png") + ')');
		injection.css('background-size', '32px 32px');
		injection.click({'mid':mid, 'feed':feedO.clone()}, addOverlay);

		// Inject to page under the avatar
		var injected = getInjected(feedO, isMain);
		doInjection(injection, injected);
	});
}

function addOverlay(event) {
	//
	mid = event.data.mid;
	feed = event.data.feed;
	candidateTagArray = TAGARRAY.slice(0);
	selectedTagArray = [];

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

	// Added origin feed to overlay
	var feedPanel = $(document.createElement('div'));
	feedPanel.attr('class', 'feedpanel');
	overlay.append(feedPanel);
	feed.attr('class', 'feed');
	feedPanel.append(feed);

	// Added button
	var buttonPanel = $(document.createElement('div'));
	buttonPanel.attr('class', 'buttonpanel');
	overlay.append(buttonPanel);
	// Ok button
	var buttonOk = $(document.createElement('button'));
	buttonOk.attr('class', 'buttonok');
	buttonOk.append('确认');
	buttonOk.click(function() {
		if (selectedTagArray.length <= 0) {
			alert('没有选择任何标签.');
			return;
		}

		//
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

	// Added overlay to page
	$(document.body).append(overlay);
}
