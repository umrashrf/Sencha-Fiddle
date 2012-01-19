function SenchaFiddle($$) {
	var that = this;

	// local
	this.BaseURL = 'http://local.senchafiddle.com/local/v10/';

	// server
	//this.BaseURL = 'http://senchafiddle.com/';

	this.init = function() {
		this.ui = {
			window : $$(window),
			document : $$(document),
			tip : $$("#tip"),
			tipDetail : $$("#tipDetail"),
			btnPrevTip : $$("#btnPrevTip"),
			btnNextTip : $$("#btnNextTip"),
			btnAbout : $$("#btnAbout"),
			btnReviews : $$("#btnReviews"),
			btnTellYourFriend : $$("#btnTellYourFriend"),
			btnFeedback : $$("#btnFeedback"),
			btnRun : $$("#btnRun"),
			btnSave : $$("#btnSave"),
			btnBeautify : $$("#btnBeautify"),
			btnShare : $$("#btnShare"),
			btnLoginSignup : $$("#btnLoginSignup"),
			txtShareLink : $$("#txtShareLink"),
			txtFullShareLink : $$("#txtFullShareLink"),
			txtIframeShareLink : $$("#txtIframeShareLink"),
			tabList : $$("#tabList"),
			tabListItems : $$("#tabListItems"),
			btnQueueLeft : $$("#btnQueueLeft"),
			btnQueueRight : $$("#btnQueueRight"),
			headerOuterWrapper : $$(".headerOuterWrapper"),
			contentOuterWrapper : $$(".contentOuterWrapper"),
			textareaOuterWrapper : $$(".textareaOuterWrapper"),
			handler : $$("#handler"),
			resultOuterWrapper : $$(".resultOuterWrapper"),
			footer : $$(".footer"),
			appView : $$("#appView"),
			overlay : $$("#overlay"),
			contextMenu : $$("#contextMenu"),
			btnRename : $$("#btnRename"),
			btnDelete : $$("#btnDelete"),
			versionDialog : $$("#versionDialog"),
			btnVersionST2 : $$("#btnVersionST2"),
			btnVersionST1_1 : $$("#btnVersionST1_1"),
			alertDialog : $$("#alertDialog"),
			alertTitle : $$("#alertTitle"),
			alertMsg : $$("#alertMsg"),
			btnAlertOk : $$("#btnAlertOk"),
			confirmDialog : $$("#confirmDialog"),
			confirmTitle : $$("#confirmTitle"),
			confirmMsg : $$("#confirmMsg"),
			btnConfirmYes : $$("#btnConfirmYes"),
			btnConfirmNo : $$("#btnConfirmNo"),
			promptDialog : $$("#promptDialog"),
			promptTitle : $$("#promptTitle"),
			txtPrompt : $$("#txtPrompt"),
			btnPromptSave : $$("#btnPromptSave"),
			btnPromptCancel : $$("#btnPromptCancel"),
			aboutDialog : $$("#aboutDialog"),
			aboutTitle : $$("#aboutTitle"),
			txtAbout : $$("#txtAbout"),
			btnAboutOk : $$("#btnAboutOk"),
			feedbackDialog : $$("#feedbackDialog"),
			feedbackTitle : $$("#feedbackTitle"),
			txtFeedback : $$("#txtFeedback"),
			btnFeedbackSend : $$("#btnFeedbackSend"),
			btnFeedbackCancel : $$("#btnFeedbackCancel"),
			loginSignupDialog : $$("#loginSignupDialog"),
			loginSignupTitle : $$("#loginSignupTitle"),
			txtLoginUsername : $$("#txtLoginUsername"),
			txtLoginPassword : $$("#txtLoginPassword"),
			btnLoginSignupLogin : $$("#btnLoginSignupLogin"),
			btnLoginSignupCancel : $$("#btnLoginSignupCancel"),
			codeEditor : $$("#codeEditor")
		};

		this.templates = {};
		this.templates.ST2 = {
			index : $$("#storage #templates #ST2 #index"),
			style : $$("#storage #templates #ST2 #scss"),
			app : $$("#storage #templates #ST2 #app"),
			store : function(name) {
				if(name == undefined || name.length <= 0) {
					name = "Store" + (that.files.findByType(that.FileTypes.Store).length + 1);
				}
				var template = "var " + name + "=Ext.create('Ext.data.Store', {model: '" + name + "',proxy: {type: 'ajax',url : '/users.json',reader: {type: 'json',root: 'users'}},autoLoad: true});";
				return template;
			},
			model : function(name) {
				if(name == undefined || name.length <= 0) {
					name = "Model" + (that.files.findByType(that.FileTypes.Store).length + 1);
				}
				var template = "Ext.define('" + name + "', {extend: 'Ext.data.Model', fields: [{name: 'name',  type: 'string'},{name: 'age',   type: 'int'},{name: 'phone', type: 'string'},{name: 'alive', type: 'boolean', defaultValue: true}],changeName: function() {var oldName = this.get('name'),newName = oldName + \" The Barbarian\";this.set('name', newName);}});";
				return template;
			}
		};
		this.templates.ST1_1 = {
			index : $$("#storage #templates #ST1_1 #index"),
			style : $$("#storage #templates #ST1_1 #scss"),
			app : $$("#storage #templates #ST1_1 #app"),
			viewport : $$("#storage #templates #ST1_1 #viewport"),
			store : function(name) {
				if(name == undefined || name.length <= 0) {
					name = "Store" + (that.files.findByType(that.FileTypes.Store).length + 1);
				}
				var template = "var " + name + "=new Ext.data.Store({model: '" + name + "',proxy: {type: 'ajax',url : '/users.json',reader: {type: 'json',root: 'users'}},autoLoad: true});";
				return template;
			},
			model : function(name) {
				if(name == undefined || name.length <= 0) {
					name = "Model" + (that.files.findByType(that.FileTypes.Store).length + 1);
				}
				var template = "Ext.regModel('" + name + "', {fields: [{name: 'name',  type: 'string'},{name: 'age',   type: 'int'},{name: 'phone', type: 'string'},{name: 'alive', type: 'boolean', defaultValue: true}],changeName: function() {var oldName = this.get('name'),newName = oldName + \" The Barbarian\";this.set('name', newName);}});";
				return template;
			}
		};

		this.STVersion = 1.1;
		this.sync = true;
		this.saver = null;
		this.syncing = false;
		//this.syncFileQueue = [];		// for files to be added here and sync from here
		this.afterSyncCycle = null;
		this.currentApp = null;
		this.currentFile = null;
		this.frameResize = false;
		this.tabListWidth = this.ui.tabList.outerWidth(true);
		this.tabListAvailableWidth = this.ui.tabList.parent().outerWidth(true);

		this.ui.window.bind("resize", {
			SF : this
		}, this.resize);
		this.ui.btnAbout.bind("click", {
			SF : this
		}, this.openAbout);
		this.ui.btnReviews.bind("click", {
			SF : this
		}, this.openReviews);
		this.ui.btnTellYourFriend.bind("click", {
			SF : this
		}, this.openTellYourFriend);
		this.ui.btnFeedback.bind("click", {
			SF : this
		}, this.openFeedback);
		this.ui.btnPrevTip.bind("click", {
			SF : this
		}, this.Tips.prevHandler);
		this.ui.btnNextTip.bind("click", {
			SF : this
		}, this.Tips.nextHandler);
		this.ui.btnRun.bind("click", {
			SF : this
		}, this.run);
		this.ui.btnSave.bind("click", {
			SF : this
		}, this.save);
		this.ui.btnBeautify.bind("click", {
			SF : this
		}, this.beautify);
		this.ui.btnShare.bind("click", {
			SF : this
		}, this.share);
		this.ui.txtShareLink.bind("click", {
			SF : this
		}, this.selectAll);
		this.ui.txtFullShareLink.bind("click", {
			SF : this
		}, this.selectAll);
		this.ui.txtIframeShareLink.bind("click", {
			SF : this
		}, this.selectAll);
		this.ui.btnLoginSignup.bind("click", {
			SF : this
		}, this.openLoginSignup);
		this.ui.handler.bind("mousedown", {
			SF : this
		}, this.startFrameResize);
		this.ui.handler.bind("mousemove", {
			SF : this
		}, this.resizeFrame);
		this.ui.document.bind("mousemove", {
			SF : this
		}, this.resizeFrame);
		this.ui.document.bind("mouseup", {
			SF : this
		}, this.stopFrameResize);
		this.ui.tabList.find("li a").live("click", {
			SF : this
		}, this.gotoFile);
		this.ui.tabListItems.find("li a").live("click", {
			SF : this
		}, this.gotoFile);
		this.ui.tabList.find("li a").live("contextmenu", {
			SF : this
		}, this.showTabContextMenu);
		this.ui.btnRename.bind("click", {
			SF : this
		}, this.renameCurrentFile);
		this.ui.btnDelete.bind("click", {
			SF : this
		}, this.deleteCurrentFile);
		this.ui.btnQueueLeft.bind("mousedown", {
			SF : this
		}, this.moveTabsLeft);
		this.ui.btnQueueRight.bind("mousedown", {
			SF : this
		}, this.moveTabsRight);

		this.resize();
		this.initTips();
		this.initCodeEditor();
		this.disableSelection();

		if(this.isExistingApp()) {
			this.loadExistingApp(this.getAppToken());
		} else {
			this.loadNewEnvironment();
		}
	};

	this.initTips = function() {
		var tip1 = new this.Tip('Did you know you can use <b>SF.proxy(URL)</b> function to call Cross Domain XHR?', '<b>Parameters</b>: URL (string) - The url you want to send request to.<br /><b>Returns</b>: URL (string) - Proxified string that can be called on cross domains.');
		var tip2 = new this.Tip('Did you know you can write <b>CSS</b> in the fiddle now?', '<b>Note</b>: The CSS support in the fiddle is right now basic so please don\'t think it SCSS where Compass is needed to compile.');
		this.Tips.add(tip1);
		this.Tips.add(tip2);
		this.Tips.updateTip(this);

		// later tips will come from database
	};

	this.initCodeEditor = function() {
		this.ui.codeEditor = CodeMirror.fromTextArea(this.ui.codeEditor.get(0), {
			mode : "text/javascript",
			theme : 'eclipse',
			indentUnit : 4,
			tabMode : 'indent',
			lineNumbers : true,
			gutter : true,
			fixedGutter : true,
			onChange : function() {
				that.syncContent();
			}
		});
	};

	this.isExistingApp = function() {
		var url = window.location.href;
		return (url.lastIndexOf("#") === (url.length - 6));
	};

	this.getAppToken = function() {
		var url = window.location.href;
		return url.substr(url.lastIndexOf("#") + 1, 5);
	};

	this.loadExistingApp = function(token) {
		var succeed = false;

		var user_token = "";
		if(this.User.loggedIn()) {
			user_token = this.User.getToken();
		}

		$$.ajax({
			url : this.BaseURL + 'server/app.php?action=load',
			type : 'POST',
			data : {
				app_token : token,
				user_token : user_token
			},
			dataType : 'json',
			success : function(response) {
				succeed = true;

				if(response.senchafiddle.error) {
					//there has to be popup
					that.confirm("Oops!", "Could not load your application. Would you like to create new environment?", function(yes) {
						if(yes) {
							if(this.isExistingApp) {
								var url = window.location.href;
								window.location = url.substr(0, url.lastIndexOf("#"));
							}
						}
					});
				} else if(response.senchafiddle.app) {
					if(response.senchafiddle.app.version) {
						that.STVersion = response.senchafiddle.app.version;
					}

					if(response.senchafiddle.app.files) {
						for(var f = 0; f < response.senchafiddle.app.files.length; f++) {
							that.addFile(response.senchafiddle.app.files[f]);
						}
					}
				}
				that.checkQueueButton();
			},
			error : function(xmlHTTP, status, msg) {
				succeed = false;
			},
			complete : function() {
				if(!succeed) {
					that.addSTVersion1_1Files();
					that.checkQueueButton();
					that.alert("Oops!", "Could not load your application. Loading new workspace.");
				}
				that.ui.overlay.addClass("hide");
			}
		});
	};

	this.loadNewEnvironment = function() {
		this.ui.overlay.addClass("hide");
		this.openVersionDialog(function() {
			if(this.STVersion > 1.1) {
				this.addSTVersion2Files();
				this.checkQueueButton();
			} else {
				this.addSTVersion1_1Files();
				this.checkQueueButton();
			}
		});
	};

	this.addSTVersion2Files = function() {
		var template = null;
		var sIndex = 0;
		var eIndex = 0;

		//        template = this.templates.style.html();
		//        sIndex = template.indexOf("<!--//") + 6;
		//        eIndex = template.indexOf("//-->");
		//        template = template.substr(sIndex, eIndex - sIndex);
		//        template = template.replace(/<br \/>/g, "\n");
		//        template = template.replace(/^\s+|\s+$/g, '');

		//        var style = new this.File("style.scss", this.FileTypes.Style, template, true);
		//        this.addFile(style);

		var style = new this.File("style.css", this.FileTypes.CSS, template, true);
		style.content = "/* This file is inserted into index.html as is after sencha-touch.css */\n\r";
		this.addFile(style);
		template = this.templates.ST2.app.html();
		sIndex = template.indexOf("<!--//") + 6;
		eIndex = template.indexOf("//-->");
		template = template.substr(sIndex, eIndex - sIndex);
		template = template.replace(/<br \/>/g, "\n");
		template = template.replace(/^\s+|\s+$/g, '');
		var app = new this.File("app.js", this.FileTypes.App, template, true);
		this.addFile(app);

		this.ui.codeEditor.focus();
		this.ui.codeEditor.setCursor({
			line : this.ui.codeEditor.lineCount()
		});
	};

	this.addSTVersion1_1Files = function() {
		var template = null;
		var sIndex = 0;
		var eIndex = 0;

		//        template = this.templates.style.html();
		//        sIndex = template.indexOf("<!--//") + 6;
		//        eIndex = template.indexOf("//-->");
		//        template = template.substr(sIndex, eIndex - sIndex);
		//        template = template.replace(/<br \/>/g, "\n");
		//        template = template.replace(/^\s+|\s+$/g, '');

		//        var style = new this.File("style.scss", this.FileTypes.Style, template, true);
		//        this.addFile(style);

		var style = new this.File("style.css", this.FileTypes.CSS, template, true);
		style.content = "/* This file is inserted into index.html as is after sencha-touch.css */\n\r";
		this.addFile(style);
		template = this.templates.ST1_1.app.html();
		sIndex = template.indexOf("<!--//") + 6;
		eIndex = template.indexOf("//-->");
		template = template.substr(sIndex, eIndex - sIndex);
		template = template.replace(/<br \/>/g, "\n");
		template = template.replace(/^\s+|\s+$/g, '');

		var app = new this.File("app.js", this.FileTypes.App, template, true);
		this.addFile(app);
		template = this.templates.ST1_1.viewport.html();
		sIndex = template.indexOf("<!--//") + 6;
		eIndex = template.indexOf("//-->");
		template = template.substr(sIndex, eIndex - sIndex);
		template = template.replace(/<br \/>/g, "\n");
		template = template.replace(/^\s+|\s+$/g, '');

		var viewport = new this.File("viewport.js", this.FileTypes.Viewport, template, true);
		this.addFile(viewport);

		this.ui.codeEditor.focus();
		this.ui.codeEditor.setCursor({
			line : this.ui.codeEditor.lineCount()
		});
	};

	this.resize = function(e) {
		var SF = this;
		if(e)
			SF = e.data.SF;

		var windowHeight = SF.ui.window.innerHeight();
		var headerHeight = SF.ui.headerOuterWrapper.outerHeight();
		var footerHeight = SF.ui.footer.outerHeight();
		var occupiedHeight = headerHeight + footerHeight;
		var remainingHeight = windowHeight - occupiedHeight;
		SF.ui.contentOuterWrapper.height(remainingHeight);
		SF.ui.contentOuterWrapper.height(remainingHeight);

		if(!e) {
			var windowWidth = SF.ui.window.innerWidth();
			var handlerWidth = SF.ui.handler.outerWidth();

			var leftWidth = 75 / 100 * windowWidth;
			var rightWidth = 25 / 100 * windowWidth;

			var leftPercent = leftWidth / windowWidth * 100;
			var rightPercent = rightWidth / windowWidth * 100;
			var handlerPercent = (leftWidth - handlerWidth / 2) / windowWidth * 100;

			SF.ui.handler.css("left", handlerPercent + "%");
			SF.ui.textareaOuterWrapper.css("width", leftPercent + "%");
			SF.ui.resultOuterWrapper.css("width", rightPercent + "%");
		}
	};

	this.startFrameResize = function(e) {
		var SF = e.data.SF;
		SF.frameResize = true;
	};

	this.stopFrameResize = function(e) {
		var SF = e.data.SF;
		SF.frameResize = false;
	};

	this.resizeFrame = function(e) {
		var SF = e.data.SF;

		if(SF.frameResize) {
			var windowWidth = SF.ui.window.innerWidth();
			var handlerWidth = SF.ui.handler.outerWidth();

			var minGap = 100;

			if(e.pageX <= minGap || e.pageX >= (windowWidth - minGap)) {
				return;
			}

			var leftWidth = e.pageX;
			var rightWidth = windowWidth - e.pageX;

			var leftPercent = leftWidth / windowWidth * 100;
			var rightPercent = rightWidth / windowWidth * 100;
			var handlerPercent = (leftWidth - handlerWidth / 2) / windowWidth * 100;

			SF.ui.handler.css("left", handlerPercent + "%");
			SF.ui.textareaOuterWrapper.css("width", leftPercent + "%");
			SF.ui.resultOuterWrapper.css("width", rightPercent + "%");
		}
	};

	this.disableSelection = function() {
		return $(":not(input,select,textarea)").each(function() {
			$(this).attr('unselectable', 'on').each(function() {
				this.onselectstart = function() {
					return false;
				};
			});
		});
	};

	this.syncContent = function(e) {
		var newContent = this.ui.codeEditor.getValue();
		if(this.currentFile.content != newContent) {
			this.currentFile.content = newContent;
			this.currentFile.updated = false;
		}
	};

	this.openAbout = function(e) {
		var SF = e.data.SF;
		SF.about("About", "<h1>Sencha Fiddle v1.0</h1><a href=\"http://umairashraf.me/\">Umair Ashraf</a><p>SenchaFiddle is an online web based Sencha Touch IDE. It supports Sencha Touch version 1.1 and SASS/Compass compiling is coming soon.</p><br /><br /><h1>Credits</h1><br /><h3>CodeMirror</h3><a href=\"http://codemirror.net/\">CodeMirror</a><p>CodeMirror is a JavaScript library that can be used to create a relatively pleasant editor interface for code-like content ― computer programs, HTML markup, and similar. If a mode has been written for the language you are editing, the code will be coloured, and the editor will optionally help you with indentation.</p>");
	};

	this.openFeedback = function(e) {
		var SF = e.data.SF;
		SF.feedback("Let us know your thoughts under 1000 characters.", function(comments) {
			if(!comments) {
				return false;
			}

			var succeed = false;

			var showError = function() {
				SF.alert("Oops", "Something went wrong while you were sending us feedback. Please try again.");
			};

			$$.ajax({
				url : SF.BaseURL + 'server/feedback.php?action=create',
				type : 'POST',
				dataType : 'json',
				data : {
					comments : comments
				},
				success : function(result) {
					succeed = true;

					if(result && result.senchafiddle && result.senchafiddle.feedback && result.senchafiddle.feedback.created) {
						SF.alert("Thanks", "We appreciate you giving us feedback. We will look into this soon.");
						return false;
					}
					showError();
				},
				error : function(xmlHTTP, status, msg) {
					succeed = true;
					showError();
				},
				complete : function() {
					if(!succeed) {
						showError();
					}
				}
			});
		});
	};

	this.openLoginSignup = function(e) {
		var SF = e.data.SF;
		SF.loginSignup("Login / Signup", function(token) {
			// save the token
			// update UI
		});
	};

	this.run = function(e) {
		var SF = e.data.SF;

		SF.ui.btnRun.unbind("click", SF.run);
		SF.ui.btnRun.children("span").text("Building...");
		SF.ui.btnRun.removeClass("disabled").addClass("disabled");

		SF.afterSyncCycle = function() {
			var appURL = SF.BaseURL + "full/" + SF.currentApp.token;
			if(SF.User.loggedIn()) {
				appURL += "/" + SF.User.getToken();
			}

			SF.ui.appView.attr("src", appURL);

			// will do following stuff onreadystate = complete or onload of iframe
			setTimeout(function() {
				if(SF.ui.btnRun.text() != "Run") {
					SF.onAppViewLoadComplete();
				}
			}, 10000);
		};
		if(!SF.currentApp) {
			var newApp = new SF.App("", SF.AppStates.Draft, SF.STVersion);
			SF.createApp(newApp, function(app, succeed) {
				if(!succeed) {
					SF.afterSyncCycle = null;
					SF.alert("Oops!", "Your app was failed to run properly. Please try again.");

					SF.ui.btnRun.children("span").text("Run");
					SF.ui.btnRun.removeClass("disabled");
					SF.ui.btnRun.bind("click", {
						SF : SF
					}, SF.run);

					return false;
				}

				SF.ui.btnRun.children("span").text("Starting...");

				SF.currentApp = app;
				SF.keepSyncing();
			});
		}
	};

	this.save = function(e) {
		var SF = e.data.SF;

		SF.ui.btnSave.unbind("click", SF.save);
		SF.ui.btnSave.removeClass("disabled").addClass("disabled");

		var updateAddressBar = function(app) {
			if(app.state == SF.AppStates.Save) {
				var appURL = window.location.href;
				if(appURL.indexOf("#") !== appURL.length - 1) {
					appURL += "#";
				}
				appURL += app.token;
				window.location = appURL;
			}
		};
		if(!SF.currentApp) {
			SF.ui.btnSave.children("span").text("Preparing...");

			var newApp = new SF.App("", SF.AppStates.Save, SF.STVersion);
			SF.createApp(newApp, function(app, succeed) {
				if(!succeed) {
					SF.alert("Oops!", "Your app was failed to save properly. Please try again.");

					SF.ui.btnSave.children("span").text("Save");
					SF.ui.btnSave.removeClass("disabled");

					return false;
				}

				updateAddressBar(app);

				SF.currentApp = app;
				SF.keepSyncing();
			});
		} else {
			SF.currentApp.state = SF.AppStates.Save;
			updateAddressBar(SF.currentApp);
		}

		SF.ui.btnSave.children("span").text("Saving...");
	};

	this.keepSyncing = function() {
		// put timer to send data to server when time permits and changed bit is on
		var filesSaver = function() {
			if(!that.sync)
				return;

			if(that.files.items.length <= 0)
				return;

			if(that.currentApp && that.currentApp.state == that.AppStates.Save) {
				SF.ui.btnSave.children("span").text("Saving...");
			}

			that.fileSaver(0, new Date());
		};
		filesSaver();
		this.saver = setInterval(filesSaver, 5000);
	};

	this.fileSaver = function(fileIndex, saveStarted) {
		this.syncing = true;

		var callback = function() {
			fileIndex++;

			if(that.files.items.length <= fileIndex) {
				fileIndex = 0;

				var timeTook = new Date() - saveStarted;
				saveStarted = new Date();

				if(that.currentApp && that.currentApp.state == that.AppStates.Save) {
					var time = (Math.round(timeTook / 1000));
					time = time <= 0 ? "" : time.toString();
					that.ui.btnSave.children("span").text("Last saved " + time + " seconds ago");
				}

				if(that.afterSyncCycle) {
					that.afterSyncCycle();
					that.afterSyncCycle = null;
				}

				that.syncing = false;
			} else {
				that.fileSaver(fileIndex, saveStarted);
			}
		};
		var file = that.files.items[fileIndex];
		if(file.updated) {
			callback();
			return false;
		}

		$$.ajax({
			url : that.BaseURL + 'server/sync.php',
			type : 'POST',
			dataType : 'json',
			data : {
				id : file.id,
				app_id : that.currentApp.id,
				app_state : that.currentApp.state,
				name : file.name,
				type : file.type,
				content : file.content,
				is_default : file.isDefault ? 1 : 0
			},
			success : function(result) {
				// if result say yes so

				//file.id = result.senchafiddle.file.id;
				file.updated = result.senchafiddle.file.updated;

				//SF.ui.tabList.find("li:has(a[id='file-" + SF.currentFile.id + "']) span").text(name);
				//SF.ui.tabListItems.find("li:has(a[id='file-" + SF.currentFile.id + "']) span").text(name);
			},
			error : function(xmlHTTP, status, msg) {
			},
			complete : callback
		});
	};

	this.pauseSyncing = function() {
		this.sync = false;
	};

	this.resumeSyncing = function() {
		this.sync = true;
	};

	this.onAppViewLoadComplete = function() {
		this.ui.btnRun.children("span").text("Run");
		this.ui.btnRun.removeClass("disabled");
		this.ui.btnRun.bind("click", {
			SF : this
		}, this.run);
	};

	this.beautify = function(e) {
		var SF = this;
		if(e)
			SF = e.data.SF;

		// beautify all files code
		if(SF.currentFile) {
			if(SF.currentFile.type == SF.FileTypes.Main) {
				SF.ui.codeEditor.setOption("mode", "text/html");
			} else if(SF.currentFile.type == SF.FileTypes.CSS || SF.currentFile.type == SF.FileTypes.SCSS || SF.currentFile.type == SF.FileTypes.Style) {
				SF.ui.codeEditor.setOption("mode", "text/css");
			} else {
				SF.ui.codeEditor.setOption("mode", "text/javascript");
			}

			for(var i = 0, e = SF.ui.codeEditor.lineCount(); i < e; ++i) {
				SF.ui.codeEditor.indentLine(i);
			}
		}
	};

	this.share = function(e) {
		var SF = e.data.SF;

		SF.ui.btnShare.unbind("click", SF.share);
		SF.ui.btnShare.removeClass("disabled").addClass("disabled");

		// let user share this whole fiddle, this file or snapshot of the result
		var todo = function() {
			SF.ui.btnShare.removeClass("disabled");
			SF.ui.btnShare.bind("click", {
				SF : SF
			}, SF.share);

			// put 3 share links here
			SF.ui.txtShareLink.val(SF.BaseURL + "#" + SF.currentApp.token);
			SF.ui.txtFullShareLink.val(SF.BaseURL + "full/" + SF.currentApp.token);
			SF.ui.txtIframeShareLink.val('<iframe src="' + SF.BaseURL + 'full/' + SF.currentApp.token + '"></iframe>');

			var li = SF.ui.btnShare.parent();
			if(li.hasClass("active")) {
				li.removeClass("active");
			} else {
				li.addClass("active");
			}
		};
		if(SF.currentApp && SF.currentApp.state == "Save") {
			todo();
		} else {
			SF.afterSyncCycle = todo;
			SF.save(e);
		}
	};

	this.selectAll = function(e) {
		var SF = e.data.SF;
		this.focus();
		this.select();
	};

	this.login = function() {
		// show user popup to login with username and password
	};

	this.addStoreFile = function() {
		// ask file name

		var store = new this.File("Store", this.FileTypes.Store, "");

		var rf = this.files.findByType(this.FileTypes.Store);
		store.name = "Store " + (rf.length + 1) + ".js";
		if(this.STVersion > 1.1) {
			store.content = js_beautify(this.templates.ST2.store());
		} else {
			store.content = js_beautify(this.templates.ST1_1.store());
		}

		this.addFile(store);
	};

	this.addModelFile = function() {
		// ask file name

		var model = new this.File("Model.js", this.FileTypes.Model, "");

		var rf = this.files.findByType(this.FileTypes.Model);
		model.name = "Model " + (rf.length + 1) + ".js";
		if(this.STVersion > 1.1) {
			model.content = js_beautify(this.templates.ST2.model());
		} else {
			model.content = js_beautify(this.templates.ST1_1.model());
		}
		this.addFile(model);
	};

	this.addControllerFile = function() {
		// ask file name

		var controller = new this.File("Controller", this.FileTypes.Controller, "");

		var rf = this.files.findByType(this.FileTypes.Controller);
		controller.name = "Controller " + (rf.length + 1) + ".js";

		this.addFile(controller);
	};
	/*
	 add file to the fiddle
	 type: MODEL, STORE, CONTROLLER
	 */
	this.addFile = function(file) {
		if(file.type == this.FileTypes.Main || file.type == this.FileTypes.App || file.type == this.FileTypes.Viewport || file.type == this.FileTypes.Style || file.type == this.FileTypes.SCSS || file.type == this.FileTypes.CSS) {
			var rf = this.files.findByType(file.type);
			if(rf.length > 0) {
				throw "This type of file can only be added once.";
			}
		}

		var rf = this.files.findByName(file.name);
		if(rf.length > 0) {
			throw "The file name already exists.";
		}

		file.index = this.files.items.length;

		this.files.add(file);
		this.currentFile = file;
		this.ui.codeEditor.setValue(file.content);
		this.beautify();
		this.ui.codeEditor.clearHistory();

		var clasess = "tab active";
		if(file.isDefault) {
			clasess += " default";
		}

		var item = '<li class="pItem"><a id="file-' + file.index + '" class="' + clasess + '"><span>' + file.name + '</span><i class="icon right arrows BArrow"></i></a> </li>';
		this.ui.tabList.find("li a").removeClass("active");
		this.ui.tabList.prepend(item);
		item = '<li><a id="file-' + file.index + '"><span>' + file.name + '</span></a></li>';
		this.ui.tabListItems.append(item);

		var oldWidth = this.ui.tabList.outerWidth(true);
		var newWidth = 0;

		this.ui.tabList.children().each(function(index, li) {
			newWidth += $$(li).outerWidth(true);
		});
		if(newWidth >= oldWidth) {
			this.ui.tabList.css("width", newWidth + "px");
		}

		this.checkQueueButton();
	};

	this.deleteFile = function(file) {
		var SF = this;

		// remove from coll and ui
		SF.files.remove(file);
		SF.ui.tabList.find("li:has(a[id='file-" + file.index + "'])").remove();
		SF.ui.tabListItems.find("li:has(a[id='file-" + file.index + "'])").remove();

		// activate next available file item
		var nextLI = SF.ui.tabList.find("li:first");
		if(nextLI.length > 0) {
			try {
				var a = nextLI.children("a");
				var id = a.attr("id").split("-")[1];
				SF.currentFile = SF.files.fileAt(id);
				SF.ui.codeEditor.setValue(SF.currentFile.content);
				SF.beautify();
				SF.ui.codeEditor.clearHistory();
				a.removeClass("active").addClass("active");
			} catch (e) {
				SF.alert("Oops!", "Some inconsistency occurred in processing your request.");
			}
		} else {
			SF.currentFile = null;
			SF.ui.codeEditor.setValue("");
			SF.ui.codeEditor.clearHistory();
		}
	};

	this.deleteCurrentFile = function(e) {
		// pause sync
		// remove file from server
		// remove file from coll
		// resume sync

		var SF = e.data.SF;

		if(SF.currentFile) {
			SF.confirm("Confirm", "Are you sure you want to delete " + SF.currentFile.name + " file?", function(yes) {
				if(yes) {
					if(!SF.currentApp) {
						SF.deleteFile(SF.currentFile);
					} else {
						var succeed = false;

						SF.pauseSyncing();

						$$.ajax({
							url : SF.BaseURL + 'server/file.php',
							type : 'DELETE',
							data : {
								appid : SF.currentApp.id,
								filename : SF.currentFile.name
							},
							dataType : 'json',
							success : function(response) {
								if(response.senchafiddle.deleted) {
									succeed = true;
									SF.deleteFile(SF.currentFile);
									SF.resumeSyncing();
								}
							},
							error : function() {
								succeed = false;
							},
							complete : function() {
								if(!succeed) {
									SF.alert("Oops!", "Your file was not deleted.");
									SF.resumeSyncing();
								}
							}
						});
					}
				}
			});
		}
	};

	this.renameFile = function(file) {
		SF.currentFile.name = file.name;

		SF.ui.tabList.find("li:has(a[id='file-" + file.index + "']) span").text(file.name);
		SF.ui.tabListItems.find("li:has(a[id='file-" + file.index + "']) span").text(file.name);
	};

	this.renameCurrentFile = function(e) {
		// ask user for new name
		// check if same filename exists
		// pause sync
		// rename file from server
		// rename file from coll
		// resume sync

		var SF = e.data.SF;

		if(SF.currentFile) {
			SF.prompt("Please type new name for the file.", SF.currentFile.name, function(name) {
				if(name != null && name.replace(/ /g, "").length > 0) {
					if(name.indexOf(".js") <= -1) {
						name += ".js";
					}

					if(SF.files.findByName(name).length > 0) {
						SF.alert("Oops!", "This is already existed filename.");
						return false;
					}

					if(!SF.currentApp) {
						SF.currentFile.name = name;
						SF.renameFile(SF.currentFile);
					} else {
						var succeed = false;

						SF.pauseSyncing();

						// to make sure continous sync is done
						while(SF.synching) {
							// do nothing and wait
						}

						$$.ajax({
							url : SF.BaseURL + 'server/file.php',
							type : 'PUT',
							data : {
								appid : SF.currentApp.id,
								oldfilename : SF.currentFile.name,
								newfilename : name
							},
							dataType : 'json',
							success : function(response) {
								if(response.senchafiddle.updated) {
									succeed = true;

									SF.currentFile.name = name;
									SF.renameFile(SF.currentFile);

									SF.resumeSyncing();
								}
							},
							error : function() {
								succeed = false;
							},
							complete : function() {
								if(!succeed) {
									SF.alert("Oops!", "Your file was not renamed.");
									SF.resumeSyncing();
								}
							}
						});
					}
				}
			});
		}
	};
	/*
	 filePath: the path from array
	 */
	this.gotoFile = function(e) {
		// show file from the fiddle using maintained array of files (path is array path)
		var SF = e.data.SF;

		var a = $$(this);

		var id = a.attr("id");

		if(id) {
			id = id.split("-")[1];

			var file = SF.files.fileAt(id);

			if(a.hasClass("active")) {
				SF.showTabContextMenu(e);
			} else {
				SF.currentFile.Cursor = SF.ui.codeEditor.getCursor();

				SF.currentFile = file;
				SF.ui.codeEditor.setValue(file.content);
				SF.beautify();
				SF.ui.codeEditor.clearHistory();
				SF.ui.codeEditor.focus();

				if(file.Cursor) {
					SF.ui.codeEditor.setCursor(file.Cursor);
				} else {
					SF.ui.codeEditor.setCursor({
						line : SF.ui.codeEditor.lineCount()
					});
				}

				SF.ui.tabList.find("li a").removeClass("active");
				SF.ui.tabList.find("li a#file-" + id).removeClass("active").addClass("active");
			}
		}
		return false;
	};

	this.showTabContextMenu = function(e) {
		var SF = e.data.SF;

		if(SF.currentFile.isDefault) {
			return false;
		}

		var a = e.target;
		while(a.nodeName != "A" || a.tagName != 'A') {
			a = e.target.parentNode;
		}
		a = $$(a);

		if(a.hasClass("active") && SF.ui.contextMenu.hasClass("hide")) {
			var btnPos = a.offset();
			var borderWidth = parseInt(SF.ui.contextMenu.children("ul").css("border-bottom-width"), 10);
			var footerPos = SF.ui.footer.offset();
			var x = btnPos.left;
			var y = footerPos.top - SF.ui.contextMenu.height() + borderWidth;

			a.parent().removeClass("CMActive").addClass("CMActive");

			SF.ui.contextMenu.css({
				'top' : y + 'px',
				'left' : x + 'px'
			}).removeClass("hide");

			SF.ui.window.bind("resize", {
				SF : SF
			}, SF.hideTabContextMenu);
			SF.ui.document.bind("mouseup", {
				SF : SF
			}, SF.hideTabContextMenu);
		}
		return false;
	};

	this.hideTabContextMenu = function(e) {
		var SF = e.data.SF;
		SF.ui.contextMenu.addClass("hide");
		SF.ui.window.unbind("resize", SF.hideTabContextMenu);
		SF.ui.document.unbind("mouseup", SF.hideTabContextMenu);
		SF.ui.tabList.find("li.CMActive").removeClass("CMActive");
	};

	this.checkQueueButton = function() {
		this.tabListWidth = this.ui.tabList.outerWidth(true);

		var left = SF.ui.tabList.css("left").replace("px", "");
		left = parseFloat(left);

		var diff = left - this.tabListAvailableWidth;
		diff = diff - (diff * 2);

		if(diff >= this.tabListWidth) {
			this.ui.btnQueueLeft.addClass("disabled");
		} else {
			this.ui.btnQueueLeft.removeClass("disabled");
		}

		if(left >= 0) {
			this.ui.btnQueueRight.addClass("disabled");
		} else {
			this.ui.btnQueueRight.removeClass("disabled");
		}
	};

	this.moveTabsLeft = function(e) {
		if(e)
			e.preventDefault();

		var SF = e.data.SF;

		var left = SF.ui.tabList.css("left").replace("px", "");
		left = parseFloat(left);

		var diff = left - SF.tabListAvailableWidth;
		diff = diff - (diff * 2);

		if(diff < SF.tabListWidth) {
			SF.ui.tabList.css("left", (left - SF.tabListAvailableWidth / 2) + "px");
		}

		SF.checkQueueButton();
	};

	this.moveTabsRight = function(e) {
		if(e)
			e.preventDefault();

		var SF = e.data.SF;

		var left = SF.ui.tabList.css("left").replace("px", "");
		left = parseFloat(left);

		if(left < 0) {
			SF.ui.tabList.css("left", (left + SF.tabListAvailableWidth / 2) + "px");
		}

		SF.checkQueueButton();
	};

	this.alert = function(title, msg) {
		var callback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnAlertOk.unbind("click", callback);
			SF.ui.alertDialog.removeClass("active");
		};

		this.ui.alertTitle.text(title);
		this.ui.alertMsg.html(msg);
		this.ui.btnAlertOk.bind("click", {
			SF : this
		}, callback);
		this.ui.alertDialog.removeClass("active").addClass("active");
	};

	this.confirm = function(title, msg, callback) {
		var yesCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnConfirmYes.unbind("click", yesCallback);
			SF.ui.confirmDialog.removeClass("active");
			callback.call(SF, true);
		};
		var noCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnConfirmNo.unbind("click", noCallback);
			SF.ui.confirmDialog.removeClass("active");
			callback.call(SF, false);
		};

		this.ui.confirmTitle.text(title);
		this.ui.confirmMsg.text(msg);
		this.ui.btnConfirmYes.bind("click", {
			SF : this
		}, yesCallback);
		this.ui.btnConfirmNo.bind("click", {
			SF : this
		}, noCallback);
		this.ui.confirmDialog.removeClass("active").addClass("active");
	};

	this.prompt = function(title, defaultValue, callback) {
		var saveCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnPromptSave.unbind("click", saveCallback);
			SF.ui.promptDialog.removeClass("active");
			callback(SF.ui.txtPrompt.val());
		};
		var cancelCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnPromptCancel.unbind("click", cancelCallback);
			SF.ui.promptDialog.removeClass("active");
			callback(null);
		};

		this.ui.promptTitle.text(title);
		this.ui.txtPrompt.val(defaultValue);
		this.ui.btnPromptSave.bind("click", {
			SF : this
		}, saveCallback);
		this.ui.btnPromptCancel.bind("click", {
			SF : this
		}, cancelCallback);
		this.ui.promptDialog.removeClass("active").addClass("active");
	};

	this.openVersionDialog = function(callback) {
		var btnVersionST2Callback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.STVersion = 2.0;
			SF.ui.btnVersionST2.unbind("click", btnVersionST2Callback);
			SF.ui.versionDialog.removeClass("active");
			callback.call(SF);
		};
		var btnVersionST1_1Callback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.STVersion = 1.1;
			SF.ui.btnVersionST1_1.unbind("click", btnVersionST1_1Callback);
			SF.ui.versionDialog.removeClass("active");
			callback.call(SF);
		};

		this.ui.btnVersionST2.bind("click", {
			SF : this
		}, btnVersionST2Callback);
		this.ui.btnVersionST1_1.bind("click", {
			SF : this
		}, btnVersionST1_1Callback);
		this.ui.versionDialog.removeClass("active").addClass("active");
	};

	this.about = function(title, content) {
		var okCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnAboutOk.unbind("click", okCallback);
			SF.ui.aboutDialog.removeClass("active");
		};

		this.ui.aboutTitle.text(title);
		this.ui.txtAbout.html(content);
		this.ui.btnAboutOk.bind("click", {
			SF : this
		}, okCallback);
		this.ui.aboutDialog.removeClass("active").addClass("active");
	};

	this.feedback = function(title, callback) {
		var sendCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnFeedbackSend.unbind("click", sendCallback);
			SF.ui.feedbackDialog.removeClass("active");
			callback(SF.ui.txtFeedback.val());
		};
		var cancelCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnFeedbackCancel.unbind("click", cancelCallback);
			SF.ui.feedbackDialog.removeClass("active");
			callback(null);
		};

		this.ui.feedbackTitle.text(title);
		this.ui.txtFeedback.val("");
		this.ui.btnFeedbackSend.bind("click", {
			SF : this
		}, sendCallback);
		this.ui.btnFeedbackCancel.bind("click", {
			SF : this
		}, cancelCallback);
		this.ui.feedbackDialog.removeClass("active").addClass("active");
	};

	this.loginSignup = function(title, callback) {
		var loginCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;

			// block ui with loader mask

			var username = SF.ui.txtLoginUsername.val();
			var password = SF.ui.txtLoginPassword.val();

			// try to login with username and password provided
			SF.User.login(username, password, function(token) {
				SF.ui.btnLoginSignupLogin.unbind("click", loginCallback);
				SF.ui.loginSignupDialog.removeClass("active");
				callback(token);
			});
		};
		var cancelCallback = function(e) {
			if(e)
				e.preventDefault();
			var SF = e.data.SF;
			SF.ui.btnLoginSignupCancel.unbind("click", cancelCallback);
			SF.ui.loginSignupDialog.removeClass("active");
			callback(null);
		};

		this.ui.loginSignupTitle.text(title);
		this.ui.btnLoginSignupLogin.bind("click", {
			SF : this
		}, loginCallback);
		this.ui.btnLoginSignupCancel.bind("click", {
			SF : this
		}, cancelCallback);
		this.ui.loginSignupDialog.removeClass("active").addClass("active");
	};
	this.File = function(name, type, content, is_default) {
		this.id = 0;
		this.name = name;
		this.type = type;
		this.content = content;
		this.updated = false;
		this.lastUpdated = new Date();
		this.index = 0;
		this.isDefault = is_default;
		this.Cursor = null;
	};

	this.files = {
		items : [],
		add : function(file) {
			this.items.push(file);
		},
		removeAt : function(index) {
			this.items.splice(index, 1);
		},
		remove : function(item) {
			this.items.splice(item.index, 1);
		},
		fileAt : function(index) {
			for(var i = 0; i < this.items.length; i++) {
				if(this.items[i].index == index) {
					return this.items[i];
				}
			}
			return null;
		},
		findByName : function(name) {
			var rv = [];
			for(var i = 0; i < this.items.length; i++) {
				if(this.items[i].name.toLowerCase() == name.toLowerCase()) {
					rv.push(this.items[i]);
				}
			}
			return rv;
		},
		findByType : function(type) {
			var rv = [];
			for(var i = 0; i < this.items.length; i++) {
				if(this.items[i].type == type) {
					rv.push(this.items[i]);
				}
			}
			return rv;
		}
	};

	this.FileTypes = {
		Main : 'Main',
		CSS : 'CSS',
		SCSS : 'SCSS',
		Style : 'Style',
		App : 'App',
		Viewport : 'Viewport',
		Model : 'Model',
		Store : 'Store',
		Controller : 'Controller'
	};

	this.App = function(name, state, version) {
		this.id = 0;
		this.name = name;
		this.state = state;
		this.version = version;
		this.created = new Date();
		this.token = null;
	};

	this.AppStates = {
		Draft : 'Draft',
		Save : 'Save'
	};

	this.createApp = function(app, callback) {
		var succeed = false;

		var user_token = "";
		if(this.User.loggedIn()) {
			user_token = this.User.getToken();
		}

		$$.ajax({
			url : that.BaseURL + 'server/app.php?action=add',
			type : 'POST',
			dataType : 'json',
			data : {
				name : app.name,
				state : app.state,
				version : app.version,
				user_token : user_token
			},
			success : function(response) {
				try {
					app.id = response.senchafiddle.app.id;
					app.token = response.senchafiddle.app.token;
					succeed = true;
				} catch (e) {
					//console.log(e.msg);
				}
			},
			error : function(xmlHTTP, status, msg) {
				succeed = false;
			},
			complete : function() {
				callback(app, succeed);
			}
		});
	};

	this.Tip = function(Title, Details) {
		this.Title = Title;
		this.Details = Details;
	};

	this.Tips = {
		entries : [],
		current : 0,
		add : function(tip) {
			this.entries.push(tip);
			this.current = this.entries.length - 1;
		},
		removeAt : function(index) {
			this.entries.slice(index, 1);
		},
		remove : function(tip) {
			var indexes = [];
			for(var i = 0; i < this.entries.length; i++)
			if(this.entries[i] == tip)
				indexes.push(i);
			for(var i = 0; i < indexes.length; i++)
			this.entries.splice(indexes[i], 1);
		},
		prev : function() {
			if(this.current <= 0)
				return null;

			// return prev item
			return this.entries[this.current - 1];
		},
		prevHandler : function(e) {
			var SF = e.data.SF;

			var tip = SF.Tips.prev();
			if(tip) {
				SF.Tips.current--;
			} else {
				SF.Tips.current = SF.Tips.entries.length - 1;
			}
			SF.Tips.updateTip(SF);
		},
		next : function() {
			if(this.current >= this.entries.length - 1)
				return null;

			// return next item
			return this.entries[this.current + 1];
		},
		nextHandler : function(e) {
			var SF = e.data.SF;

			var tip = SF.Tips.next();
			if(tip) {
				SF.Tips.current++;
			} else {
				SF.Tips.current = 0;
			}
			SF.Tips.updateTip(SF);
		},
		updateTip : function(SF) {
			// update tip bar here
			var tip = this.entries[this.current];
			SF.ui.tip.children("span").html(tip.Title);
			SF.ui.tipDetail.html(tip.Details);

			if(this.entries.length > 1) {
				SF.ui.btnPrevTip.removeClass("disabled");
				SF.ui.btnNextTip.removeClass("disabled");
			} else {
				SF.ui.btnPrevTip.addClass("disabled");
				SF.ui.btnNextTip.addClass("disabled");
			}
		}
	};

	this.User = {
		loginWithGoogle : function() {

		},
		loginWithFacebook : function() {

		},
		loginWithTwitter : function() {

		},
		loginWithYahoo : function() {

		},
		loginWithLinkedIn : function() {

		},
		loginWithOpenId : function() {

		},
		login : function(username, password, successCallback) {
			var succeed = false;

			$$.ajax({
				url : SF.BaseURL + 'server/user.php?action=login',
				type : 'POST',
				data : {
					email : username,
					pwd : password
				},
				dataType : 'json',
				success : function(response) {
					succeed = true;

					if(response.senchafiddle.user && response.senchafiddle.user.token) {
						// callback with token
						successCallback(response.senchafiddle.user.token);
					} else {
						var errorMsg = "Login failed.";

						if(response.senchafiddle.error) {
							errorMsg += " " + response.senchafiddle.error;
						} else {
							errorMsg += " Please check your username and password.";
						}

						SF.alert("Oops!", errorMsg);
					}
				},
				error : function() {
					succeed = false;
				},
				complete : function() {
					if(!succeed) {
						SF.alert("Oops!", "Login failed. Please check your username and password.");
					}
				}
			});
		},
		loggedIn : function() {
			return ($$.cookies.get("user_token") != null);
		},
		getToken : function() {
			return $$.cookies.get("user_token");
		}
	};
}