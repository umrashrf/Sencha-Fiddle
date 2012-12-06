Ext.define('SF.controller.EditorController', {
	extend : 'Ext.app.Controller',

	refs : [{
		ref : 'editor',
		selector : 'sf-view-editor'
	}],

	init : function() {
		this.control({
			'sf-view-editor' : {
				'onContentChange' : this.onContentChange
			}
		});
	},

	onLaunch : function() {
		
	},

	setContent : function(content) {
		this.getEditor().getCodeEditor().setValue(content);
	},

	onContentChange : function(codeEditor, pos, e) {
		var tabController = this.getController('TabController');
		var currentTab = tabController.getCurrentTab();

		if (currentTab) {
			var currentRecord = tabController.getRecordByTab(currentTab);

			if (currentRecord) {
				currentRecord.set('content', codeEditor.getValue());
			}
		}
	}
});
