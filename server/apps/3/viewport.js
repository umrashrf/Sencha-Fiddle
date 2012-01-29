SenchaFiddle.views.Viewport = Ext.extend(Ext.Panel, {
    fullscreen: true,
    dockedItems: [
        {
            xtype: 'toolbar',
            title: 'Sencha Fiddle'
        }
    ],
    items: [
        {
            xtype: 'panel',
            cls: 'fbPanel',
            html: '<iframe src="//www.facebook.com/plugins/activity.php?site=senchafiddle.com&amp;width=300&amp;height=300&amp;header=true&amp;colorscheme=light&amp;linktarget=_blank&amp;border_color&amp;font&amp;recommendations=true&amp;appId=107914269266720" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:300px; height:300px;" allowTransparency="true"></iframe>'        
        }
    ]
});