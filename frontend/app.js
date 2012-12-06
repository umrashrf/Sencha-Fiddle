var API_ENDPOINT;

API_ENDPOINT = 'http://api.senchafiddle.com/v3';

Ext.Loader.setConfig({
	enabled : true,
	paths : {
		'SF' : './app'
	}
});

Ext.require(['Ext.util.History', 'SF.view.Main']);

Ext.History.init();

Ext.application({
	name : 'SF',

	views : ['Main', 'TipBar', 'MenuBar', 'Editor', 'ResultView', 'TabBar'],
	models : ['AppModel', 'FileModel', 'FileTemplateModel', 'TipModel', 'FeedbackModel'],
	stores : ['AppStore', 'FileStore', 'FileTemplateStore', 'TipStore'],
	controllers : ['AppController', 'TipController', 'MenuController', 'EditorController', 'ResultController', 'TabController'],

	launch : function() {
		Ext.create('SF.view.Main');
	}
});
