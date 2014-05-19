# WeiboSearchInjector

Weibo Search Result Injector

It's a Google Chrome extension.

## Misc

* 热门微博: http://s.weibo.com/wb/[keyboard]&xsort=hot
* 媒体报道: http://s.weibo.com/list/coverage?search=[keyboard]&category=4
* 名人观点: http://s.weibo.com/list/coverage?search=[keyboard]&category=5
* 实时微博: http://s.weibo.com/weibo/[keyboard]?topnav=1&wvr=5&b=1&rd=newTips

## 页面注入 JQuery

Chrome 下给当前网页注入 JQuery 的方法: 在 Console 里执行如下语句:

	var jq = document.createElement('script');
	jq.src = 'http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js';
	document.getElementsByTagName('head')[0].appendChild(jq);
	jQuery.noConflict();

如果执行一遍出错, 那就再执行一遍.
