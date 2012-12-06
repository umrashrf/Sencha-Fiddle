Ext.define('SF.model.FileTemplateModel', {
	extend : 'Ext.data.Model',

	fields : [{
		name : 'type',
		type : 'string'
	}, {
		name : 'version',
		type : 'string'
	}, {
		name : 'content',
		type : 'string'
	}]
});
