Ext.define('SF.model.TipModel', {
	extend : 'Ext.data.Model',

	fields : [{
		name : 'id',
		type : 'int'
	}, {
		name : 'title',
		type : 'string'
	}, {
		name : 'content',
		type : 'string'
	}, {
		name : 'created',
		type : 'string'
	}]
});
