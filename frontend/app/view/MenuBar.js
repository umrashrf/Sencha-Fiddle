Ext.define('SF.view.MenuBar', {
	extend : 'Ext.container.Container',
	xtype : 'sf-view-menubar',

	height : 56,
	layout : 'fit',

	initComponent : function() {
		var btnLogo = Ext.create('Ext.Button', {
			text : 'Sencha Fiddle',
			cls : 'logo',
			iconCls : 'icon sf',
			arrowCls : 'arrow',
			width : 240,
			height : 35,
			menu : Ext.create('Ext.menu.Menu', {
				cls : 'logoMenu',
				width : 240,
				showSeparator : false,
				collapseDirection : 'bottom',
				items : [{
					text : 'About'
				}, {
					text : 'Feedback'
				}],
				listeners : {
					mouseover : function() {
						logoMenuHideTask.cancel();
					},
					mouseleave : function() {
						logoMenuHideTask.delay(250);
					}
				}
			}),
			listeners : {
				mouseover : function() {
					logoMenuHideTask.cancel();
					if (!this.hasVisibleMenu()) {
						this.showMenu();
					}
				},
				mouseout : function() {
					logoMenuHideTask.delay(250);
				}
			}
		});

		var logoMenuHideTask = new Ext.util.DelayedTask(btnLogo.hideMenu, btnLogo);

		var btnShare = Ext.create('Ext.Button', {
			cls : 'button share',
			text : 'Share',
			iconCls : 'icon share',
			menu : Ext.create('Ext.menu.Menu', {
				cls : 'shareBox',
				width : 240,
				shadow : false,
				defaultAlign : 'bl',
				items : [{
					xtype : 'container',
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					items : [{
						xtype : 'container',
						cls : 'shareText',
						html : 'Share Link'
					}, {
						xtype : 'textfield',
						cls : 'shareField link',
						value : 'http://www.senchafiddle.com/#PHRyc'
					}, {
						xtype : 'container',
						cls : 'break1'
					}, {
						xtype : 'container',
						cls : 'shareText',
						html : 'Share full screen result'
					}, {
						xtype : 'textfield',
						cls : 'shareField full',
						value : 'http://www.senchafiddle.com/#PHRyc'
					}, {
						xtype : 'container',
						cls : 'break1'
					}, {
						xtype : 'container',
						cls : 'shareText',
						html : 'Embed on your page'
					}, {
						xtype : 'textfield',
						cls : 'shareField embed',
						value : 'http://www.senchafiddle.com/#PHRyc'
					}]
				}]
			}),
			listeners : {
				move : function() {
					// this.menu.alignTo(this);
				}
			}
		});

		this.items = [{
			xtype : 'container',
			margin : '0 10',
			layout : {
				type : 'hbox',
				align : 'middle'
			},
			items : [btnLogo, {
				xtype : 'button',
				cls : 'button run',
				text : 'Run',
				iconCls : 'icon run'
			}, {
				xtype : 'button',
				cls : 'button save',
				text : 'Save',
				iconCls : 'icon save'
			}, {
				xtype : 'button',
				cls : 'button beautify',
				text : 'Beautify',
				iconCls : 'icon beautify'
			}, btnShare, {
				xtype : 'button',
				cls : 'button download',
				text : 'Download',
				iconCls : 'icon download'
			}]
		}];

		this.callParent();
	}
});
