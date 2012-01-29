Ext.application({
    name: 'SenchaFiddle',
    fullscreen: true,
            
    launch: function() {
        Ext.create('Ext.Panel', {
            fullscreen: true,
            html: 'Hello from your first Sencha Touch App made by Sencha Fiddle.'
        });
    }
});