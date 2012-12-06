Ext.define('SF.store.FileStore', {
	extend : 'Ext.data.Store',

	model : 'SF.model.FileModel',
	proxy : {
		type : 'rest',
		url : API_ENDPOINT + '/file.php',
		reader : {
			type : 'json',
			root : 'results'
		}
	}
});
