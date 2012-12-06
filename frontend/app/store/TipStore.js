Ext.define('SF.store.TipStore', {
	extend : 'Ext.data.Store',

	model : 'SF.model.TipModel',
	proxy : {
		type : 'ajax',
		url : 'resources/data/tips.json',
		reader : {
			type : 'json',
			root : 'results'
		}
	}
});
