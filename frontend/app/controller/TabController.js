Ext.define('SF.controller.TabController', {
	extend : 'Ext.app.Controller',

	refs : [{
		ref : 'tabs',
		selector : 'container[cls=tabs]'
	}, {
		ref : 'addMenu',
		selector : 'button[cls=button addTab] > menu'
	}, {
		ref : 'tabList',
		selector : 'button[cls=button switchTab] > menu'
	}, {
		ref : 'tabSubMenu',
		selector : 'button[cls=tab] > menu[cls=tabSubMenu]'
	}, {
		ref : 'tabsBackwardButton',
		selector : 'button[cls=button tabsBackward]'
	}, {
		ref : 'tabsForwardButton',
		selector : 'button[cls=button tabsForward]'
	}],

	init : function() {
		this.control({
			'button[cls=tab], button[cls=tab active]' : {
				click : this.switchTab
			},
			'button[cls=button switchTab] > menu' : {
				click : this.gotoTab
			},
			'button[cls=button addTab] > menu' : {
				click : this.addTab
			},
			'button[cls=tab] > menu > menuitem[text=Rename]' : {
				click : this.renameTab
			},
			'button[cls=tab] > menu > menuitem[text=Delete]' : {
				click : this.deleteTab
			},
			'button[cls=button tabsBackward]' : {
				click : this.moveTabsBackward
			},
			'button[cls=button tabsForward]' : {
				click : this.moveTabsForward
			}
		});

	},

	onLaunch : function() {

	},

	addBasicTabs : function() {
		var fileTemplateStore = this.application.getStore('FileTemplateStore');
		var fileStore = this.application.getStore('FileStore');

		// style.css tab

		var styleTab = Ext.create('Ext.Button', {
			cls : 'tab',
			text : 'style.css'
		});

		var styleTabItem = Ext.create('Ext.menu.Item', {
			cls : 'gotoTab',
			itemId : styleTab.getId(),
			text : 'style.css'
		});

		// sometimes doesn't work onload see'
		var styleFileTemplateRecord = fileTemplateStore.findRecord('type', 'CSS');
		var styleFileTemplate = '';
		if (styleFileTemplateRecord) {
			styleFileTemplate = styleFileTemplateRecord.get('content');
		}

		var styleFile = Ext.create('SF.model.FileModel', {
			domid : styleTab.getId(),
			name : 'style.css',
			type : 'CSS',
			content : styleFileTemplate
		});

		fileStore.add(styleFile);

		this.getTabs().insert(0, styleTab);
		this.getTabList().add(styleTabItem);
		this.switchTab(styleTab);

		// app.js tab

		var appTab = Ext.create('Ext.Button', {
			cls : 'tab',
			text : 'app.js'
		});

		var appTabItem = Ext.create('Ext.menu.Item', {
			cls : 'gotoTab',
			itemId : appTab.getId(),
			text : 'app.js'
		});

		var appFileTemplateRecord = fileTemplateStore.findRecord('type', 'App');
		var appFileTemplate = '';
		if (appFileTemplateRecord) {
			appFileTemplate = appFileTemplateRecord.get('content');
		}

		// add basic files to FileStore
		var appFile = Ext.create('SF.model.FileModel', {
			domid : appTab.getId(),
			name : 'app.js',
			type : 'App',
			content : appFileTemplate
		});

		fileStore.add(appFile);

		this.getTabs().insert(0, appTab);
		this.getTabList().add(appTabItem);
		this.switchTab(appTab);

		this.checkTabsMoveButtons();
	},

	addTab : function(menu, item, e, events) {
		var fileTemplateStore = this.application.getStore('FileTemplateStore');
		var fileStore = this.application.getStore('FileStore');

		var targetTabs = this.getTabs().query("button[iconCls=" + item.text.toLowerCase() + "Tab]");

		var tabName = item.text + '_' + (targetTabs.length + 1) + ".js";

		var tab = Ext.create('Ext.Button', {
			cls : 'tab',
			menu : null,
			iconCls : item.text.toLowerCase() + 'Tab',
			text : tabName,
			menu : {
				cls : 'tabSubMenu upsideDown',
				items : [{
					text : 'Delete'
				}, {
					text : 'Rename'
				}]
			}
		});

		var tabItem = Ext.create('Ext.menu.Item', {
			itemId : tab.getId(),
			cls : 'gotoTab',
			iconCls : item.text.toLowerCase() + 'Tab',
			text : tabName
		});

		var fileTemplateRecord = fileTemplateStore.findRecord('type', item.text);
		var fileTemplate = '';
		if (fileTemplateRecord) {
			fileTemplate = fileTemplateRecord.get('content');
		}

		var tabFile = Ext.create('SF.model.FileModel', {
			name : tabName,
			type : item.text,
			content : fileTemplate,
			domid : tab.getId()
		});

		fileStore.add(tabFile);

		this.getTabs().insert(0, tab);
		this.getTabList().add(tabItem);
		this.switchTab(tab);

		this.checkTabsMoveButtons();
	},

	getCurrentTab : function() {
		var activeTabs = Ext.Array.filter(this.getTabs().query('button[cls=tab]'), function(tab, index, tabs) {
			return tab.hasCls('active');
		});

		if (activeTabs.length > 0) {
			return activeTabs[0];
		}

		return null;
	},

	getLinkTabByTab : function(tabId) {
		var activeLinkTabs = this.getTabList().query('*[itemId=' + tabId + ']');

		if (activeLinkTabs.length > 0) {
			return activeLinkTabs[0];
		}

		return null;
	},

	addTempTabs : function(n) {
		var tab = null;
		for (var t = 0; t < n; t++) {
			tab = Ext.create('Ext.Button', {
				cls : 'tab',
				arrowCls : 'arrow',
				text : 'Button' + (t + 1)
			});
			this.getTabs().insert(0, tab);
			this.switchTab(tab);
		}
	},

	gotoTab : function(sender, item, e, events) {
		if (item) {
			var targetTab = this.getTabs().getComponent(item.getItemId());
			this.switchTab(targetTab);
		}
	},

	switchTab : function(sender, e, obj) {
		if (!sender.hasCls('active')) {
			// remove active class from button.tab
			var tabs = this.getTabs();
			for (var t = 0; t < tabs.items.length; t++) {
				tabs.items.get(t).removeCls("active");
			}

			// put active class on current button
			sender.addCls("active");
			sender.hideMenu();

			var fileRecord = this.getRecordByTab(sender);

			var editorController = this.getController('EditorController');
			editorController.setContent(fileRecord.get('content'));
			editorController.getEditor().getCodeEditor().clearHistory();
			editorController.getEditor().getCodeEditor().focus();
			editorController.getEditor().getCodeEditor().setCursor({
				line : editorController.getEditor().getCodeEditor().lineCount()
			});
		}
	},

	renameTab : function(sender, e, events) {
		var callback = function(answer, filename) {
			if (answer == "ok") {
				var currentTab = this.getCurrentTab();
				var currentLinkTab = this.getLinkTabByTab(currentTab.getId());
				var currentRecord = this.getRecordByTab(currentTab);

				currentTab.setText(filename);
				currentLinkTab.setText(filename);
				currentRecord.set('name', filename);
			}
		};

		var tabName = sender.up("button").getText();

		Ext.Msg.prompt('Please type new name for the file', '', callback, this, false, tabName);
	},

	deleteTab : function(sender, e, events) {
		var callback = function(answer) {
			if (answer == "yes") {
				var currentTab = this.getCurrentTab();
				var currentLinkTab = this.getLinkTabByTab(currentTab.getId());
				var currentRecord = this.getRecordByTab(currentTab);

				this.getTabs().remove(currentTab);
				this.getTabList().remove(currentLinkTab);
				this.application.getStore('FileStore').remove(currentRecord);

				this.switchTab(this.getTabs().items.get(0));
			}
		};

		var tabName = sender.up("button").getText();

		Ext.Msg.confirm('Confirm to delete file permanently', 'Are you sure you want to delete ' + tabName + ' file?', callback, this);
	},

	getRecordByTab : function(tab) {
		var fileStore = this.application.getStore('FileStore');
		var tabRecord = fileStore.findRecord("domid", tab.getId());
		return tabRecord;
	},

	getAllTabsWidth : function() {
		var width = 0;

		var tabs = this.getTabs();

		var tabsPos = tabs.getBox();

		var lastTabX = tabsPos.x;

		for (var t = 0; t < tabs.items.length; t++) {
			var tab = tabs.items.get(t);

			var tabPos = tab.getBox();

			var posDiff = tabPos.x - lastTabX;

			lastTabX = tabPos.x + tabPos.width;

			width += tab.getWidth() + posDiff;
		}

		return width;
	},

	getAllTabsWidth : function() {
		var tabs = this.getTabs();

		var lastTab = tabs.items.get(tabs.items.length - 1);

		var lastTabPos = lastTab.getBox(true);

		var tabsWidth = lastTabPos.x + lastTabPos.width;

		return tabsWidth;
	},

	getTabsContainerLeft : function(left) {
		return parseFloat(this.getTabs().getEl().down('*').down('*').dom.style.left);
	},

	setTabsContainerLeft : function(left) {
		this.getTabs().getEl().down('*').down('*').dom.style.left = left + "px";
	},

	checkTabsMoveButtons : function() {
		var availableWidth = this.getTabs().getWidth();
		var occupiedWidth = this.getAllTabsWidth();

		if (availableWidth < occupiedWidth) {
			// check for arrows state

			var off = occupiedWidth - availableWidth;
			var tabsLeft = this.getTabsContainerLeft();

			if ((off + tabsLeft) > 0) {
				// enable backward button
				this.getTabsBackwardButton().setDisabled(false);
			} else {
				// disable backward button
				this.getTabsBackwardButton().setDisabled(true);
			}

			if (tabsLeft >= 0) {
				// disable forward button
				this.getTabsForwardButton().setDisabled(true);
			} else {
				// enable forward button
				this.getTabsForwardButton().setDisabled(false);
			}
		}
	},

	moveTabsBackward : function(sender, e, obj) {
		var availableWidth = this.getTabs().getWidth();
		var occupiedWidth = this.getAllTabsWidth();

		if (availableWidth < occupiedWidth) {

			var off = occupiedWidth - availableWidth;
			var tabsLeft = this.getTabsContainerLeft();

			var toMove = availableWidth;

			if ((off + tabsLeft) < availableWidth) {
				toMove = off;
			}

			this.setTabsContainerLeft(-toMove);
		}

		this.checkTabsMoveButtons();
	},

	moveTabsForward : function() {
		var availableWidth = this.getTabs().getWidth();
		var occupiedWidth = this.getAllTabsWidth();

		if (availableWidth < occupiedWidth) {

			var off = occupiedWidth - availableWidth;
			var tabsLeft = this.getTabsContainerLeft();

			var toMove = availableWidth + tabsLeft;

			if ((availableWidth + tabsLeft) >= 0) {
				toMove = tabsLeft - tabsLeft;
			}

			this.setTabsContainerLeft(toMove);
		}

		this.checkTabsMoveButtons();
	}
});
