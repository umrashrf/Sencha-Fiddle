var userStore = new Ext.data.Store({
    model : ' User',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        url    :  SF.proxy('http://api.twitter.com/1/statuses/public_timeline.xml'),
        reader: {
            type: 'xml',
            root    : 'statuses',
            record  : 'status'
        }
    }
});