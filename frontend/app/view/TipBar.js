Ext.define('SF.view.TipBar', {
	extend : 'Ext.panel.Panel',
	xtype : 'sf-view-tipbar',

	height : 20,

	dockedItems : [{
		dock : 'right',
		xtype : 'container',
		padding : '0 10 0 0',
		layout : {
			type : 'hbox',
			align : 'middle'
		},
		items : [{
			xtype : 'button',
			cls : 'button tip',
			text : '<'
		}, {
			xtype : 'button',
			cls : 'button tip',
			text : '>'
		}]
	}],

	layout : {
		type : 'hbox',
		align : 'middle'
	},

	items : [{
		xtype : 'button',
		cls : 'tip tipText',
		padding : '0 0 0 10'
	}]
});
