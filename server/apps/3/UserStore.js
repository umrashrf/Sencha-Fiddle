var userStore = new Ext.data.Store({
    model : ' User',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        url    :  'http://local.senchafiddle.com/local/v8/server/proxy.php?url=' + encodeURI('http://some-address-link/api/getPublished.xml'),
        reader: {
            type: 'xml',
            root    : 'qoutes',
            record  : 'qoute'
        }
    }
});