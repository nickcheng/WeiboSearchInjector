window.onload=function(){
	var feedItemList = $('dl[action-type=feed_list_item]');
	feedItemList.each(function(idx, feed) {
		var d = $(feed).find('.date');
		//
		var link = d.last().attr("href");
		//
		var text = $(feed).find('em').first().innerText;
		//
		var injection = '<a href="https://api.pinboard.in/v1/posts/add?url='+link+'&description='+text+'&auth_token=">Send</a>';
    $(feed).children('.face').append(injection);
	});
}
