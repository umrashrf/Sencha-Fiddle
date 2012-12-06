Ext.define('SF.controller.MenuController', {
	extend : 'Ext.app.Controller',

	refs : [{
		ref : 'runButton',
		selector : 'container > button[cls=button run]'
	}, {
		ref : 'saveButton',
		selector : 'container > button[cls=button save]'
	}, {
		ref : 'shareButton',
		selector : 'container > button[cls=button share]'
	}, {
		ref : 'linkShareField',
		selector : 'textfield[cls=shareField link]'
	}, {
		ref : 'fullShareField',
		selector : 'textfield[cls=shareField full]'
	}, {
		ref : 'embedShareField',
		selector : 'textfield[cls=shareField embed]'
	}],

	init : function() {
		this.control({
			'button[cls=logo] > menu > menuitem[text=About]' : {
				click : this.openAbout
			},
			'button[cls=logo] > menu > menuitem[text=Feedback]' : {
				click : this.openFeedback
			},
			'container > button[cls=button run]' : {
				click : this.run
			},
			'container > button[cls=button save]' : {
				click : this.save
			},
			'container > button[cls=button beautify]' : {
				click : this.beautify
			},
			'container > button[cls=button share]' : {
				click : this.share
			},
			'container > button[cls=button download]' : {
				click : this.download
			}
		});
	},

	onLaunch : function() {

	},

	openAbout : function(sender, e, events) {
		Ext.Msg.alert('About', '<h1>Sencha Fiddle v2.0</h1><a href="http://umairashraf.me/">Umair Ashraf</a><p>SenchaFiddle is an online web based Sencha Touch IDE. It supports Sencha Touch version 1.1 and SASS/Compass compiling is coming soon.</p><br /><h1>Credits</h1><br /><a href="http://codemirror.net/">CodeMirror</a><p>CodeMirror is a JavaScript library that can be used to create a relatively pleasant editor interface for code-like content - computer programs, HTML markup, and similar. If a mode has been written for the language you are editing, the code will be coloured, and the editor will optionally help you with indentation.</p>');
	},

	openFeedback : function(sender, e, events) {
		var callback = function(answer, comments) {
			if (answer == "ok") {

				if (comments.length <= 0) {
					return;
				}

				var feedback = Ext.create('SF.model.FeedbackModel', {
					comments : comments
				});
				feedback.save();

				Ext.Msg.alert('Success', 'Thanks for giving us your valuable feedback. We\'ll look into it.');
			}
		};

		Ext.Msg.prompt('Let us know your thoughts under 1000 characters', '', callback, this, true);
	},

	run : function(sender, e, obj) {
		this.getController('AppController').onRun(sender, e, obj);
	},

	save : function(sender, e, obj) {
		this.getController('AppController').onSave(sender, e, obj);
	},

	beautify : function(sender, e, obj) {
		var tabController = this.getController('TabController');

		var currentTab = tabController.getCurrentTab();
		var currentRecord = tabController.getRecordByTab(currentTab);

		var editorController = this.getController('EditorController');
		var codeEditor = editorController.getEditor().getCodeEditor();

		if (currentRecord.get('type') == 'HTML') {
			codeEditor.setOption("mode", "text/html");
		} else if (currentRecord.get('type') == 'CSS') {
			codeEditor.setOption("mode", "text/css");
		} else {
			codeEditor.setOption("mode", "text/javascript");
		}

		for (var i = 0, e = codeEditor.lineCount(); i < e; ++i) {
			codeEditor.indentLine(i);
		}
	},

	share : function(sender, e, obj) {
		this.getController('AppController').onShare(sender, e, obj);
	},

	download : function(sender, e, obj) {
		this.getController('AppController').onDownload(sender, e, obj);
	}
});
