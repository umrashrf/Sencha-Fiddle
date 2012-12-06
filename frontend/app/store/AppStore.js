Ext.define('SF.store.AppStore', {
	extend : 'Ext.data.Store',

	model : 'SF.model.AppModel',
	proxy : {
		type : 'ajax',
		url : API_ENDPOINT + '/app.php',
		reader : {
			type : 'json',
			root : 'results'
		}
	}
});
