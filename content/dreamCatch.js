var dreamCatch = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		init : function () {
			gBrowser.addEventListener("load", function () {
				var autoRun = prefManager.getBoolPref("extensions.dreamcatch.autorun");
				if (autoRun) {
					dreamCatch.run();
				}
			}, false);
		},
			
		run : function () {
			var head = content.document.getElementsByTagName("head")[0],
				allLinks = content.document.getElementsByTagName("a"),
				foundLinks = 0;
						
			for (var i=0, il=allLinks.length; i<il; i++) {
				elm = allLinks[i];
				if (elm.getAttribute("target")) {
					foundLinks++;
				}
			}
			if (foundLinks === 0) {
				alert("No links found with a target attribute");
			}
			else {
				alert("F!!ound " + foundLinks + " links with a target attribute");
			}	
		}
	};
}();
window.addEventListener("load", dreamCatch.init, false);