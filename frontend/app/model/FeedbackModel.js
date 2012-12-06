Ext.define('SF.model.FeedbackModel', {
	extend : 'Ext.data.Model',

	fields : [{
		name : 'id',
		type : 'int'
	}, {
		name : 'comments',
		type : 'string'
	}, {
		name : 'created',
		type : 'string'
	}],

	proxy : {
		type : 'ajax',
		url : API_ENDPOINT + '/feedback.php',
		reader : {
			type : 'json',
			root : 'results'
		}
	}
});
