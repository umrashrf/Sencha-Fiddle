var userStore = new Ext.data.Store({
    model : ' User',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        url: SF.proxy('http://some-address-link/api/getPublished.xml'),
        reader: {
            type: 'xml',
            root    : 'qoutes',
            record  : 'qoute'
        }
    }
});