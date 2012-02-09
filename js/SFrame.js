function SenchaFiddle() {
	var that = this;

	// local
	this.BaseURL = 'http://local.senchafiddle.com/local/v8/';

	// server
	//this.BaseURL = 'http://senchafiddle.com/';

	this.ProxyURL = this.BaseURL + 'server/proxy.php?url=';

	this.init = function() {
	};

	this.proxy = function(url) {
		return this.ProxyURL + encodeURI(url);
	};

	this.informLoad = function() {
		try {
			window.parent.SF.onAppViewLoadComplete();
		} catch(ex) {
		}
	};
}