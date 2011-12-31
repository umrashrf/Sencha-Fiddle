var SenchaFiddleApp = new Ext.Application({ 
    name: 'Sencha Fiddle App', 
    launch: function() { 
        Ext.Ajax.request({
            url: SF.proxy('http://api.twitter.com/1/statuses/public_timeline.xml'),
            success: function(response, opts) {
                console.log(response);
            }
        });
        this.views.viewport = new this.views.Viewport();
    } 
});