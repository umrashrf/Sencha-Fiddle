Ext.define('SF.controller.TipController', {
	extend : 'Ext.app.Controller',

	config : {
		currentTipIndex : 0
	},

	refs : [{
		ref : 'tipContainer',
		selector : 'button[cls=tip tipText]'
	}],

	init : function() {
		this.control({
			'button[cls=tip tipText]' : {
				click : this.showTipDetails
			},
			'button[cls=button tip][text=<]' : {
				click : this.prevTip
			},
			'button[cls=button tip][text=>]' : {
				click : this.nextTip
			}
		});
	},

	onLaunch : function() {

	},

	printTip : function() {
		var tipStore = this.application.getStore('TipStore');

		if (this.getCurrentTipIndex() < 0) {
			this.setCurrentTipIndex(tipStore.getCount() - 1);
		}

		if (this.getCurrentTipIndex() >= tipStore.getCount()) {
			this.setCurrentTipIndex(0);
		}

		var theTip = tipStore.getAt(this.getCurrentTipIndex());

		this.getTipContainer().update(theTip.get('title'));
	},

	showTipDetails : function(sender, e, eOpts) {
		var tipStore = this.application.getStore('TipStore');
		var theTip = tipStore.getAt(this.getCurrentTipIndex());

		Ext.Msg.alert('Tip', theTip.get('content'));
	},

	prevTip : function(sender, e, eOpts) {
		this.setCurrentTipIndex(this.getCurrentTipIndex() - 1);
		this.printTip();
	},

	nextTip : function(sender, e, eOpts) {
		this.setCurrentTipIndex(this.getCurrentTipIndex() + 1);
		this.printTip();
	}
});
