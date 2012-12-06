Ext.define('SF.controller.AppController', {
	extend : 'Ext.app.Controller',

	config : {
		lastSavedTime : 0,
		statusInterval : null
	},

	refs : [],

	init : function() {
		this.storesLoaded = 0;
		this.storesToLoad = ['TipStore', 'FileTemplateStore'];

		for (var s = 0; s < this.storesToLoad.length; s++) {
			this.application.getStore(this.storesToLoad[s]).load({
				scope : this,
				callback : this.storeLoaded
			});
		}
	},

	onLaunch : function() {
		if (!this.loadPanel) {
			this.loadPanel = Ext.create('Ext.Panel', {
				cls : 'floating-panel',
				floating : true,
				centered : true,
				minWidth : 200,
				height : 100,
				renderTo : Ext.getBody(),
				layout : {
					type : 'vbox',
					align : 'center',
					pack : 'center'
				},
				items : [{
					xtype : 'container',
					html : 'Loading Application Files...'
				}]
			});
		}

		Ext.getBody().mask();
		this.loadPanel.show();
	},

	storeLoaded : function(records, opt, success) {
		this.storesLoaded++;

		if (this.storesLoaded >= this.storesToLoad.length) {
			this.loadApp();
			this.getController('TipController').printTip();
		}
	},

	loadApp : function() {
		this.loadPanel.hide();
		Ext.getBody().unmask();

		// if is it existing app?

		var isExistingApp = this.getRequestedApp();

		if (isExistingApp) {

			// Ext.History.getToken();
			var tokenParts = isExistingApp;

			// create and new app to AppStore
			var newApp = Ext.create('SF.model.AppModel', {
				state : 'Draft',
				// version : '1.0'
			});

			var appStore = this.application.getStore('AppStore');
			appStore.add(newApp);

			// load files from existing app into this app

			var fileStore = this.application.getStore('FileStore');

			fileStore.load({
				params : {
					app_token : tokenParts[tokenParts.length - 1],
					// user_token : 'fghij'
				},
				callback : function(records, operation, success) {

					if (success) {

						// add existing app file tabs

						var tab = null, tabMenu;

						var tabController = this.getController('TabController');

						for (var r = 0; r < records.length; r++) {
							tab = Ext.create('Ext.Button', {
								cls : 'tab',
								arrowCls : 'arrow',
								text : records[r].get('name')
							});

							tabMenu = Ext.create('Ext.menu.Item', {
								cls : 'gotoTab',
								itemId : tab.getId(),
								text : records[r].get('name')
							});

							records[r].set('domid', tab.getId());

							tabController.getTabs().insert(0, tab);
							tabController.getTabList().add(tabMenu);
							tabController.switchTab(tab);
						}

					} else {

						// prompt error that this app is invalid or private what so ever
					}
				},
				scope : this
			});

		} else {

			// create and new app to AppStore
			var newApp = Ext.create('SF.model.AppModel', {
				state : 'Draft',
				// version : '1.0'
			});

			var appStore = this.application.getStore('AppStore');
			appStore.add(newApp);

			var tabController = this.getController('TabController');
			tabController.addBasicTabs();
		}
	},

	getRequestedApp : function() {
		var url = window.location.href;

		// split by /#/ or /!/
		url = url.split(new RegExp("/[#!]/|/$"));

		// remove feces from start
		url.length > 1 ? url.splice(0, 1) : url;

		// remove feces from end
		url.length > 1 ? url.splice(-1, 1) : url;

		// if url contains only one item and if it is empty nullify it
		url = url.length == 1 ? url[0].length < 1 ? null : url : url;

		return url;
	},

	loadExistingApp : function() {

	},

	onRun : function(sender, e, obj) {
		var me = this;

		var token = '';

		var afterSync = function() {
			// just refresh result view

			var iframe = '<iframe scrolling="no" frameborder="0" width="100%" height="100%" src="{src}"></iframe>';
			iframe = iframe.replace('{src}', API_ENDPOINT + '/full/' + token + '/');

			var resultController = me.getController('ResultController');
			resultController.getResultView().update(iframe);

			setTimeout(function() {
				sender.setText('Run');
				sender.setDisabled(false);
			}, 1000);
		};

		// check if the app was created

		var appStore = me.application.getStore('AppStore');
		var fileStore = me.application.getStore('FileStore');

		if (appStore.data.length > 0) {
			var appRecord = appStore.data.items[appStore.data.length - 1];
			if (appRecord.get('token').length <= 0) {
				sender.setDisabled(true);
				sender.setText('Building...');

				appStore.sync({
					success : function(appBatch, appOptions) {

						if (appStore.data.length > 0) {
							var appRecord = appStore.data.items[appStore.data.length - 1];
							if (appRecord.get('token').length > 0) {

								// change all files appid to app id
								for (var f = 0; f < fileStore.getCount(); f++) {
									var file = fileStore.getAt(f);
									file.set('appid', appRecord.get('id'));
								}

								token = appRecord.get('token');
							}
						}

						fileStore.sync({
							success : function(fileBatch, fileOptions) {
								fileStore.on('add', me.onFileAdd, me);
								fileStore.on('update', me.onFileUpdate, me);
								fileStore.on('remove', me.onFileRemove, me);

								afterSync();
							},
							failure : function(fileBatch, fileOptions) {
								me.resetButtons(sender);
								alert('File(s) were failed to be saved. Please try again.');
							},
							scope : me
						});

					},
					failure : function(appBatch, appOptions) {
						me.resetButtons(sender);
						alert('App was failed to be saved. Please try again.');
					},
					scope : me
				});

				return;

			} else {
				token = appRecord.get('token');
			}
		}

		sender.setDisabled(true);
		sender.setText('Running...');

		afterSync();
	},

	// same as Run but app status changed to "Save"
	onSave : function(sender, e, obj) {
		var me = this;

		var token = '';

		var afterSync = function() {
			me.setLastSavedTime(new Date().getTime());
			me.setStatusInterval(setInterval(function() {
				Ext.callback(me.updateSaveStatus, me);
			}, 500));

			// update share menu
			var menuController = me.getController('MenuController');
			menuController.getLinkShareField().setValue(window.location.href.split('#')[0] + '#' + token + '/');
			menuController.getFullShareField().setValue(API_ENDPOINT + '/full/' + token + '/');
			menuController.getEmbedShareField().setValue('<iframe src="' + API_ENDPOINT + '/full/' + token + '/"></iframe>');
		};

		var appStore = me.application.getStore('AppStore');
		var fileStore = me.application.getStore('FileStore');

		if (appStore.data.length > 0) {
			var appRecord = appStore.data.items[appStore.data.length - 1];
			appRecord.set('state', 'Save');

			appStore.sync({
				success : function(batch, options) {

					appRecord = appStore.data.items[appStore.data.length - 1];

					if (appRecord.get('token').length > 0) {
						if (window.location.href.indexOf('#') < 0) {

							// there is no # in url
							window.location = '#/' + appRecord.get('token') + '/';

						} else {
							window.location += '!/' + appRecord.get('token') + '/';
						}

						token = appRecord.get('token');
					}

					if (appStore.data.length > 0) {
						var appRecord = appStore.data.items[appStore.data.length - 1];
						if (appRecord.get('token').length > 0) {

							// change all files appid to app id
							for (var f = 0; f < fileStore.getCount(); f++) {
								var file = fileStore.getAt(f);
								file.set('appid', appRecord.get('id'));
							}
						}
					}

					fileStore.sync({
						success : function(fileBatch, fileOptions) {
							fileStore.on('add', me.onFileAdd, me);
							fileStore.on('update', me.onFileUpdate, me);
							fileStore.on('remove', me.onFileRemove, me);

							afterSync();
						},
						failure : function(fileBatch, fileOptions) {
							me.resetButtons(sender);
							alert('File(s) were failed to be saved. Please try again.');
						},
						scope : me
					});

				},
				failure : function(batch, options) {
					me.resetButtons(sender);
					alert('App was failed to be saved. Please try again.');
				},
				scope : this
			});
		}

		sender.setDisabled(true);
		sender.setText('Saving...');
	},

	onShare : function(sender, e, obj) {
		var me = this;

		var appStore = me.application.getStore('AppStore');

		if (appStore.data.length > 0) {
			var appRecord = appStore.data.items[appStore.data.length - 1];

			if (appRecord.get('state') == 'Save') {
				return false;
			}
		}

		var token = '';

		var afterSync = function() {
			me.setLastSavedTime(new Date().getTime());
			Ext.callback(me.updateSaveStatus, me);

			me.setStatusInterval(setInterval(function() {
				Ext.callback(me.updateSaveStatus, me);
			}, 500));

			// update share menu
			var menuController = me.getController('MenuController');
			menuController.getLinkShareField().setValue(window.location.href.split('#')[0] + '#' + token + '/');
			menuController.getFullShareField().setValue(API_ENDPOINT + '/full/' + token + '/');
			menuController.getEmbedShareField().setValue('<iframe src="' + API_ENDPOINT + '/full/' + token + '/"></iframe>');

			sender.setDisabled(false);
			sender.showMenu();
		};

		sender.hideMenu();
		sender.setDisabled(true);

		var menuController = me.getController('MenuController');
		var saveButton = menuController.getSaveButton();
		saveButton.setDisabled(true);
		saveButton.setText('Saving...');

		if (appStore.data.length > 0) {
			var appRecord = appStore.data.items[appStore.data.length - 1];
			appRecord.set('state', 'Save');
		}

		var fileStore = me.application.getStore('FileStore');

		appStore.sync({
			success : function(batch, options) {

				appRecord = appStore.data.items[appStore.data.length - 1];

				if (appRecord.get('token').length > 0) {
					if (window.location.href.indexOf('#') < 0) {

						// there is no # in url
						window.location = '#/' + appRecord.get('token') + '/';

					} else {
						window.location += '!/' + appRecord.get('token') + '/';
					}

					// change all files appid to app id
					for (var f = 0; f < fileStore.getCount(); f++) {
						var file = fileStore.getAt(f);
						file.set('appid', appRecord.get('id'));
					}

					token = appRecord.get('token');
				}

				fileStore.sync({
					success : function(fileBatch, fileOptions) {
						fileStore.on('add', me.onFileAdd, me);
						fileStore.on('update', me.onFileUpdate, me);
						fileStore.on('remove', me.onFileRemove, me);

						afterSync();
					},
					failure : function(fileBatch, fileOptions) {
						me.resetButtons(sender);
						alert('File(s) were failed to be saved. Please try again.');
					},
					scope : me
				});

			},
			failure : function(batch, options) {
				me.resetButtons(sender);
				alert('App was failed to be saved. Please try again.');
			},
			scope : this
		});
	},

	onDownload : function(sender, e, obj) {
		sender.setDisabled(true);

		Ext.Msg.confirm('Wait!', 'The dialog box would show now to let you download the app in zip. Some browsers doesn\'t let us name the file so don\'t forget to name the file whatever you want but end it with <b>.zip</b><br><br>Do you want to go get it?', function(buttonId) {
			if (buttonId == "yes") {
				var zip = new JSZip();

				zip.folder("app");
				zip.folder("app/model");
				zip.folder("app/store");
				zip.folder("app/view");
				zip.folder("app/controller");
				zip.folder("resources");
				zip.folder("resources/img");
				zip.folder("resources/css");
				zip.folder("resources/scss");
				zip.folder("resources/libs");

				var fileStore = this.application.getStore('FileStore');

				fileStore.each(function(file) {

					switch (file.get('type')) {
						case 'CSS':
							zip.add("resources/css/" + file.get('name'), file.get('content'));
							break;
						case 'Viewport':
							zip.add("app/view/" + file.get('name'), file.get('content'));
							break;
						case 'Model':
							zip.add("app/model/" + file.get('name'), file.get('content'));
							break;
						case 'Store':
							zip.add("app/store/" + file.get('name'), file.get('content'));
							break;
						case 'View':
							zip.add("app/view/" + file.get('name'), file.get('content'));
							break;
						case 'Controller':
							zip.add("app/controller/" + file.get('name'), file.get('content'));
							break;
						default:
							zip.add(file.get('name'), file.get('content'));
					}

				}, this);

				var index = ['<!DOCTYPE html>', '<html>', '<head>', '<title>Sencha Touch App by Sencha Fiddle</title>', '<link type="text/css" href="resources/css/sencha-touch.css" rel="stylesheet" />', '<link type="text/css" href="resources/css/style.css" rel="stylesheet" />', '<script type="text/javascript" src="resources/libs/sencha-touch-all-debug.js"></script>', '<script type="text/javascript" src="app.js"></script>', '</head>', '<body>', '</body>', '</html>'];
				zip.add("index.html", index.join(''));

				zip.add("README.txt", "Please don't forget to add sencha touch CSS and JavaScript files to the app folder. Put sencha-touch.css inside resources/css/ and put sencha-touch-debug.js inside resources/libs/");

				content = zip.generate();
				location.href = "data:application/zip;base64," + content;
			}
		}, this);

		sender.setDisabled(false);
	},

	onFileAdd : function(store, records, index, eOpts) {
		var appStore = this.application.getStore('AppStore');

		if (appStore.data.length > 0) {

			var appRecord = appStore.data.items[appStore.data.length - 1];

			if (appRecord.get('token').length > 0) {

				// we're updating file and onFileUpdate will be called
				for (var r = 0; r < records.length; r++) {
					records[r].set('appid', appRecord.get('id'));
				}
			}
		}
	},

	onFileUpdate : function(store, record, operation, modifiedFieldNames, eOpts) {
		var oldFilename = record.raw.name;
		record.set('oldname', oldFilename);

		store.sync({
			success : function() {
				this.setLastSavedTime(new Date().getTime());
			},
			scope : this
		});
	},

	onFileRemove : function(store, record, index, eOpts) {
		store.sync({
			success : function() {
				this.setLastSavedTime(new Date().getTime());
			},
			scope : this
		});
	},

	updateSaveStatus : function() {
		var ago = prettyDate(new Date(this.getLastSavedTime()));

		ago = "Last saved " + ago;

		var menuController = this.getController('MenuController');
		menuController.getSaveButton().setText(ago);
	},

	resetButtons : function(callee) {
		if (callee.hasCls('run')) {
			callee.setText('Run');
			callee.setDisabled(false);

		} else if (callee.hasCls('save')) {
			callee.setDisabled(false);
			callee.setText('Save');

		} else if (callee.hasCls('share')) {
			var menuController = this.getController('MenuController');
			var saveButton = menuController.getSaveButton();
			saveButton.setDisabled(false);
			saveButton.setText('Save');

			callee.setDisabled(false);
		}
	}
});
