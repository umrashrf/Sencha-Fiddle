Ext.define('SF.model.FileModel', {
	extend : 'Ext.data.Model',

	fields : [{
		name : 'domid',
		type : 'string'
	}, {
		name : 'id',
		type : 'int'
	}, {
		name : 'appid',
		type : 'int'
	}, {
		name : 'name',
		type : 'string'
	}, {
		name : 'oldname',
		type : 'string'
	}, {
		name : 'type',
		type : 'string'
	}, {
		name : 'content',
		type : 'string',
		persist : true
	}, {
		name : 'isdefault',
		type : 'bool'
	}, {
		name : 'created',
		type : 'string'
	}, {
		name : 'lastupdate',
		type : 'string'
	}]
});
