Ext.define('SF.view.Editor', {
	extend : 'Ext.form.field.TextArea',
	xtype : 'sf-view-editor',

	region : 'center',
	layout : 'fit',
	margins : '0 4 0 0',
	autoHeight : true,

	config : {
		codeEditor : null
	},

	initComponent : function() {
		this.addEvents('onContentChange');
		this.callParent();
	},

	listeners : {
		resize : function() {
			var me = this;

			if (!this.getCodeEditor()) {
				var targetEl = this.getId() + "-inputEl";

				this.setCodeEditor(CodeMirror.fromTextArea(document.getElementById(targetEl), {
					mode : "text/javascript",
					theme : 'eclipse',
					indentUnit : 4,
					tabMode : 'indent',
					lineNumbers : true,
					gutter : true,
					fixedGutter : true,
					smartIndent : true,
					onChange : function(sender, pos) {
						me.fireEvent('onContentChange', sender, pos);
					}
				}));
			}
		}
	}
});
