Ext.define('SF.view.Main', {
	extend : 'Ext.container.Viewport',
	requires : ['Ext.container.Viewport', 'Ext.layout.container.Border', 'SF.view.TipBar', 'SF.view.MenuBar', 'SF.view.TabBar', 'SF.view.Editor', 'SF.view.ResultView'],

	layout : 'fit',

	initComponent : function() {
		this.items = {
			xtype : 'panel',
			layout : 'fit',
			dockedItems : [{
				dock : 'top',
				xtype : 'sf-view-tipbar',
				cls : 'tipbar'
			}],
			items : [{
				xtype : 'panel',
				layout : 'fit',
				dockedItems : [{
					dock : 'top',
					xtype : 'sf-view-menubar'
				}, {
					dock : 'bottom',
					xtype : 'sf-view-tabbar'
				}],
				items : [{
					xtype : 'panel',
					margin : '0 10',
					itemCls : 'editorContainer',
					layout : 'border',
					items : [{
						xtype : 'sf-view-editor'
					}, {
						xtype : 'sf-view-resultview'
					}]
				}]
			}]
		};

		this.callParent();
	}
});
