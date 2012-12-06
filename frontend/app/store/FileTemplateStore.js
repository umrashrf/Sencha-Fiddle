Ext.define('SF.store.FileTemplateStore', {
	extend : 'Ext.data.Store',

	model : 'SF.model.FileTemplateModel',
	proxy : {
		type : 'ajax',
		url : 'resources/data/file_templates.json',
		reader : {
			type : 'json',
			root : 'results'
		}
	}
});
