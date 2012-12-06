Ext.define('SF.model.AppModel', {
	extend : 'Ext.data.Model',

	fields : [{
		name : 'id',
		type : 'int'
	}, {
		name : 'token',
		type : 'string'
	}, {
		name : 'name',
		type : 'string'
	}, {
		name : 'state',
		type : 'string',
		defaultValue : 'Draft'
	}, {
		name : 'version',
		type : 'string'
	}, {
		name : 'privacy',
		type : 'string',
		defaultValue : 'public'
	}, {
		name : 'created',
		type : 'string'
	}]
});
