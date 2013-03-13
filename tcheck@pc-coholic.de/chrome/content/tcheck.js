var tcheck = {
	
	tickSpeed :12,
	ticksPerItem : 200,
	currentFirstItemMargin : 0,
	limitItemsPerFeed : false,
	itemsPerFeed : 10, 
	tickTimer : null,
	internalPause : false,
	mouseOverFlag : false,
	
	onload : function () {
		tcheck.ticker = document.createElement('toolbar');
		tcheck.ticker.setAttribute("id", "tcheckToolbar");
		tcheck.ticker.setAttribute("class", "chromeclass-toolbar");
		tcheck.ticker.setAttribute("hidden", false);
		tcheck.ticker.setAttribute("iconsize", "small");
		tcheck.ticker.setAttribute("inherits", "collapsed,hidden");
		tcheck.ticker.setAttribute("mode", "full");
		tcheck.ticker.setAttribute("persist", "collapsed,hidden");
		tcheck.ticker.setAttribute("toolbarname", "tcheck@pc-coholic.de");
		
		tcheck.toolbar = document.createElement('hbox');
		tcheck.toolbar.spacer = document.createElement('spacer');
		tcheck.toolbar.appendChild(tcheck.toolbar.spacer);
		
		tcheck.ticker.appendChild(tcheck.toolbar);
		
		document.getElementById('browser-bottombox').insertBefore(tcheck.ticker, document.getElementById('status-bar').nextSibling);
		
		tcheck.tickLength = tcheck.tickSpeed * (500 / tcheck.ticksPerItem);
		
		tcheck.ticker.setAttribute("onmouseover","tcheck.mouseOverFlag = true;");
		tcheck.ticker.setAttribute("onmouseout","tcheck.mouseOverFlag = false;");
		/*
		var button = document.createElement("toolbarbutton");
		button.setAttribute('id','TestButton');
		button.setAttribute('label',"<strong>TestButton</strong> Label");
		button.setAttribute('persist','label icon');
		button.setAttribute('color', '#FF0000');
		tcheck.ticker.appendChild(button);
		*/
		
		var feedObject = {
			label : "",
			image : "",
			description : "",
			uri : "",
			siteUri : "",
			items : [],
			id : "",
			rootUri : ""
		};
		
		feedObject.label = "SX tCheck";
		feedObject.image = "";
		feedObject.description = "SX tCheck";
		feedObject.uri = "http://www.sixt.de/";
		feedObject.siteUri = "http://www.sixt.de/";
		feedObject.id = "http://www.sixt.de/";
		feedObject.rootUri = "http://www.sixt.de/";
		
		for (var j = 0; j < 10; j++){
			var itemObject = {
				uri : "",
				published : "",
				label : "",
				description : "",
				image : "",
				id : ""
			};
			
			itemObject.uri = "";
			itemObject.published = j;
			itemObject.label = "Lade Daten - bitte etwas Geduld...";
			itemObject.description = "Lade Daten - bitte etwas Geduld...";
			itemObject.image = "chrome://tcheck/skin/icon-pending.gif"; //Thanks to Dreamhost - To be replaced in a future version.
			itemObject.id = "loading_" + j;
			feedObject.items.push(itemObject);
			delete itemObject;
		}
		
		tcheck.writeFeed(feedObject);
		
		tcheck.getSxData();
	},

	tick : function () {
		clearTimeout(tcheck.tickTimer);
		
		if (tcheck.internalPause){
			tcheck.tickTimer = setTimeout(function () { tcheck.tick(); }, tcheck.tickLength);
		}
		else {
			var node, nodeWidth, marginLeft;
			
			if (tcheck.mouseOverFlag){
				if (tcheck.toolbar.childNodes.length > 1){
					if (tcheck.currentFirstItemMargin <= (tcheck.toolbar.firstChild.boxObject.width * -1)){
						node = tcheck.toolbar.firstChild;
						tcheck.toolbar.removeChild(node);
						
						// Add an item to the end of the ticker.
						
						tcheck.currentFirstItemMargin = 0;
						node.style.marginLeft = '0px';
						tcheck.toolbar.appendChild(node);
						
						if (node.nodeName == 'toolbarbutton' && (node.getAttribute("visited") == "false")) {
							if (tcheck.history.isVisitedURL(node.uri, node.guid, 2)){
								tcheck.markAsRead(node);
							}
						}
						else if (node.nodeName == 'spacer') {
							tcheck.adjustSpacerWidth();
						}
					}
					else if (tcheck.currentFirstItemMargin > 0){
						// Move the last child back to the front.
						node = tcheck.toolbar.lastChild;
						nodeWidth = node.boxObject.width;
						tcheck.toolbar.removeChild(node);
						
						// Set the correct margins
						marginLeft = parseInt((0 - nodeWidth) + tcheck.currentFirstItemMargin);
						
						node.style.marginLeft = marginLeft + "px";
						tcheck.currentFirstItemMargin = marginLeft;
						tcheck.toolbar.firstChild.style.marginLeft = 0;
						tcheck.toolbar.insertBefore(node, tcheck.toolbar.firstChild);
					}
				}
				
				tcheck.tickTimer = setTimeout(function () { tcheck.tick(); }, tcheck.tickLength);
			}
			else {
				if (tcheck.toolbar.childNodes.length > 1){
					if (tcheck.currentFirstItemMargin <= (tcheck.toolbar.firstChild.boxObject.width * -1)){
						node = tcheck.toolbar.firstChild;
						tcheck.toolbar.removeChild(node);
						tcheck.currentFirstItemMargin = 0;
						node.style.marginLeft = '0px';
						tcheck.toolbar.appendChild(node);
						
						if (node.nodeName == 'toolbarbutton' && (node.getAttribute("visited") == "false")) {
							if (tcheck.history.isVisitedURL(node.uri, node.guid, 3)){
								tcheck.markAsRead(node);
							}
						}
					}
					else if (tcheck.currentFirstItemMargin > 0){
						// Move the last child back to the front.
						node = tcheck.toolbar.lastChild;
						tcheck.toolbar.removeChild(node);
						
						// Set the correct margins
						nodeWidth = node.boxObject.width;
						marginLeft = parseInt((0 - nodeWidth) + tcheck.currentFirstItemMargin);

						node.style.marginLeft = marginLeft + "px";
						tcheck.currentFirstItemMargin = marginLeft;
						tcheck.toolbar.firstChild.style.marginLeft = 0;
						tcheck.toolbar.insertBefore(node, tcheck.toolbar.firstChild);
					}
					else {
						tcheck.currentFirstItemMargin -= (200 / tcheck.ticksPerItem);
						tcheck.toolbar.firstChild.style.marginLeft = tcheck.currentFirstItemMargin + "px";
					}
				}
				
				tcheck.tickTimer = setTimeout(function () { tcheck.tick(); }, tcheck.tickLength);
			}
		}
	},

	writeFeed : function (feed) {
		
		var feedItems = feed.items;
		
		tcheck.internalPause = true;
		
		// Remove items that are no longer in the feed.
		for (var i = tcheck.toolbar.childNodes.length - 1; i >= 0; i--){
			var item = tcheck.toolbar.childNodes[i];
			
			if ((item.nodeName == 'toolbarbutton') && (item.feed == feed.label)){
				var itemFound = false;
				
				var len = feedItems.length;
				
				for (var j = 0; j < len; j++){
					if ((feedItems[j].uri == item.uri) && (feedItems[j].id == item.guid)){
						itemFound = true;
						break;
					}
				}
				
				if (!itemFound){
					tcheck.toolbar.removeChild(item);
				}
			}
		}
		
		var itemsShowing = tcheck.itemsInTicker(feed.label);
		
		var len = feedItems.length;
		
		for (var j = 0; j < len; j++){
			var feedItem = feedItems[j];
			if (!document.getElementById("tcheck" + feedItem.uri)){
				if (tcheck.limitItemsPerFeed && (tcheck.itemsPerFeed <= itemsShowing.length)){
					// Determine if this item is newer than the oldest item showing.
					if ((tcheck.itemsPerFeed > 0) && feedItem.published && itemsShowing[0].published && (feedItem.published > itemsShowing[0].published)){
						tcheck.toolbar.removeChild(document.getElementById("tcheck" + itemsShowing[0].href));
						itemsShowing.shift();
					}
					else {
						continue;
					}
				}
				
				feedItem.description = feedItem.description.replace(/<[^>]+>/g, "");
				
				if ((feedItem.label == '') && (feedItem.description != '')){
					if (feedItem.description.length > 40){
						feedItem.label = feedItem.description.substr(0,40) + "...";
					}
					else {
						feedItem.label = feedItem.description;
					}
				}
				
				var tbb = document.createElement('toolbarbutton');
				tbb.uri = feedItem.uri;
				tbb.id = "tcheck" + feedItem.uri;
				tbb.description = feedItem.description;
				tbb.feed = feed.label;
				tbb.feedURL = feed.uri;
				tbb.href = feedItem.uri;
				tbb.displayHref = feedItem.displayUri;
				tbb.published = feedItem.published;
				tbb.guid = feedItem.id;
				
				tbb.setAttribute("label", feedItem.label);
				tbb.setAttribute("tooltip", "tcheckTooltip");
				tbb.setAttribute("image", feedItem.image);
				tbb.setAttribute("onclick", "return tcheck.onTickerItemClick(event, this.uri, this);");
				tbb.onclick = function (event) {
					return tcheck.onTickerItemClick(event, this.uri, this);
				};
				
				if (feedItem.trackingUri) {
					tbb.style.background = 'url('+feedItem.trackingUri+') no-repeat';
				}
				
				// Determine where to add the item
				// Check for another item from this feed, if so place at end of that feed.
				if (itemsShowing.length > 0){
					for (var i = tcheck.toolbar.childNodes.length - 1; i >= 0; i--){
						var node = tcheck.toolbar.childNodes[i];
						
						if (node.nodeName == 'toolbarbutton'){
							if (node.feed == tbb.feed){
								if (i == (tcheck.toolbar.childNodes.length - 1)){
									tcheck.toolbar.appendChild(tbb);
									addedButton = true;
								}
								else {
									tcheck.toolbar.insertBefore(tbb, node.nextSibling);
									addedButton = true;
								}
								
								break;
							}
						}
					}
				}
				else {
					// None of this feed is showing; add after another feed.
					if ((tcheck.toolbar.firstChild.nodeName == 'spacer') || (tcheck.toolbar.lastChild.nodeName == 'spacer')){
						tcheck.toolbar.appendChild(tbb);
					}
					else {
						if (tcheck.toolbar.firstChild.feed != tcheck.toolbar.lastChild.feed){
							// We're in luck - a feed just finished scrolling
							tcheck.toolbar.appendChild(tbb);
						}
						else {
							var addedButton = false;
							
							for (var i = tcheck.toolbar.childNodes.length - 2; i >= 0; i--){
								var node = tcheck.toolbar.childNodes[i];
								
								if (node.nodeName == 'spacer'){
									tcheck.toolbar.insertBefore(tbb, node.nextSibling);
									addedButton = true;
									break;
								}
								else if (node.feed != node.nextSibling.feed){
									tcheck.toolbar.insertBefore(tbb, node.nextSibling);
									addedButton = true;
									break;
								}
							}
							
							if (!addedButton){
								tcheck.toolbar.appendChild(tbb);
							}
						}
					}
				}
				
				itemsShowing.push(tbb);
				
				itemsShowing.sort(tcheck.sortByPubDate);
			}
		}
		
		tcheck.internalPause = false;
		
		tcheck.adjustSpacerWidth();
		tcheck.checkForEmptiness();
		tcheck.tick();
	},
	
	itemsInTicker : function (feed) {
		var items = [];
		var ip = tcheck.internalPause;
		
		tcheck.internalPause = true;
		
		for (var i = tcheck.toolbar.childNodes.length - 1; i >= 0; i--){
			var tbb = tcheck.toolbar.childNodes[i];
			
			if (tbb.nodeName != "spacer" && tbb.feed == feed){
				if (tcheck.limitItemsPerFeed && (items.length == tcheck.itemsPerFeed)){
					tcheck.toolbar.removeChild(tbb);
				}
				else {
					items.push(tbb);
				}
			}
		}
		
		// Sort the array by time
		
		items.sort(tcheck.sortByPubDate);
		
		tcheck.internalPause = ip;
		
		tcheck.checkForEmptiness();
		
		return items;
	},

	sortByPubDate : function (a, b){
		var atime, btime;

		if (a.published){
			atime = a.published;
		}

		if (b.published){
			btime = b.published;
		}

		if (!atime && !btime){
			return 0;
		}
		else if (!btime){
			return 1;
		}
		else if (!atime){
			return -1;
		}
		else {
			return atime - btime;
		}
	},
	
	checkForEmptiness : function(){
		if (tcheck.toolbar) {
			if ((tcheck.toolbar.childNodes.length <= 1) && (tcheck.hideWhenEmpty)){
				tcheck.ticker.style.display = 'none';
				tcheck.toolbar.firstChild.style.marginLeft = '0px';
				tcheck.currentFirstItemMargin = 0;
				tcheck.mouseOverFlag = false;
			}
			else {
				tcheck.ticker.style.display = '';
			}
		}
	},
	
	adjustSpacerWidth : function () {
		if (tcheck.toolbar && !tcheck.disabled){
			var extraPadding;
			
			try {
				if (tcheck.displayWidth.limitWidth){
					extraPadding = tcheck.displayWidth.itemWidth;
				}
				else {
					extraPadding = 250;
				}
				
				var windowWidth = parseInt(tcheck.ticker.boxObject.width);
				
				var tickerWidth = 0;
				
				var len = tcheck.toolbar.childNodes.length;
				
				for (var i = 0; i < len; i++){
					var node = tcheck.toolbar.childNodes[i];
					
					if (node.nodeName == 'toolbarbutton'){
						tickerWidth += node.boxObject.width;
					}
				}
				
				var spacerWidth;
				
				if (parseInt(windowWidth) > parseInt(tickerWidth - extraPadding)) {
					spacerWidth = parseInt(windowWidth) - parseInt(tickerWidth) + parseInt(extraPadding);
				}
				else {
					spacerWidth = 0;
				}
				
				if (spacerWidth < parseInt(tcheck.toolbar.spacer.style.width.replace("px", ""), 10) && tcheck.toolbar.firstChild.nodeName == 'spacer') {
					// Don't shrink the spacer if it's the first item; it makes for a poor UX
					return;
				}
				
				tcheck.toolbar.spacer.style.width = spacerWidth + "px";
			} catch (e) {
				// Tried to adjust spacer when there wasn't one.
				// Could happen depending on when the disable button was pressed
				if (tcheck.DEBUG) tcheck.logMessage(e);
			}
		}
	},
	
	getSxData : function () {
		var date = new Date();

		date.setDate(date.getDate()+1);
		
		var collectDay = date.getDate();
		var collectMonth = date.getMonth()+1; // 0 = Januar 11 = Dezember
		var collectYear = date.getFullYear();
		
		if (collectDay <= 9) {
			collectDay = "0" + collectDay;
		}
		
		if (collectMonth <= 9) {
			collectMonth = "0" + collectMonth;
		}
		
		date.setDate(date.getDate()+1);
		
		var returnDay = date.getDate();
		var returnMonth = date.getMonth()+1; // 0 = Januar 11 = Dezember
		var returnYear = date.getFullYear();
		
		if (returnDay <= 9) {
			returnDay = "0" + returnDay;
		}
		
		if (returnMonth <= 9) {
			returnMonth = "0" + returnMonth;
		}
		
		
		var collectStation = 11;
		var returnStation = 11;
		var collectDate = collectYear + collectMonth + collectDay;
		var returnDate = returnYear + returnMonth + returnDay;
		var collectHour = 1000;
		var returnHour = 1000;
		
		/*	IMPORTANT README
			
			Dear you!
		
			The following API and Signature-Key haven't been approved by Sixt GmbH & Co Autovermietung KG  or anyone else.
		
			In other words: They haven't told neither me and probably also not you, that they are OK with using this method to collect data out of their Website and GDS.
		
			So please respect some basic rules when using the following code in your application - although I strongly encourage you to search sourself another way to access the data:
			- Use the "Android/iSIXT 1.0" Useragent when querying data.
			- Please don't query too often. Every hour some request seems to be fair to me...
			- Always sign your requests. You got yourself a key? Use it instead, please!
			- Don't you ever, never, never, ever, ever, ever, ever, ever, never use this API to access to private data stored on the SIXT-Servers! Never, I said!
			- Private data includes not exclusivly but also:
				- Name and personal Information of Customers
				- Private and corporate Rates. That are rates, that you need to access using a "CD-number" (Corporate Discount number or so called "Kundennummer") and password
				- Pseudo-Public Rates like "Lufthansa Miles & More Credit Card"-rate.
			- (As you don't private data and rates, this point doesn't apply to you) : Don't publish any of the private data or pseudo-public rate-informations
			
			Let us all be "happy campers" that don't have any problems with the SIXT IT-Department ;)
			
			If you are a SIXT-employee:
			We're doing nothing bad, nor publishing any confidential information. The only goal is, to provide an extra service to your customers.
			So, after all, we're doing our best, to get some more customers to you.
			
			But if you still have any concern about the individual use of the API, please contact the respective owener/developer of the application.
			He will be happy to answer your questions.
		*/
		var signKey = "MIIBOgIBAAJBAKmdPwOOsmcV6i18/N9ageyLkEFfqn4N6zPy+9MUPMzkFfNLNLl5keJ0FxDAiSaEmdj9XAriaAWr/DFrDVGRKq8CAwEAAQJAUTdXVge9CzlmIZPorbZz4eVOFM+PHr7hccWWqZLWLjD9SKzwXK2U7/qEAC9l2ls1m5SyIKQo8lRniPTR7e2avkWbMX/EI7q5MW6LY2D3kYBJJTvZ7zswvMyuCDzwacZtVhdLiPeJ3UDwh9MCQBEjPFkQcVJ30dinH9BwZr6SCrhiu6Ar0tP7VGK5SYM07zn5KkfH2e+Lroq1C0X4CPi6fkIGi8s6TZjrN5nj+m0CQBtJ+H1GFez16vOc3yAb/Qc5fu2enAb1dZ8qIcQlkN7X";
		var baseURL = "https://partner.sixt.de";
		var basePath = "/php/res/";
		
		var queryURL = basePath + "mobile.offerlist?uci=" +  collectStation + "&uti=" + collectHour + "&uda=" +collectDate + "&rci=" + returnStation + "&rti=" + returnHour + "&rda=" + returnDate + "&language=de&offerposl=DE&ctyp=P&uid=000000000000000";
		var queryURL = baseURL + queryURL + "&auth=" + MD5(queryURL + signKey);

		var http = new XMLHttpRequest();
		http.open('GET', queryURL, true);
		http.setRequestHeader('User-Agent','Android/iSIXT 1.0');
		http.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
		
		http.onreadystatechange = function() {
			if(http.readyState==4) {
				tcheck.formatSxResponse(http.responseText);
			}
		}
		
		http.send('GET');
	},
	
	formatSxResponse : function (sxData) {
		//alert(sxData);
		var offers = sxData.split("�");
		
		for (i = 0; i < offers.length; i++) {
			//alert(offers[i]);
			offers[i] = offers[i].split("|");
		}
		
		//alert(dump(offers));

		var feedObject = {
			label : "",
			image : "",
			description : "",
			uri : "",
			siteUri : "",
			items : [],
			id : "",
			rootUri : ""
		};
		
		feedObject.label = "SX tCheck";
		feedObject.image = "";
		feedObject.description = "SX tCheck";
		feedObject.uri = "http://www.sixt.de/";
		feedObject.siteUri = "http://www.sixt.de/";
		feedObject.id = "http://www.sixt.de/";
		feedObject.rootUri = "http://www.sixt.de/";	
		
		for (i = 0; i < offers.length; i++) {
			//alert(dump(offers[i][1]));
			//alert(offers[i][0]);
			
			if (offers[i][0] == "\nOFFER") {
				//alert(i + " -> " + offers[i][1]);
				var itemObject = {
					uri : "",
					published : "",
					label : "",
					description : "",
					image : "",
					id : ""
				};
			
				itemObject.uri = "http://www.google.de/" + i;
				itemObject.published = j;
				itemObject.label = offers[i][1] + " 24h München Airport-Station: " + offers[i][7] + "€ (inkl. " + offers[i][9] + " km)";
				itemObject.description = offers[i][1] + " 24h München Airport-Station: " + offers[i][7] + "€ (inkl. " + offers[i][9] + " km)";
				itemObject.image = "chrome://tcheck/skin/sixt.png";
				itemObject.id = i;
				feedObject.items.push(itemObject);
				
				delete itemObject;
			}
		
		}
		tcheck.writeFeed(feedObject);
	},
	
	onTickerItemClick : function (event, uri, thing) {
		/*
		if (uri != "") {
			window.open(uri);
		}
		*/
		window.open("http://partners.webmasterplan.com/click.asp?ref=152143&site=3042&type=text&tnb=8");
	}
};

function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}