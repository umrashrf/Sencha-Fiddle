Ext.define('SF.view.TabBar', {
	extend : 'Ext.container.Container',
	xtype : 'sf-view-tabbar',

	height : 50,
	layout : {
		type : 'hbox',
		align : 'stretch'
	},

	initComponent : function() {
		var btnAddMenu = Ext.create('Ext.Button', {
			cls : 'button addTab',
			iconCls : 'icon add',
			arrowCls : '',
			menu : Ext.create('Ext.menu.Menu', {
				cls : 'addTabMenu upsideDown',
				width : 200,
				maxHeight : 200,
				items : [{
					text : 'Model',
					cls : 'addTab'
				}, {
					text : 'Store',
					cls : 'addTab'
				}, {
					text : 'View',
					cls : 'addTab'
				}, {
					text : 'Controller',
					cls : 'addTab'
				}],
				listeners : {
					mouseover : function() {
						menuHideTask.cancel();
					},
					mouseleave : function() {
						menuHideTask.delay(250);
					}
				}
			}),
			listeners : {
				mouseover : function() {
					menuHideTask.cancel();
					if (!this.hasVisibleMenu()) {
						this.showMenu();
					}
				},
				mouseout : function() {
					menuHideTask.delay(250);
				}
			}
		});

		var menuHideTask = new Ext.util.DelayedTask(btnAddMenu.hideMenu, btnAddMenu);

		var btnTabList = Ext.create('Ext.Button', {
			cls : 'button switchTab',
			iconCls : 'icon page',
			arrowCls : '',
			menu : Ext.create('Ext.menu.Menu', {
				cls : 'tabList upsideDown',
				width : 200,
				maxHeight : 200,
				showSeparator : false,
				collapseDirection : 'top',
				listeners : {
					mouseover : function() {
						tabListHideTask.cancel();
					},
					mouseleave : function() {
						tabListHideTask.delay(250);
					}
				}
			}),
			listeners : {
				mouseover : function() {
					tabListHideTask.cancel();
					if (!this.hasVisibleMenu()) {
						this.showMenu();
					}
				},
				mouseout : function() {
					tabListHideTask.delay(250);
				}
			}
		});

		var tabListHideTask = new Ext.util.DelayedTask(btnTabList.hideMenu, btnTabList);

		this.items = [{
			xtype : 'container',
			flex : 1.5,
			layout : {
				type : 'hbox',
				align : 'middle',
				pack : 'end'
			},
			items : [btnAddMenu, btnTabList]
		}, {
			xtype : 'container',
			cls : 'tabs',
			flex : 8,
			layout : {
				type : 'hbox',
				align : 'middle'
			}
		}, {
			xtype : 'container',
			flex : 1.5,
			layout : {
				type : 'hbox',
				align : 'middle'
			},
			items : [{
				xtype : 'button',
				cls : 'button tabsBackward',
				iconCls : 'icon leftArrow',
				disabled : true
			}, {
				xtype : 'button',
				cls : 'button tabsForward',
				iconCls : 'icon rightArrow',
				disabled : true
			}]
		}];

		this.callParent();
	}
});
