function SenchaFiddle($$) {
    var that = this;

    // local
    this.BaseURL = 'http://local.senchafiddle.com/local/v8/';

    // server
    //this.BaseURL = 'http://senchafiddle.com/';

    this.init = function () {
        this.ui = {
            window: $$(window),
            document: $$(document),
            tip: $$("#tip span"),
            tipDetail: $$("#tip #tipDetail"),
            btnRun: $$("#btnRun"),
            btnSave: $$("#btnSave"),
            btnBeautify: $$("#btnBeautify"),
            btnShare: $$("#btnShare"),
            txtShareLink: $$("#txtShareLink"),
            txtFullShareLink: $$("#txtFullShareLink"),
            txtIframeShareLink: $$("#txtIframeShareLink"),
            tabList: $$("#tabList"),
            tabListItems: $$("#tabListItems"),
            btnQueueLeft: $$("#btnQueueLeft"),
            btnQueueRight: $$("#btnQueueRight"),
            headerOuterWrapper: $$(".headerOuterWrapper"),
            contentOuterWrapper: $$(".contentOuterWrapper"),
            textareaOuterWrapper: $$(".textareaOuterWrapper"),
            handler: $$("#handler"),
            resultOuterWrapper: $$(".resultOuterWrapper"),
            footer: $$(".footer"),
            appView: $$("#appView"),
            overlay: $$("#overlay"),
            contextMenu: $$("#contextMenu"),
            btnRename: $$("#btnRename"),
            btnDelete: $$("#btnDelete"),
            alertDialog: $$("#alertDialog"),
            alertTitle: $$("#alertTitle"),
            alertMsg: $$("#alertMsg"),
            btnAlertOk: $$("#btnAlertOk"),
            confirmDialog: $$("#confirmDialog"),
            confirmTitle: $$("#confirmTitle"),
            confirmMsg: $$("#confirmMsg"),
            btnConfirmYes: $$("#btnConfirmYes"),
            btnConfirmNo: $$("#btnConfirmNo"),
            promptDialog: $$("#promptDialog"),
            promptTitle: $$("#promptTitle"),
            txtPrompt: $$("#txtPrompt"),
            btnPromptSave: $$("#btnPromptSave"),
            btnPromptCancel: $$("#btnPromptCancel"),
            codeEditor: $$("#codeEditor")
        };

        this.templates = {
            index: $$("#storage #templates #index"),
            style: $$("#storage #templates #scss"),
            app: $$("#storage #templates #app"),
            viewport: $$("#storage #templates #viewport"),
            store: function (name) {
                if (name == undefined || name.length <= 0) {
                    name = "Store" + (that.files.findByType(that.FileTypes.Store).length + 1);
                }
                var template = "var " + name + "=new Ext.data.Store({model: '" + name + "',proxy: {type: 'ajax',url : '/users.json',reader: {type: 'json',root: 'users'}},autoLoad: true});";
                return template;
            },
            model: function (name) {
                if (name == undefined || name.length <= 0) {
                    name = "Model" + (that.files.findByType(that.FileTypes.Store).length + 1);
                }
                var template = "Ext.regModel('" + name + "', {fields: [{name: 'name',  type: 'string'},{name: 'age',   type: 'int'},{name: 'phone', type: 'string'},{name: 'alive', type: 'boolean', defaultValue: true}],changeName: function() {var oldName = this.get('name'),newName = oldName + \" The Barbarian\";this.set('name', newName);}});";
                return template;
            }
        };

        this.sync = true;
        this.saver = null;
        this.syncing = false;
        this.afterSyncCycle = null;
        this.currentApp = null;
        this.currentFile = null;
        this.frameResize = false;
        this.tabListWidth = this.ui.tabList.outerWidth(true);
        this.tabListAvailableWidth = this.ui.tabList.parent().outerWidth(true);

        this.ui.window.bind("resize", { SF: this }, this.resize);
        this.ui.handler.bind("mousedown", { SF: this }, this.startFrameResize);
        this.ui.handler.bind("mousemove", { SF: this }, this.resizeFrame);
        this.ui.document.bind("mousemove", { SF: this }, this.resizeFrame);
        this.ui.document.bind("mouseup", { SF: this }, this.stopFrameResize);
        this.ui.btnQueueLeft.bind("mousedown", { SF: this }, this.moveTabsLeft);
        this.ui.btnQueueRight.bind("mousedown", { SF: this }, this.moveTabsRight);
        this.ui.btnRun.bind("click", { SF: this }, this.run);
        this.ui.btnSave.bind("click", { SF: this }, this.save);
        this.ui.btnBeautify.bind("click", { SF: this }, this.beautify);
        this.ui.btnShare.bind("click", { SF: this }, this.share);
        this.ui.txtShareLink.bind("click", { SF: this }, this.selectAll);
        this.ui.txtFullShareLink.bind("click", { SF: this }, this.selectAll);
        this.ui.txtIframeShareLink.bind("click", { SF: this }, this.selectAll);
        this.ui.tabList.find("li a").live("click", { SF: this }, this.gotoFile);
        this.ui.tabListItems.find("li a").live("click", { SF: this }, this.gotoFile);
        this.ui.tabList.find("li a").live("contextmenu", { SF: this }, this.showTabContextMenu);
        this.ui.btnRename.bind("click", { SF: this }, this.renameCurrentFile);
        this.ui.btnDelete.bind("click", { SF: this }, this.deleteCurrentFile);

        // give a tip
        //this.alert("Tip", "You can use <b>SF.proxy(URL)</b> function to call Cross Domain XHR.<br /><br /><b>Parameters</b>: URL (string) - The url you want to send request to.<br /><b>Returns</b>: URL (string) - Proxified string that can be called on cross domains.");

        this.resize();
        this.initCodeEditor();
        this.disableSelection();

        if (this.isExistingApp()) {
            this.loadExistingApp(this.getAppToken());
        }
        else {
            this.addImportantFiles();
            this.checkQueueButton();
        }
    };

    this.initCodeEditor = function () {
        this.ui.codeEditor = CodeMirror.fromTextArea(this.ui.codeEditor.get(0), {
            mode: "text/javascript",
            theme: 'eclipse',
            indentUnit: 4,
            tabMode: 'indent',
            lineNumbers: true,
            gutter: true,
            fixedGutter: true,
            onChange: function () {
                that.syncContent();
            }
        });
    };

    this.isExistingApp = function () {
        var url = window.location.href;
        return (url.lastIndexOf("#") === (url.length - 6));
    };

    this.getAppToken = function () {
        var url = window.location.href;
        return url.substr(url.lastIndexOf("#") + 1, 5);
    };

    this.loadExistingApp = function (token) {
        var succeed = false;

        $$.ajax({
            url: this.BaseURL + 'server/app.php',
            type: 'GET',
            data: { token: token },
            dataType: 'json',
            success: function (response) {
                if (response.app) {
                    succeed = true;

                    if (response.app.files) {
                        for (var f = 0; f < response.app.files.length; f++) {
                            that.addFile(response.app.files[f]);
                        }
                    }

                    that.ui.overlay.addClass("hide");
                    that.checkQueueButton();
                }
            },
            error: function (xmlHTTP, status, msg) {
                succeed = false;
            },
            complete: function () {
                if (!succeed) {
                    that.addImportantFiles();
                    that.checkQueueButton();
                    that.alert("Oops", "Could not load your application. Launching new workspace.");
                    that.ui.overlay.addClass("hide");
                }
            }
        });
    };

    this.addImportantFiles = function () {
        var template = null;
        var sIndex = 0;
        var eIndex = 0;

        //        template = this.templates.style.html();
        //        sIndex = template.indexOf("<!--//") + 6;
        //        eIndex = template.indexOf("//-->");
        //        template = template.substr(sIndex, eIndex - sIndex);
        //        template = template.replace(/<br \/>/g, "\n");
        //        template = template.replace(/^\s+|\s+$/g, '');

        //        var style = new this.File("style.scss", this.FileTypes.Style, template);
        //        this.addFile(style);

        var style = new this.File("style.css", this.FileTypes.CSS, template);
        style.content = "/* This file is inserted into index.html as is after sencha-touch.css */\n\r";
        this.addFile(style);

        template = this.templates.app.html();
        sIndex = template.indexOf("<!--//") + 6;
        eIndex = template.indexOf("//-->");
        template = template.substr(sIndex, eIndex - sIndex);
        template = template.replace(/<br \/>/g, "\n");
        template = template.replace(/^\s+|\s+$/g, '');

        var app = new this.File("app.js", this.FileTypes.App, template);
        this.addFile(app);

        template = this.templates.viewport.html();
        sIndex = template.indexOf("<!--//") + 6;
        eIndex = template.indexOf("//-->");
        template = template.substr(sIndex, eIndex - sIndex);
        template = template.replace(/<br \/>/g, "\n");
        template = template.replace(/^\s+|\s+$/g, '');

        var viewport = new this.File("viewport.js", this.FileTypes.Viewport, template);
        this.addFile(viewport);

        this.ui.overlay.addClass("hide");
    };

    this.resize = function (e) {
        var SF = this;
        if (e) SF = e.data.SF;

        var windowHeight = SF.ui.window.innerHeight();
        var headerHeight = SF.ui.headerOuterWrapper.outerHeight();
        var footerHeight = SF.ui.footer.outerHeight();
        var occupiedHeight = headerHeight + footerHeight;
        var remainingHeight = windowHeight - occupiedHeight;
        SF.ui.contentOuterWrapper.height(remainingHeight);
        SF.ui.contentOuterWrapper.height(remainingHeight);

        if (!e) {
            var windowWidth = SF.ui.window.innerWidth();
            var handlerWidth = SF.ui.handler.outerWidth();

            var leftWidth = 75 / 100 * windowWidth;
            var rightWidth = 25 / 100 * windowWidth;

            var leftPercent = leftWidth / windowWidth * 100;
            var rightPercent = rightWidth / windowWidth * 100;
            var handlerPercent = (leftWidth - handlerWidth / 2) / windowWidth * 100;

            SF.ui.handler.css("left", handlerPercent + "%");
            SF.ui.textareaOuterWrapper.css("width", leftPercent + "%");
            SF.ui.resultOuterWrapper.css("width", rightPercent + "%");
        }
    };

    this.startFrameResize = function (e) {
        var SF = e.data.SF;
        SF.frameResize = true;
    };

    this.stopFrameResize = function (e) {
        var SF = e.data.SF;
        SF.frameResize = false;
    };

    this.resizeFrame = function (e) {
        var SF = e.data.SF;

        if (SF.frameResize) {
            var windowWidth = SF.ui.window.innerWidth();
            var handlerWidth = SF.ui.handler.outerWidth();

            var minGap = 100;

            if (e.pageX <= minGap || e.pageX >= (windowWidth - minGap)) {
                return;
            }

            var leftWidth = e.pageX;
            var rightWidth = windowWidth - e.pageX;

            var leftPercent = leftWidth / windowWidth * 100;
            var rightPercent = rightWidth / windowWidth * 100;
            var handlerPercent = (leftWidth - handlerWidth / 2) / windowWidth * 100;

            SF.ui.handler.css("left", handlerPercent + "%");
            SF.ui.textareaOuterWrapper.css("width", leftPercent + "%");
            SF.ui.resultOuterWrapper.css("width", rightPercent + "%");
        }
    };

    this.disableSelection = function () {
        return $(":not(input,select,textarea)").each(function () {
            $(this).attr('unselectable', 'on')
               .each(function () {
                   this.onselectstart = function () { return false; };
               });
        });
    };

    this.syncContent = function (e) {
        var newContent = this.ui.codeEditor.getValue();
        if (this.currentFile.content != newContent) {
            this.currentFile.content = newContent;
            this.currentFile.updated = false;
        }
    };

    this.run = function (e) {
        var SF = e.data.SF;

        SF.ui.btnRun.unbind("click", SF.run);
        SF.ui.btnRun.children("span").text("Building...");
        SF.ui.btnRun.removeClass("disabled").addClass("disabled");

        SF.afterSyncCycle = function () {
            SF.ui.appView.attr("src", SF.BaseURL + "server/app.php?id=" + SF.currentApp.id);
            SF.ui.btnRun.children("span").text("Run");
            SF.ui.btnRun.removeClass("disabled");
            SF.ui.btnRun.bind("click", { SF: SF }, SF.run);
        };

        if (!SF.currentApp) {
            var newApp = new SF.App("", SF.AppStates.Draft);
            SF.createApp(newApp, function (app, succeed) {
                if (!succeed) {
                    SF.afterSyncCycle = null;
                    SF.alert("Oops", "Your app was failed to run properly. Please try again.");

                    SF.ui.btnRun.children("span").text("Run");
                    SF.ui.btnRun.removeClass("disabled");
                    SF.ui.btnRun.bind("click", { SF: SF }, SF.run);

                    return false;
                }

                SF.ui.btnRun.children("span").text("Running...");

                SF.currentApp = app;
                SF.keepSyncing();
            });
        }
    };

    this.save = function (e) {
        var SF = e.data.SF;

        SF.ui.btnSave.unbind("click", SF.save);
        SF.ui.btnSave.removeClass("disabled").addClass("disabled");

        var updateAddressBar = function (app) {
            if (app.state == SF.AppStates.Save) {
                var appURL = window.location.href;
                if (appURL.indexOf("#") !== appURL.length - 1) {
                    appURL += "#";
                }
                appURL += app.token;
                window.location = appURL;
            }
        };

        if (!SF.currentApp) {
            SF.ui.btnSave.children("span").text("Preparing...");

            var newApp = new SF.App("", SF.AppStates.Save);
            SF.createApp(newApp, function (app, succeed) {
                if (!succeed) {
                    SF.alert("Oops", "Your app was failed to save properly. Please try again.");

                    SF.ui.btnSave.children("span").text("Save");
                    SF.ui.btnSave.removeClass("disabled");

                    return false;
                }

                updateAddressBar(app);

                SF.currentApp = app;
                SF.keepSyncing();
            });
        }
        else {
            SF.currentApp.state = SF.AppStates.Save;
            updateAddressBar(SF.currentApp);
        }

        SF.ui.btnSave.children("span").text("Saving...");
    };

    this.keepSyncing = function () {
        // put timer to send data to server when time permits and changed bit is on
        var filesSaver = function () {
            if (!that.sync) return;

            if (that.files.items.length <= 0) return;

            if (that.currentApp && that.currentApp.state == that.AppStates.Save) {
                SF.ui.btnSave.children("span").text("Saving...");
            }

            that.fileSaver(0, new Date());
        };

        filesSaver();
        this.saver = setInterval(filesSaver, 5000);
    };

    this.fileSaver = function (fileIndex, saveStarted) {
        this.syncing = true;

        var callback = function () {
            fileIndex++;

            if (that.files.items.length <= fileIndex) {
                fileIndex = 0;

                var timeTook = new Date() - saveStarted;
                saveStarted = new Date();

                if (that.currentApp && that.currentApp.state == that.AppStates.Save) {
                    var time = (Math.round(timeTook / 1000));
                    time = time <= 0 ? "" : time.toString();
                    that.ui.btnSave.children("span").text("Last saved " + time + " seconds ago");
                }

                if (that.afterSyncCycle) {
                    that.afterSyncCycle();
                    that.afterSyncCycle = null;
                }

                that.syncing = false;
            }
            else {
                that.fileSaver(fileIndex, saveStarted);
            }
        };

        var file = that.files.items[fileIndex];
        if (file.updated) {
            callback();
            return false;
        }

        $$.ajax({
            url: that.BaseURL + 'server/sync.php',
            type: 'POST',
            dataType: 'json',
            data: { id: file.id, app_id: that.currentApp.id, app_state: that.currentApp.state, name: file.name, type: file.type, content: file.content },
            success: function (result) {
                // if result say yes so

                //file.id = result.senchafiddle.file.id;
                file.updated = result.senchafiddle.file.updated;

                //SF.ui.tabList.find("li:has(a[id='file-" + SF.currentFile.id + "']) span").text(name);
                //SF.ui.tabListItems.find("li:has(a[id='file-" + SF.currentFile.id + "']) span").text(name);
            },
            error: function (xmlHTTP, status, msg) {
            },
            complete: callback
        });
    };

    this.pauseSyncing = function () {
        this.sync = false;
    };

    this.resumeSyncing = function () {
        this.sync = true;
    };

    this.beautify = function (e) {
        var SF = this;
        if (e) SF = e.data.SF;

        // beautify all files code
        if (SF.currentFile) {
            if (SF.currentFile.type == SF.FileTypes.Main) {
                SF.ui.codeEditor.setOption("mode", "text/html");
            }
            else if (SF.currentFile.type == SF.FileTypes.CSS || SF.currentFile.type == SF.FileTypes.SCSS || SF.currentFile.type == SF.FileTypes.Style) {
                SF.ui.codeEditor.setOption("mode", "text/css");
            }
            else {
                SF.ui.codeEditor.setOption("mode", "text/javascript");
            }

            for (var i = 0, e = SF.ui.codeEditor.lineCount(); i < e; ++i) {
                SF.ui.codeEditor.indentLine(i);
            }
        }
    };

    this.share = function (e) {
        var SF = e.data.SF;

        SF.ui.btnShare.unbind("click", SF.share);
        SF.ui.btnShare.removeClass("disabled").addClass("disabled");

        // let user share this whole fiddle, this file or snapshot of the result
        var todo = function () {
            SF.ui.btnShare.removeClass("disabled");
            SF.ui.btnShare.bind("click", { SF: SF }, SF.share);

            // put 3 share links here
            SF.ui.txtShareLink.val(SF.BaseURL + "#" + SF.currentApp.token);
            SF.ui.txtFullShareLink.val(SF.BaseURL + "full/" + SF.currentApp.token);
            SF.ui.txtIframeShareLink.val('<iframe src="' + SF.BaseURL + 'full/' + SF.currentApp.token + '"></iframe>');

            var li = SF.ui.btnShare.parent();
            if (li.hasClass("active")) {
                li.removeClass("active");
            }
            else {
                li.addClass("active");
            }
        };

        if (SF.isExistingApp()) {
            todo();
        }
        else {
            SF.afterSyncCycle = todo;
            SF.save(e);
        }
    };

    this.selectAll = function (e) {
        var SF = e.data.SF;
        this.focus();
        this.select();
    };

    this.login = function () {
        // show user popup to login with username and password
    };

    this.addStoreFile = function () {
        // ask file name

        var store = new this.File("Store", this.FileTypes.Store, "");

        var rf = this.files.findByType(this.FileTypes.Store);
        store.name = "Store " + (rf.length + 1) + ".js";
        store.content = js_beautify(this.templates.store());

        this.addFile(store);
    };

    this.addModelFile = function () {
        // ask file name

        var model = new this.File("Model.js", this.FileTypes.Model, "");

        var rf = this.files.findByType(this.FileTypes.Model);
        model.name = "Model " + (rf.length + 1) + ".js";
        model.content = js_beautify(this.templates.model());

        this.addFile(model);
    };

    this.addControllerFile = function () {
        // ask file name

        var controller = new this.File("Controller", this.FileTypes.Controller, "");

        var rf = this.files.findByType(this.FileTypes.Controller);
        controller.name = "Controller " + (rf.length + 1) + ".js";

        this.addFile(controller);
    };

    /*
    add file to the fiddle
    type: MODEL, STORE, CONTROLLER
    */
    this.addFile = function (file) {
        if (file.type == this.FileTypes.Main || file.type == this.FileTypes.App || file.type == this.FileTypes.Viewport) {
            var rf = this.files.findByType(file.type);
            if (rf.length > 0) {
                throw "This type of file can only be added once.";
            }
        }

        var rf = this.files.findByName(file.name);
        if (rf.length > 0) {
            throw "The file name already exists.";
        }

        file.index = this.files.items.length;

        this.files.add(file);
        this.currentFile = file;
        this.ui.codeEditor.setValue(file.content);
        this.beautify();
        this.ui.codeEditor.clearHistory();

        var item = '<li class="pItem"><a id="file-' + file.index + '" class="tab active"><span>' + file.name + '</span><i class="icon right arrows BArrow"></i></a> </li>';
        this.ui.tabList.find("li a").removeClass("active");
        this.ui.tabList.prepend(item);

        item = '<li><a id="file-' + file.index + '"><span>' + file.name + '</span></a></li>';
        this.ui.tabListItems.append(item);

        var oldWidth = this.ui.tabList.outerWidth(true);
        var newWidth = 0;

        this.ui.tabList.children().each(function (index, li) {
            newWidth += $$(li).outerWidth(true);
        });

        if (newWidth >= oldWidth) {
            this.ui.tabList.css("width", newWidth + "px");
        }

        this.checkQueueButton();
    };

    this.deleteFile = function (file) {
        var SF = this;

        // remove from coll and ui
        SF.files.remove(file);
        SF.ui.tabList.find("li:has(a[id='file-" + file.index + "'])").remove();
        SF.ui.tabListItems.find("li:has(a[id='file-" + file.index + "'])").remove();

        // activate next available file item
        var nextLI = SF.ui.tabList.find("li:first");
        if (nextLI.length > 0) {
            try {
                var a = nextLI.children("a");
                var id = a.attr("id").split("-")[1];
                SF.currentFile = SF.files.fileAt(id);
                SF.ui.codeEditor.setValue(SF.currentFile.content);
                SF.beautify();
                SF.ui.codeEditor.clearHistory();
                a.removeClass("active").addClass("active");
            }
            catch (e) {
                SF.alert("Oops", "Some inconsistency occurred in processing your request.");
            }
        }
        else {
            SF.currentFile = null;
            SF.ui.codeEditor.setValue("");
            SF.ui.codeEditor.clearHistory();
        }
    };

    this.deleteCurrentFile = function (e) {
        // pause sync
        // remove file from server
        // remove file from coll
        // resume sync

        var SF = e.data.SF;

        if (SF.currentFile) {
            SF.confirm("Confirm", "Are you sure you want to delete " + SF.currentFile.name + " file?", function (yes) {
                if (yes) {
                    if (!SF.currentApp) {
                        SF.deleteFile(SF.currentFile);
                    }
                    else {
                        var succeed = false;

                        SF.pauseSyncing();

                        $$.ajax({
                            url: SF.BaseURL + 'server/file.php',
                            type: 'DELETE',
                            data: { appid: SF.currentApp.id, filename: SF.currentFile.name },
                            dataType: 'json',
                            success: function (response) {
                                if (response.senchafiddle.deleted) {
                                    succeed = true;
                                    SF.deleteFile(SF.currentFile);
                                    SF.resumeSyncing();
                                }
                            },
                            error: function () {
                                succeed = false;
                            },
                            complete: function () {
                                if (!succeed) {
                                    SF.alert("Oops", "Your file was not deleted.");
                                    SF.resumeSyncing();
                                }
                            }
                        });
                    }
                }
            });
        }
    };

    this.renameFile = function (file) {
        SF.currentFile.name = file.name;

        SF.ui.tabList.find("li:has(a[id='file-" + file.index + "']) span").text(file.name);
        SF.ui.tabListItems.find("li:has(a[id='file-" + file.index + "']) span").text(file.name);
    };

    this.renameCurrentFile = function (e) {
        // ask user for new name
        // check if same filename exists
        // pause sync
        // rename file from server
        // rename file from coll
        // resume sync

        var SF = e.data.SF;

        if (SF.currentFile) {
            SF.prompt("Please type new name for the file.", SF.currentFile.name, function (name) {
                if (name != null && name.replace(/ /g, "").length > 0) {
                    if (name.indexOf(".js") <= -1) {
                        name += ".js";
                    }

                    if (SF.files.findByName(name).length > 0) {
                        SF.alert("Oops", "This is already existed filename.");
                        return false;
                    }

                    if (!SF.currentApp) {
                        SF.currentFile.name = name;
                        SF.renameFile(SF.currentFile);
                    }
                    else {
                        var succeed = false;

                        SF.pauseSyncing();

                        // to make sure continous sync is done
                        while (SF.synching) {
                            // do nothing and wait
                        }

                        $$.ajax({
                            url: SF.BaseURL + 'server/file.php',
                            type: 'PUT',
                            data: { appid: SF.currentApp.id, oldfilename: SF.currentFile.name, newfilename: name },
                            dataType: 'json',
                            success: function (response) {
                                if (response.senchafiddle.updated) {
                                    succeed = true;

                                    SF.currentFile.name = name;
                                    SF.renameFile(SF.currentFile);

                                    SF.resumeSyncing();
                                }
                            },
                            error: function () {
                                succeed = false;
                            },
                            complete: function () {
                                if (!succeed) {
                                    SF.alert("Oops", "Your file was not renamed.");
                                    SF.resumeSyncing();
                                }
                            }
                        });
                    }
                }
            });
        }
    };

    /*
    filePath: the path from array
    */
    this.gotoFile = function (e) {
        // show file from the fiddle using maintained array of files (path is array path)
        var SF = e.data.SF;

        var a = $$(this);

        var id = a.attr("id");

        if (id) {
            id = id.split("-")[1];

            var file = SF.files.fileAt(id);

            if (a.hasClass("active")) {
                SF.showTabContextMenu(e);
            }
            else {
                SF.currentFile = file;
                SF.ui.codeEditor.setValue(file.content);
                SF.beautify();
                SF.ui.codeEditor.clearHistory();

                SF.ui.tabList.find("li a").removeClass("active");
                SF.ui.tabList.find("li a#file-" + id).removeClass("active").addClass("active");
            }
        }
        return false;
    };

    this.showTabContextMenu = function (e) {
        var SF = e.data.SF;

        if (SF.currentFile.type == SF.FileTypes.App ||
            SF.currentFile.type == SF.FileTypes.Viewport ||
            SF.currentFile.type == SF.FileTypes.Style) return;

        var a = e.target;
        while (a.nodeName != "A" || a.tagName != 'A') {
            a = e.target.parentNode;
        }

        a = $$(a);

        if (a.hasClass("active") && SF.ui.contextMenu.hasClass("hide")) {
            var btnPos = a.offset();
            var borderWidth = parseInt(SF.ui.contextMenu.children("ul").css("border-bottom-width"), 10);
            var footerPos = SF.ui.footer.offset();
            var x = btnPos.left;
            var y = footerPos.top - SF.ui.contextMenu.height() + borderWidth;

            a.parent().removeClass("CMActive").addClass("CMActive");

            SF.ui.contextMenu.css({ 'top': y + 'px', 'left': x + 'px' }).removeClass("hide");

            SF.ui.window.bind("resize", { SF: SF }, SF.hideTabContextMenu);
            SF.ui.document.bind("mouseup", { SF: SF }, SF.hideTabContextMenu);
        }
        return false;
    };

    this.hideTabContextMenu = function (e) {
        var SF = e.data.SF;
        SF.ui.contextMenu.addClass("hide");
        SF.ui.window.unbind("resize", SF.hideTabContextMenu);
        SF.ui.document.unbind("mouseup", SF.hideTabContextMenu);
        SF.ui.tabList.find("li.CMActive").removeClass("CMActive");
    };

    this.checkQueueButton = function () {
        this.tabListWidth = this.ui.tabList.outerWidth(true);

        var left = SF.ui.tabList.css("left").replace("px", "");

        left = parseFloat(left);

        var diff = left - this.tabListAvailableWidth;
        diff = diff - (diff * 2);

        if (diff >= this.tabListWidth) {
            this.ui.btnQueueLeft.addClass("disabled");
        }
        else {
            this.ui.btnQueueLeft.removeClass("disabled");
        }

        if (left >= 0) {
            this.ui.btnQueueRight.addClass("disabled");
        }
        else {
            this.ui.btnQueueRight.removeClass("disabled");
        }
    };

    this.moveTabsLeft = function (e) {
        if (e) e.preventDefault();

        var SF = e.data.SF;

        var left = SF.ui.tabList.css("left").replace("px", "");

        left = parseFloat(left);

        var diff = left - SF.tabListAvailableWidth;
        diff = diff - (diff * 2);

        if (diff < SF.tabListWidth) {
            SF.ui.tabList.css("left", (left - SF.tabListAvailableWidth / 2) + "px");
        }

        SF.checkQueueButton();
    };

    this.moveTabsRight = function (e) {
        if (e) e.preventDefault();

        var SF = e.data.SF;

        var left = SF.ui.tabList.css("left").replace("px", "");

        left = parseFloat(left);

        if (left < 0) {
            SF.ui.tabList.css("left", (left + SF.tabListAvailableWidth / 2) + "px");
        }

        SF.checkQueueButton();
    };

    this.alert = function (title, msg) {
        var callback = function (e) {
            if (e) e.preventDefault();
            var SF = e.data.SF;
            SF.ui.btnAlertOk.unbind("click", callback);
            SF.ui.alertDialog.removeClass("active");
        };

        this.ui.alertTitle.text(title);
        this.ui.alertMsg.html(msg);
        this.ui.btnAlertOk.bind("click", { SF: this }, callback);
        this.ui.alertDialog.removeClass("active").addClass("active");
    };

    this.confirm = function (title, msg, callback) {
        var yesCallback = function (e) {
            if (e) e.preventDefault();
            var SF = e.data.SF;
            SF.ui.btnConfirmYes.unbind("click", yesCallback);
            SF.ui.confirmDialog.removeClass("active");
            callback(true);
        };

        var noCallback = function (e) {
            if (e) e.preventDefault();
            var SF = e.data.SF;
            SF.ui.btnConfirmNo.unbind("click", noCallback);
            SF.ui.confirmDialog.removeClass("active");
            callback(false);
        };

        this.ui.confirmTitle.text(title);
        this.ui.confirmMsg.text(msg);
        this.ui.btnConfirmYes.bind("click", { SF: this }, yesCallback);
        this.ui.btnConfirmNo.bind("click", { SF: this }, noCallback);
        this.ui.confirmDialog.removeClass("active").addClass("active");
    };

    this.prompt = function (title, defaultValue, callback) {
        var saveCallback = function (e) {
            if (e) e.preventDefault();
            var SF = e.data.SF;
            SF.ui.btnPromptSave.unbind("click", saveCallback);
            SF.ui.promptDialog.removeClass("active");
            callback(SF.ui.txtPrompt.val());
        };

        var cancelCallback = function (e) {
            if (e) e.preventDefault();
            var SF = e.data.SF;
            SF.ui.btnPromptCancel.unbind("click", cancelCallback);
            SF.ui.promptDialog.removeClass("active");
            callback(null);
        };

        this.ui.promptTitle.text(title);
        this.ui.txtPrompt.val(defaultValue);
        this.ui.btnPromptSave.bind("click", { SF: this }, saveCallback);
        this.ui.btnPromptCancel.bind("click", { SF: this }, cancelCallback);
        this.ui.promptDialog.removeClass("active").addClass("active");
    };

    this.File = function (name, type, content) {
        this.id = 0;
        this.name = name;
        this.type = type;
        this.content = content;
        this.updated = false;
        this.lastUpdated = new Date();
        this.index = 0;
    };

    this.files = {
        items: [],
        add: function (file) {
            this.items.push(file);
        },
        removeAt: function (index) {
            this.items.splice(index, 1);
        },
        remove: function (item) {
            this.items.splice(item.index, 1);
        },
        fileAt: function (index) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].index == index) {
                    return this.items[i];
                }
            }
            return null;
        },
        findByName: function (name) {
            var rv = [];
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].name.toLowerCase() == name.toLowerCase()) {
                    rv.push(this.items[i]);
                }
            }
            return rv;
        },
        findByType: function (type) {
            var rv = [];
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].type == type) {
                    rv.push(this.items[i]);
                }
            }
            return rv;
        }
    };

    this.FileTypes = {
        Main: 'Main',
        CSS: 'CSS',
        SCSS: 'SCSS',
        Style: 'Style',
        App: 'App',
        Viewport: 'Viewport',
        Model: 'Model',
        Store: 'Store',
        Controller: 'Controller'
    };

    this.App = function (name, state, callback) {
        this.id = 0;
        this.name = name;
        this.state = state;
        this.created = new Date();
        this.token = null;
    };

    this.AppStates = {
        Draft: 'Draft',
        Save: 'Save'
    };

    this.createApp = function (app, callback) {
        var succeed = false;

        $$.ajax({
            url: that.BaseURL + 'server/app.php',
            type: 'POST',
            dataType: 'json',
            data: { name: app.name, state: app.state },
            success: function (response) {
                try {
                    app.id = response.senchafiddle.app.id;
                    app.token = response.senchafiddle.app.token;
                    succeed = true;
                }
                catch (e) {
                    console.log(e.msg);
                }
            },
            error: function (xmlHTTP, status, msg) {
                succeed = false;
            },
            complete: function () {
                callback(app, succeed);
            }
        });
    };
}