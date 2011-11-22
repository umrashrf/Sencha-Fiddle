function SenchaFiddle($$) {
    this.init = function () {
        var windowHeight = $$(window).height();
        var headerHeight = $$(".headerOuterWrapper").height();
        var footerHeight = $$(".footer").height();
        var occupiedHeight = headerHeight + footerHeight;
        var remainingHeight = windowHeight - occupiedHeight;
        $$(".contentOuterWrapper").height(remainingHeight);

        this.tabList = $$("#tabList");
        this.tabListWidth = this.tabList.parent().width();
    };

    this.run = function () {
    };

    this.save = function () {
    };

    this.beutify = function () {
    };

    this.share = function () {
    };

    this.login = function () {
    };

    /*
    type: MODEL, STORE, CONTROLLER
    */
    this.addFile = function (type) {

    };

    /*
    filePath: the path from array
    */
    this.openFile = function (filePath) {
    };

    this.moveTabsLeft = function (e) {
        if (e) e.preventDefault();

        var left = this.tabList.css("left").replace("px", "");
        this.tabList.css("left", (parseFloat(left) - this.tabListWidth) + "px");
    };

    this.moveTabsRight = function (e) {
        if (e) e.preventDefault();

        var left = this.tabList.css("left").replace("px", "");
        this.tabList.css("left", (parseFloat(left) + this.tabListWidth) + "px");
    };
}