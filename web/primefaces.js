PrimeFaces = {

    escapeClientId : function(id) {
        return "#" + id.replace(/:/g,"\\:");
    },
		
    cleanWatermarks : function(){
        $.watermark.hideAll();
    },
	
    showWatermarks : function(){
        $.watermark.showAll();
    },
	
    addSubmitParam : function(parent, params) {
        var form = $(this.escapeClientId(parent));
        
        for(var key in params) {
            form.append("<input type=\"hidden\" name=\"" + key + "\" value=\"" + params[key] + "\" class=\"ui-submit-param\"/>");
        }

        return this;
    },

    /**
     * Submits a form and clears ui-submit-param after that to prevent dom caching issues
     */ 
    submit : function(formId) {
        $(this.escapeClientId(formId)).submit().children('input.ui-submit-param').remove();
    },

    attachBehaviors : function(element, behaviors) {
        $.each(behaviors, function(event, fn) {
            element.bind(event, function(e) {
                fn.call(element, e);
            });
        });
    },

    getCookie : function(name) {
        return $.cookie(name);
    },

    setCookie : function(name, value) {
        $.cookie(name, value);
    },

    skinInput : function(input) {
        input.hover(
            function() {
                $(this).addClass('ui-state-hover');
            },
            function() {
                $(this).removeClass('ui-state-hover');
            }
        ).focus(function() {
                $(this).addClass('ui-state-focus');
        }).blur(function() {
                $(this).removeClass('ui-state-focus');
        });
        
        //aria
        input.attr('role', 'textbox').attr('aria-disabled', input.is(':disabled'))
                                      .attr('aria-readonly', input.prop('readonly'))
                                      .attr('aria-multiline', input.is('textarea'));
        
        
        return this;
    },
    
    skinButton : function(button) {
        button.mouseover(function(){
            var el = $(this);
            if(!button.hasClass('ui-state-disabled')) {
                el.addClass('ui-state-hover');
            }
        }).mouseout(function() {
            $(this).removeClass('ui-state-active ui-state-hover');
        }).mousedown(function() {
            var el = $(this);
            if(!button.hasClass('ui-state-disabled')) {
                el.addClass('ui-state-active');
            }
        }).mouseup(function() {
            $(this).removeClass('ui-state-active');
        }).focus(function() {
            $(this).addClass('ui-state-focus');
        }).blur(function() {
            $(this).removeClass('ui-state-focus');
        }).keydown(function(e) {
            if(e.keyCode == $.ui.keyCode.SPACE || e.keyCode == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.NUMPAD_ENTER) {
                $(this).addClass('ui-state-active');
            }
        }).keyup(function() {
            $(this).removeClass('ui-state-active');
        });
        
        //aria
        button.attr('role', 'button').attr('aria-disabled', button.is(':disabled'));
        
        return this;
    },
    
    skinSelect : function(select) {
       select.mouseover(function() {
            var el = $(this);
            if(!el.hasClass('ui-state-focus'))
                el.addClass('ui-state-hover'); 
       }).mouseout(function() {
            $(this).removeClass('ui-state-hover'); 
       }).focus(function() {
            $(this).addClass('ui-state-focus').removeClass('ui-state-hover');
       }).blur(function() {
            $(this).removeClass('ui-state-focus ui-state-hover'); 
       });
        
        return this;
    },
    
    isIE: function(version) {
       return ($.browser.msie && parseInt($.browser.version, 10) == version);
    },

    //ajax shortcut
    ab: function(cfg, ext) {
        PrimeFaces.ajax.AjaxRequest(cfg, ext);
    },
    
    info: function(log) {
        if(this.logger) {
            this.logger.info(log);
        }
    },
    
    debug: function(log) {
        if(this.logger) {
            this.logger.debug(log);
        }
    },
    
    warn: function(log) {
        if(this.logger) {
            this.logger.warn(log);
        }
    },
    
    error: function(log) {
        if(this.logger) {
            this.logger.error(log);
        }
    },
    
    changeTheme: function(newTheme) {
        if(newTheme && newTheme != '') {
            var themeLink = $('link[href*="javax.faces.resource/theme.css"]'),
            themeURL = themeLink.attr('href'),
            plainURL = themeURL.split('&')[0],
            oldTheme = plainURL.split('ln=')[1],
            newThemeURL = themeURL.replace(oldTheme, 'primefaces-' + newTheme);

            themeLink.attr('href', newThemeURL);
        }
    },
    
    escapeRegExp: function(text) {
        return text.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    },
    
    clearSelection: function() {
        if(window.getSelection) {
            if(window.getSelection().empty) {
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }
        }
    },
    
    extend: function(subClass, superClass) {
        subClass.prototype = new superClass;
        subClass.prototype.constructor = subClass;
    },
    
    cw : function(widgetConstructor, widgetVar, cfg, resource) {
        PrimeFaces.createWidget(widgetConstructor, widgetVar, cfg, resource);
    },
    
    createWidget : function(widgetConstructor, widgetVar, cfg, resource) {            
        if(PrimeFaces.widget[widgetConstructor]) {
            if(window[widgetVar])
                window[widgetVar].refresh(cfg);                                     //ajax update
            else
                window[widgetVar] = new PrimeFaces.widget[widgetConstructor](cfg);  //page init
        }
        else {
            var scriptURI = $('script[src*="/javax.faces.resource/primefaces.js"]').attr('src').replace('primefaces.js', resource + '/' + resource + '.js'),
            cssURI = $('link[href*="/javax.faces.resource/primefaces.css"]').attr('href').replace('primefaces.css', resource + '/' + resource + '.css'),
            cssResource = '<link type="text/css" rel="stylesheet" href="' + cssURI + '" />';

            //load css
            $('head').append(cssResource);

            //load script and initialize widget
            PrimeFaces.getScript(location.protocol + '//' + location.host + scriptURI, function() {
                setTimeout(function() {
                    window[widgetVar] = new PrimeFaces.widget[widgetConstructor](cfg);
                }, 100);
            });
        }
    },

    isNumber: function(value) {
        return typeof value === 'number' && isFinite(value);
    },
    
    getScript: function(url, callback) {
        $.ajax({
			type: "GET",
			url: url,
			success: callback,
			dataType: "script",
			cache: true
        });
    },
    
    focus : function(id, context) {
        var selector = ':not(:submit):not(:button):input:visible:enabled';

        setTimeout(function() {
            if(id) {
                var jq = $(PrimeFaces.escapeClientId(id));

                if(jq.is(selector)) {
                    jq.focus();
                } 
                else {
                    jq.find(selector).eq(0).focus();
                }
            }
            else if(context) {
                $(PrimeFaces.escapeClientId(context)).find(selector).eq(0).focus();
            }
            else {
                $(selector).eq(0).focus();
            }
        }, 250);
    },
    
    monitorDownload: function(start, complete) {
        if(start) {
            start();
        }

        window.downloadMonitor = setInterval(function() {
            var downloadComplete = PrimeFaces.getCookie('primefaces.download');

            if(downloadComplete == 'true') {
                if(complete) {
                    complete();
                }
                clearInterval(window.downloadPoll);
                PrimeFaces.setCookie('primefaces.download', null);
            }
        }, 500);
    },
    
    /**
     *  Scrolls to a component with given client id
     */
    scrollTo: function(id) {
        var offset = $(PrimeFaces.escapeClientId(id)).offset();

        $('html,body').animate({
                scrollTop:offset.top
                ,scrollLeft:offset.left
            },{
               easing: 'easeInCirc'
            },1000);
            
    },

    locales : {},
    
    zindex : 1000,
	
    PARTIAL_REQUEST_PARAM : "javax.faces.partial.ajax",

    PARTIAL_UPDATE_PARAM : "javax.faces.partial.render",

    PARTIAL_PROCESS_PARAM : "javax.faces.partial.execute",

    PARTIAL_SOURCE_PARAM : "javax.faces.source",

    BEHAVIOR_EVENT_PARAM : "javax.faces.behavior.event",

    PARTIAL_EVENT_PARAM : "javax.faces.partial.event",

    VIEW_STATE : "javax.faces.ViewState",
    
    VIEW_ROOT : "javax.faces.ViewRoot",
    
    CLIENT_ID_DATA : "primefaces.clientid"
};

/**
 * PrimeFaces Namespaces
 */
PrimeFaces.ajax = {};
PrimeFaces.widget = {};
PrimeFaces.websockets = {};

/**
 * BaseWidget for PrimeFaces Widgets
 */
PrimeFaces.widget.BaseWidget = Class.extend({
    
  init: function(cfg) {
    this.cfg = cfg;
    this.id = cfg.id;
    this.jqId = PrimeFaces.escapeClientId(this.id),
    this.jq = $(this.jqId);
    
    //remove script tag
    $(this.jqId + '_s').remove();
  },
  
  //used mostly in ajax updates, reloads the widget configuration
  refresh: function(cfg) {
    return this.init(cfg);
  },
  
  //returns jquery object representing the main dom element related to the widget
  getJQ: function(){
    return this.jq;
  }
  
});

PrimeFaces.ajax.AjaxUtils = {
	
    encodeViewState : function() {
        var viewstateValue = document.getElementById(PrimeFaces.VIEW_STATE).value;
        var re = new RegExp("\\+", "g");
        var encodedViewState = viewstateValue.replace(re, "\%2B");
		
        return encodedViewState;
    },
	
    updateState: function(value) {
        var viewstateValue = $.trim(value),
        forms = this.portletForms ? this.portletForms : $('form');
        
        forms.each(function() {
            var form = $(this),
            formViewStateElement = form.children("input[name='javax.faces.ViewState']").get(0);

            if(formViewStateElement) {
                $(formViewStateElement).val(viewstateValue);
            }
            else
            {
                form.append('<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value="' + viewstateValue + '" autocomplete="off" />');
            }
        });
    },

    updateElement: function(id, content) {        
        if(id == PrimeFaces.VIEW_STATE) {
            PrimeFaces.ajax.AjaxUtils.updateState.call(this, content);
        }
        else if(id == PrimeFaces.VIEW_ROOT) {
            document.open();
            document.write(content);
            document.close();
        }
        else {
            $(PrimeFaces.escapeClientId(id)).replaceWith(content);
        }
    },

    /**
     *  Handles response handling tasks after updating the dom
     **/
    handleResponse: function(xmlDoc) {
        var redirect = xmlDoc.find('redirect'),
        callbackParams = xmlDoc.find('extension[ln="primefaces"][type="args"]'),
        pushData = xmlDoc.find('extension[ln="primefaces"][type="push-data"]'),
        scripts = xmlDoc.find('eval');

        if(redirect.length > 0) {
            window.location = redirect.attr('url');
        }
        else {
            //args
            this.args = callbackParams.length > 0 ? $.parseJSON(callbackParams.text()) : {};
            
            //push data
            this.pushData = pushData.length > 0 ? $.parseJSON(pushData.text()) : null;

            //scripts to execute
            for(var i=0; i < scripts.length; i++) {
                $.globalEval(scripts.eq(i).text());
            }
        }
        
        //Handle push data
        if(this.pushData) {
            for(var channel in this.pushData) {
                if(channel) {
                    var message = JSON.stringify(this.pushData[channel].data);

                    PrimeFaces.websockets[channel].send(message);
                }
            }
        }
    },
    
    findComponents : function(selector) {
        //converts pfs to jq selector e.g. @(div.mystyle :input) to div.mystyle :input
        var jqSelector = selector.substring(2, selector.length - 1),
        components = $(jqSelector),
        ids = [];
        
        components.each(function() {
            var element = $(this),
            clientId = element.data(PrimeFaces.CLIENT_ID_DATA)||element.attr('id');
            
            ids.push(clientId);
        });
        
        return ids;
    },
    
    send : function(cfg) {
        PrimeFaces.debug('Initiating ajax request.');
    
        if(cfg.onstart) {
            var retVal = cfg.onstart.call(this, cfg);
            if(retVal == false) {
                PrimeFaces.debug('Ajax request cancelled by onstart callback.');
                
                //remove from queue
                if(!cfg.async) {
                    PrimeFaces.ajax.Queue.poll();
                }
                
                return;  //cancel request
            }
        }

        var form = null,
        sourceId = null;

        //source can be a client id or an element defined by this keyword
        if(typeof(cfg.source) == 'string') {
            sourceId = cfg.source;
        } else {
            sourceId = $(cfg.source).attr('id');
        }

        if(cfg.formId) {
            form = $(PrimeFaces.escapeClientId(cfg.formId));                         //Explicit form is defined
        }
        else {
            form = $(PrimeFaces.escapeClientId(sourceId)).parents('form:first');     //look for a parent of source

            //source has no parent form so use first form in document
            if(form.length == 0) {
                form = $('form').eq(0);
            }
        }

        PrimeFaces.debug('Form to post ' + form.attr('id') + '.');

        var postURL = form.attr('action'),
        encodedURLfield = form.children("input[name='javax.faces.encodedURL']"),
        postParams = [];

        //portlet support
        var pForms = null;
        if(encodedURLfield.length > 0) {
            postURL = encodedURLfield.val();
            pForms = $('form[action="' + form.attr('action') + '"]');   //find forms of the portlet
        }

        PrimeFaces.debug('URL to post ' + postURL + '.');

        //partial ajax
        postParams.push({name:PrimeFaces.PARTIAL_REQUEST_PARAM, value:true});

        //source
        postParams.push({name:PrimeFaces.PARTIAL_SOURCE_PARAM, value:sourceId});

        //process
        var process = [];
        if(cfg.process) {
            process.push(cfg.process);
        }
        if(cfg.ext && cfg.ext.process) {
            process.push(cfg.ext.process);
        }

        //process selector
        if(cfg.processSelector) {
            $.merge(process, PrimeFaces.ajax.AjaxUtils.findComponents(cfg.processSelector));
        }

        var processIds = process.length > 0 ? process.join(' ') : '@all';
        postParams.push({name:PrimeFaces.PARTIAL_PROCESS_PARAM, value:processIds});

        //update
        var update = [];
        if(cfg.update) {
            update.push(cfg.update);
        }
        if(cfg.ext && cfg.ext.update) {
            update.push(cfg.ext.update);
        }

        //update selector
        if(cfg.updateSelector) {
            $.merge(update, PrimeFaces.ajax.AjaxUtils.findComponents(cfg.updateSelector));
        }

        if(update.length > 0) {
            postParams.push({name:PrimeFaces.PARTIAL_UPDATE_PARAM, value:update.join(' ')});
        }

        //behavior event
        if(cfg.event) {
            postParams.push({name:PrimeFaces.BEHAVIOR_EVENT_PARAM, value:cfg.event});

            var domEvent = cfg.event;

            if(cfg.event == 'valueChange')
                domEvent = 'change';
            else if(cfg.event == 'action')
                domEvent = 'click';

            postParams.push({name:PrimeFaces.PARTIAL_EVENT_PARAM, value:domEvent});
        } 
        else {
            postParams.push({name:sourceId, value:sourceId});
        }

        //params
        if(cfg.params) {
            $.merge(postParams, cfg.params);
        }
        if(cfg.ext && cfg.ext.params) {
            $.merge(postParams, cfg.ext.params);
        }

        /**
        * Only add params of process components and their children 
        * if partial submit is enabled and there are components to process partially
        */
        if(cfg.partialSubmit && processIds != '@all') {
            var hasViewstate = false;
            
            if(processIds != '@none') {
                var processIdsArray = processIds.split(' ');

                $.each(processIdsArray, function(i, item) {
                    var jqProcess = $(PrimeFaces.escapeClientId(item)),
                    componentPostParams = null;
                    
                    if(jqProcess.is('form')) {
                        componentPostParams = jqProcess.serializeArray();
                        hasViewstate = true;
                    }
                    else if(jqProcess.is(':input')) {
                        componentPostParams = jqProcess.serializeArray();
                    }
                    else {
                        componentPostParams = jqProcess.find(':input').serializeArray();
                    }
                    
                    $.merge(postParams, componentPostParams);
                });
            }
            
            //add viewstate if necessary
            if(!hasViewstate) {
                postParams.push({name:PrimeFaces.VIEW_STATE, value:form.children("input[name='javax.faces.ViewState']").val()});
            }

        }
        else {
            $.merge(postParams, form.serializeArray());
        }

        //serialize
        var postData = $.param(postParams);

        PrimeFaces.debug('Post Data:' + postData);

        var xhrOptions = {
            url : postURL,
            type : "POST",
            cache : false,
            dataType : "xml",
            data : postData,
            portletForms: pForms,
            source: cfg.source,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Faces-Request', 'partial/ajax');
            },
            error: function(xhr, status, errorThrown) {
                if(cfg.onerror) {
                    cfg.onerror.call(xhr, status, errorThrown);
                }

                PrimeFaces.error('Request return with error:' + status + '.');
            },
            success : function(data, status, xhr) {
                PrimeFaces.debug('Response received succesfully.');

                var parsed;

                //call user callback
                if(cfg.onsuccess) {
                    parsed = cfg.onsuccess.call(this, data, status, xhr);
                }

                //extension callback that might parse response
                if(cfg.ext && cfg.ext.onsuccess && !parsed) {
                    parsed = cfg.ext.onsuccess.call(this, data, status, xhr); 
                }

                //do not execute default handler as response already has been parsed
                if(parsed) {
                    return;
                } 
                else {
                    PrimeFaces.ajax.AjaxResponse.call(this, data, status, xhr);
                }

                PrimeFaces.debug('DOM is updated.');
            },
            complete : function(xhr, status) {
                if(cfg.oncomplete) {
                    cfg.oncomplete.call(this, xhr, status, this.args);
                }

                if(cfg.ext && cfg.ext.oncomplete) {
                    cfg.ext.oncomplete.call(this, xhr, status, this.args);
                }

                PrimeFaces.debug('Response completed.');

                if(!cfg.async) {
                    PrimeFaces.ajax.Queue.poll();
                }
            }
        };

        xhrOptions.global = cfg.global == true || cfg.global == undefined ? true : false;
        
        $.ajax(xhrOptions);
    }
};

PrimeFaces.ajax.AjaxRequest = function(cfg, ext) {
    cfg.ext = ext;
    
    if(cfg.async) {
        PrimeFaces.ajax.AjaxUtils.send(cfg);
    }
    else {
        PrimeFaces.ajax.Queue.offer(cfg);
    }
}

PrimeFaces.ajax.AjaxResponse = function(responseXML) {
    var xmlDoc = $(responseXML.documentElement),
    updates = xmlDoc.find('update');

    for(var i=0; i < updates.length; i++) {
        var update = updates.eq(i),
        id = update.attr('id'),
        content = update.text();

        PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
    }

    PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);
}

PrimeFaces.ajax.Queue = {
		
    requests : new Array(),
    
    offer : function(request) {
        this.requests.push(request);
        
        if(this.requests.length == 1) {
            PrimeFaces.ajax.AjaxUtils.send(request);
        }
    },
    
    poll : function() {
        if(this.isEmpty()) {
            return null;
        }
        
        var processed = this.requests.shift(),
        next = this.peek();
        
        if(next != null) {
            PrimeFaces.ajax.AjaxUtils.send(next);
        }

        return processed;
    },
    
    peek : function() {
        if(this.isEmpty()) {
            return null;
        }
        
        return this.requests[0];
    },
        
    isEmpty : function() {
        return this.requests.length == 0;
    }
};

/**
 * Utilities
 */
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

String.prototype.startsWith = function(str){
    return (this.indexOf(str) === 0);
}

/**
 * Prime Push Widget
 */
PrimeFaces.widget.PrimeWebSocket = function(cfg) {
    this.cfg = cfg;

    if(this.cfg.autoConnect) {
        this.connect();
    }
}

PrimeFaces.widget.PrimeWebSocket.prototype.send = function(data) {
    this.ws.send(data);
}

PrimeFaces.widget.PrimeWebSocket.prototype.connect = function() {
    this.ws = new WebSocket(this.cfg.url);

    var _self = this;

    this.ws.onmessage = function(evt) {
        var pushData = $.parseJSON(evt.data);

        if(_self.cfg.onmessage) {
            _self.cfg.onmessage.call(_self, evt, pushData);
        }
    };

    this.ws.onclose = function() {
        
    };
    
    this.ws.onerror = function(evt) {
        alert(evt.data);
    };

    PrimeFaces.websockets[this.cfg.channel] = this;
}

PrimeFaces.widget.PrimeWebSocket.prototype.close = function() {
    this.ws.close();
}
/**
 * PrimeFaces Accordion Panel Widget
 */
PrimeFaces.widget.AccordionPanel = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.stateHolder = $(this.jqId + '_active');
        this.headers = this.jq.children('.ui-accordion-header');
        this.panels = this.jq.children('.ui-accordion-content');
        this.headers.children('a').disableSelection();
        this.onshowHandlers = [];

        //active index
        this.cfg.active = this.cfg.multiple ? this.stateHolder.val().split(',') : this.stateHolder.val();

        this.bindEvents();

        if(this.cfg.dynamic && this.cfg.cache) {
            this.markAsLoaded(this.panels.eq(this.cfg.active));
        }

        this.jq.data('widget', this);
    },
    
    bindEvents: function() {
        var _self = this;
    
        this.headers.mouseover(function() {
            var element = $(this);
            if(!element.hasClass('ui-state-active')&&!element.hasClass('ui-state-disabled')) {
                element.addClass('ui-state-hover');
            }
        }).mouseout(function() {
            var element = $(this);
            if(!element.hasClass('ui-state-active')&&!element.hasClass('ui-state-disabled')) {
                element.removeClass('ui-state-hover');
            }
        }).click(function(e) {
            var element = $(this);
            if(!element.hasClass('ui-state-disabled')) {
                var tabIndex = element.index() / 2;

                if(element.hasClass('ui-state-active')) {
                    _self.unselect(tabIndex);
                }
                else {
                    _self.select(tabIndex);
                }
            }

            e.preventDefault();
        });
    },
    
    /**
     *  Activates a tab with given index
     */
    select: function(index) {
        var panel = this.panels.eq(index);

        //Call user onTabChange callback
        if(this.cfg.onTabChange) {
            var result = this.cfg.onTabChange.call(this, panel);
            if(result == false)
                return false;
        }

        var shouldLoad = this.cfg.dynamic && !this.isLoaded(panel);

        //update state
        if(this.cfg.multiple)
            this.addToSelection(index);
        else
            this.cfg.active = index;

        this.saveState();

        if(shouldLoad) {
            this.loadDynamicTab(panel);
        }
        else {
            if(this.hasBehavior('tabChange')) {
                this.fireTabChangeEvent(panel);
            }
            else {
                this.show(panel);
            }
        }

        return true;
    },
    
    /**
     *  Deactivates a tab with given index
     */
    unselect: function(index) {
        var panel = this.panels.eq(index),
        header = panel.prev();

        header.attr('aria-expanded', false).children('.ui-icon').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
        header.removeClass('ui-state-active ui-corner-top').addClass('ui-corner-all');
        panel.attr('aria-hidden', true).slideUp();

        this.removeFromSelection(index);
        this.saveState();
    },
    
    show: function(panel) {
        var _self = this;

        //deactivate current
        if(!this.cfg.multiple) {
            var oldHeader = this.headers.filter('.ui-state-active');
            oldHeader.children('.ui-icon').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
            oldHeader.attr('aria-expanded', false).removeClass('ui-state-active ui-corner-top').addClass('ui-corner-all').next().attr('aria-hidden', true).slideUp();
        }

        //activate selected
        var newHeader = panel.prev();
        newHeader.attr('aria-expanded', true).addClass('ui-state-active ui-corner-top').removeClass('ui-state-hover ui-corner-all')
                .children('.ui-icon').removeClass('ui-icon-triangle-1-e').addClass('ui-icon-triangle-1-s');

        panel.attr('aria-hidden', false).slideDown('normal', function() {
            _self.postTabShow(panel);
        });
    },
    
    loadDynamicTab: function(panel) {
        var _self = this,
        options = {
            source: this.id,
            process: this.id,
            update: this.id
        };

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    $(panel).html(content);

                    if(_self.cfg.cache) {
                        _self.markAsLoaded(panel);
                    }
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            return true;
        };

        options.oncomplete = function() {
            _self.show(panel);
        };

        options.params = [
            {name: this.id + '_contentLoad', value: true},
            {name: this.id + '_newTab', value: panel.attr('id')},
            {name: this.id + '_tabindex', value: parseInt(panel.index() / 2)}
        ];

        if(this.hasBehavior('tabChange')) {
            var tabChangeBehavior = this.cfg.behaviors['tabChange'];

            tabChangeBehavior.call(this, null, options);
        }
        else {
            PrimeFaces.ajax.AjaxRequest(options);
        }
    },
    
    /**
     * Fires an ajax tabChangeEvent if a tabChangeListener is defined on server side
     */
    fireTabChangeEvent : function(panel) {
        var tabChangeBehavior = this.cfg.behaviors['tabChange'],
        _self = this,
        ext = {
            params: [
                {name: this.id + '_newTab', value: panel.attr('id')},
                {name: this.id + '_tabindex', value: parseInt(panel.index() / 2)}
            ]
        };
        
        ext.oncomplete = function() {
            _self.show(panel);
        };

        tabChangeBehavior.call(this, null, ext);
    },
    
    markAsLoaded: function(panel) {
        panel.data('loaded', true);
    },

    isLoaded: function(panel) {
        return panel.data('loaded') == true;
    },

    hasBehavior: function(event) {
        if(this.cfg.behaviors) {
            return this.cfg.behaviors[event] != undefined;
        }

        return false;
    },

    addToSelection: function(nodeId) {
        this.cfg.active.push(nodeId);
    },

    removeFromSelection: function(nodeId) {
        this.cfg.active = $.grep(this.cfg.active, function(r) {
            return r != nodeId;
        });
    },
    
    saveState: function() {
        if(this.cfg.multiple)
            this.stateHolder.val(this.cfg.active.join(','));
        else
            this.stateHolder.val(this.cfg.active);
    },

    addOnshowHandler : function(fn) {
        this.onshowHandlers.push(fn);
    },

    postTabShow: function(newPanel) {            
        //Call user onTabShow callback
        if(this.cfg.onTabShow) {
            this.cfg.onTabShow.call(this, newPanel);
        }

        //execute onshowHandlers and remove successful ones
        this.onshowHandlers = $.grep(this.onshowHandlers, function(fn) {
            return !fn.call();
        });
    }
    
});
/**
 * PrimeFaces AjaxStatus Widget
 */
PrimeFaces.widget.AjaxStatus = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
    },
    
    bindFacet: function(eventName, facetToShow) {
        var _self = this;

        $(document).bind(eventName, function() {
            $(_self.jqId).children().hide();

            $(_self.jqId + '_' + facetToShow).show();
        });
    }
    
    ,bindCallback: function(eventName, fn) {
        $(document).bind(eventName, fn);
    }
    
});
/**
 * PrimeFaces AutoComplete Widget
 */
PrimeFaces.widget.AutoComplete = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.panelId = this.jqId + '_panel';
        this.input = $(this.jqId + '_input');
        this.hinput = $(this.jqId + '_hinput');
        this.panel = this.jq.children(this.panelId);
        this.dropdown = this.jq.children('.ui-button');
        this.disabled = this.input.is(':disabled');
        this.active = true;
        this.cfg.pojo = this.hinput.length == 1;
        this.cfg.minLength = this.cfg.minLength != undefined ? this.cfg.minLength : 1;
        this.cfg.delay = this.cfg.delay != undefined ? this.cfg.delay : 300;
        var _self = this;
        
        //pfs metadata
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        this.hinput.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        
        if(!this.disabled) {
            if(this.cfg.multiple) {
                this.setupMultipleMode();

                this.multiItemContainer.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);
            } 
            else {
                //visuals
                PrimeFaces.skinInput(this.input);

                this.input.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);
                this.dropdown.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);
            }
            
            //core events
            this.bindStaticEvents();

            //client Behaviors
            if(this.cfg.behaviors) {
                PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors);
            }
            
            //force selection
            if(this.cfg.forceSelection) {
                this.setupForceSelection();
            }

            //Panel management
            $(document.body).children(this.panelId).remove();
            this.panel.appendTo(document.body);

            //itemtip
            if(this.cfg.itemtip) {
                this.itemtip = $('<div id="' + this.id + '_itemtip" class="ui-autocomplete-itemtip ui-state-highlight ui-widget ui-corner-all ui-shadow"></div>').appendTo(document.body);
            }

            //Hide overlay on resize
            var resizeNS = 'resize.' + this.id;
            $(window).unbind(resizeNS).bind(resizeNS, function() {
                if(_self.panel.is(':visible')) {
                    _self.hide();
                }
            });

            //dialog support
            this.setupDialogSupport();
        }
        
    },
    
    /**
     * Binds events for multiple selection mode
     */
    setupMultipleMode: function() {
        var _self = this;
        this.multiItemContainer = this.jq.children('ul');
        this.inputContainer = this.multiItemContainer.children('.ui-autocomplete-input-token');

        this.multiItemContainer.hover(function() {
                $(this).addClass('ui-state-hover');
            },
            function() {
                $(this).removeClass('ui-state-hover');
            }
        ).click(function() {
            _self.input.focus();
        });

        //delegate events to container
        this.input.focus(function() {
            _self.multiItemContainer.addClass('ui-state-focus');
        }).blur(function(e) {
            _self.multiItemContainer.removeClass('ui-state-focus');
        });

        //remove token
        $(this.jqId + ' li.ui-autocomplete-token .ui-autocomplete-token-icon').die().live('click', function(e) {
            _self.removeItem(e, $(this).parent());
        });
    },
    
    setupDialogSupport: function() {
        var dialog = this.jq.parents('.ui-dialog:first');

        if(dialog.length == 1) {
            this.panel.css('position', 'fixed');
            
            if(this.cfg.itemtip) {
                this.itemtip.css('position', 'fixed');
            }
        }
    },
    
    bindStaticEvents: function() {
        var _self = this;
 
        this.bindKeyEvents();

        this.dropdown.mouseover(function() {
            if(!_self.disabled) {
                $(this).addClass('ui-state-hover');
            }
        }).mouseout(function() {
            if(!_self.disabled) {
                $(this).removeClass('ui-state-hover');
            }
        }).mousedown(function() {
            if(!_self.disabled && _self.active) {
                $(this).addClass('ui-state-active');
            }
        }).mouseup(function() {
            if(!_self.disabled && _self.active) {
                $(this).removeClass('ui-state-active');

                _self.search('');
                _self.input.focus();
            }
        }).focus(function() {
            $(this).addClass('ui-state-focus');
        }).blur(function() {
            $(this).removeClass('ui-state-focus');
        }).keydown(function(e) {
            var keyCode = $.ui.keyCode;
            
            if(e.which == keyCode.ENTER || e.which == keyCode.NUMPAD_ENTER) {
                _self.search('');
                _self.input.focus();
                
                e.preventDefault();
            }
        });

        //hide overlay when outside is clicked
        var offset;
        $(document.body).bind('mousedown.ui-autocomplete', function (e) {
            if(_self.panel.is(":hidden")) {
                return;
            }
            offset = _self.panel.offset();
            if(e.target === _self.input.get(0)) {
                return;
            }
            if (e.pageX < offset.left ||
                e.pageX > offset.left + _self.panel.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.panel.height()) {
                _self.hide();
            }
        });
    },
    
    bindKeyEvents: function() {
        var _self = this;
        
        //bind keyup handler
        this.input.keyup(function(e) {
            var keyCode = $.ui.keyCode,
            key = e.which,
            shouldSearch = true;

            if(key == keyCode.UP 
                || key == keyCode.LEFT 
                || key == keyCode.DOWN 
                || key == keyCode.RIGHT 
                || key == keyCode.TAB 
                || key == keyCode.SHIFT 
                || key == keyCode.ENTER
                || key == keyCode.NUMPAD_ENTER) {
                shouldSearch = false;
            } 
            else if(_self.cfg.pojo && !_self.cfg.multiple) {
                _self.hinput.val($(this).val());
            }

            if(shouldSearch) {
                var value = _self.input.val();

                if(!value.length) {
                    _self.hide();
                }

                if(value.length >= _self.cfg.minLength) {

                    //Cancel the search request if user types within the timeout
                    if(_self.timeout) {
                        clearTimeout(_self.timeout);
                    }

                    _self.timeout = setTimeout(function() {
                        _self.search(value);
                    }, 
                    _self.cfg.delay);
                }
            }
            
        }).keydown(function(e) {
            if(_self.panel.is(':visible')) {
                var keyCode = $.ui.keyCode,
                highlightedItem = _self.items.filter('.ui-state-highlight');

                switch(e.which) {
                    case keyCode.UP:
                    case keyCode.LEFT:
                        var prev = highlightedItem.length == 0 ? _self.items.eq(0) : highlightedItem.prevAll('.ui-autocomplete-item:first');
                        
                        if(prev.length == 1) {
                            highlightedItem.removeClass('ui-state-highlight');
                            prev.addClass('ui-state-highlight');
                            
                            if(_self.cfg.itemtip) {
                                _self.showItemtip(prev);
                            }
                            
                            if(_self.cfg.scrollHeight) {
                                _self.alignScrollbar(prev);
                            }
                        }
 
                        e.preventDefault();
                        break;

                    case keyCode.DOWN:
                    case keyCode.RIGHT:
                        var next = highlightedItem.length == 0 ? _self.items.eq(0) : highlightedItem.nextAll('.ui-autocomplete-item:first');
                        
                        if(next.length == 1) {
                            highlightedItem.removeClass('ui-state-highlight');
                            next.addClass('ui-state-highlight');
                            
                            if(_self.cfg.itemtip) {
                                _self.showItemtip(next);
                            }
                            
                            if(_self.cfg.scrollHeight) {
                                _self.alignScrollbar(next);
                            }
                        }
                        
                        e.preventDefault();
                        break;

                    case keyCode.ENTER:
                    case keyCode.NUMPAD_ENTER:
                        highlightedItem.click();

                        e.preventDefault();
                        break;

                    case keyCode.ALT: 
                    case 224:
                        break;

                    case keyCode.TAB:
                        highlightedItem.trigger('click');
                        _self.hide();
                        break;
                }
            }

        });
    },
    
    bindDynamicEvents: function() {
        var _self = this;

        //visuals and click handler for items
        this.items.bind('mouseover', function() {
            var item = $(this);
            
            if(!item.hasClass('ui-state-highlight')) {
                _self.items.filter('.ui-state-highlight').removeClass('ui-state-highlight');
                item.addClass('ui-state-highlight');
                
                if(_self.cfg.itemtip) {
                    _self.showItemtip(item);
                }
            }
        })
        .bind('click', function(event) {
            var item = $(this),
            itemValue = item.attr('data-item-value');

            if(_self.cfg.multiple) {
                var itemDisplayMarkup = '<li data-token-value="' + item.attr('data-item-value') + '"class="ui-autocomplete-token ui-state-active ui-corner-all ui-helper-hidden">';
                itemDisplayMarkup += '<span class="ui-autocomplete-token-icon ui-icon ui-icon-close" />';
                itemDisplayMarkup += '<span class="ui-autocomplete-token-label">' + item.attr('data-item-label') + '</span></li>';

                _self.inputContainer.before(itemDisplayMarkup);
                _self.multiItemContainer.children('.ui-helper-hidden').fadeIn();
                _self.input.val('').focus();

                _self.hinput.append('<option value="' + itemValue + '" selected="selected"></option>');
            }
            else {
                _self.input.val(item.attr('data-item-label')).focus();

                if(_self.cfg.pojo) {
                    _self.hinput.val(itemValue);            
                }
            }

            _self.invokeItemSelectBehavior(event, itemValue);

            _self.hide();
        });
    },
    
    showItemtip: function(item) {
        var content = item.is('li') ? item.next('.ui-autocomplete-itemtip-content') : item.children('td:last');
            
        this.itemtip.html(content.html())
                    .css({
                        'left':'', 
                        'top':'', 
                        'z-index': ++PrimeFaces.zindex,
                        'width': content.outerWidth()
                    })
                    .position({
                        my: 'left top'
                        ,at: 'right bottom'
                        ,of: item
                    })
                    .show();
    },
    
    search: function(query) {
        if(!this.active) {
            return;
        }

        var _self = this;

        //start callback
        if(this.cfg.onstart) {
            this.cfg.onstart.call(this, query);
        }
        
        if(this.cfg.itemtip) {
            this.itemtip.hide();
        }
        
        var options = {
            source: this.id,
            update: this.id,
            formId: this.cfg.formId,
            onsuccess: function(responseXML) {
                var xmlDoc = $(responseXML.documentElement),
                updates = xmlDoc.find("update");

                for(var i=0; i < updates.length; i++) {
                    var update = updates.eq(i),
                    id = update.attr('id'),
                    data = update.text();

                    if(id == _self.id) {
                        _self.panel.html(data);
                        _self.items = _self.panel.find('.ui-autocomplete-item');
                        
                        _self.bindDynamicEvents();

                        if(_self.items.length > 0) {
                            var firstItem = _self.items.eq(0);
                            
                            //highlight first item
                            firstItem.addClass('ui-state-highlight');
                            
                            //highlight query string
                            if(_self.panel.children().is('ul')) {
                                _self.items.each(function() {
                                    var item = $(this),
                                    text = item.text(),
                                    re = new RegExp(PrimeFaces.escapeRegExp(query), 'gi'),
                                    highlighedText = text.replace(re, '<span class="ui-autocomplete-query">$&</span>');
                                    
                                    item.html(highlighedText);
                                });
                            }

                            if(_self.cfg.forceSelection) {
                                _self.cachedResults = [];
                                _self.items.each(function(i, item) {
                                    _self.cachedResults.push($(item).attr('data-item-label'));
                                });
                            }
                            
                            //adjust height
                            if(_self.cfg.scrollHeight && _self.panel.height() > _self.cfg.scrollHeight) {
                                _self.panel.height(_self.cfg.scrollHeight);
                            }

                            if(_self.panel.is(':hidden')) {
                                _self.show();
                            } 
                            else {
                                _self.alignPanel(); //with new items
                            }
                            
                            //show itemtip if defined
                            if(_self.cfg.itemtip && firstItem.length == 1) {
                                _self.showItemtip(firstItem);
                            }
                        }
                        else {
                            _self.panel.hide();
                        }
                    } 
                    else {
                        PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, data);
                    }
                }

                PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

                return true;
            }
        };

        //complete callback
        if(this.cfg.oncomplete) {
            options.oncomplete = this.cfg.oncomplete;
        }
        
        //process
        options.process = this.cfg.process ? this.id + ' ' + this.cfg.process : this.id;

        if(this.cfg.global === false) {
            options.global = false;
        }

        options.params = [
          {name: this.id + '_query', value: query}  
        ];
        
        PrimeFaces.ajax.AjaxRequest(options);
    },
    
    show: function() {
        this.alignPanel();

        if(this.cfg.effect)
            this.panel.show(this.cfg.effect, {}, this.cfg.effectDuration);
        else
            this.panel.show();
    },
    
    hide: function() {        
        this.panel.hide();
        
        if(this.cfg.itemtip) {
            this.itemtip.hide();
        }
    },
    
    invokeItemSelectBehavior: function(event, itemValue) {
        if(this.cfg.behaviors) {
            var itemSelectBehavior = this.cfg.behaviors['itemSelect'];

            if(itemSelectBehavior) {
                var ext = {
                    params : [
                        {name: this.id + '_itemSelect', value: itemValue}
                    ]
                };

                itemSelectBehavior.call(this, event, ext);
            }
        }
    },
    
    invokeItemUnselectBehavior: function(event, itemValue) {
        if(this.cfg.behaviors) {
            var itemUnselectBehavior = this.cfg.behaviors['itemUnselect'];

            if(itemUnselectBehavior) {
                var ext = {
                    params : [
                        {name: this.id + '_itemUnselect', value: itemValue}
                    ]
                };
                
                itemUnselectBehavior.call(this, event, ext);
            }
        }
    },
    
    removeItem: function(event, item) {
        var itemValue = item.attr('data-token-value'),
        _self = this;
        
        //remove from options
        this.hinput.children('option').filter('[value="' + itemValue + '"]').remove();
        
        //remove from items
        item.fadeOut('fast', function() {
            var token = $(this);

            token.remove();

            _self.invokeItemUnselectBehavior(event, itemValue);
        });
    },
    
    setupForceSelection: function() {
        this.cachedResults = [this.input.val()];
        var _self = this;

        this.input.blur(function() {
            var value = $(this).val(),
            valid = false;

            for(var i = 0; i < _self.cachedResults.length; i++) {
                if(_self.cachedResults[i] == value) {
                    valid = true;
                    break;
                }
            }

            if(!valid) {
                _self.input.val('');
                _self.hinput.val('');
            }
        });
    },
    
    disable: function() {
        this.disabled = true;
        this.input.addClass('ui-state-disabled').attr('disabled', 'disabled');
    },
    
    enable: function() {
        this.disabled = false;
        this.input.removeClass('ui-state-disabled').removeAttr('disabled');
    },
    
    close: function() {
        this.hide();
    },
    
    deactivate: function() {
        this.active = false;
    },
    
    activate: function() {
        this.active = true;
    },
    
    alignScrollbar: function(item) {
        var relativeTop = item.offset().top - this.items.eq(0).offset().top,
        visibleTop = relativeTop + item.height(),
        scrollTop = this.panel.scrollTop(),
        scrollBottom = scrollTop + this.cfg.scrollHeight,
        viewportCapacity = parseInt(this.cfg.scrollHeight / item.outerHeight(true));
        
        //scroll up
        if(visibleTop < scrollTop) {
            this.panel.scrollTop(relativeTop);
        }
        //scroll down
        else if(visibleTop > scrollBottom) {
            var viewportTopitem = this.items.eq(item.index() - viewportCapacity + 1);
            
            this.panel.scrollTop(viewportTopitem.offset().top - this.items.eq(0).offset().top);
        }
    },
    
    alignPanel: function() {
        var fixedPosition = this.panel.css('position') == 'fixed',
        win = $(window),
        positionOffset = fixedPosition ? '-' + win.scrollLeft() + ' -' + win.scrollTop() : null,
        panelWidth = null;

        if(this.cfg.multiple) {
            panelWidth = this.multiItemContainer.innerWidth() - (this.input.position().left - this.multiItemContainer.position().left);
        }
        else {
            panelWidth = this.input.innerWidth();
        }

        this.panel.css({
                        'left':'',
                        'top':'',
                        'width': panelWidth,
                        'z-index': ++PrimeFaces.zindex
                })
                .position({
                    my: 'left top'
                    ,at: 'left bottom'
                    ,of: this.input,
                    offset : positionOffset
                });
    }
    
});
/**
 * PrimeFaces BlockUI Widget
 */
PrimeFaces.widget.BlockUI = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.block = $(PrimeFaces.escapeClientId(this.cfg.block));
        this.content = $(this.jqId);

        this.render();

        if(this.cfg.triggers) {
            this.bindTriggers();
        }
        
        if(this.cfg.blocked) {
            this.show();
        }

        //remove script tag
        $(this.jqId + '_s').remove();
    },
    
    bindTriggers: function() {
        var _self = this,
        triggers = this.cfg.triggers.split(',');

        //listen global ajax send and complete callbacks
        $(document).bind('ajaxSend', function(e, xhr, settings) {
            if($.inArray(settings.source, triggers) != -1) {
                _self.show();
            }
        });

        $(document).bind('ajaxComplete', function(e, xhr, settings) {
            if($.inArray(settings.source, triggers) != -1) {
                _self.hide();
            }
        });
    },
    
    show: function() {
        var blockWidth = this.block.outerWidth(),
        blockHeight = this.block.outerHeight();

        //set dimensions of blocker to span the content
        this.blocker.width(blockWidth).height(blockHeight);

        //center position of content
        this.content.css({
            'left': (blockWidth - this.content.outerWidth()) / 2,
            'top': (blockHeight - this.content.outerHeight()) / 2
        });

        this.blocker.fadeIn();

        if(this.hasContent()) {
            this.content.fadeIn();
        }
    },
    
    hide: function() {
        this.blocker.fadeOut();

        if(this.hasContent()) {
            this.content.fadeOut();
        }
    },
    
    render: function() {   
        this.blocker = $('<div id="' + this.id + '_blocker" class="ui-blockui ui-widget-overlay ui-helper-hidden"></div>');

        if(this.block.hasClass('ui-corner-all')) {
            this.blocker.addClass('ui-corner-all');
        }

        this.block.css('position', 'relative').append(this.blocker).append(this.content);
    },
    
    hasContent: function() {
        return this.content.contents().length > 0;
    }
    
});
/**
 * PrimeFaces Calendar Widget
 */
PrimeFaces.widget.Calendar = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.input = $(this.jqId + '_input');
        this.jqEl = this.cfg.popup ? this.input : $(this.jqId + '_inline');
        var _self = this;

        //i18n and l7n
        this.configureLocale();

        //Select listener
        this.bindDateSelectListener();

        //disabled dates
        this.cfg.beforeShowDay = function(date) { 
            if(_self.cfg.preShowDay) {
                return _self.cfg.preShowDay(date);
            }
            else if(_self.cfg.disabledWeekends) {
                return $.datepicker.noWeekends(date);
            }
            else {
                return [true,''];
            }
        }


        //Setup timepicker
        var hasTimePicker = this.hasTimePicker();
        if(hasTimePicker) {
            this.configureTimePicker();
        }

        //Client behaviors, input skinning and z-index
        if(this.cfg.popup) {
            PrimeFaces.skinInput(this.jqEl);

            if(this.cfg.behaviors) {
                PrimeFaces.attachBehaviors(this.jqEl, this.cfg.behaviors);
            }

            this.cfg.beforeShow = function() {
                setTimeout(function() {
                    $('#ui-datepicker-div').css('z-index', ++PrimeFaces.zindex);
                }, 250);
            };
        }

        //image title
        this.cfg.buttonText = this.jqEl.attr('title') || '';
        
        //Initialize calendar
        if(!this.cfg.disabled) {
            if(hasTimePicker) {
                if(this.cfg.timeOnly)
                    this.jqEl.timepicker(this.cfg);
                else
                    this.jqEl.datetimepicker(this.cfg);
            }
            else {
                this.jqEl.datepicker(this.cfg);
            }
        }
        
        //readonly input
        if(this.cfg.popup && this.cfg.readonlyInput) {
            this.input.focus(function(e) {
                e.preventDefault();
                $(this).blur();
            });
        }

        //button title
        if(this.cfg.popup && this.cfg.showOn) {
            var triggerButton = this.jqEl.siblings('.ui-datepicker-trigger:button');
            triggerButton.attr('title', this.cfg.buttonText);

            PrimeFaces.skinButton(triggerButton);
        }
        
        //Hide overlay on resize
        if(this.cfg.popup) {
            var resizeNS = 'resize.' + this.id;
            $(window).unbind(resizeNS).bind(resizeNS, function() {
                _self.jqEl.datepicker('hide');
            });
        }
        
        //pfs metadata
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    configureLocale: function() {
        var localeSettings = PrimeFaces.locales[this.cfg.locale];

        if(localeSettings) {
            for(var setting in localeSettings) {
                this.cfg[setting] = localeSettings[setting];
            }
        }
    },
    
    bindDateSelectListener: function() {
        var _self = this;

        this.cfg.onSelect = function() {
            if(_self.cfg.popup) {
                _self.fireDateSelectEvent();
            }
            else {
                var newDate = $.datepicker.formatDate(_self.cfg.dateFormat, _self.getDate()),
                oldDate = _self.input.val();

                if(oldDate == newDate) {
                    _self.setDate(null);
                    _self.input.val('');
                }
                else {
                    _self.input.val(newDate);
                    _self.fireDateSelectEvent();
                }
            }
        };
    },
    
    fireDateSelectEvent: function() {
        if(this.cfg.behaviors) {
            var dateSelectBehavior = this.cfg.behaviors['dateSelect'];

            if(dateSelectBehavior) {
                dateSelectBehavior.call(this);
            }
        }
    },
    
    configureTimePicker: function() {
        var pattern = this.cfg.dateFormat,
        timeSeparatorIndex = pattern.indexOf('h');

        this.cfg.dateFormat = pattern.substring(0, timeSeparatorIndex - 1);
        this.cfg.timeFormat = pattern.substring(timeSeparatorIndex, pattern.length);

        //second
        if(this.cfg.timeFormat.indexOf('ss') != -1) {
            this.cfg.showSecond = true;
        }

        //ampm
        if(this.cfg.timeFormat.indexOf('TT') != -1) {
            this.cfg.ampm = true;
        }
    },
    
    hasTimePicker: function() {
        return this.cfg.dateFormat.indexOf('h') != -1;
    },
    
    setDate: function(date) {
        this.jqEl.datetimepicker('setDate', date);
    },
    
    getDate: function() {
        return this.jqEl.datetimepicker('getDate');
    },
    
    enable: function() {
        this.jqEl.datetimepicker('enable');
    },
    
    disable: function() {
        this.jqEl.datetimepicker('disable');
    }
    
});
/**
 * PrimeFaces Carousel Widget
 */
PrimeFaces.widget.Carousel = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.viewport = this.jq.children('.ui-carousel-viewport');
        this.header = this.jq.children('.ui-carousel-header'),
        this.list = this.viewport.children('ul');
        this.items = this.list.children('.ui-carousel-item');
        this.prevButton = this.header.children('.ui-carousel-prev-button');
        this.nextButton = this.header.children('.ui-carousel-next-button');
        this.pageLinks = this.header.find('.ui-carousel-page-links .ui-carousel-page-link');
        this.dropdown = this.header.children('.ui-carousel-dropdown');
        this.state = $(this.jqId + '_first');

        //configuration
        this.cfg.numVisible = this.cfg.numVisible||3;
        this.cfg.pageLinks = this.cfg.pageLinks||3;
        this.cfg.effect = this.cfg.effect||'slide';
        this.cfg.effectDuration = this.cfg.effectDuration||500;
        this.cfg.easing = this.cfg.easing||'easeInOutCirc';
        this.cfg.pageCount = Math.ceil(this.items.length / this.cfg.numVisible);
        this.cfg.firstVisible = (this.cfg.firstVisible||0) % this.items.length;
        this.cfg.page = (this.cfg.firstVisible / this.cfg.numVisible) + 1;
        this.animating = false;

        var firstItem  = this.items.filter(':first'),
        firstItemNative = firstItem.get(0);
        this.cfg.itemOuterWidth =  firstItem.innerWidth() + parseInt(this.getProperty(firstItemNative, 'margin-Left')) + parseInt(this.getProperty(firstItemNative, 'margin-Right')) +  ((parseInt(this.getProperty(firstItemNative, 'border-Left-Width')) + parseInt(this.getProperty(firstItemNative, 'border-Right-Width'))));
        this.cfg.itemOuterHeight = firstItem.innerHeight() + Math.max(parseInt(this.getProperty(firstItemNative, 'margin-Top')), parseInt(this.getProperty(firstItemNative, 'margin-Bottom'))) + ((parseInt(this.getProperty(firstItemNative, 'border-Top-Width')) + parseInt(this.getProperty(firstItemNative, 'border-Bottom-Width'))));

        //viewport width/height
        if(this.cfg.vertical) {
            this.viewport.width(this.cfg.itemOuterWidth);
            this.viewport.height(this.cfg.numVisible * this.cfg.itemOuterHeight);
        }
        else{
            this.viewport.width(this.cfg.numVisible * this.cfg.itemOuterWidth);
            this.viewport.height(this.cfg.itemOuterHeight);
        }
        this.jq.width(this.viewport.outerWidth(true));

        //set offset position
        this.setOffset(this.getItemPosition(this.cfg.firstVisible));

        this.checkButtons();

        this.bindEvents();

        if(this.cfg.autoPlayInterval) {
            this.startAutoPlay();
        }
    },
    
    /**
     * Returns browser specific computed style property value.
     */
    getProperty: function(item, prop){
        return $.browser.msie ? item.currentStyle.getAttribute(prop.replace(/-/g, "")) : document.defaultView.getComputedStyle(item, "").getPropertyValue(prop.toLowerCase());
    },
    
    /**
     * Autoplay startup.
     */
    startAutoPlay: function(){
        var _self = this;
        if(this.cfg.autoPlayInterval){
            setInterval(function() {
                _self.next();
            }, this.cfg.autoPlayInterval);
        }
    },
    
    /**
     * Binds related mouse/key events.
     */
    bindEvents: function(){
        var _self = this;

        this.pageLinks.click(function(e) {
            if(!_self.animating) {
                _self.setPage($(this).index() + 1);
            }

            e.preventDefault();
        });

        PrimeFaces.skinSelect(this.dropdown);
        this.dropdown.change(function(e) {
            if(!_self.animating)
                _self.setPage(parseInt($(this).val()));
        });

        this.prevButton.click(function(e) {
            if(!_self.prevButton.hasClass('ui-state-disabled') && !_self.animating)
                _self.prev();
        });

        this.nextButton.click(function(){
            if(!_self.nextButton.hasClass('ui-state-disabled') && !_self.animating)
                _self.next();
        });
    },
    
    /**
     * Calculates position of list for a page index.
     */
    getPagePosition: function(index) {
        return -((index - 1) * (this.cfg.vertical ? this.cfg.itemOuterHeight : this.cfg.itemOuterWidth) * this.cfg.numVisible);
    },
    
    /**
     * Calculates position of a given indexed item.
     */
    getItemPosition: function(index){
        return -(index * (this.cfg.vertical ? this.cfg.itemOuterHeight : this.cfg.itemOuterWidth));
    },
    
    /**
     * Returns instant position of list.
     */
    getPosition: function(){
        return parseInt(this.list.css(this.cfg.vertical ? 'top' : 'left'));
    },
    
    /**
     * Sets instant position of list.
     */
    setOffset: function(val) {
        this.list.css(this.cfg.vertical ? {
            'top' : val
        } : {
            'left' : val
        });
    },
    
    fade: function(val){
        var _self = this;
        this.list.animate(
        {
            opacity: 0
        },
        {
            duration: this.cfg.effectDuration / 2,
            specialEasing: {
                opacity : this.cfg.easing
            },
            complete: function() {
                _self.setOffset(val);
                $(this).animate( 
                {
                    opacity: 1
                }, 
                {
                    duration: _self.cfg.effectDuration / 2,
                    specialEasing: {
                        opacity : _self.cfg.easing
                    },
                    complete: function() {
                        _self.animating = false;
                    }
                });
            }
        });
    },
    
    slide: function(val){
        var _self = this,
        animateOption = this.cfg.vertical ? {
            top : val
        } : {
            left : val
        };

        this.list.animate( 
            animateOption, 
            {
                duration: this.cfg.effectDuration,
                easing: this.cfg.easing,
                complete: function() {
                    _self.animating = false;
                }
            });
    },
    
    next: function(){
        this.setPage(this.cfg.page + 1);
    },
    
    prev: function(){
        this.setPage(this.cfg.page - 1);
    },
    
    setPage: function(index) {    
        if(this.cfg.isCircular)
            this.cfg.page = index > this.cfg.pageCount ? 1 : index < 1 ? this.cfg.pageCount : index;
        else
            this.cfg.page  = index;

        this.checkButtons();

        this.state.val((this.cfg.page - 1) * this.cfg.numVisible);

        var newPosition = this.getPagePosition(this.cfg.page);

        if(this.getPosition() == newPosition) {
            this.animating = false;
            return;
        }

        if(this.cfg.effect == 'fade')
            this.fade(newPosition);
        else
            this.slide(newPosition);
    },
    
    checkButtons: function() {
        this.pageLinks.filter('.ui-icon-radio-on').removeClass('ui-icon-radio-on');
        this.pageLinks.eq(this.cfg.page - 1).addClass('ui-icon-radio-on');

        this.dropdown.val(this.cfg.page);

        //no bound
        if(this.cfg.isCircular)
            return;

        //lower bound
        if(this.cfg.page == 1){
            this.prevButton.addClass('ui-state-disabled');
        }
        else{
            this.prevButton.removeClass('ui-state-disabled');
        }

        //upper bound
        if(this.cfg.page >= this.cfg.pageCount){
            this.nextButton.addClass('ui-state-disabled');
        }
        else{
            this.nextButton.removeClass('ui-state-disabled');
        }
    }
    
});
/**
 * PrimeFaces Dashboard Widget
 */
PrimeFaces.widget.Dashboard = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.cfg.connectWith = '.ui-dashboard-column';
        this.cfg.placeholder = 'ui-state-hover';
        this.cfg.forcePlaceholderSize = true;
        this.cfg.revert=true;
        this.cfg.handle='.ui-panel-titlebar';

        var _self = this;

        if(this.cfg.behaviors) {
            var reorderBehavior = this.cfg.behaviors['reorder'];

            if(reorderBehavior) {
                this.cfg.update = function(e, ui) {

                    if(this === ui.item.parent()[0]) {
                        var itemIndex = ui.item.parent().children().filter(':not(script):visible').index(ui.item),
                        receiverColumnIndex =  ui.item.parent().parent().children().index(ui.item.parent());

                        var ext = {
                            params: [
                                {name: _self.id + '_reordered', value: true},
                                {name: _self.id + '_widgetId', value: ui.item.attr('id')},
                                {name: _self.id + '_itemIndex', value: itemIndex},
                                {name: _self.id + '_receiverColumnIndex', value: receiverColumnIndex}
                            ]
                        }  

                        if(ui.sender) {
                            ext.params.push({name: _self.id + '_senderColumnIndex', value: ui.sender.parent().children().index(ui.sender)});
                        }

                        reorderBehavior.call(_self, e, ext);
                    }

                };
            }
        } 

        $(this.jqId + ' .ui-dashboard-column').sortable(this.cfg);
    }
    
});
/**
 * PrimeFaces DataGrid Widget
 */
PrimeFaces.widget.DataGrid = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.cfg.formId = $(this.jqId).parents('form:first').attr('id');
        this.content = this.jqId + '_content';

        if(this.cfg.paginator) {
            this.setupPaginator();
        }
    },
    
    setupPaginator: function() {
        var _self = this;
        this.cfg.paginator.paginate = function(newState) {
            _self.handlePagination(newState);
        };

        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator);
    },
    
    handlePagination: function(newState) {
        var _self = this,
        options = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId,
            onsuccess: function(responseXML) {
                var xmlDoc = $(responseXML.documentElement),
                updates = xmlDoc.find("update");

                for(var i=0; i < updates.length; i++) {
                    var update = updates.eq(i),
                    id = update.attr('id'),
                    content = update.text();

                    if(id == _self.id){
                        $(_self.content).html(content);
                    }
                    else {
                        PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                    }
                }

                PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);
                
                return true;
            }
        };
        
        options.oncomplete = function() {
            //update paginator state
            _self.paginator.cfg.page = newState.page;
            
            _self.paginator.updateUI();
        };

        options.params = [
            {name: this.id + '_pagination', value: true},
            {name: this.id + '_first', value: newState.first},
            {name: this.id + '_rows', value: newState.rows}
        ];

        PrimeFaces.ajax.AjaxRequest(options);
    },
    
    getPaginator: function() {
        return this.paginator;
    }
    
});
/**
 * PrimeFaces DataGrid Widget
 */
PrimeFaces.widget.DataList = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.cfg.formId = $(this.jqId).parents('form:first').attr('id');
        this.content = this.jqId + '_content';

        if(this.cfg.paginator) {
            this.setupPaginator();
        }
    },
    
    setupPaginator: function() {
        var _self = this;
        this.cfg.paginator.paginate = function(newState) {
            _self.handlePagination(newState);
        };

        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator);
    },
    
    handlePagination: function(newState) {
        var _self = this,
        options = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId,
            onsuccess: function(responseXML) {
                var xmlDoc = $(responseXML.documentElement),
                updates = xmlDoc.find("update");

                for(var i=0; i < updates.length; i++) {
                    var update = updates.eq(i),
                    id = update.attr('id'),
                    content = update.text();

                    if(id == _self.id){
                        $(_self.content).html(content);
                    }
                    else {
                        PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                    }
                }

                PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);
               
                return true;
            }
        };
        
        options.oncomplete = function() {
            //update paginator state
            _self.paginator.cfg.page = newState.page;
                
            _self.paginator.updateUI();
        };
        
        options.params = [
            {name: this.id + '_pagination', value: true},
            {name: this.id + '_first', value: newState.first},
            {name: this.id + '_rows', value: newState.rows}
        ];

        PrimeFaces.ajax.AjaxRequest(options);
    },
    
    getPaginator: function() {
        return this.paginator;
    }
    
});
/**
 * PrimeFaces DataTable Widget
 */
PrimeFaces.widget.DataTable = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.tbody = $(this.jqId + '_data');
        this.cfg.formId = this.jq.parents('form:first').attr('id');

        //Paginator
        if(this.cfg.paginator) {
            this.setupPaginator();
        }

        //Sort events
        this.setupSortEvents();

        //Selection events
        if(this.cfg.selectionMode || this.cfg.columnSelectionMode) {
            this.selectionHolder = this.jqId + '_selection';

            var preselection = $(this.selectionHolder).val();
            this.selection = preselection == "" ? [] : preselection.split(',');
            
            //shift key based range selection
            this.originRowIndex = 0;
            this.cursorIndex = null;

            this.setupSelectionEvents();
        }

        //Filtering
        if(this.cfg.filtering) {
            this.setupFiltering();
        }

        if(this.cfg.expansion) {
            this.expansionProcess = [];
            this.setupExpansionEvents();
        }

        if(this.cfg.editable) {
            this.setupCellEditorEvents();
        }

        if(this.cfg.scrollable) {
            this.setupScrolling();
        }

        if(this.cfg.resizableColumns) {
            this.setupResizableColumns();
        }

        if(this.cfg.draggableColumns) {
            this.setupDraggableColumns();
        }
    },
    
    /**
     * @Override
     */
    refresh: function(cfg) {
        //remove arrows
        if(cfg.draggableColumns) {
            var jqId = PrimeFaces.escapeClientId(cfg.id);
            $(jqId + '_dnd_top,' + jqId + '_dnd_bottom').remove();
        }
        
        this.init(cfg);
    },
    
    /**
     * Binds the change event listener and renders the paginator
     */
    setupPaginator: function() {
        var _self = this;
        this.cfg.paginator.paginate = function(newState) {
            _self.paginate(newState);
        };

        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator);
    },
    
    /**
     * Applies events related to sorting in a non-obstrusive way
     */
    setupSortEvents: function() {
        var _self = this;

        $(this.jqId + ' th.ui-sortable-column').
            mouseover(function(){
                $(this).toggleClass('ui-state-hover');
            })
            .mouseout(function(){
                $(this).toggleClass('ui-state-hover');}
            )
            .click(function(event) {

                //Stop event if target is a clickable element inside header
                if($(event.target).is(':not(th,span,.ui-dt-c)')) {
                    return;
                }

                PrimeFaces.clearSelection();

                var columnId = $(this).attr('id');

                //Reset previous sorted columns
                $(this).siblings().removeClass('ui-state-active').
                    find('.ui-sortable-column-icon').removeClass('ui-icon-triangle-1-n ui-icon-triangle-1-s');

                //Update sort state
                $(this).addClass('ui-state-active');
                var sortIcon = $(this).find('.ui-sortable-column-icon');

                if(sortIcon.hasClass('ui-icon-triangle-1-n')) {
                    sortIcon.removeClass('ui-icon-triangle-1-n').addClass('ui-icon-triangle-1-s');

                    _self.sort(columnId, "DESCENDING");
                    PrimeFaces.clearSelection();
                }
                else if(sortIcon.hasClass('ui-icon-triangle-1-s')) {
                    sortIcon.removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-n');

                    _self.sort(columnId, "ASCENDING");
                } 
                else {
                    sortIcon.addClass('ui-icon-triangle-1-n');

                    _self.sort(columnId, "ASCENDING");
                }
            });
    },
      
    /**
     * Binds filter events to filters
     */
    setupFiltering: function() {
        var _self = this,
        filterEvent = _self.cfg.filterEvent == 'enter' ? 'keypress' : 'keyup';

        $(this.jqId + ' thead:first th.ui-filter-column .ui-dt-c .ui-column-filter').each(function(index) {
            var filter = $(this);

            if(filter.is('input:text')) {
                PrimeFaces.skinInput(filter);

                filter.bind(filterEvent, function(e) {
                    if(_self.cfg.filterEvent == 'keyup'||(_self.cfg.filterEvent == 'enter' && e.which == $.ui.keyCode.ENTER)){
                        _self.filter(e);

                        e.preventDefault();
                    } 
                });
            } 
            else {
                filter.change(function(e) {
                    _self.filter(e);
                });
            }
        });
    },
    
    /**
     * Applies events related to selection in a non-obstrusive way
     */
    setupSelectionEvents: function() {
        var _self = this;

        //Row mouseover, mouseout, click
        if(this.cfg.selectionMode) {
            $(this.jqId + ' tbody.ui-datatable-data > tr.ui-widget-content:not(.ui-datatable-empty-message)').css('cursor', 'pointer')
                .die('mouseover.datatable mouseout.datatable contextmenu.datatable click.datatable')
                .live('mouseover.datatable', function() {
                    var element = $(this);

                    if(!element.hasClass('ui-state-highlight')) {
                        element.addClass('ui-state-hover');
                    }
                })
                .live('mouseout.datatable', function() {
                    var element = $(this);

                    if(!element.hasClass('ui-state-highlight')) {
                        element.removeClass('ui-state-hover');
                    }
                })
                .live('click.datatable', function(event) {
                    _self.onRowClick(event, this);
                })
                .live('dblclick.datatable', function(event) {
                    _self.onRowDblclick(event, this);
                })
                .live('contextmenu.datatable', function(event) {
                    _self.onRowClick(event, this);
                    event.preventDefault();
                });
        }
        //Radio-Checkbox based rowselection
        else if(this.cfg.columnSelectionMode) {

            if(this.cfg.columnSelectionMode == 'single') {
                var radios = $(this.jqId + ' tbody.ui-datatable-data td.ui-selection-column .ui-radiobutton .ui-radiobutton-box');

                radios.die('click').live('click', function() {
                    var radio = $(this),
                    checked = radio.hasClass('ui-state-active'),
                    disabled = radio.hasClass('ui-state-disabled');

                    if(!disabled && !checked) {
                        _self.selectRowWithRadio(radio);
                    }
                }).die('mouseover').live('mouseover', function() {
                    var radio = $(this);
                    if(!radio.hasClass('ui-state-disabled')&&!radio.hasClass('ui-state-active')) {
                        radio.addClass('ui-state-hover');
                    }
                }).die('mouseout').live('mouseout', function() {
                    var radio = $(this);
                    radio.removeClass('ui-state-hover');
                });
            }
            else {
                this.checkAllToggler = $(this.jqId + ' table thead th.ui-selection-column .ui-chkbox.ui-chkbox-all .ui-chkbox-box');

                //check-uncheck all
                this.checkAllToggler.die('mouseover').live('mouseover', function() {
                    var box = $(this);
                    if(!box.hasClass('ui-state-disabled')&&!box.hasClass('ui-state-active')) {
                        box.addClass('ui-state-hover');
                    }
                }).die('mouseout').live('mouseout', function() {
                    $(this).removeClass('ui-state-hover');
                }).die('click').live('click', function() {
                    _self.toggleCheckAll();
                });

                //row checkboxes
                $(this.jqId + ' tbody.ui-datatable-data td.ui-selection-column .ui-chkbox .ui-chkbox-box').die('mouseover').live('mouseover', function() {
                    var box = $(this);
                    if(!box.hasClass('ui-state-disabled')&&!box.hasClass('ui-state-active')) {
                        box.addClass('ui-state-hover');
                    }
                }).die('mouseout').live('mouseout', function() {
                    $(this).removeClass('ui-state-hover');
                }).die('click').live('click', function() {
                    var checkbox = $(this);

                    if(!checkbox.hasClass('ui-state-disabled')) {
                        var checked = checkbox.hasClass('ui-state-active');

                        if(checked) {
                            _self.unselectRowWithCheckbox(checkbox);
                        } 
                        else {                        
                            _self.selectRowWithCheckbox(checkbox);
                        }
                    }
                });
            }
        }
    },
    
    /**
     * Applies events related to row expansion in a non-obstrusive way
     */
    setupExpansionEvents: function() {
        var _self = this;

        $(this.jqId + ' tbody.ui-datatable-data tr td span.ui-row-toggler')
                .die()
                .live('click', function() {
                    _self.toggleExpansion(this);
                });
    },
    
    /**
     * Initialize data scrolling, for live scrolling listens scroll event to load data dynamically
     */
    setupScrolling: function() {
        this.scrollHeader = $(this.jqId + ' .ui-datatable-scrollable-header');
        this.scrollBody = $(this.jqId + ' .ui-datatable-scrollable-body');
        this.scrollFooter = $(this.jqId + ' .ui-datatable-scrollable-footer');
        this.scrollStateHolder = $(this.jqId + '_scrollState');
        var _self = this;
        
        this.restoreScrollState();

        if(this.cfg.liveScroll) {
            this.scrollOffset = this.cfg.scrollStep;
            this.shouldLiveScroll = true;       
        }

        //scroll handler
        this.scrollBody.scroll(function() {
            _self.scrollHeader.scrollLeft(_self.scrollBody.scrollLeft());
            _self.scrollFooter.scrollLeft(_self.scrollBody.scrollLeft());

            if(_self.shouldLiveScroll) {
                var scrollTop = this.scrollTop,
                scrollHeight = this.scrollHeight,
                viewportHeight = this.clientHeight;

                if(scrollTop >= (scrollHeight - (viewportHeight))) {
                    _self.loadLiveRows();
                }
            }
            
            _self.saveScrollState();
        });
    },
    
    restoreScrollState: function() {
        var scrollState = this.scrollStateHolder.val(),
        scrollValues = scrollState.split(',');

        this.scrollBody.scrollLeft(scrollValues[0]);
        this.scrollBody.scrollTop(scrollValues[1]);
    },
    
    saveScrollState: function() {
        var scrollState = this.scrollBody.scrollLeft() + ',' + this.scrollBody.scrollTop();
        
        this.scrollStateHolder.val(scrollState);
     },
    
    /**
     * Loads rows on-the-fly when scrolling live
     */
    loadLiveRows: function() {
        var options = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId
        },
        _self = this;

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id) {
                    var lastRow = $(_self.jqId + ' .ui-datatable-scrollable-body table tr:last'),
                    lastRowColumnWrappers = lastRow.find('div.ui-dt-c');

                    //insert new rows
                    lastRow.after(content);

                    //align column widths of newly added rows with older ones
                    lastRow.nextAll('tr').each(function() {
                        var row = $(this);
                        row.find('div.ui-dt-c').each(function(i) {
                            var wrapper = $(this),
                            column = wrapper.parent();

                            wrapper.width(lastRowColumnWrappers.eq(i).width());
                            column.width('');
                        });
                    });

                    _self.scrollOffset += _self.cfg.scrollStep;

                    //Disable scroll if there is no more data left
                    if(_self.scrollOffset == _self.cfg.scrollLimit) {
                        _self.shouldLiveScroll = false;
                    }
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            return true;
        };

        options.params = [
            {name: this.id + '_scrolling', value: true},
            {name: this.id + '_scrollOffset', value: this.scrollOffset}
            
        ];

        PrimeFaces.ajax.AjaxRequest(options);
    },
    
    /**
     * Ajax pagination
     */
    paginate: function(newState) {
        var options = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId
        };

        var _self = this;

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id) {
                    //update body
                    _self.tbody.html(content);

                    //update header checkbox if all enabled checkboxes are checked in new page
                    if(_self.checkAllToggler) {
                        _self.updateHeaderCheckbox();
                    }
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);
            
            return true;
        };
        
        options.oncomplete = function() {
            //update paginator state
            _self.paginator.cfg.page = newState.page;
            
            _self.paginator.updateUI();
        };

        options.params = [
            {name: this.id + '_pagination', value: true},
            {name: this.id + '_first', value: newState.first},
            {name: this.id + '_rows', value: newState.rows},
            {name: this.id + '_updateBody', value: true},
        ];

        if(this.hasBehavior('page')) {
            var pageBehavior = this.cfg.behaviors['page'];

            pageBehavior.call(this, newState, options);
        } 
        else {
            PrimeFaces.ajax.AjaxRequest(options); 
        }
    },
    
    /**
     * Ajax sort
     */
    sort: function(columnId, asc) {    
        var options = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId
        };

        var _self = this;
        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    //update body
                    _self.tbody.html(content);

                    //reset paginator
                    var paginator = _self.getPaginator();
                    if(paginator) {
                        paginator.setPage(0, true);
                    }
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            return true;
        };

        options.params = [
            {name: this.id + '_sorting', value: true},
            {name: this.id + '_sortKey', value: columnId},
            {name: this.id + '_sortDir', value: asc},
            {name: this.id + '_updateBody', value: true}
        ];

        if(this.hasBehavior('sort')) {
            var sortBehavior = this.cfg.behaviors['sort'];

            sortBehavior.call(this, columnId, options);
        } 
        else {
            PrimeFaces.ajax.AjaxRequest(options); 
        }
    },
    
    /**
     * Ajax filter
     */
    filter: function() {
        var options = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId
        };

        var _self = this;
        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    //update body
                    _self.tbody.html(content);
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            //update paginator
            var paginator = _self.getPaginator();
            if(paginator) {
                paginator.setTotalRecords(this.args.totalRecords);
            }
            
            return true;
        };

        options.params = [
            {name: this.id + '_filtering', value: true},
            {name: this.id + '_updateBody', value: true}
        ];

        if(this.hasBehavior('filter')) {
            var filterBehavior = this.cfg.behaviors['filter'];

            filterBehavior.call(this, {}, options);
        } 
        else {
            PrimeFaces.ajax.AjaxRequest(options); 
        }
    },
    
    onRowClick: function(event, rowElement) {    
        //Check if rowclick triggered this event not a clickable element in row content
        if($(event.target).is('.ui-dt-c,td,span')) {
            var row = $(rowElement),
            selected = row.hasClass('ui-state-highlight'),
            metaKey = event.metaKey||event.ctrlKey;

            //unselect a selected row if metakey is on
            if(selected && metaKey) {
                this.unselectRow(row);
            }
            else {
                //unselect previous selection if this is single selection or multiple one with no keys
                if(this.isSingleSelection() || (this.isMultipleSelection() && event && !metaKey && !event.shiftKey)) {
                    this.unselectAllRows();
                }
                
                //range selection with shift key
                if(this.isMultipleSelection() && event && event.shiftKey) {                    
                    this.selectRowsInRange(row);
                }
                //select current row
                else {
                    this.originRowIndex = row.index();
                    this.cursorIndex = null;
                    
                    this.selectRow(row);
                }
            } 

            PrimeFaces.clearSelection();
        }
    },
    
    onRowDblclick: function(event, rowElement) {   
        var rowDblclickBehavior = this.cfg.behaviors['rowDblselect'];
        
        if(rowDblclickBehavior) {
            //Check if rowclick triggered this event not a clickable element in row content
            if($(event.target).is('.ui-dt-c,td,span')) {
                var row = $(rowElement),
                rowMeta = this.getRowMeta(row);
                
                this.fireRowSelectEvent(rowMeta.key, 'rowDblselect');
            }
        }
        
    },
    
    /**
     * @param r {Row Index || Row Element}
     */
    findRow: function(r) {
        var row = r;

        if(PrimeFaces.isNumber(r)) {
            row = this.tbody.children('tr:eq(' + r + ')');
        }

        return row;
    },
    
    selectRowsInRange: function(row) {
        var rows = this.tbody.children(),
        _self = this;
       
        //unselect previously selected rows with shift
        if(this.cursorIndex) {
            var oldCursorIndex = this.cursorIndex,
            rowsToUnselect = oldCursorIndex > this.originRowIndex ? rows.slice(this.originRowIndex, oldCursorIndex + 1) : rows.slice(oldCursorIndex, this.originRowIndex + 1);

            rowsToUnselect.each(function(i, item) {
                _self.unselectRow($(item), true);
            });
        }

        //select rows between cursor and origin
        this.cursorIndex = row.index();

        var rowsToSelect = this.cursorIndex > this.originRowIndex ? rows.slice(this.originRowIndex, this.cursorIndex + 1) : rows.slice(this.cursorIndex, this.originRowIndex + 1);

        rowsToSelect.each(function(i, item) {
            _self.selectRow($(item), true);
        });
    },
    
    selectRow: function(r, silent) {
        var row = this.findRow(r),
        rowMeta = this.getRowMeta(row);

        //add to selection
        row.removeClass('ui-state-hover').addClass('ui-state-highlight').attr('aria-selected', true);
        this.addSelection(rowMeta.key);

        //save state
        this.writeSelections();

        if(!silent) {
            this.fireRowSelectEvent(rowMeta.key, 'rowSelect');
        }
    },
    
    unselectRow: function(r, silent) {
        var row = this.findRow(r),
        rowMeta = this.getRowMeta(row);

        //remove visual style
        row.removeClass('ui-state-highlight').attr('aria-selected', false);

        //remove from selection
        this.removeSelection(rowMeta.key);

        //save state
        this.writeSelections();

        if(!silent) {
            this.fireRowUnselectEvent(rowMeta.key, "rowUnselect");
        }
    },
    
    /**
     * Sends a rowSelectEvent on server side to invoke a rowSelectListener if defined
     */
    fireRowSelectEvent: function(rowKey, behaviorEvent) {
        if(this.cfg.behaviors) {
            var selectBehavior = this.cfg.behaviors[behaviorEvent];

            if(selectBehavior) {
                var ext = {
                    params: [
                        {name: this.id + '_instantSelectedRowKey', value: rowKey}
                    ]
                };

                selectBehavior.call(this, rowKey, ext);
            }
        }
    },
    
    /**
     * Sends a rowUnselectEvent on server side to invoke a rowUnselectListener if defined
     */
    fireRowUnselectEvent: function(rowKey, behaviorEvent) {
        if(this.cfg.behaviors) {
            var unselectBehavior = this.cfg.behaviors[behaviorEvent];

            if(unselectBehavior) {
                var ext = {
                    params: [
                        {name: this.id + '_instantUnselectedRowKey', value: rowKey}
                    ]
                };

                unselectBehavior.call(this, rowKey, ext);
            }
        }
    },
    
    /**
     * Selects the corresping row of a radio based column selection
     */
    selectRowWithRadio: function(radio) {
        var row = radio.parents('tr:first'),
        rowMeta = this.getRowMeta(row);

        //clean previous selection
        this.selection = [];
        row.siblings('.ui-state-highlight').removeClass('ui-state-highlight').attr('aria-selected', false)      //row
            .find('td.ui-selection-column .ui-radiobutton .ui-radiobutton-box').removeClass('ui-state-active')  //radio
            .children('span.ui-radiobutton-icon').removeClass('ui-icon ui-icon-bullet');                        //radio icon

        //select current
        radio.addClass('ui-state-active').children('.ui-radiobutton-icon').addClass('ui-icon ui-icon-bullet');

        //add to selection
        this.addSelection(rowMeta.key);
        row.addClass('ui-state-highlight').attr('aria-selected', true); 

        //save state
        this.writeSelections();

        this.fireRowSelectEvent(rowMeta.key, 'rowSelectRadio');
    },
    
    /**
     * Selects the corresping row of a checkbox based column selection
     */
    selectRowWithCheckbox: function(checkbox, silent) {
        var row = checkbox.parents('tr:first'),
        rowMeta = this.getRowMeta(row);

        //update visuals
        checkbox.addClass('ui-state-active').children('span.ui-chkbox-icon:first').addClass('ui-icon ui-icon-check');
        row.addClass('ui-state-highlight').attr('aria-selected', true);

        //add to selection
        this.addSelection(rowMeta.key);

        this.updateHeaderCheckbox();

        this.writeSelections();

        if(!silent) {
            this.fireRowSelectEvent(rowMeta.key, "rowSelectCheckbox");
        }
    },
    
    /**
     * Unselects the corresping row of a checkbox based column selection
     */
    unselectRowWithCheckbox: function(checkbox, silent) {
        var row = checkbox.parents('tr:first'),
        rowMeta = this.getRowMeta(row);

        checkbox.removeClass('ui-state-active').children('span.ui-chkbox-icon:first').removeClass('ui-icon ui-icon-check');
        row.removeClass('ui-state-highlight').attr('aria-selected', false);

        //remove from selection
        this.removeSelection(rowMeta.key);

        //unselect header checkbox
        this.checkAllToggler.removeClass('ui-state-active').children('span.ui-chkbox-icon:first').removeClass('ui-icon ui-icon-check');

        this.writeSelections();

        if(!silent) {
            this.fireRowUnselectEvent(rowMeta.key, "rowUnselectCheckbox");
        }
    },
    
    unselectAllRows: function() {
        this.tbody.children('tr.ui-state-highlight').removeClass('ui-state-highlight').attr('aria-selected', false); 
        this.selection = [];
        this.writeSelections();
    },
    
    /**
     * Toggles all rows with checkbox
     */
    toggleCheckAll: function() {
        var checkboxes = this.tbody.find('> tr > td.ui-selection-column .ui-chkbox-box:not(.ui-state-disabled)'),
        checked = this.checkAllToggler.hasClass('ui-state-active'),
        _self = this;

        if(checked) {
            this.checkAllToggler.removeClass('ui-state-active').children('span.ui-chkbox-icon').removeClass('ui-icon ui-icon-check');

            checkboxes.each(function() {
                _self.unselectRowWithCheckbox($(this), true);
            });
        } 
        else {
            this.checkAllToggler.addClass('ui-state-active').children('span.ui-chkbox-icon').addClass('ui-icon ui-icon-check');

            checkboxes.each(function() {
                _self.selectRowWithCheckbox($(this), true);

            });
        }

        //save state
        this.writeSelections();

        //fire toggleSelect event
        if(this.cfg.behaviors) {
            var toggleSelectBehavior = this.cfg.behaviors['toggleSelect'];

            if(toggleSelectBehavior) {            
                toggleSelectBehavior.call(this);
            }
        }
    },
    
    /**
     * Expands a row to display detail content
     */
    toggleExpansion: function(expanderElement) {
        var expander = $(expanderElement),
        row = expander.parents('tr:first'),
        rowIndex = this.getRowMeta(row).index,
        expanded = row.hasClass('ui-expanded-row'),
        _self = this;

        //Run toggle expansion if row is not being toggled already to prevent conflicts
        if($.inArray(rowIndex, this.expansionProcess) == -1) {
            if(expanded) {
                this.expansionProcess.push(rowIndex);
                expander.removeClass('ui-icon-circle-triangle-s');
                row.removeClass('ui-expanded-row');

                row.next().fadeOut(function() {
                $(this).remove();

                _self.expansionProcess = $.grep(_self.expansionProcess, function(r) {
                        return r != rowIndex;
                    });
                });
                
                this.fireRowCollapseEvent(row);
            }
            else {
                this.expansionProcess.push(rowIndex);
                expander.addClass('ui-icon-circle-triangle-s');
                row.addClass('ui-expanded-row');

                this.loadExpandedRowContent(row);
            }
        }
    },
    
    loadExpandedRowContent: function(row) {
        var options = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId
        },
        rowIndex = this.getRowMeta(row).index,
        _self = this;

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    row.after(content);
                    row.next().fadeIn();
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            return true;
        };

        options.oncomplete = function() {
            _self.expansionProcess = $.grep(_self.expansionProcess, function(r) {
                return r != rowIndex;
            });
        };

        options.params = [
            {name: this.id + '_rowExpansion', value: true},
            {name: this.id + '_expandedRowIndex', value: rowIndex}
        ];
        
        if(this.hasBehavior('rowToggle')) {
            var rowToggleBehavior = this.cfg.behaviors['rowToggle'];

            rowToggleBehavior.call(this, row, options);
        } 
        else {
            PrimeFaces.ajax.AjaxRequest(options); 
        }
    },
    
    fireRowCollapseEvent: function(row) {
        var rowIndex = this.getRowMeta(row).index;
        
        if(this.hasBehavior('rowToggle')) {
            var ext = {
                params: [
                    {name: this.id + '_collapsedRowIndex', value: rowIndex}
                ]
            };
        
            var rowToggleBehavior = this.cfg.behaviors['rowToggle'];

            rowToggleBehavior.call(this, row, ext);
        } 
    },
    
    /**
     * Displays in-cell editors for given row
     */
    showEditors: function(el) {
        var element = $(el);

        element.parents('tr:first').addClass('ui-state-highlight').children('td.ui-editable-column').each(function() {
            var column = $(this);

            column.find('span.ui-cell-editor-output').hide();
            column.find('span.ui-cell-editor-input').show();

            if(element.hasClass('ui-icon-pencil')) {
                element.hide().siblings().show();
            }
        });
    },
    
    /**
     * Saves the edited row
     */
    saveRowEdit: function(rowEditor) {
        this.doRowEditRequest(rowEditor, 'save');
    },
    
    /**
     * Cancels row editing
     */
    cancelRowEdit: function(rowEditor) {
        this.doRowEditRequest(rowEditor, 'cancel');
    },
    
    /**
     * Sends an ajax request to handle row save or cancel
     */
    doRowEditRequest: function(rowEditor, action) {
        var row = rowEditor.parents('tr:first'),
        rowEditorId = rowEditor.attr('id'),
        options = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId
        },
        expanded = row.hasClass('ui-expanded-row'),
        _self = this;

        if(action === 'save') {
            //Only process cell editors of current row
            var editorsToProcess = new Array();
            row.find('span.ui-cell-editor').each(function() {
                editorsToProcess.push($(this).attr('id'));
            });

            options.process = editorsToProcess.join(' ');
        }

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    if(!this.args.validationFailed) {
                        //remove row expansion
                        if(expanded) {
                            row.next().remove();
                        }

                        row.replaceWith(content);
                    }
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            return true;
        };

        options.params = [
            {name: rowEditorId, value: rowEditorId},
            {name: this.id + '_rowEditIndex', value: this.getRowMeta(row).index},
            {name: this.id + '_rowEditAction', value: action}
        ];

        if(action === 'save' && this.hasBehavior('rowEdit')) {
            this.cfg.behaviors['rowEdit'].call(this, row, options);
        }
        else if(action === 'cancel' && this.hasBehavior('rowEditCancel')) {
            this.cfg.behaviors['rowEditCancel'].call(this, row, options);
        }
        else {
            PrimeFaces.ajax.AjaxRequest(options); 
        }
    }

    /**
     * Returns the paginator instance if any defined
     */
    ,getPaginator: function() {
        return this.paginator;
    },
    
    /**
     * Writes selected row ids to state holder
     */
    writeSelections: function() {
        $(this.selectionHolder).val(this.selection.join(','));
    },
    
    isSingleSelection: function() {
        return this.cfg.selectionMode == 'single';
    },
    
    isMultipleSelection: function() {
        return this.cfg.selectionMode == 'multiple';
    },
    
    /**
     * Clears the selection state
     */
    clearSelection: function() {
        this.selection = [];

        $(this.selectionHolder).val('');
    },
    
    /**
     * Returns true|false if selection is enabled|disabled
     */
    isSelectionEnabled: function() {
        return this.cfg.selectionMode != undefined || this.cfg.columnSelectionMode != undefined;
    },
        
    /**
     * Binds cell editor events non-obstrusively
     */
    setupCellEditorEvents: function() {
        var _self = this,
        rowEditors = $(this.jqId + ' tbody.ui-datatable-data > tr > td span.ui-row-editor');

        rowEditors.find('span.ui-icon-pencil').die().live('click', function() {
            _self.showEditors(this);
        });

        rowEditors.find('span.ui-icon-check').die().live('click', function() {
            _self.saveRowEdit($(this).parent());
        });

        rowEditors.find('span.ui-icon-close').die().live('click', function() {
            _self.cancelRowEdit($(this).parent());
        }); 
    },
    
    /**
     * Clears table filters
     */
    clearFilters: function() {
        $(this.jqId + ' thead th .ui-column-filter').val('');
    },
    
    /**
     * Add resize behavior to columns
     */
    setupResizableColumns: function() {
        //Add resizers and resizer helper
        $(this.jqId + ' thead tr th.ui-resizable-column div.ui-dt-c').prepend('<span class="ui-column-resizer">&nbsp;</span>');
        $(this.jqId).append('<div class="ui-column-resizer-helper ui-state-highlight"></div>');

        //Variables
        var resizerHelper = $(this.jqId + ' .ui-column-resizer-helper'),
        resizers = $(this.jqId + ' thead th span.ui-column-resizer'),
        scrollHeader = $(this.jqId + ' .ui-datatable-scrollable-header'),
        scrollBody = $(this.jqId + ' .ui-datatable-scrollable-body'),
        table = $(this.jqId + ' table'),
        thead = $(this.jqId + ' thead'),  
        tfoot = $(this.jqId + ' tfoot'),
        _self = this;

        //Main resize events
        resizers.draggable({
            axis: 'x',
            start: function(event, ui) {
                var height = _self.cfg.scrollable ? scrollBody.height() : table.height() - thead.height() - 1;

                //Set height of resizer helper
                resizerHelper.height(height);
                resizerHelper.show();
            },
            drag: function(event, ui) {
                resizerHelper.offset(
                    {
                        left: ui.helper.offset().left + ui.helper.width() / 2, 
                        top: thead.offset().top + thead.height()
                    });  
            },
            stop: function(event, ui) {
                var columnHeaderWrapper = ui.helper.parent(),
                columnHeader = columnHeaderWrapper.parent(),
                oldPos = ui.originalPosition.left,
                newPos = ui.position.left,
                change = (newPos - oldPos),
                newWidth = (columnHeaderWrapper.width() + change - (ui.helper.width() / 2));

                ui.helper.css('left','');
                resizerHelper.hide();

                columnHeaderWrapper.width(newWidth);
                columnHeader.css('width', '');

                _self.tbody.find('tr td:nth-child(' + (columnHeader.index() + 1) + ')').width('').children('div').width(newWidth);            
                tfoot.find('tr td:nth-child(' + (columnHeader.index() + 1) + ')').width('').children('div').width(newWidth);

                scrollHeader.scrollLeft(scrollBody.scrollLeft());

                //Sync width change with server side state
                var options = {
                    source: _self.id,
                    process: _self.id,
                    params: [
                        {name: _self.id + '_updateBody', value: true},
                        {name: _self.id + '_colResize', value: true},
                        {name: _self.id + '_columnId', value: columnHeader.attr('id')},
                        {name: _self.id + '_width', value: newWidth},
                        {name: _self.id + '_height', value: columnHeader.height()}
                    ]
                }
                
                if(_self.hasBehavior('colResize')) {
                    var colResizeBehavior = _self.cfg.behaviors['colResize'];
                    
                    colResizeBehavior.call(_self, event, options);
                }
                else {
                    PrimeFaces.ajax.AjaxRequest(options);
                }
                
            },
            containment: this.jq
        });
    },
    
    hasBehavior: function(event) {
        if(this.cfg.behaviors) {
            return this.cfg.behaviors[event] != undefined;
        }
    
        return false;
    },
    
    /**
     * Remove given rowIndex from selection
     */
    removeSelection: function(rowIndex) {
        var selection = this.selection;

        $.each(selection, function(index, value) {
            if(value === rowIndex) {
                selection.remove(index);

                return false;       //break
            } 
            else {
                return true;        //continue
            }
        });
    },
    
    /**
     * Adds given rowIndex to selection if it doesn't exist already
     */
    addSelection: function(rowIndex) {
        if(!this.isSelected(rowIndex)) {
            this.selection.push(rowIndex);
        }
    },
    
    /**
     * Finds if given rowIndex is in selection
     */
    isSelected: function(rowIndex) {
        var selection = this.selection,
        selected = false;

        $.each(selection, function(index, value) {
            if(value === rowIndex) {
                selected = true;

                return false;       //break
            } 
            else {
                return true;        //continue
            }
        });

        return selected;
    },
    
    getRowMeta: function(row) {
        var meta = {
            index: row.data('ri'),
            key:  row.attr('data-rk')
        };

        return meta;
    },
    
    setupDraggableColumns : function() {
        this.dragIndicatorTop = $('<div id="' + this.id + '_dnd_top" class="ui-column-dnd-top"><span class="ui-icon ui-icon-arrowthick-1-s" /></div>').appendTo(document.body);
        this.dragIndicatorBottom = $('<div id="' + this.id + '_dnd_bottom" class="ui-column-dnd-bottom"><span class="ui-icon ui-icon-arrowthick-1-n" /></div>').appendTo(document.body);
    
        this.orderStateHolder = $(this.jqId + '_columnOrder');

        var _self = this;

        $(this.jqId + ' thead th').draggable({
            appendTo: 'body'
            ,opacity: 0.75
            ,cursor: 'move'
            ,drag: function(event, ui) {
                var droppable = ui.helper.data('droppable-column');

                if(droppable) {
                    var droppableOffset = droppable.offset(),
                    topArrowY = droppableOffset.top - 10,
                    bottomArrowY = droppableOffset.top + droppable.height() + 8,
                    arrowX = null;
                    
                    //calculate coordinates of arrow depending on mouse location
                    if(event.originalEvent.pageX >= droppableOffset.left + (droppable.width() / 2)) {
                        arrowX = droppable.next().offset().left - 9;
                        ui.helper.data('drop-location', 1);     //right
                    }
                    else {
                        arrowX = droppableOffset.left  - 9;
                        ui.helper.data('drop-location', -1);    //left
                    }
                    
                    _self.dragIndicatorTop.offset({'left': arrowX, 'top': topArrowY}).show();
                    _self.dragIndicatorBottom.offset({'left': arrowX, 'top': bottomArrowY}).show();
                }
            }
            ,stop: function(event, ui) {
                //hide dnd arrows
                _self.dragIndicatorTop.css({'left':0, 'top':0}).hide();
                _self.dragIndicatorBottom.css({'left':0, 'top':0}).hide();
            }
            ,helper: function() {
                var header = $(this),
                helper = $('<div class="ui-widget ui-state-default" style="padding:4px 10px;text-align:center;"></div>');

                helper.width(header.width());
                helper.height(header.height());

                helper.html(header.html());

                return helper.get(0);
            }

        }).droppable({
            hoverClass:'ui-state-highlight'
            ,tolerance:'pointer'
            ,over: function(event, ui) {
                ui.helper.data('droppable-column', $(this));
            }
            ,drop: function(event, ui) {
                
                var draggedColumn = ui.draggable,
                dropLocation = ui.helper.data('drop-location'),
                droppedColumn =  $(this);
                
                var draggedCells = _self.tbody.find('> tr > td:nth-child(' + (draggedColumn.index() + 1) + ')'),
                droppedCells = _self.tbody.find('> tr > td:nth-child(' + (droppedColumn.index() + 1) + ')');
                
                //drop right
                if(dropLocation > 0) {
                    draggedColumn.insertAfter(droppedColumn);

                    draggedCells.each(function(i, item) {
                        $(this).insertAfter(droppedCells.eq(i));
                    });
                }
                //drop left
                else {
                    draggedColumn.insertBefore(droppedColumn);

                    draggedCells.each(function(i, item) {
                        $(this).insertBefore(droppedCells.eq(i));
                    });
                }
               
                //save order
                var columns = $(_self.jqId + ' thead:first th'),
                columnIds = [];

                columns.each(function(i, item) {
                    columnIds.push($(item).attr('id'));
                });

                _self.orderStateHolder.val(columnIds.join(','));
                

                //fire toggleCheckAll event
                if(_self.cfg.behaviors) {
                    var columnReorderBehavior = _self.cfg.behaviors['colReorder'];

                    if(columnReorderBehavior) {            
                        columnReorderBehavior.call(_self);
                    }
                }
            }
        });
    },
    
    /**
     * Returns if there is any data displayed
     */
    isEmpty: function() {
        return this.tbody.children('tr.ui-datatable-empty-message').length == 1;
    },
    
    getSelectedRowsCount: function() {
        return this.isSelectionEnabled() ? this.selection.length : 0;
    },
    
    updateHeaderCheckbox: function() {
        var checkboxes = $(this.jqId + ' tbody.ui-datatable-data:first > tr > td.ui-selection-column .ui-chkbox-box'),
        uncheckedBoxes = $.grep(checkboxes, function(element) {
            var checkbox = $(element),
            disabled = checkbox.hasClass('ui-state-disabled'),
            checked = checkbox.hasClass('ui-state-active');

            return !(checked || disabled); 
        });

        if(uncheckedBoxes.length == 0)
            this.checkAllToggler.addClass('ui-state-active').children('span.ui-chkbox-icon').addClass('ui-icon ui-icon-check');
        else
            this.checkAllToggler.removeClass('ui-state-active').children('span.ui-chkbox-icon').removeClass('ui-icon ui-icon-check');
    }  

});
/**
 * PrimeFaces Dialog Widget
 */ 
PrimeFaces.widget.Dialog = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.content = this.jq.children('.ui-dialog-content');
        this.titlebar = this.jq.children('.ui-dialog-titlebar');
        this.footer = this.jq.find('.ui-dialog-footer');
        this.icons = this.titlebar.children('.ui-dialog-titlebar-icon');
        this.closeIcon = this.titlebar.children('.ui-dialog-titlebar-close');
        this.minimizeIcon = this.titlebar.children('.ui-dialog-titlebar-minimize');
        this.maximizeIcon = this.titlebar.children('.ui-dialog-titlebar-maximize');
        this.blockEvents = 'focus.dialog mousedown.dialog mouseup.dialog keydown.dialog keyup.dialog';

        //configuration
        this.cfg.width = this.cfg.width||'auto';
        if(this.cfg.width == 'auto' && PrimeFaces.isIE(7)) {
            this.cfg.width = this.content.outerWidth();
        }
        this.cfg.height = this.cfg.height||'auto';
        this.cfg.draggable = this.cfg.draggable == false ? false : true;
        this.cfg.resizable = this.cfg.resizable == false ? false : true;
        this.cfg.minWidth = this.cfg.minWidth||150;
        this.cfg.minHeight = this.cfg.minHeight||this.titlebar.outerHeight();
        this.cfg.position = this.cfg.position||'center';
        this.parent = this.jq.parent();

        //size
        this.jq.css({
            'width': this.cfg.width,
            'height': 'auto'
        });

        this.content.height(this.cfg.height);

        //events
        this.bindEvents();

        if(this.cfg.draggable) {
            this.setupDraggable();
        }

        if(this.cfg.resizable){
            this.setupResizable();
        }

        if(this.cfg.modal) {
            this.syncWindowResize();
        }

        if(this.cfg.appendToBody){
            this.jq.appendTo('body');
        }

        //docking zone
        if($(document.body).children('.ui-dialog-docking-zone').length == 0) {
            $(document.body).append('<div class="ui-dialog-docking-zone"></div>')
        }

        //remove related modality if there is one
        var modal = $(this.jqId + '_modal');
        if(modal.length > 0) {
            modal.remove();
        }

        if(this.cfg.autoOpen){
            this.show();
        }
    },
    
    //override
    refresh: function(cfg) {
        this.positionInitialized = false;
        this.loaded = false;
        
        this.init(cfg);
    },
    
    enableModality: function() {
        var _self = this;

        $(document.body).append('<div id="' + this.id + '_modal" class="ui-widget-overlay"></div>')
                        .children(this.jqId + '_modal').css({
                            'width' : $(document).width(),
                            'height' : $(document).height(),
                            'z-index' : this.jq.css('z-index') - 1
                        });

        //Disable tabbing out of modal dialog and stop events from targets outside of dialog
        $(document).bind('keydown.modal-dialog',
                function(event) {
                    if(event.keyCode == $.ui.keyCode.TAB) {
                        var tabbables = _self.content.find(':tabbable'), 
                        first = tabbables.filter(':first'), 
                        last = tabbables.filter(':last');

                        if(event.target === last[0] && !event.shiftKey) {
                            first.focus(1);
                            return false;
                        } 
                        else if (event.target === first[0] && event.shiftKey) {
                            last.focus(1);
                            return false;
                        }
                    }
                })
                .bind(this.blockEvents, function(event) {
                    if ($(event.target).zIndex() < _self.jq.zIndex()) {
                        return false;
                    }
                });
    },
    
    disableModality: function(){
        $(document.body).children(this.jqId + '_modal').remove();
        $(document).unbind(this.blockEvents).unbind('keydown.modal-dialog');
    },
    
    syncWindowResize: function() {
        $(window).resize(function() {
            $(document.body).children('.ui-widget-overlay').css({
                'width': $(document).width()
                ,'height': $(document).height()
            });
        });
    },
    
    show: function() {
        if(this.jq.hasClass('ui-overlay-visible')) {
            return;
        }

        if(!this.loaded && this.cfg.dynamic) {
            this.loadContents();
        } 
        else {
            if(!this.positionInitialized) {
                this.initPosition();
            }

            this._show();
        }
    },
    
    _show: function() {
        //replace visibility hidden with display none for effect support, toggle marker class
        this.jq.removeClass('ui-overlay-hidden').addClass('ui-overlay-visible').css({
            'display':'none'
            ,'visibility':'visible'
        });
        
        if(this.cfg.showEffect) {
            var _self = this;

            this.jq.show(this.cfg.showEffect, null, 'normal', function() {
                _self.postShow();
            });
        }    
        else {
            //display dialog
            this.jq.show();

            this.postShow();
        }

        this.moveToTop();
        this.focusFirstInput();

        if(this.cfg.modal)
            this.enableModality();
    },
    
    postShow: function() {   
        //execute user defined callback
        if(this.cfg.onShow) {
            this.cfg.onShow.call(this);
        }
    },
    
    hide: function() {   
        if(this.jq.hasClass('ui-overlay-hidden')) {
            return;
        }
        
        if(this.cfg.hideEffect) {
            var _self = this;

            this.jq.hide(this.cfg.hideEffect, null, 'normal', function() {
                _self.onHide();
            });
        }
        else {
            this.jq.hide();

            this.onHide();
        }

        if(this.cfg.modal)
            this.disableModality();
    },
    
    focusFirstInput: function() {
        this.jq.find(':not(:submit):not(:button):input:visible:enabled:first').focus();
    },
    
    bindEvents: function() {   
        var _self = this;

        //Move dialog to top if target is not a trigger for a PrimeFaces overlay
        this.jq.mousedown(function(e) {
            if(!$(e.target).data('primefaces-overlay-target')) {
                _self.moveToTop();
            }
        });

        this.icons.mouseover(function() {
            $(this).addClass('ui-state-hover');
        }).mouseout(function() {
            $(this).removeClass('ui-state-hover');
        })

        this.closeIcon.click(function(e) {
            _self.hide();
            e.preventDefault();
        });

        this.maximizeIcon.click(function(e) {
            _self.toggleMaximize();
            e.preventDefault();
        });

        this.minimizeIcon.click(function(e) {
            _self.toggleMinimize();
            e.preventDefault();
        });
    },
    
    setupDraggable: function() {    
        this.jq.draggable({
            cancel: '.ui-dialog-content, .ui-dialog-titlebar-close',
            handle: '.ui-dialog-titlebar',
            containment : 'document'
        });
    },
    
    setupResizable: function() {
        var _self = this;

        this.jq.resizable({
            handles : 'n,s,e,w,ne,nw,se,sw',
            minWidth : this.cfg.minWidth,
            minHeight : this.cfg.minHeight,
            alsoResize : this.content,
            containment: 'document',
            start: function(event, ui) {
                _self.jq.data('offset', _self.jq.offset());
            },
            stop: function(event, ui) {
                var offset = _self.jq.data('offset')

                _self.jq.css('position', 'fixed');
                _self.jq.offset(offset);
            }
        });

        this.resizers = this.jq.children('.ui-resizable-handle');
    },
    
    initPosition: function() {
        //reset
        this.jq.css({left:0,top:0});

        if(/(center|left|top|right|bottom)/.test(this.cfg.position)) {
            this.cfg.position = this.cfg.position.replace(',', ' ');

            this.jq.position({
                        my: 'center'
                        ,at: this.cfg.position
                        ,collision: 'fit'
                        ,of: window
                        //make sure dialog stays in viewport
                        ,using: function(pos) {
                            var l = pos.left < 0 ? 0 : pos.left,
                            t = pos.top < 0 ? 0 : pos.top;

                            $(this).css({
                                left: l
                                ,top: t
                            });
                        }
                    });
        }
        else {
            var coords = this.cfg.position.split(','),
            x = $.trim(coords[0]),
            y = $.trim(coords[1]);

            this.jq.offset({
                left: x
                ,top: y
            });
        }

        this.positionInitialized = true;
    },
    
    onHide: function(event, ui) {
        //replace display block with visibility hidden for hidden container support, toggle marker class
        this.jq.removeClass('ui-overlay-visible').addClass('ui-overlay-hidden').css({
            'display':'block'
            ,'visibility':'hidden'
        });
        
        if(this.cfg.onHide) {
            this.cfg.onHide.call(this, event, ui);
        }

        if(this.cfg.behaviors) {
            var closeBehavior = this.cfg.behaviors['close'];

            if(closeBehavior) {
                closeBehavior.call(this);
            }
        }
    },
    
    moveToTop: function() {
        this.jq.css('z-index', ++PrimeFaces.zindex);
    },
    
    toggleMaximize: function() {
        if(this.minimized) {
            this.toggleMinimize();
        }

        if(this.maximized) {
            this.jq.removeClass('ui-dialog-maximized');
            this.restoreState();

            this.maximizeIcon.children('.ui-icon').removeClass('ui-icon-newwin').addClass('ui-icon-extlink');
            this.maximized = false;
        } 
        else {
            this.saveState();

            var win = $(window);

            this.jq.addClass('ui-dialog-maximized').css({
                'width': win.width() - 6
                ,'height': win.height()
            }).offset({
                top: win.scrollTop()
                ,left: win.scrollLeft()
            });

            //maximize content
            this.content.css({
                width: 'auto',
                height: 'auto'
            });

            this.maximizeIcon.removeClass('ui-state-hover').children('.ui-icon').removeClass('ui-icon-extlink').addClass('ui-icon-newwin');
            this.maximized = true;
            
            if(this.cfg.behaviors) {
                var maximizeBehavior = this.cfg.behaviors['maximize'];

                if(maximizeBehavior) {
                    maximizeBehavior.call(this);
                }
            }
        }
    },
    
    toggleMinimize: function() {
        var animate = true,
        dockingZone = $(document.body).children('.ui-dialog-docking-zone');

        if(this.maximized) {
            this.toggleMaximize();
            animate = false;
        }

        var _self = this;

        if(this.minimized) {
            this.jq.appendTo(this.parent).removeClass('ui-dialog-minimized').css({'position':'fixed', 'float':'none'});
            this.restoreState();
            this.content.show();
            this.minimizeIcon.removeClass('ui-state-hover').children('.ui-icon').removeClass('ui-icon-plus').addClass('ui-icon-minus');
            this.minimized = false;

            if(this.cfg.resizable)
                this.resizers.show();
        }
        else {
            this.saveState();

            if(animate) {
                this.jq.effect('transfer', {
                                to: dockingZone
                                ,className: 'ui-dialog-minimizing'
                                }, 500, 
                                function() {
                                    _self.dock(dockingZone);
                                    _self.jq.addClass('ui-dialog-minimized');
                                });
            } 
            else {
                this.dock(dockingZone);
            }
        }
    },
    
    dock: function(zone) {
        this.jq.appendTo(zone).css('position', 'static');
        this.jq.css({'height':'auto', 'width':'auto', 'float': 'left'});
        this.content.hide();
        this.minimizeIcon.removeClass('ui-state-hover').children('.ui-icon').removeClass('ui-icon-minus').addClass('ui-icon-plus');
        this.minimized = true;

        if(this.cfg.resizable) {
            this.resizers.hide();
        }
        
        if(this.cfg.behaviors) {
            var minimizeBehavior = this.cfg.behaviors['minimize'];

            if(minimizeBehavior) {
                minimizeBehavior.call(this);
            }
        }
    },
    
    saveState: function() {
        this.state = {
            width: this.jq.width()
            ,height: this.jq.height()
        };

        var win = $(window);
        this.state.offset = this.jq.offset();
        this.state.windowScrollLeft = win.scrollLeft();
        this.state.windowScrollTop = win.scrollTop();
    },
    
    restoreState: function(includeOffset) {
        this.jq.width(this.state.width).height(this.state.height);

        var win = $(window);
        this.jq.offset({
        top: this.state.offset.top + (win.scrollTop() - this.state.windowScrollTop)
        ,left: this.state.offset.left + (win.scrollLeft() - this.state.windowScrollLeft)
        });
    },
    
    loadContents: function() {
        var options = {
            source: this.id,
            process: this.id,
            update: this.id
        },
        _self = this;

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    _self.content.html(content);
                    _self.loaded = true;
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            return true;
        };

        options.oncomplete = function() {
            _self.show();
        };

        options.params = [
            {name: this.id + '_contentLoad', value: true}
        ];
        
        PrimeFaces.ajax.AjaxRequest(options);
    }
    
});

/**
 * PrimeFaces ConfirmDialog Widget
 */
PrimeFaces.widget.ConfirmDialog = PrimeFaces.widget.Dialog.extend({
    
    init: function(cfg) {
        cfg.draggable = false;
        cfg.resizable = false;
        cfg.modal = true;
        cfg.showEffect = 'fade';
        cfg.hideEffect = 'fade';
        
        this._super(cfg);
    }

});
/**
 * PrimeFaces Draggable Widget
 */
PrimeFaces.widget.Draggable = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jq = $(PrimeFaces.escapeClientId(this.cfg.target));

        this.jq.draggable(this.cfg);
        
        $(this.jqId + '_s').remove();
    }
    
});

/**
 * PrimeFaces Droppable Widget
 */
PrimeFaces.widget.Droppable = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jq = $(PrimeFaces.escapeClientId(this.cfg.target));

        this.bindDropListener();

        this.jq.droppable(this.cfg);
        
        $(this.jqId + '_s').remove();
    },
    
    bindDropListener: function() {
        var _self = this;

        this.cfg.drop = function(event, ui) {
            if(_self.cfg.onDrop) {
                _self.cfg.onDrop.call(_self, event, ui);
            }
            if(_self.cfg.behaviors) {
                var dropBehavior = _self.cfg.behaviors['drop'];

                if(dropBehavior) {
                    var ext = {
                        params: [
                            {name: _self.id + '_dragId', value: ui.draggable.attr('id')},
                            {name: _self.id + '_dropId', value: _self.cfg.target}
                        ]
                    };

                    dropBehavior.call(_self, event, ext);
                }
            }
        };
    }
    
});
/**
 * PrimeFaces Effect Widget
 */
PrimeFaces.widget.Effect = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.source = $(PrimeFaces.escapeClientId(this.cfg.source));
        var _self = this;

        this.runner = function() {
            //avoid queuing multiple runs
            if(_self.timeoutId) {
                clearTimeout(_self.timeoutId);
            }

            _self.timeoutId = setTimeout(_self.cfg.fn, _self.cfg.delay);
        };

        if(this.cfg.event == 'load') {
            this.runner.call();
        } 
        else {
            this.source.bind(this.cfg.event, this.runner);
        }
        
        $(this.jqId + '_s').remove();
    }
    
});
/**
 * PrimeFaces Fieldset Widget
 */
PrimeFaces.widget.Fieldset = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        this.onshowHandlers = [];
        
        this.legend = this.jq.children('.ui-fieldset-legend');

        var _self = this;

        if(this.cfg.toggleable) {

            this.content = this.jq.children('.ui-fieldset-content');
            this.toggler = this.legend.children('.ui-fieldset-toggler');
            this.stateHolder = $(this.jqId + '_collapsed');

            //Add clickable legend state behavior
            this.legend.click(function(e) {_self.toggle(e);})
                            .mouseover(function() {_self.legend.toggleClass('ui-state-hover');})
                            .mouseout(function() {_self.legend.toggleClass('ui-state-hover');})
                            .mousedown(function() {_self.legend.toggleClass('ui-state-active');})
                            .mouseup(function() {_self.legend.toggleClass('ui-state-active');})
        }
        
        this.jq.data('widget', this);
    },
    
    /**
     * Toggles the content
     */
    toggle: function(e) {
        this.updateToggleState(this.cfg.collapsed);

        var _self = this;

        this.content.slideToggle(this.cfg.toggleSpeed, 'easeInOutCirc', function() {
            if(_self.cfg.behaviors) {
                var toggleBehavior = _self.cfg.behaviors['toggle'];

                if(toggleBehavior) {
                    toggleBehavior.call(_self);
                }
            }
            
            if(_self.onshowHandlers.length > 0) {
                _self.invokeOnshowHandlers();
            }
        });
    },
    
    /**
     * Updates the visual toggler state and saves state
     */
    updateToggleState: function(collapsed) {
        if(collapsed)
            this.toggler.removeClass('ui-icon-plusthick').addClass('ui-icon-minusthick');
        else
            this.toggler.removeClass('ui-icon-minusthick').addClass('ui-icon-plusthick');

        this.cfg.collapsed = !collapsed;

        this.stateHolder.val(!collapsed);
    },
    
    addOnshowHandler: function(fn) {
        this.onshowHandlers.push(fn);
    },
    
    invokeOnshowHandlers: function() {
        this.onshowHandlers = $.grep(this.onshowHandlers, function(fn) {
            return !fn.call();
        });
    }
    
});
/**
 * PrimeFaces InputText Widget
 */
PrimeFaces.widget.InputText = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        //Client behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.jq, this.cfg.behaviors);
        }

        //Visuals
        PrimeFaces.skinInput(this.jq);
    }
});

/**
 * PrimeFaces InputTextarea Widget
 */
PrimeFaces.widget.InputTextarea = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.cfg.rowsDefault = this.jq.attr('rows');
        this.cfg.colsDefault = this.jq.attr('cols');
        
        //Visuals
        PrimeFaces.skinInput(this.jq);

        //autoComplete
        if(this.cfg.autoComplete) {
            this.setupAutoComplete();
        }
        
        //autoResize
        if(this.cfg.autoResize) {
            this.setupAutoResize();
        }

        //maxLength
        if(this.cfg.maxlength) {
            this.applyMaxlength();
        }

        //Client behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.jq, this.cfg.behaviors);
        }
        
        //Counter
        if(this.cfg.counter) {
            this.counter = this.cfg.counter ? $(PrimeFaces.escapeClientId(this.cfg.counter)) : null;
            this.cfg.counterTemplate = this.cfg.counterTemplate||'{0}';
            this.updateCounter();
        }
    },
    
    refresh: function(cfg) {
        //remove autocomplete panel
        if(cfg.autoComplete) {
            $(PrimeFaces.escapeClientId(cfg.id + '_panel')).remove();
            $(PrimeFaces.escapeClientId('textarea_simulator')).remove();
        }
        
        this.init(cfg);
    },
    
    setupAutoResize: function() {
        var _self = this;

        this.jq.keyup(function() {
            _self.resize();
        }).focus(function() {
            _self.resize();
        }).blur(function() {
            _self.resize();
        });
    },
    
    resize: function() {
        var linesCount = 0,
        lines = this.jq.val().split('\n');

        for(var i = lines.length-1; i >= 0 ; --i) {
            linesCount += Math.floor((lines[i].length / this.cfg.colsDefault) + 1);
        }

        var newRows = (linesCount >= this.cfg.rowsDefault) ? (linesCount + 1) : this.cfg.rowsDefault;

        this.jq.attr('rows', newRows);
    },
    
    applyMaxlength: function() {
        var _self = this;

        this.jq.keyup(function(e) {
            var value = _self.jq.val(),
            length = value.length;

            if(length > _self.cfg.maxlength) {
                _self.jq.val(value.substr(0, _self.cfg.maxlength));
            }
            
            if(_self.counter) {
                _self.updateCounter();
            }
        });
    },
    
    updateCounter: function() {
        var value = this.jq.val(),
        length = value.length;

        if(this.counter) {
            var remaining = this.cfg.maxlength - length,
            remainingText = this.cfg.counterTemplate.replace('{0}', remaining);

            this.counter.html(remainingText);
        }
    },
    
    setupAutoComplete: function() {
        var panelMarkup = '<div id="' + this.id + '_panel" class="ui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden ui-shadow"></div>',
        _self = this;
        
        this.panel = $(panelMarkup).appendTo(document.body);
        
        this.jq.keyup(function(e) {
            var keyCode = $.ui.keyCode;
            
            switch(e.which) {
                
                case keyCode.UP:
                case keyCode.LEFT:
                case keyCode.DOWN:
                case keyCode.RIGHT:
                case keyCode.ENTER:
                case keyCode.NUMPAD_ENTER:
                case keyCode.TAB:
                case keyCode.SPACE:
                case keyCode.CONTROL:
                case keyCode.ALT:
                case keyCode.ESCAPE:
                case 224:   //mac command
                    //do not search
                break;

                default:
                    var query = _self.extractQuery();           
                    if(query && query.length >= _self.cfg.minQueryLength) {
                        
                         //Cancel the search request if user types within the timeout
                        if(_self.timeout) {
                            _self.clearTimeout(_self.timeout);
                        }
                        
                        _self.timeout = setTimeout(function() {
                            _self.search(query);
                        }, _self.cfg.queryDelay);
                        
                    }
                break;
            }

        }).keydown(function(e) {
            var overlayVisible = _self.panel.is(':visible'),
            keyCode = $.ui.keyCode;

            switch(e.which) {
                case keyCode.UP:
                case keyCode.LEFT:
                    if(overlayVisible) {
                        var highlightedItem = _self.items.filter('.ui-state-highlight'),
                        prev = highlightedItem.length == 0 ? _self.items.eq(0) : highlightedItem.prev();

                        if(prev.length == 1) {
                            highlightedItem.removeClass('ui-state-highlight');
                            prev.addClass('ui-state-highlight');
                        }
                        
                        if(_self.cfg.scrollHeight) {
                            _self.alignScrollbar(prev);
                        }

                        e.preventDefault();
                    }
                    else {
                        _self.clearTimeout();
                    }
                break;

                case keyCode.DOWN:
                case keyCode.RIGHT:
                    if(overlayVisible) {
                        var highlightedItem = _self.items.filter('.ui-state-highlight'),
                        next = highlightedItem.length == 0 ? _self.items.eq(0) : highlightedItem.next();
                        
                        if(next.length == 1) {
                            highlightedItem.removeClass('ui-state-highlight');
                            next.addClass('ui-state-highlight');
                        }
                        
                        if(_self.cfg.scrollHeight) {
                            _self.alignScrollbar(next);
                        }

                        e.preventDefault();
                    }
                    else {
                        _self.clearTimeout();
                    }
                break;

                case keyCode.ENTER:
                case keyCode.NUMPAD_ENTER:
                    if(overlayVisible) {
                        _self.items.filter('.ui-state-highlight').trigger('click');

                        e.preventDefault();
                    }
                    else {
                        _self.clearTimeout();
                    } 
                break;

                case keyCode.SPACE:
                case keyCode.CONTROL:
                case keyCode.ALT:
                case keyCode.BACKSPACE:
                case keyCode.ESCAPE:
                case 224:   //mac command
                    _self.clearTimeout();

                    if(overlayVisible) {
                        _self.hide();
                    }
                break;
  
                case keyCode.TAB:
                    _self.clearTimeout();
                    
                    if(overlayVisible) {
                        _self.items.filter('.ui-state-highlight').trigger('click');
                        _self.hide();
                    }
                break;
            }
        });
        
        //hide panel when outside is clicked
        $(document.body).bind('mousedown.ui-inputtextarea', function (e) {
            if(_self.panel.is(":hidden")) {
                return;
            }
            var offset = _self.panel.offset();
            if(e.target === _self.jq.get(0)) {
                return;
            }
            
            if (e.pageX < offset.left ||
                e.pageX > offset.left + _self.panel.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.panel.height()) {
                _self.hide();
            }
        });
        
        //Hide overlay on resize
        var resizeNS = 'resize.' + this.id;
        $(window).unbind(resizeNS).bind(resizeNS, function() {
            if(_self.panel.is(':visible')) {
                _self.hide();
            }
        });

        //dialog support
        this.setupDialogSupport();
    },
        
    bindDynamicEvents: function() {
        var _self = this;

        //visuals and click handler for items
        this.items.bind('mouseover', function() {
            var item = $(this);
            
            if(!item.hasClass('ui-state-highlight')) {
                _self.items.filter('.ui-state-highlight').removeClass('ui-state-highlight');
                item.addClass('ui-state-highlight');
            }
        })
        .bind('click', function(event) {
            var item = $(this),
            itemValue = item.attr('data-item-value'),
            insertValue = itemValue.substring(_self.query.length);
            
            _self.jq.focus();
            
            _self.jq.insertText(insertValue, _self.jq.getSelection().start, true);
            
            _self.invokeItemSelectBehavior(event, itemValue);
            
            _self.hide();
        });
    },
    
    invokeItemSelectBehavior: function(event, itemValue) {
        if(this.cfg.behaviors) {
            var itemSelectBehavior = this.cfg.behaviors['itemSelect'];

            if(itemSelectBehavior) {
                var ext = {
                    params : [
                        {name: this.id + '_itemSelect', value: itemValue}
                    ]
                };

                itemSelectBehavior.call(this, event, ext);
            }
        }
    },
    
    clearTimeout: function() {
        if(this.timeout) {
            clearTimeout(this.timeout);
        }
        
        this.timeout = null;
    },
    
    extractQuery: function() {
        var end = this.jq.getSelection().end,
        result = /\S+$/.exec(this.jq.get(0).value.slice(0, end)),
        lastWord = result ? result[0] : null;
    
        return lastWord;
    },
    
    search: function(query) {
        var _self = this;
        this.query = query;

        var options = {
            source: this.id,
            update: this.id,
            onsuccess: function(responseXML) {
                var xmlDoc = $(responseXML.documentElement),
                updates = xmlDoc.find("update");

                for(var i=0; i < updates.length; i++) {
                    var update = updates.eq(i),
                    id = update.attr('id'),
                    data = update.text();

                    if(id == _self.id) {
                        _self.panel.html(data);
                        _self.items = _self.panel.find('.ui-autocomplete-item');
                        
                        _self.bindDynamicEvents();
                        
                        if(_self.items.length > 0) {                            
                            //highlight first item
                            _self.items.eq(0).addClass('ui-state-highlight');
                            
                            //adjust height
                            if(_self.cfg.scrollHeight && _self.panel.height() > _self.cfg.scrollHeight) {
                                _self.panel.height(_self.cfg.scrollHeight);
                            }

                            if(_self.panel.is(':hidden')) {
                                _self.show();
                            } 
                            else {
                                _self.alignPanel(); //with new items
                            }

                        }
                        else {
                            _self.panel.hide();
                        }
                    } 
                    else {
                        PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, data);
                    }
                }

                PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

                return true;
            }
        };

        options.params = [
          {name: this.id + '_query', value: query}  
        ];
        
        PrimeFaces.ajax.AjaxRequest(options);
    },
    
    alignPanel: function() {
        var pos = this.jq.getCaretPosition(),
        offset = this.jq.offset();
        
        this.panel.css({
                        'left': offset.left + pos.left,
                        'top': offset.top + pos.top,
                        'width': this.jq.innerWidth(),
                        'z-index': ++PrimeFaces.zindex
                });
    },
    
    alignScrollbar: function(item) {
        var relativeTop = item.offset().top - this.items.eq(0).offset().top,
        visibleTop = relativeTop + item.height(),
        scrollTop = this.panel.scrollTop(),
        scrollBottom = scrollTop + this.cfg.scrollHeight,
        viewportCapacity = parseInt(this.cfg.scrollHeight / item.outerHeight(true));
        
        //scroll up
        if(visibleTop < scrollTop) {
            this.panel.scrollTop(relativeTop);
        }
        //scroll down
        else if(visibleTop > scrollBottom) {
            var viewportTopitem = this.items.eq(item.index() - viewportCapacity + 1);
            
            this.panel.scrollTop(viewportTopitem.offset().top - this.items.eq(0).offset().top);
        }
    },
    
    show: function() {
        this.alignPanel();

        this.panel.show();
    },
    
    hide: function() {        
        this.panel.hide();
    },
    
    setupDialogSupport: function() {
        var dialog = this.jq.parents('.ui-dialog:first');

        if(dialog.length == 1) {
            this.panel.css('position', 'fixed');
        }
    }
    
});

/**
 * PrimeFaces SelectOneMenu Widget
 */
PrimeFaces.widget.SelectOneMenu = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.panelId = this.jqId + '_panel';
        this.input = $(this.jqId + '_input');
        this.label = this.jq.find('.ui-selectonemenu-label');
        this.menuIcon = this.jq.children('.ui-selectonemenu-trigger');
        this.panel = this.jq.children(this.panelId);
        this.disabled = this.jq.hasClass('ui-state-disabled');
        this.itemContainer = this.panel.children('.ui-selectonemenu-items');
        this.items = this.itemContainer.find('.ui-selectonemenu-item');
        this.options = this.input.children('option');
        this.cfg.effect = this.cfg.effect||'fade';
        this.cfg.effectSpeed = this.cfg.effectSpeed||'normal';
        
        var _self = this,
        selectedOption = this.options.filter(':selected');

        //disable options
        this.options.filter(':disabled').each(function() {
            _self.itemContainer.children().eq($(this).index()).addClass('ui-state-disabled');
        });
        
        //triggers and default label value
        if(this.cfg.editable) {
            this.triggers = this.jq.find('.ui-selectonemenu-trigger');
        } 
        else {
            this.triggers = this.jq.find('.ui-selectonemenu-trigger, .ui-selectonemenu-label');
            this.setLabel(selectedOption.text());
            this.value = selectedOption.val();
        }
        
        //highlight selected
        this.highlightItem(this.items.eq(selectedOption.index()), false);
        
        //mark trigger and descandants of trigger as a trigger for a primefaces overlay
        this.triggers.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);

        if(!this.disabled) {            
            this.bindEvents();
            
            this.bindConstantEvents();
            
            //dialog support
            this.setupDialogSupport();
        }

        //Append panel to body
        $(document.body).children(this.panelId).remove();
        this.panel.appendTo(document.body);

        if(this.jq.is(':visible')) {
            this.initWidths();
        }
        else {
            var hiddenParent = this.jq.parents('.ui-hidden-container:first'),
            hiddenParentWidget = hiddenParent.data('widget');

            if(hiddenParentWidget) {
                hiddenParentWidget.addOnshowHandler(function() {
                    return _self.initWidths();
                });
            }
        }
        
        //pfs metadata
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    setupDialogSupport: function() {
        var dialog = this.jq.parents('.ui-dialog:first');

        if(dialog.length == 1) {
            this.panel.css('position', 'fixed');
        }
    },
    
    initWidths: function() {
        var userStyle = this.jq.attr('style');
        
        //do not adjust width of container if there is user width defined
        if(!userStyle||userStyle.indexOf('width') == -1) {
            this.jq.width(this.input.outerWidth(true) + 5);  
        }
        
        //width of label
        this.label.width(this.jq.width() - this.menuIcon.width());
        
        //align panel and container
        var jqWidth = this.jq.innerWidth();
        if(this.panel.outerWidth() < jqWidth) {
            this.panel.width(jqWidth);
        }
    },
    
    bindEvents: function() {
        var _self = this;

        //Events for items
        this.items.filter(':not(.ui-state-disabled)').mouseover(function() {
            _self.highlightItem($(this), false);
        })
        .click(function() {
            _self.selectItem($(this));   
        });

        //Events to show/hide the panel
        this.triggers.mouseover(function() {
            _self.jq.addClass('ui-state-hover');
            _self.menuIcon.addClass('ui-state-hover');
        }).mouseout(function() {
            _self.jq.removeClass('ui-state-hover');
            _self.menuIcon.removeClass('ui-state-hover');
        }).click(function(e) {
            if(_self.panel.is(":hidden"))
                _self.show();
            else
                _self.hide();

            _self.jq.removeClass('ui-state-hover');
            _self.menuIcon.removeClass('ui-state-hover');          
            _self.input.focus();
            e.preventDefault();
        });
        
        this.input.focus(function(){
            _self.jq.addClass('ui-state-focus');
            _self.menuIcon.addClass('ui-state-focus');
        })
        .blur(function(){
            _self.jq.removeClass('ui-state-focus');
            _self.menuIcon.removeClass('ui-state-focus');
            
            if(_self.changed) {
                _self.triggerChange();
            }
        });
        
        //onchange handler for editable input
        if(this.cfg.editable) {
            this.label.change(function() {
                _self.triggerChange(true);
            });
        }
        
        //key bindings
        this.bindKeyEvents();
    },
    
    bindConstantEvents: function(item) {
        var _self = this;
        
        //hide overlay when outside is clicked
        $(document.body).bind('mousedown.ui-selectonemenu', function (e) {
            if(_self.panel.is(":hidden")) {
                return;
            }
            var offset = _self.panel.offset();
            if (e.target === _self.label.get(0) ||
                e.target === _self.menuIcon.get(0) ||
                e.target === _self.menuIcon.children().get(0)) {
                return;
            }
            if (e.pageX < offset.left ||
                e.pageX > offset.left + _self.panel.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.panel.height()) {

                _self.hide();
            }
        });

        this.resizeNS = 'resize.' + this.id;
        this.unbindResize();
        this.bindResize();
    },
    
    bindResize: function() {
        var _self = this;

        $(window).bind(this.resizeNS, function(e) {
            if(_self.panel.is(':visible')) {
                _self.hide();
            }
        });
    },
    
    unbindResize: function() {
        $(window).unbind(this.resizeNS);
    },
    
    unbindEvents: function() {
        this.items.filter(':not(.ui-state-disabled)').unbind('mouseover click');
        this.triggers.unbind('mouseover mouseout click');
        this.input.unbind('focus blur keydown keyup');
    },
    
    highlightItem: function(item, updateLabel) {
        this.unhighlightItem(this.items.filter('.ui-state-highlight'));
        item.addClass('ui-state-highlight');
        
        if(updateLabel) {
            this.setLabel(item.text());
        }

        this.alignScroller(item);
    },
    
    unhighlightItem: function(item) {
        item.removeClass('ui-state-highlight');
    },
    
    triggerChange: function(edited) {
        this.changed = false;
        
        var inputEl = this.input.get(0);
        if(this.cfg.onchange) {
            this.cfg.onchange.call(inputEl);
        }
        
        if(this.cfg.behaviors && this.cfg.behaviors['change']) {
            this.cfg.behaviors['change'].call(inputEl);
        }
        
        if(!edited) {
            this.value = this.options.filter(':selected').val();
        }
    },
    
    /**
     * Handler to process item selection with mouse
     */
    selectItem: function(item, silent) {
        //option to select
        var newOption = this.options.eq(item.index()),
        currentOption = this.options.filter(':selected'),
        sameOption = newOption.val() == currentOption.val(),
        shouldChange = null;
        
        if(this.cfg.editable) {
            shouldChange = (!sameOption)||(newOption.text() != this.label.val());
        }
        else {
            shouldChange = !sameOption;
        }
        
        if(shouldChange) {
            //update selected option
            this.input.val(newOption.val());
            this.value = newOption.val();
            
            //update label
            this.setLabel(newOption.text());
            
            //trigger change
            this.triggerChange();
        }

        if(!silent) {
            this.input.focus();
        }
        
        this.hide();
    },
    
    bindKeyEvents: function() {
        var _self = this;

        this.input.keyup(function(e) {            
            var keyCode = $.ui.keyCode,
            mozilla = $.browser.mozilla;

            switch(e.which) { 
                case keyCode.UP:
                case keyCode.LEFT:
                case keyCode.DOWN:
                case keyCode.RIGHT:
                    if(mozilla) {
                        var highlightedItem = _self.items.filter('.ui-state-highlight');
                        _self.options.filter(':selected').removeAttr('selected');
                        _self.options.eq(highlightedItem.index()).attr('selected', 'selected');
                    }
                    
                    e.preventDefault();
                break;
                
                case keyCode.TAB:
                case keyCode.ESCAPE:
                    //do nothing
                break;
                                
                default:
                    var currentOption = _self.options.filter(':selected'),
                    item = _self.items.eq(currentOption.index());

                    _self.highlightItem(item, true);
                    
                    _self.changed = (currentOption.val() != _self.value);
                    
                    e.preventDefault();
                break;
            }            
        })
        .keydown(function(e) {            
            var keyCode = $.ui.keyCode;

            switch(e.which) { 
                case keyCode.UP:
                case keyCode.LEFT:
                    var highlightedItem = _self.items.filter('.ui-state-highlight'),
                    prev = highlightedItem.prevAll(':not(.ui-state-disabled):first');
                    
                    

                    if(prev.length == 1) {
                        _self.highlightItem(prev, true);
                        _self.changed = true;
                        
                        _self.options.filter(':selected').removeAttr('selected');
                        
                        var option = _self.options.eq(prev.index());
                        option.attr('selected', 'selected');
                        
                        _self.changed = (option.val() != _self.value);
                    }
                    
                    e.preventDefault();
                    
                break;

                case keyCode.DOWN:
                case keyCode.RIGHT:
                    var highlightedItem = _self.items.filter('.ui-state-highlight'),
                    next = highlightedItem.nextAll(':not(.ui-state-disabled):first');

                    if(next.length == 1) {
                        _self.highlightItem(next, true);
                        _self.options.filter(':selected').removeAttr('selected');
                        
                        var option = _self.options.eq(next.index());
                        option.attr('selected', 'selected');
                        
                        _self.changed = (option.val() != _self.value);
                    }
                    
                    e.preventDefault();
                    
                break;
      
                case keyCode.TAB:
                case keyCode.ESCAPE:
                    if(_self.panel.is(":visible")) {
                        _self.hide();
                    }
                    
                    if(_self.changed) {
                        _self.triggerChange();
                    }                    
                break;
                

                case keyCode.ENTER:
                case keyCode.NUMPAD_ENTER:
                    if(_self.panel.is(":visible")) {
                        _self.hide();
                    }
                    
                    if(_self.changed) {
                        _self.triggerChange();
                    }
                    
                    e.preventDefault();
                break;
            }
        });
    },
         
    alignScroller: function(item) {
        var scrollHeight = this.panel.height();
        
        if(scrollHeight < this.itemContainer.height()) {
            var itemTop = item.offset().top - this.items.eq(0).offset().top,
            visibleTop = itemTop + item.height(),
            scrollTop = this.panel.scrollTop(),
            scrollBottom = scrollTop + scrollHeight;
            
            //scroll up
            if(itemTop < scrollTop) {
                this.panel.scrollTop(itemTop);
            }
            //scroll down
            else if(visibleTop > scrollBottom) {
                this.panel.scrollTop(itemTop);
            }
        }
    },
    
    show: function() {
        //calculate panel position
        this.alignPanel();

        this.panel.css('z-index', ++PrimeFaces.zindex);

        if($.browser.msie && /^[6,7]\.[0-9]+/.test($.browser.version)) {
            this.panel.parent().css('z-index', PrimeFaces.zindex - 1);
        }

        if(this.cfg.effect != 'none')
            this.panel.show(this.cfg.effect, {}, this.cfg.effectSpeed);
        else
            this.panel.show();
        
        //highlight current
        this.highlightItem(this.items.eq(this.options.filter(':selected').index()), false);
    },
    
    hide: function() {
        if($.browser.msie && /^[6,7]\.[0-9]+/.test($.browser.version)) {
            this.panel.parent().css('z-index', '');
        }

        this.panel.css('z-index', '').hide();
    },
    
    focus: function() {
        this.input.focus();
    },
    
    blur: function() {
        this.input.blur();
    },
    
    disable: function() {
        this.disabled = true;
        this.jq.addClass('ui-state-disabled');
        this.input.attr('disabled', 'disabled');
        if(this.cfg.editable) {
            this.label.attr('disabled', 'disabled');
        }
        this.unbindEvents();
    },
    
    enable: function() {
        this.disabled = false;
        this.jq.removeClass('ui-state-disabled');
        this.input.removeAttr('disabled');
        if(this.cfg.editable) {
            this.label.removeAttr('disabled');
        }
        this.bindEvents();
    },
    
    /**
     * Positions overlay relative to the dropdown considering fixed positioning and #4231 IE8 bug
     **/
    alignPanel: function() {
        var isIE8 = PrimeFaces.isIE(8);
        if(isIE8) {
            this.unbindResize();
        }
        
        var fixedPosition = this.panel.css('position') == 'fixed',
        win = $(window),
        positionOffset = fixedPosition ? '-' + win.scrollLeft() + ' -' + win.scrollTop() : null;

        this.panel.css({left:'', top:''}).position({
                                        my: 'left top'
                                        ,at: 'left bottom'
                                        ,of: this.jq
                                        ,offset : positionOffset
                                    });
           
        if(isIE8) {
            this.bindResize();
        }
    },
    
    setLabel: function(value) {
        if(this.cfg.editable) {
            this.label.val(value);
        }
        else {
            if(value == '')
                this.label.html('&nbsp;');
            else
                this.label.text(value);
        }
    },
    
    selectValue : function(value) {
        var option = this.options.filter('[value="' + value + '"]');

        this.selectItem(this.items.eq(option.index()), true);
    }
    
});

/**
 * PrimeFaces SelectOneRadio Widget
 */
PrimeFaces.widget.SelectOneRadio = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        //custom layout
        if(this.cfg.custom) {
            this.inputs = $('input:radio[name="' + this.id + '"]:not:(:disabled)');
            this.outputs = this.inputs.parent().next('.ui-radiobutton-box:not(.ui-state-disabled)');
            this.labels = $();
            this.icons = this.outputs.find('.ui-radiobutton-icon');
            
            //labels
            for(var i=0; i < this.outputs.length; i++) {
                this.labels = this.labels.add('label[for="' + this.outputs.eq(i).parent().attr('id') + '"]');
            }
        }
        //regular layout
        else {
            this.outputs = this.jq.find('.ui-radiobutton-box:not(.ui-state-disabled)');
            this.inputs = this.jq.find(':radio:not(:disabled)');
            this.labels = this.jq.find('label:not(.ui-state-disabled)');
            this.icons = this.jq.find('.ui-radiobutton-icon');
        }
        
        this.checkedRadio = this.outputs.filter('.ui-state-active');
    
        this.bindEvents();    
        
        //pfs metadata
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    bindEvents: function() {
        var _self = this;
        
        //events for displays
        this.outputs.mouseover(function() {
            $(this).addClass('ui-state-hover');
        }).mouseout(function() {
            $(this).removeClass('ui-state-hover');
        }).click(function() {
            var radio = $(this),
            input = radio.prev().children(':radio');
            
            if(!input.is(':checked')) {
                input.trigger('click');
                
                if($.browser.msie && parseInt($.browser.version) < 9) {
                    input.trigger('change');
                }
            }
        });
        
        //selects radio when label is clicked
        this.labels.click(function(e) {
            var target = $(PrimeFaces.escapeClientId($(this).attr('for'))),
            radio = null;

            //checks if target is input or not(custom labels)
            if(target.is(':input'))
                radio = target.parent().next();
            else
                radio = target.children('.ui-radiobutton-box'); //custom layout

            radio.click();
            
            e.preventDefault();
        });
        
        //delegate focus-blur-change states
        this.inputs.focus(function() {
            var input = $(this),
            radio = input.parent().next();
            
            if(input.prop('checked')) {
                radio.removeClass('ui-state-active');
            }
            
            radio.addClass('ui-state-focus');
        })
        .blur(function() {
            var input = $(this),
            radio = input.parent().next();
            
            if(input.prop('checked')) {
                radio.addClass('ui-state-active');
            }
                        
            radio.removeClass('ui-state-focus');
        })
        .change(function(e) {
            //unselect previous
            _self.checkedRadio.removeClass('ui-state-active').children('.ui-radiobutton-icon').removeClass('ui-icon ui-icon-bullet');
            
            //select current
            var currentInput = _self.inputs.filter(':checked'),
            currentRadio = currentInput.parent().next();
            currentRadio.children('.ui-radiobutton-icon').addClass('ui-icon ui-icon-bullet');
            
            if(!currentInput.is(':focus')) {
                currentRadio.addClass('ui-state-active');
            }
            
            _self.checkedRadio = currentRadio;
        });
        
        //Client Behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.inputs, this.cfg.behaviors);
        }
    }
    
});

/**
 * PrimeFaces SelectBooleanCheckbox Widget
 */
PrimeFaces.widget.SelectBooleanCheckbox = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.input = $(this.jqId + '_input');
        this.box = this.jq.find('.ui-chkbox-box');
        this.icon = this.box.children('.ui-chkbox-icon');
        this.itemLabel = this.jq.find('.ui-chkbox-label');
        this.disabled = this.input.is(':disabled');
        
        var _self = this;

        //bind events if not disabled
        if(!this.disabled) {
            this.box.mouseover(function() {
                _self.box.addClass('ui-state-hover');
            }).mouseout(function() {
                _self.box.removeClass('ui-state-hover');
            }).click(function() {
                _self.toggle();
            });
            
            this.input.focus(function() {
                if(_self.isChecked()) {
                    _self.box.removeClass('ui-state-active');
                }

                _self.box.addClass('ui-state-focus');
            })
            .blur(function() {
                if(_self.isChecked()) {
                    _self.box.addClass('ui-state-active');
                }

                _self.box.removeClass('ui-state-focus');
            })
            .keydown(function(e) {
                var keyCode = $.ui.keyCode;
                if(e.which == keyCode.SPACE) {
                    e.preventDefault();
                }
            })
            .keyup(function(e) {
                var keyCode = $.ui.keyCode;
                if(e.which == keyCode.SPACE) {
                    _self.toggle();
                    
                    e.preventDefault();
                }
            });

            //toggle state on label click
            this.itemLabel.click(function() {
                _self.toggle();
            });

            //Client Behaviors
            if(this.cfg.behaviors) {
                PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors);
            }
        }
        
        //pfs metadata
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    toggle: function() {  
        if(this.isChecked()) {
            this.uncheck();
        }
        else {
            this.check();
        }
    },
    
    isChecked: function() {
        return this.input.is(':checked');
    },
    
    check: function() {
        if(!this.isChecked()) {
            this.input.prop('checked', true);
            this.box.addClass('ui-state-active').children('.ui-chkbox-icon').addClass('ui-icon ui-icon-check');
            
            this.input.trigger('change');
        }
    },
    
    uncheck: function() {
        if(this.isChecked()) {
            this.input.prop('checked', false);
            this.box.removeClass('ui-state-active').children('.ui-chkbox-icon').removeClass('ui-icon ui-icon-check');
            
            this.input.trigger('change');
        }
    }
    
});

/**
 * PrimeFaces SelectManyCheckbox Widget
 */
PrimeFaces.widget.SelectManyCheckbox = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.outputs = this.jq.find('.ui-chkbox-box:not(.ui-state-disabled)');
        this.inputs = this.jq.find(':checkbox:not(:disabled)');
                        
        this.bindEvents();
        
        //pfs metadata
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    bindEvents: function() {        
        this.outputs.mouseover(function() {
            $(this).addClass('ui-state-hover');
        }).mouseout(function() {
            $(this).removeClass('ui-state-hover');
        }).click(function() {
            var checkbox = $(this),
            input = checkbox.prev().children(':checkbox');
            
            input.trigger('click');
            
            if($.browser.msie && parseInt($.browser.version) < 9) {
                input.trigger('change');
            }
        });
        
        //delegate focus-blur-change states
        this.inputs.focus(function() {
            var input = $(this),
            checkbox = input.parent().next();
            
            if(input.prop('checked')) {
                checkbox.removeClass('ui-state-active');
            }
            
            checkbox.addClass('ui-state-focus');
        })
        .blur(function() {
            var input = $(this),
            checkbox = input.parent().next();
            
            if(input.prop('checked')) {
                checkbox.addClass('ui-state-active');
            }
            
            checkbox.removeClass('ui-state-focus');
        })
        .change(function(e) {
            var input = $(this),
            checkbox = input.parent().next(),
            hasFocus = input.is(':focus'),
            disabled = input.is(':disabled');

            if(disabled) {
                return;
            }

            if(input.is(':checked')) {
                checkbox.children('.ui-chkbox-icon').addClass('ui-icon ui-icon-check');

                if(!hasFocus) {
                    checkbox.addClass('ui-state-active');
                }
            }
            else {
                checkbox.removeClass('ui-state-active').children('.ui-chkbox-icon').removeClass('ui-icon ui-icon-check');
            }
        });

        //Client Behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.inputs, this.cfg.behaviors);
        }
    }
    
});

            /**
 * PrimeFaces SelectListbox Widget
 */
PrimeFaces.widget.SelectListbox = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.input = $(this.jqId + '_input'),
        this.listContainer = this.jq.children('ul'),
        this.options = $(this.input).children('option');

        this.generateItems(cfg);

        this.bindEvents();

        //Client Behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors);
        }
        
        //pfs metadata
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    /**
     * Creates items for each option 
     */
    generateItems: function() {
        var _self = this;

        this.options.each(function(i) {
            var option = $(this),
            selected = option.is(':selected'),
            disabled = option.is(':disabled'),
            styleClass = 'ui-selectlistbox-item ui-corner-all';
            styleClass = disabled ? styleClass + ' ui-state-disabled' : styleClass;
            styleClass = selected ? styleClass + ' ui-state-active' : styleClass;

            _self.listContainer.append('<li class="' + styleClass + '">' + option.text() + '</li>');
        });

        this.items = this.listContainer.children('li:not(.ui-state-disabled)');
        
        //scroll to selected
        var selected = this.options.filter(':selected');
        if(selected.length > 0) {
            var selectedItem = this.items.eq(selected.eq(0).index()),
            itemBottom = selectedItem.position().top + selectedItem.height(),
            scrollBottom = this.jq.scrollTop() + this.jq.height();

            if(itemBottom > scrollBottom) {
                this.jq.scrollTop(selectedItem.position().top);
            }
        }
    },
    
    bindEvents: function() {
        var _self = this;

        //items
        this.items.mouseover(function() {
            var element = $(this);
            if(!element.hasClass('ui-state-active')) {
                $(this).addClass('ui-state-hover');
            }
        }).mouseout(function() {
            $(this).removeClass('ui-state-hover');
        }).mousedown(function(e) {        
            var element = $(this),
            option = $(_self.options.get(element.index())),
            metaKey = (e.metaKey||e.ctrlKey);

            //clear previous selection if single or multiple with no metakey
            if(_self.cfg.selection == 'single' || (_self.cfg.selection == 'multiple' && !metaKey)) {
                _self.items.removeClass('ui-state-active ui-state-hover');
                _self.options.removeAttr('selected');
            }

            //unselect current selected item if multiple with metakey
            if(_self.cfg.selection == 'multiple' && metaKey && element.hasClass('ui-state-active')) {
                element.removeClass('ui-state-active');
                option.removeAttr('selected');
            } 
            //select item
            else {
                element.addClass('ui-state-active').removeClass('ui-state-hover');
                option.attr('selected', 'selected');
            }

            _self.input.change();

            PrimeFaces.clearSelection();

            e.preventDefault();
        });

        //input
        this.input.focus(function() {
            _self.jq.addClass('ui-state-focus');
        }).blur(function() {
            _self.jq.removeClass('ui-state-focus');
        })
    }

});

/** 
 * PrimeFaces CommandButton Widget
 */
PrimeFaces.widget.CommandButton = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        PrimeFaces.skinButton(this.jq);
    },
    
    disable: function() {
        this.jq.removeClass('ui-state-hover ui-state-focus ui-state-active')
                .addClass('ui-state-disabled').attr('disabled', 'disabled');
    },
    
    enable: function() {
        this.jq.removeClass('ui-state-disabled').removeAttr('disabled');
    }
    
});

/*
 * PrimeFaces Button Widget
 */
PrimeFaces.widget.Button = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        PrimeFaces.skinButton(this.jq);
    },
    
    disable: function() {
        this.jq.removeClass('ui-state-hover ui-state-focus ui-state-active')
                .addClass('ui-state-disabled').attr('disabled', 'disabled');
    },
    
    enable: function() {
        this.jq.removeClass('ui-state-disabled').removeAttr('disabled');
    }
    
});

/**
 * PrimeFaces SelecyManyButton Widget
 */
PrimeFaces.widget.SelectManyButton = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.buttons = this.jq.children('div:not(:disabled)');
        this.inputs = this.jq.find(':checkbox:not(:disabled)');
        var _self = this;

        this.buttons.mouseover(function() {
            var button = $(this);
            if(!button.hasClass('ui-state-active'))
                button.addClass('ui-state-hover'); 
        }).mouseout(function() {
            $(this).removeClass('ui-state-hover'); 
        }).click(function() {
            var button = $(this);

            if(button.hasClass('ui-state-active'))
                _self.unselect(button);
            else
                _self.select(button);
        });

        //Client behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.inputs, this.cfg.behaviors);
        }
        
        //pfs metadata
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    select: function(button) {
        button.removeClass('ui-state-hover').addClass('ui-state-active')
                                .children(':checkbox').attr('checked','checked').change();

    },
    
    unselect: function(button) {
        button.removeClass('ui-state-active').addClass('ui-state-hover')
                                .children(':checkbox').removeAttr('checked').change();
    }
    
});

/**
 * PrimeFaces SelectOneButton Widget
 */
PrimeFaces.widget.SelectOneButton = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.buttons = this.jq.children('div:not(:disabled)');
        this.inputs = this.jq.find(':radio:not(:disabled)');
        var _self = this;

        this.buttons.mouseover(function() {
            var button = $(this);
            if(!button.hasClass('ui-state-active')) {
                button.addClass('ui-state-hover');
            }
        }).mouseout(function() {
            $(this).removeClass('ui-state-hover');
        }).click(function() {
            var button = $(this);

            if(!button.hasClass('ui-state-active')) {
                _self.select(button);
            }
        });

        //Client behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.inputs, this.cfg.behaviors);
        }
        
        //pfs metadata
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    select: function(button) {
        this.unselect(this.buttons.filter('.ui-state-active'));

        button.addClass('ui-state-active').children(':radio').attr('checked','checked').change();
    },
    
    unselect: function(button) {
        button.removeClass('ui-state-active ui-state-hover').children(':radio').removeAttr('checked').change();
    }
    
});


/**
 * PrimeFaces SelectBooleanButton Widget
 */
PrimeFaces.widget.SelectBooleanButton = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.input = $(this.jqId + '_input');
        this.disabled = this.input.is(':disabled');
        this.icon = this.jq.children('.ui-button-icon-left');
        var _self = this;

        //bind events if not disabled
        if(!this.disabled) {
            this.jq.mouseover(function() {
                if(!_self.jq.hasClass('ui-state-active')) {
                    _self.jq.addClass('ui-state-hover');
                }
            }).mouseout(function() {
                if(!_self.jq.hasClass('ui-state-active')) {
                    _self.jq.removeClass('ui-state-hover');
                }
            }).click(function() {
                _self.toggle();
            });

            //Client Behaviors
            if(this.cfg.behaviors) {
                PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors);
            }
        }
        
        //pfs metadata
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    toggle: function() {
        if(!this.disabled) {
            if(this.jq.hasClass('ui-state-active'))
                this.uncheck();
            else
                this.check();
        }
    },
    
    check: function() {
        if(!this.disabled) {
            this.input.attr('checked', 'checked');
            this.jq.addClass('ui-state-active').children('.ui-button-text').html(this.cfg.onLabel);

            if(this.icon.length > 0) {
                this.icon.removeClass(this.cfg.offIcon).addClass(this.cfg.onIcon);
            }

            this.input.change();
        }
    },
    
    uncheck: function() {
        if(!this.disabled) {
            this.input.removeAttr('checked', 'checked');
            this.jq.removeClass('ui-state-active').children('.ui-button-text').html(this.cfg.offLabel);

            if(this.icon.length > 0) {
                this.icon.removeClass(this.cfg.onIcon).addClass(this.cfg.offIcon);
            }

            this.input.change();
        }
    }
    
});

/** 
 * PrimeFaces SelectCheckboxMenu Widget
 */
PrimeFaces.widget.SelectCheckboxMenu = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.labelContainer = this.jq.find('.ui-selectcheckboxmenu-label-container');
        this.label = this.jq.find('.ui-selectcheckboxmenu-label');
        this.menuIcon = this.jq.children('.ui-selectcheckboxmenu-trigger');
        this.triggers = this.jq.find('.ui-selectcheckboxmenu-trigger, .ui-selectcheckboxmenu-label');
        this.disabled = this.jq.hasClass('ui-state-disabled');
        this.inputs = this.jq.find(':checkbox');

        this.renderPanel();

        this.checkboxes = this.itemContainer.find('.ui-chkbox-box:not(.ui-state-disabled)');
        this.labels = this.itemContainer.find('label');

        //mark trigger and descandants of trigger as a trigger for a primefaces overlay
        this.triggers.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);

        this.bindEvents();

        this.setupDialogSupport();

        //pfs metadata
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    refresh: function(cfg) {
        this.panel.remove();
        
        this.init(cfg);
    },
    
    renderPanel: function() {
        this.panelId = this.jqId + '_panel';
                
        this.panel = $('<div id="' + this.panelId + '" class="ui-selectcheckboxmenu-panel ui-widget ui-widget-content ui-corner-all ui-helper-hidden"></div>')
                        .appendTo(document.body);
                
        this.renderHeader();

        this.renderItems();
        
        if(this.cfg.height) {
            this.panel.height(this.cfg.height);
        }
        else if(this.inputs.length > 10) {
            this.panel.height(200)
        }
    },
    
    renderHeader: function() {        
        this.header = $('<div class="ui-widget-header ui-corner-all ui-selectcheckboxmenu-header ui-helper-clearfix"></div>')
                        .appendTo(this.panel); 
        
        //toggler
        this.toggler = $('<div class="ui-chkbox ui-widget"><div class="ui-chkbox-box ui-widget ui-corner-all ui-state-default"><span class="ui-chkbox-icon"></span></div></div>')
                            .appendTo(this.header);
        this.togglerBox = this.toggler.children('.ui-chkbox-box');
        this.updateToggler();
        
        //filter
        if(this.cfg.filter) {
            this.filterInput = $('<input type="text" aria-multiline="false" aria-readonly="false" aria-disabled="false" role="textbox" class="ui-inputfield ui-inputtext ui-widget ui-state-default ui-corner-all">');
            if(this.cfg.filterText) {
                this.filterInput.attr('placeholder', this.cfg.filterText);
            }
            
            this.filterInput.appendTo(this.header);
        }
        
        
        //closer
        this.closer = $('<a class="ui-selectcheckboxmenu-close ui-corner-all" href="#"><span class="ui-icon ui-icon-circle-close"></span></a>')
                    .appendTo(this.header)
       
        
    },
   
    renderItems: function() {
        var _self = this;
        
        this.itemContainer = $('<ul class="ui-selectcheckboxmenu-items ui-selectcheckboxmenu-list ui-widget-content ui-widget ui-corner-all ui-helper-reset"></div>')
                .appendTo(this.panel);

        this.inputs.each(function() {
            var input = $(this),
            label = input.next(),
            disabled = input.is(':disabled'),
            checked = input.is(':checked'),
            boxClass = 'ui-chkbox-box ui-widget ui-corner-all ui-state-default';

            if(disabled) {
                boxClass += " ui-state-disabled";
            }

            if(checked) {
                boxClass += " ui-state-active";
            }

            var iconClass = checked ? 'ui-chkbox-icon ui-icon ui-icon-check' : 'ui-chkbox-icon';

            var dom = '<li class="ui-selectcheckboxmenu-item ui-selectcheckboxmenu-list-item ui-corner-all">';
            dom += '<div class="ui-chkbox ui-widget"><div class="' + boxClass + '"><span class="' + iconClass + '"></span></div></div>';
            dom += '<label>' + label.text() +  '</label></li>';

            _self.itemContainer.append(dom);
        });
    },
    
    bindEvents: function() {
        var _self = this;
        
        //Events for checkboxes
        this.bindCheckboxHover(this.checkboxes);
        this.checkboxes.click(function() {
            _self.toggleItem($(this));
        });
        
        //Toggler
        this.bindCheckboxHover(this.togglerBox);
        this.togglerBox.click(function() {
            var el = $(this);
            if(el.hasClass('ui-state-active')) {
                _self.uncheckAll();
                el.addClass('ui-state-hover');
            }
            else {
                _self.checkAll();
                el.removeClass('ui-state-hover');
            }
        });
        
        //Filter
        if(this.cfg.filter) {
            PrimeFaces.skinInput(this.filterInput);
            this.filterInput.keyup(function() {
                _self.filter($(this).val());
            });
        }

        //Closer
        this.closer.mouseenter(function(){
            $(this).addClass('ui-state-hover');
        }).mouseleave(function() {
            $(this).removeClass('ui-state-hover');
        }).click(function(e) {
            _self.hide(true);
            
            e.preventDefault();
        });

        //Labels
        this.labels.click(function() {
            var checkbox = $(this).prev().children('.ui-chkbox-box');
            _self.toggleItem(checkbox);
            checkbox.removeClass('ui-state-hover');
            PrimeFaces.clearSelection();
        });

        //Events to show/hide the panel
        this.triggers.mouseover(function() {
            if(!_self.disabled&&!_self.triggers.hasClass('ui-state-focus')) {
                _self.triggers.addClass('ui-state-hover');
            }
        }).mouseout(function() {
            if(!_self.disabled) {
                _self.triggers.removeClass('ui-state-hover');
            }
        }).mousedown(function(e) {
            if(!_self.disabled) {
                if(_self.panel.is(":hidden")) {
                    _self.show();
                }
                else {
                    _self.hide(true);
                }
            }
        }).click(function(e) {
            e.preventDefault(); 
        });

        //hide overlay when outside is clicked
        $(document.body).bind('mousedown.selectcheckboxmenu', function (e) {        
            if(_self.panel.is(':hidden')) {
                return;
            }

            //do nothing on trigger mousedown
            var target = $(e.target);
            if(_self.triggers.is(target)||_self.triggers.has(target).length > 0) {
                return;
            }

            //hide the panel and remove focus from label
            var offset = _self.panel.offset();
            if(e.pageX < offset.left ||
                e.pageX > offset.left + _self.panel.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.panel.height()) {

                _self.hide(true);
            }
        });

        //Hide overlay on resize
        var resizeNS = 'resize.' + this.id;
        $(window).unbind(resizeNS).bind(resizeNS, function() {
            if(_self.panel.is(':visible')) {
                _self.hide(false);
            }
        });
        
        //Client Behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.inputs, this.cfg.behaviors);
        }
    },
    
    bindCheckboxHover: function(item) {
        item.mouseenter(function() {
            var item = $(this);
            if(!item.hasClass('ui-state-active')&&!item.hasClass('ui-state-disabled')) {
                item.addClass('ui-state-hover');
            }
        }).mouseleave(function() {
            $(this).removeClass('ui-state-hover');
        });
    },
    
    filter: function(value) {
        var filterValue = $.trim(value).toLowerCase(),
        match = false;
        
        if(filterValue === '') {
            this.labels.filter(':hidden').parent().show();
        }
        else {
            for(var i = 0; i < this.labels.length; i++) {
                var label = this.labels.eq(i);

                if(label.text().toLowerCase().indexOf(filterValue) == -1) {
                    label.parent().hide();
                } 
                else {
                    label.parent().show();
                    match = true;
                }
                    
            }
        }
        
        var overflow = match ? 'auto' : 'visible';
        this.panel.css('overflow', overflow);
    },
    
    checkAll: function() {
        this.inputs.prop('checked', true);
        this.check(this.checkboxes);
        
        if(this.toggler) {
            this.check(this.togglerBox);
        }
    },
    
    uncheckAll: function() {
        this.inputs.prop('checked', false);
        this.uncheck(this.checkboxes);
        
        if(this.toggler) {
            this.uncheck(this.togglerBox);
        }
    },
    
    show: function() {    
        this.alignPanel();

        this.panel.show();
        
        this.postShow();
    },
    
    hide: function(animate) {
        var _self = this;

        this.triggers.removeClass('ui-state-focus');

        if(animate) {
            this.panel.fadeOut('fast', function() {
                _self.postHide();
            });
        }
            
        else {
            this.panel.hide();
            this.postHide();
        }
    },
    
    postShow: function() {
        if(this.cfg.onShow) {
            this.cfg.onShow.call(this);
        }
    },
    
    postHide: function() {
        if(this.cfg.onHide) {
            this.cfg.onHide.call(this);
        }
    },

    alignPanel: function() {
        var fixedPosition = this.panel.css('position') == 'fixed',
        win = $(window),
        positionOffset = fixedPosition ? '-' + win.scrollLeft() + ' -' + win.scrollTop() : null;

        this.panel.css({left:'', top:''}).position({
                                        my: 'left top'
                                        ,at: 'left bottom'
                                        ,of: this.jq
                                        ,offset : positionOffset
                                    });
                                    
        this.panel.css('z-index', ++PrimeFaces.zindex);
    },
    
    toggleItem: function(checkbox) {
        if(!checkbox.hasClass('ui-state-disabled')) {
            if(checkbox.hasClass('ui-state-active')) {
                this.uncheck(checkbox, true);
                checkbox.addClass('ui-state-hover');
            }
            else {
                this.check(checkbox, true);
                checkbox.removeClass('ui-state-hover');
            }
        }
    },
    
    check: function(checkbox, updateInput) {
        if(!checkbox.hasClass('ui-state-disabled')) {
            checkbox.addClass('ui-state-active').children('.ui-chkbox-icon').addClass('ui-icon ui-icon-check');
            
            if(updateInput) {
                var input = this.inputs.eq(checkbox.parents('li:first').index());
                input.attr('checked', 'checked').change();
                
                this.updateToggler();
            }
        }
    },
    
    uncheck : function(checkbox, updateInput) {
        if(!checkbox.hasClass('ui-state-disabled')) {
            checkbox.removeClass('ui-state-active').children('.ui-chkbox-icon').removeClass('ui-icon ui-icon-check');

            if(updateInput) {
                var input = this.inputs.eq(checkbox.parents('li:first').index());
                input.removeAttr('checked').change();
                
                this.updateToggler();
            }
        }
    },
    
    updateToggler: function() {
        if(this.inputs.length === this.inputs.filter(':checked').length) {
            this.check(this.togglerBox);
        }
        else {
            this.uncheck(this.togglerBox);
        }
    },
    
    setupDialogSupport: function() {
        var dialog = this.jq.parents('.ui-dialog:first');

        if(dialog.length == 1) {
            this.panel.css('position', 'fixed');
        }
    }
    
});

/**
 * PrimeFaces InputMask Widget
 */
PrimeFaces.widget.InputMask = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        if(this.cfg.mask) {
            this.jq.mask(this.cfg.mask, this.cfg);
        }

        //Client behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.jq, this.cfg.behaviors);
        }

        //Visuals
        PrimeFaces.skinInput(this.jq);
    },

    setValue: function(value) {
        this.jq.val(value);
        this.jq.unmask().mask(this.cfg.mask, this.cfg);
    },

    getValue: function() {
        return this.jq.val();
    }
    
});

/**
 * PrimeFaces Password
 */
PrimeFaces.widget.Password = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        if(!this.jq.is(':disabled')) {
            if(this.cfg.feedback) {
                this.setupFeedback();
            }

            //Client Behaviors
            if(this.cfg.behaviors) {
                PrimeFaces.attachBehaviors(this.jq, this.cfg.behaviors);
            }

            //Visuals
            PrimeFaces.skinInput(this.jq);
        }
    },
    
    setupFeedback: function() {
        var _self = this;

        //remove previous panel if any
        var oldPanel = $(this.jqId + '_panel');
        if(oldPanel.length == 1) {
            oldPanel.remove();
        }

        //config
        this.cfg.promptLabel = this.cfg.promptLabel||'Please enter a password';
        this.cfg.weakLabel = this.cfg.weakLabel||'Weak';
        this.cfg.goodLabel = this.cfg.goodLabel||'Medium';
        this.cfg.strongLabel = this.cfg.strongLabel||'Strong';

        var panelStyle = this.cfg.inline ? 'ui-password-panel-inline' : 'ui-password-panel-overlay';

        //create panel element
        var panelMarkup = '<div id="' + this.id + '_panel" class="ui-password-panel ui-widget ui-state-highlight ui-corner-all ui-helper-hidden ' + panelStyle + '">';
        panelMarkup += '<div class="ui-password-meter" style="background-position:0pt 0pt">&nbsp;</div>';
        panelMarkup += '<div class="ui-password-info">' + this.cfg.promptLabel + '</div>';
        panelMarkup += '</div>';

        this.panel = $(panelMarkup).insertAfter(this.jq);
        this.meter = this.panel.children('div.ui-password-meter');
        this.infoText = this.panel.children('div.ui-password-info');

        if(!this.cfg.inline) {
            this.panel.addClass('ui-shadow');
        }

        //events
        this.jq.focus(function() {
            _self.show();
        })
        .blur(function() {
            _self.hide();
        })
        .keyup(function() {
            var value = _self.jq.val(),
            label = null,
            meterPos = null;

            if(value.length == 0) {
                label = _self.cfg.promptLabel;
                meterPos = '0px 0px';
            }
            else {
                var score = _self.testStrength(_self.jq.val());

                if(score < 30) {
                    label = _self.cfg.weakLabel;
                    meterPos = '0px -10px';
                }
                else if(score >= 30 && score < 80) {
                    label = _self.cfg.goodLabel;
                    meterPos = '0px -20px';
                } 
                else if(score >= 80) {
                    label = _self.cfg.strongLabel;
                    meterPos = '0px -30px';
                }
            }

            //update meter and info text
            _self.meter.css('background-position', meterPos);
            _self.infoText.text(label);
        });

        //overlay setting
        if(!this.cfg.inline) {
            this.panel.appendTo('body');

            //Hide overlay on resize
            var resizeNS = 'resize.' + this.id;
            $(window).unbind(resizeNS).bind(resizeNS, function() {
                if(_self.panel.is(':visible')) {
                    _self.panel.hide();
                }
            });
        }
    },
    
    testStrength: function(str) {
        var grade = 0, 
        val = 0, 
        _self = this;

        val = str.match('[0-9]');
        grade += _self.normalize(val ? val.length : 1/4, 1) * 25;

        val = str.match('[a-zA-Z]');
        grade += _self.normalize(val ? val.length : 1/2, 3) * 10;

        val = str.match('[!@#$%^&*?_~.,;=]');
        grade += _self.normalize(val ? val.length : 1/6, 1) * 35;

        val = str.match('[A-Z]');
        grade += _self.normalize(val ? val.length : 1/6, 1) * 30;

        grade *= str.length / 8;

        return grade > 100 ? 100 : grade;
    },
    
    normalize: function(x, y) {
        var diff = x - y;

        if(diff <= 0) {
            return x / y;
        }
        else {
            return 1 + 0.5 * (x / (x + y/4));
        }
    },
    
    show: function() {
        //align panel before showing
        if(!this.cfg.inline) {
            this.panel.css({
                left:'', 
                top:'',
                'z-index': ++PrimeFaces.zindex
            })
            .position({
                my: 'left top',
                at: 'right top',
                of: this.jq
            });

            this.panel.fadeIn();
        }
        else {
            this.panel.slideDown(); 
        }        
    },
    
    hide: function() {
        if(this.cfg.inline)
            this.panel.slideUp();
        else
            this.panel.fadeOut();
    }
    
});

/**
 * PrimeFaces DefaultCommand Widget
 */
PrimeFaces.widget.DefaultCommand = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jqTarget = $(PrimeFaces.escapeClientId(this.cfg.target));
        this.scope = this.cfg.scope ? $(PrimeFaces.escapeClientId(this.cfg.scope)) : null;
        var _self = this;
        
        //attach keypress listener to parent form
        this.jqTarget.parents('form:first').keydown(function(e) {
           //do not proceed if event target is not in this scope or target is a textarea
           if((_self.scope && _self.scope.find(e.target).length == 0)||$(e.target).is('textarea')) {
               return true;
           }
               
           var keyCode = $.ui.keyCode;
           
           if(e.which == keyCode.ENTER || e.which == keyCode.NUMPAD_ENTER) {
               _self.jqTarget.click();
               e.preventDefault();
           }
        });
        
        $(this.jqId + '_s').remove();
    }
});

/*
 * PrimeFaces SplitButton Widget
 */
PrimeFaces.widget.SplitButton = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.button = $(this.jqId + '_button');
        this.menuButton = $(this.jqId + '_menuButton');
        this.menu = $(this.jqId + '_menu');
        this.menuitems = this.menu.find('.ui-menuitem:not(.ui-state-disabled)');
        this.cfg.disabled = this.button.is(':disabled');
        
        if(!this.cfg.disabled) {
            this.cfg.position = {
                my: 'left top'
                ,at: 'left bottom'
                ,of: this.button
            };
        
            this.menu.appendTo(document.body);
            
            this.bindEvents();

            this.setupDialogSupport();
        }
        
        //pfs metadata
        this.button.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        this.menuButton.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    },
    
    //override
    refresh: function(cfg) {
        //remove previous overlay
        $(document.body).children(PrimeFaces.escapeClientId(cfg.id + '_menu')).remove();
        
        this.init(cfg);
    },
    
    bindEvents: function() {  
        var _self = this;

        PrimeFaces.skinButton(this.button).skinButton(this.menuButton);

        //mark button and descandants of button as a trigger for a primefaces overlay
        this.button.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);

        //toggle menu
        this.menuButton.click(function() {
            if(_self.menu.is(':hidden')) {   
                _self.show();
            }
            else {
                _self.hide();
            }
        });

        //menuitem visuals
        this.menuitems.mouseover(function(e) {
            var menuitem = $(this),
            menuitemLink = menuitem.children('.ui-menuitem-link');
            
            if(!menuitemLink.hasClass('ui-state-disabled')) {
                menuitem.addClass('ui-state-hover');
            }
        }).mouseout(function(e) {
            $(this).removeClass('ui-state-hover');
        }).click(function() {
            _self.hide();
        });

        /**
        * handler for document mousedown to hide the overlay
        **/
        $(document.body).bind('mousedown.ui-menubutton', function (e) {
            //do nothing if hidden already
            if(_self.menu.is(":hidden")) {
                return;
            }

            //do nothing if mouse is on button
            var target = $(e.target);
            if(target.is(_self.button)||_self.button.has(target).length > 0) {
                return;
            }

            //hide overlay if mouse is outside of overlay except button
            var offset = _self.menu.offset();
            if(e.pageX < offset.left ||
                e.pageX > offset.left + _self.menu.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.menu.height()) {

                _self.button.removeClass('ui-state-focus ui-state-hover');
                _self.hide();
            }
        });

        //hide overlay on window resize
        var resizeNS = 'resize.' + this.id;
        $(window).unbind(resizeNS).bind(resizeNS, function() {
            if(_self.menu.is(':visible')) {
                _self.menu.hide();
            }
        });
    },
    
    setupDialogSupport: function() {
        var dialog = this.button.parents('.ui-dialog:first');

        if(dialog.length == 1) {        
            this.menu.css('position', 'fixed');
        }
    },
    
    show: function() {
        this.alignPanel();
        
        this.menuButton.focus();
        
        this.menu.show();
    },
    
    hide: function() {
        this.menuButton.removeClass('ui-state-focus');
        
        this.menu.fadeOut('fast');
    },
    
    alignPanel: function() {
        var fixedPosition = this.menu.css('position') == 'fixed',
        win = $(window),
        positionOffset = fixedPosition ? '-' + win.scrollLeft() + ' -' + win.scrollTop() : null;

        this.cfg.position.offset = positionOffset;

        this.menu.css({left:'', top:'','z-index': ++PrimeFaces.zindex}).position(this.cfg.position);
    }
    
});

/*
 * PrimeFaces ThemeSwitcher Widget
 */
PrimeFaces.widget.ThemeSwitcher = PrimeFaces.widget.SelectOneMenu.extend({
    
    init: function(cfg) { 
        var _self = this;
        cfg.onchange = function() {
            var value = _self.options.filter(':selected').val();
            
            PrimeFaces.changeTheme(value);
        };
        
        this._super(cfg);
    }
});
/**
 * PrimeFaces Growl Widget
 */
PrimeFaces.widget.Growl = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id
        this.jqId = PrimeFaces.escapeClientId(this.id);

        this.render();
        
        $(this.jqId + '_s').remove();
    },
    
    //Override
    refresh: function(cfg) {
        this.show(cfg.msgs);
    },
    
    show: function(msgs) {
        var _self = this;
        
        this.jq.css('z-index', ++PrimeFaces.zindex);

        //clear previous messages
        this.removeAll();

        $.each(msgs, function(index, msg) {
            _self.renderMessage(msg);
        }); 
    },
    
    removeAll: function() {
        this.jq.children('div.ui-growl-item-container').remove();
    },
    
    render: function() {
        //create container
        this.jq = $('<div id="' + this.id + '_container" class="ui-growl ui-widget"></div>');
        this.jq.appendTo($(document.body));

        //render messages
        this.show(this.cfg.msgs);
    },
    
    renderMessage: function(msg) {
        var markup = '<div class="ui-growl-item-container ui-state-highlight ui-corner-all ui-helper-hidden ui-shadow">';
        markup += '<div class="ui-growl-item">';
        markup += '<div class="ui-growl-icon-close ui-icon ui-icon-closethick" style="display:none"></div>';
        markup += '<span class="ui-growl-image ui-growl-image-' + msg.severity + '" />';
        markup += '<div class="ui-growl-message">';
        markup += '<span class="ui-growl-title"></span>';
        markup += '<p></p>';
        markup += '</div><div style="clear: both;"></div></div></div>';

        var message = $(markup),
        summaryEL = message.find('span.ui-growl-title'),
        detailEL = summaryEL.next();
        
        if(this.cfg.escape) {
            summaryEL.text(msg.summary);
            detailEL.text(msg.detail);
        }
        else {
            summaryEL.html(msg.summary);
            detailEL.html(msg.detail);
        }

        this.bindEvents(message);

        message.appendTo(this.jq).fadeIn();
    },
    
    bindEvents: function(message) {
        var _self = this,
        sticky = this.cfg.sticky;

        message.mouseover(function() {
            var msg = $(this);

            //visuals
            if(!msg.is(':animated')) {
                msg.find('div.ui-growl-icon-close:first').show();
            }
        })
        .mouseout(function() {        
            //visuals
            $(this).find('div.ui-growl-icon-close:first').hide();
        });

        //remove message on click of close icon
        message.find('div.ui-growl-icon-close').click(function() {
            _self.removeMessage(message);

            //clear timeout if removed manually
            if(!sticky) {
                clearTimeout(message.data('timeout'));
            }
        });

        //hide the message after given time if not sticky
        if(!sticky) {
            this.setRemovalTimeout(message);
        }
    },
    
    removeMessage: function(message) {
        message.fadeTo('normal', 0, function() {
            message.slideUp('normal', 'easeInOutCirc', function() {
                message.remove();
            });
        });
    },
    
    setRemovalTimeout: function(message) {
        var _self = this;

        var timeout = setTimeout(function() {
            _self.removeMessage(message);
        }, this.cfg.life);

        message.data('timeout', timeout);
    }
});
/**
 * PrimeFaces Inplace Widget
 */
PrimeFaces.widget.Inplace = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.display = $(this.jqId + '_display');
        this.content = $(this.jqId + '_content');
        this.cfg.formId = this.jq.parents('form:first').attr('id');
        this.onshowHandlers = [];

        var _self = this;

        if(!this.cfg.disabled) {

            if(this.cfg.toggleable) {
                this.display.bind(this.cfg.event, function(){
                    _self.show();
                });

                this.display.mouseover(function(){
                    $(this).toggleClass("ui-state-highlight");
                }).mouseout(function(){
                    $(this).toggleClass("ui-state-highlight");
                });
            }
            else {
                this.display.css('cursor', 'default');
            }

            if(this.cfg.editor) {
                this.cfg.formId = $(this.jqId).parents('form:first').attr('id');

                this.editor = $(this.jqId + '_editor');

                var saveButton = this.editor.children('.ui-inplace-save'),
                cancelButton = this.editor.children('.ui-inplace-cancel');

                PrimeFaces.skinButton(saveButton).skinButton(cancelButton);

                saveButton.click(function(e) {_self.save(e)});
                cancelButton.click(function(e) {_self.cancel(e)});
            }
        }

        this.jq.data('widget', this);
    },
    
    show: function() {    
        this.toggle(this.content, this.display, function() {
            this.content.find(':input:text:visible:enabled:first').focus().select();
        });
    },
    
    hide: function() {
        this.toggle(this.display, this.content);
    },
    
    toggle: function(elToShow, elToHide, callback) {
        var _self = this;

        if(this.cfg.effect == 'fade') {
            elToHide.fadeOut(this.cfg.effectSpeed,
                function(){
                    elToShow.fadeIn(_self.cfg.effectSpeed);

                    _self.postShow();

                    if(callback)
                        callback.call(_self);
                });
        }
        else if(this.cfg.effect == 'slide') {
                elToHide.slideUp(this.cfg.effectSpeed,
                    function(){
                        elToShow.slideDown(_self.cfg.effectSpeed);

                        _self.postShow();
                });
        }
        else if(this.cfg.effect == 'none') {
                elToHide.hide();
                elToShow.show();

                _self.postShow();
        }
    },
    
    postShow: function() {
        //execute onshowHandlers and remove successful ones
        this.onshowHandlers = $.grep(this.onshowHandlers, function(fn) {
            return !fn.call();
        });
    },
    
    getDisplay: function() {
        return this.display;
    },
    
    getContent: function() {
        return this.content;
    },
    
    save: function(e) {
        var options = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId
        };

        if(this.hasBehavior('save')) {
            var saveBehavior = this.cfg.behaviors['save'];

            saveBehavior.call(this, e, options);
        } 
        else {
            PrimeFaces.ajax.AjaxRequest(options); 
        }
    },
    
    cancel: function(e) {
        var options = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId
        };

        options.params = [
            {name: this.id + '_cancel', value: true}
        ];

        if(this.hasBehavior('cancel')) {
            var saveBehavior = this.cfg.behaviors['cancel'];

            saveBehavior.call(this, e, options);
        } else {
            PrimeFaces.ajax.AjaxRequest(options); 
        }
    },
    
    hasBehavior: function(event) {
        if(this.cfg.behaviors) {
            return this.cfg.behaviors[event] != undefined;
        }

        return false;
    },
    
    addOnshowHandler: function(fn) {
        this.onshowHandlers.push(fn);
    }
    
});
/**
 * PrimeFaces LightBox Widget
 */
PrimeFaces.widget.LightBox = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.links = this.jq.children(':not(.ui-lightbox-inline)');
        this.onshowHandlers = [];

        this.createPanel();

        if(this.cfg.mode == 'image') {
            this.setupImaging();
        } else if(this.cfg.mode == 'inline') {
            this.setupInline();
        } else if(this.cfg.mode == 'iframe') {
            this.setupIframe();
        }

        this.bindCommonEvents();

        if(this.cfg.visible) {
            this.links.eq(0).click();
        }

        this.panel.data('widget', this);
    },
    
    createPanel: function() {
        var dom = '<div id="' + this.id + '_panel" class="ui-lightbox ui-widget ui-helper-hidden ui-hidden-container">';
        dom += '<div class="ui-lightbox-content-wrapper">';
        dom += '<a class="ui-state-default ui-lightbox-nav-left ui-corner-right ui-helper-hidden"><span class="ui-icon ui-icon-carat-1-w">go</span></a>';
        dom += '<div class="ui-lightbox-content ui-corner-all"></div>';
        dom += '<a class="ui-state-default ui-lightbox-nav-right ui-corner-left ui-helper-hidden"><span class="ui-icon ui-icon-carat-1-e">go</span></a>';
        dom += '</div>';
        dom += '<div class="ui-lightbox-caption ui-widget-header ui-helper-hidden"></div>';
        dom += '</div>';

        $(document.body).append(dom);
        this.panel = $(this.jqId + '_panel');
        this.contentWrapper = this.panel.children('.ui-lightbox-content-wrapper');
        this.content = this.contentWrapper.children('.ui-lightbox-content');
        this.caption = this.panel.children('.ui-lightbox-caption');
    },
    
    setupImaging: function() {
        var _self = this;

        this.content.append('<img class="ui-helper-hidden"></img>');
        this.imageDisplay = this.content.children('img');
        this.navigators = this.contentWrapper.children('a');

        this.imageDisplay.load(function() {
            var leftOffset = (_self.panel.width() - _self.imageDisplay.width()) / 2,
            topOffset = (_self.panel.height() - _self.imageDisplay.height()) / 2;

            //prepare content for new image
            _self.content.removeClass('ui-lightbox-loading').animate({
                width:_self.imageDisplay.width()
                ,height: _self.imageDisplay.height()
            },
            500,
            function() {            
                //show image
                _self.imageDisplay.fadeIn();
                _self.showNavigators();
                _self.caption.slideDown();
            });

            _self.panel.animate({
                left: '+=' + leftOffset
                ,top: '+=' + topOffset
            }, 500);
        });

        this.navigators.mouseover(function() {
        $(this).addClass('ui-state-hover'); 
        }).mouseout(function() {
        $(this).removeClass('ui-state-hover'); 
        }).click(function(e) {
        var nav = $(this);

        _self.hideNavigators();

        if(nav.hasClass('ui-lightbox-nav-left')) {
            var index = _self.current == 0 ? _self.links.length - 1 : _self.current - 1;

            _self.links.eq(index).click();
        } 
        else {
            var index = _self.current == _self.links.length - 1 ? 0 : _self.current + 1;

            _self.links.eq(index).click();
        }

        e.preventDefault(); 
        });

        this.links.click(function(e) {
            var link = $(this);

            if(_self.panel.is(':hidden')) {
                _self.content.addClass('ui-lightbox-loading').width(32).height(32);
                _self.show();
            }
            else {
                _self.imageDisplay.fadeOut(function() {
                    _self.content.addClass('ui-lightbox-loading');
                });

                _self.caption.slideUp();
            }

            setTimeout(function() {
                _self.imageDisplay.attr('src', link.attr('href'));
                _self.current = link.index();

                var title = link.attr('title');
                if(title) {
                    _self.caption.html(title);
                }
            }, 1000);


            e.preventDefault();
            e.stopPropagation();
        });
    },
    
    setupInline: function() {
        this.inline = this.jq.children('.ui-lightbox-inline');
        this.inline.appendTo(this.content).show();
        var _self = this;

        this.links.click(function(e) {
            _self.show();

            var title = $(this).attr('title');
            if(title) {
                _self.caption.html(title);
                _self.caption.slideDown();
            }

            e.preventDefault();
            e.stopPropagation();
        });
    },
    
    setupIframe: function() {
        var _self = this;
        this.cfg.width = this.cfg.width||'640px';
        this.cfg.height = this.cfg.height||'480px';

        _self.content.append('<iframe frameborder="0" style="width:' + this.cfg.width + ';height:' + this.cfg.height + ';border:0 none; display: block;" src="' 
            + this.links.eq(0).attr('href') + '"></iframe>');

        this.links.click(function(e) {
            _self.show();

            var title = $(this).attr('title');
            if(title) {
                _self.caption.html(title);
                _self.caption.slideDown();
            }

            e.preventDefault();
            e.stopPropagation();
        });
    },
    
    bindCommonEvents: function() {
        var _self = this;

        //hide when outside is clicked
        $(document.body).bind('click.ui-lightbox', function (e) {            
            if(_self.panel.is(":hidden")) {
                return;
            }

            //hide if mouse is outside of lightbox
            var offset = _self.panel.offset();
            if(e.pageX < offset.left ||
                e.pageX > offset.left + _self.panel.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.panel.height()) {

                _self.hide();
            }
        });
    },
    
    show: function() {
        this.center();
        this.panel.css('z-index', ++PrimeFaces.zindex).show();
        this.enableModality();

        if(this.cfg.onShow) {
            this.cfg.onShow.call(this);
        }

        //execute onshowHandlers and remove successful ones
        this.onshowHandlers = $.grep(this.onshowHandlers, function(fn) {
            return !fn.call();
        });
    },
    
    hide: function() {
        this.panel.fadeOut();
        this.disableModality();
        this.imageDisplay.hide();
        this.hideNavigators();
        this.caption.hide();

        if(this.cfg.onHide) {
            this.cfg.onHide.call(this);
        }
    },
    
    center: function() {    
        var win = $(window),
        left = (win.width() / 2 ) - (this.panel.width() / 2),
        top = (win.height() / 2 ) - (this.panel.height() / 2);

        this.panel.css({
        'left': left,
        'top': top
        });
    },
    
    enableModality: function() {
        $(document.body).append('<div id="' + this.id + '_modal" class="ui-widget-overlay"></div>').
        children(this.jqId + '_modal').css({
            'width': $(document).width()
            ,'height': $(document).height()
            ,'z-index': this.panel.css('z-index') - 1
        });
    },
    
    disableModality: function() {
        $(document.body).children(this.jqId + '_modal').remove();
    },
    
    showNavigators: function() {
        this.navigators.zIndex(this.imageDisplay.zIndex() + 1).show();
    },
    
    hideNavigators: function() {
        this.navigators.hide();
    },
    
    addOnshowHandler: function(fn) {
        this.onshowHandlers.push(fn);
    }
    
});
/**
 * PrimeFaces Menu Widget
 */
PrimeFaces.widget.Menu = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        if(this.cfg.overlay) {
            this.initOverlay();
        }
    },
    
    initOverlay: function() {
        var _self = this;
        
        this.trigger = $(PrimeFaces.escapeClientId(this.cfg.trigger));

        //mark trigger and descandants of trigger as a trigger for a primefaces overlay
        this.trigger.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);

        /*
         * we might have two menus with same ids if an ancestor of a menu is updated,
         * if so remove the previous one and refresh jq
         */
        if(this.jq.length > 1){
            $(document.body).children(this.jqId).remove();
            this.jq = $(this.jqId);
            this.jq.appendTo(document.body);
        }
        else if(this.jq.parent().is(':not(body)')) {
            this.jq.appendTo(document.body);
        }

        this.cfg.pos = {
            my: this.cfg.my
            ,at: this.cfg.at
            ,of: this.trigger
        }

        this.trigger.bind(this.cfg.triggerEvent + '.ui-menu', function(e) {
            if(_self.jq.is(':visible')) {
                _self.hide();
            }
            else {
                _self.show();
                e.preventDefault();
            }
        });

        //hide overlay on document mousedown
        $(document.body).bind('mousedown.ui-menu', function (e) {            
            if(_self.jq.is(":hidden")) {
                return;
            }

            //do nothing if mousedown is on trigger
            var target = $(e.target);
            if(target.is(_self.trigger.get(0))||_self.trigger.has(target).length > 0) {
                return;
            }

            //hide if mouse is outside of overlay except trigger
            var offset = _self.jq.offset();
            if(e.pageX < offset.left ||
                e.pageX > offset.left + _self.jq.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.jq.height()) {
                _self.hide(e);
            }
        });

        //Hide overlay on resize
        var resizeNS = 'resize.' + this.id;
        $(window).unbind(resizeNS).bind(resizeNS, function() {
            if(_self.jq.is(':visible')) {
                _self.hide();
            }
        });

        //dialog support
        this.setupDialogSupport();
    },
    
    setupDialogSupport: function() {
        var dialog = this.trigger.parents('.ui-dialog:first');

        if(dialog.length == 1) {
            this.jq.css('position', 'fixed');
        }
    },
    
    show: function() {
        this.align();
        this.jq.css('z-index', ++PrimeFaces.zindex).show();
    },
    
    hide: function() {
        this.jq.fadeOut('fast');
    },
    
    align: function() {
        var fixedPosition = this.jq.css('position') == 'fixed',
        win = $(window),
        positionOffset = fixedPosition ? '-' + win.scrollLeft() + ' -' + win.scrollTop() : null;

        this.cfg.pos.offset = positionOffset;

        this.jq.css({left:'', top:''}).position(this.cfg.pos);
    }
});

/**
 * PrimeFaces TieredMenu Widget
 */
PrimeFaces.widget.TieredMenu = PrimeFaces.widget.Menu.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.links = this.jq.find('a.ui-menuitem-link:not(.ui-state-disabled)');
        
        this.bindEvents();
    },
    
    bindEvents: function() {        
        this.bindItemEvents();
        
        this.bindDocumentHandler();
    },
    
    bindItemEvents: function() {
        var _self = this;
        
        this.links.mouseenter(function() {
            var link = $(this),
            menuitem = link.parent(),
            autoDisplay = _self.cfg.autoDisplay;
            
            var activeSibling = menuitem.siblings('.ui-menuitem-active');
            if(activeSibling.length == 1) {
                _self.deactivate(activeSibling);
            }
            
            if(autoDisplay||_self.active) {
                if(menuitem.hasClass('ui-menuitem-active')) {
                    _self.reactivate(menuitem);
                }
                else {
                    _self.activate(menuitem);
                }  
            }
            else {
                _self.highlight(menuitem);
            }
        });
        
        if(this.cfg.autoDisplay == false) {
            this.rootLinks = this.jq.find('> ul.ui-menu-list > .ui-menuitem > .ui-menuitem-link');
            
            this.rootLinks.data('primefaces-menubar', this.id).find('*').data('primefaces-menubar', this.id)
            
            this.rootLinks.click(function(e) {
                var link = $(this),
                menuitem = link.parent(),
                submenu = menuitem.children('ul.ui-menu-child');

                if(submenu.length == 1) {
                    if(submenu.is(':visible')) {
                        _self.active = false;
                        _self.deactivate(menuitem);
                    }
                    else {                                        
                        _self.active = true;
                        _self.highlight(menuitem);
                        _self.showSubmenu(menuitem, submenu);
                    }
                }
            });
        }
        
        this.jq.find('ul.ui-menu-list').mouseleave(function(e) {
           if(_self.activeitem) {
               _self.deactivate(_self.activeitem);
           }
           
           e.stopPropagation();
        });
    },
    
    bindDocumentHandler: function() {
        var _self = this;
        
        $(document.body).click(function(e) {
            var target = $(e.target);
            if(target.data('primefaces-menubar') == _self.id) {
                return;
            }
            
            _self.active = false;

            _self.jq.find('li.ui-menuitem-active').each(function() {
                _self.deactivate($(this), true);
            });
        });
    },
    
    deactivate: function(menuitem, animate) {
        this.activeitem = null;
        menuitem.children('a.ui-menuitem-link').removeClass('ui-state-hover');
        menuitem.removeClass('ui-menuitem-active');
        
        if(animate)
            menuitem.children('ul.ui-menu-child:visible').fadeOut('fast');
        else
            menuitem.children('ul.ui-menu-child:visible').hide();
    },
    
    activate: function(menuitem) {
        this.highlight(menuitem);

        var submenu = menuitem.children('ul.ui-menu-child');
        if(submenu.length == 1) {
            this.showSubmenu(menuitem, submenu);
        }
    },
    
    reactivate: function(menuitem) {
        this.activeitem = menuitem;
        var submenu = menuitem.children('ul.ui-menu-child'),
        activeChilditem = submenu.children('li.ui-menuitem-active:first'),
        _self = this;
        
        if(activeChilditem.length == 1) {
            _self.deactivate(activeChilditem);
        }
    },
    
    highlight: function(menuitem) {
        this.activeitem = menuitem;
        menuitem.children('a.ui-menuitem-link').addClass('ui-state-hover');
        menuitem.addClass('ui-menuitem-active');
    },
    
    showSubmenu: function(menuitem, submenu) {
        
        submenu.css({
            'left': menuitem.outerWidth()
            ,'top': 0
            ,'z-index': ++PrimeFaces.zindex
        });

        submenu.show();
    }
    
});

/**
 * PrimeFaces Menubar Widget
 */
PrimeFaces.widget.Menubar = PrimeFaces.widget.TieredMenu.extend({
    
    showSubmenu: function(menuitem, submenu) {
        submenu.css('z-index', ++PrimeFaces.zindex);

        if(menuitem.parent().hasClass('ui-menu-child')) {    //submenu menuitem
            submenu.css({
                'left': menuitem.outerWidth()
                ,'top': 0
            });
        } 
        else {  
            submenu.css({                                    //root menuitem         
                'left': 0
                ,'top': menuitem.outerHeight()
            });
            
        }

        submenu.show();
    }
});

/**
 * PrimeFaces SlideMenu Widget
 */
PrimeFaces.widget.SlideMenu = PrimeFaces.widget.Menu.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        //elements
        this.submenus = this.jq.find('ul.ui-menu-list');
        this.wrapper = this.jq.children('div.ui-slidemenu-wrapper');
        this.content = this.wrapper.children('div.ui-slidemenu-content');
        this.rootList = this.content.children('ul.ui-menu-list');
        this.links = this.jq.find('a.ui-menuitem-link:not(.ui-state-disabled)');
        this.backward = this.wrapper.children('div.ui-slidemenu-backward');
                
        //config
        this.stack = [];
        this.jqWidth = this.jq.width();
                     
        var _self = this;
        
        if(!this.jq.hasClass('ui-menu-dynamic')) {
            
            if(this.jq.is(':not(:visible)')) {
                var hiddenParent = this.jq.parents('.ui-hidden-container:first'),
                hiddenParentWidget = hiddenParent.data('widget');

                if(hiddenParentWidget) {
                    hiddenParentWidget.addOnshowHandler(function() {
                        return _self.render();
                    });
                }
            }
            else {
                this.render();
            }
        }
                
        this.bindEvents();
    },
    
    bindEvents: function() {
        var _self = this;
        
        this.links.mouseenter(function() {
           $(this).addClass('ui-state-hover'); 
        })
        .mouseleave(function() {
           $(this).removeClass('ui-state-hover'); 
        })
        .click(function() {
           var link = $(this),
           submenu = link.next();
           
           if(submenu.length == 1) {
               _self.forward(submenu)
           }
        });
        
        this.backward.click(function() {
            _self.back();
        });
    },
    
    forward: function(submenu) {
        var _self = this;
        
        this.push(submenu);
        
        var rootLeft = -1 * (this.depth() * this.jqWidth);
        
        submenu.show().css({
            left: this.jqWidth
        });
               
        this.rootList.animate({
            left: rootLeft
        }, 500, 'easeInOutCirc', function() {
            if(_self.backward.is(':hidden')) {
                _self.backward.fadeIn('fast');
            }
        });
    },
    
    back: function() {
        var _self = this,
        last = this.pop(),
        depth = this.depth();
            
        var rootLeft = -1 * (depth * this.jqWidth);

        this.rootList.animate({
            left: rootLeft
        }, 500, 'easeInOutCirc', function() {
            last.hide();
            
            if(depth == 0) {
                _self.backward.fadeOut('fast');
            }
        });
    },
    
    push: function(submenu) {
        this.stack.push(submenu);
    },
    
    pop: function() {
        return this.stack.pop();
    },
    
    last: function() {
        return this.stack[this.stack.length - 1];
    },
    
    depth: function() {
        return this.stack.length;
    },
    
    render: function() {
        this.submenus.width(this.jq.width());
        this.wrapper.height(this.rootList.outerHeight(true) + this.backward.outerHeight(true));
        this.content.height(this.rootList.outerHeight(true));
        this.rendered = true;
    },
    
    show: function(e) {                
        this.align();
        this.jq.css('z-index', ++PrimeFaces.zindex).show();
        
        if(!this.rendered) {
            this.render();
        }

        e.preventDefault();
    }
});


/**
 * PrimeFaces PlainMenu Widget
 */
PrimeFaces.widget.PlainMenu = PrimeFaces.widget.Menu.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.menuitemLinks = this.jq.find('.ui-menuitem-link:not(.ui-state-disabled)');

        //events
        this.bindEvents();
    }
    
    ,bindEvents: function() {  
        var _self = this;

        this.menuitemLinks.mouseenter(function(e) {
            $(this).addClass('ui-state-hover');
        }).mouseleave(function(e) {
            $(this).removeClass('ui-state-hover');
        });

        if(this.cfg.overlay) {
            this.menuitemLinks.click(function() {
                _self.hide();
            });  
        }   
    }
});
            
/*
 * PrimeFaces MenuButton Widget
 */
PrimeFaces.widget.MenuButton = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.menuId = this.jqId + '_menu';
        this.button = this.jq.children('button');
        this.menu = this.jq.children('.ui-menu');
        this.menuitems = this.jq.find('.ui-menuitem');
        this.cfg.disabled = this.button.is(':disabled');

        if(!this.cfg.disabled) {
            this.bindEvents();

            $(document.body).children(this.menuId).remove();
            this.menu.appendTo(document.body);

            //dialog support
            this.setupDialogSupport();
        }
    },
    
    bindEvents: function() {  
        var _self = this;

        //button visuals
        this.button.mouseover(function(){
            if(!_self.button.hasClass('ui-state-focus')) {
                _self.button.addClass('ui-state-hover');
            }
        }).mouseout(function() {
            if(!_self.button.hasClass('ui-state-focus')) {
                _self.button.removeClass('ui-state-hover ui-state-active');
            }
        }).mousedown(function() {
            $(this).removeClass('ui-state-focus ui-state-hover').addClass('ui-state-active');
        }).mouseup(function() {
            var el = $(this);
            el.removeClass('ui-state-active')

            if(_self.menu.is(':visible')) {
                el.addClass('ui-state-hover');
                _self.hide();
            } 
            else {
                el.addClass('ui-state-focus');
                _self.show();
            }
        }).focus(function() {
            $(this).addClass('ui-state-focus');
        }).blur(function() {
            $(this).removeClass('ui-state-focus');
        });

        //mark button and descandants of button as a trigger for a primefaces overlay
        this.button.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);

        //menuitem visuals
        this.menuitems.mouseover(function(e) {
            var element = $(this);
            if(!element.hasClass('ui-state-disabled')) {
                element.addClass('ui-state-hover');
            }
        }).mouseout(function(e) {
            $(this).removeClass('ui-state-hover');
        }).click(function() {
            _self.button.removeClass('ui-state-focus');
            _self.hide();
        });

        this.cfg.position = {
            my: 'left top'
            ,at: 'left bottom'
            ,of: this.button
        }

        /**
        * handler for document mousedown to hide the overlay
        **/
        $(document.body).bind('mousedown.ui-menubutton', function (e) {
            //do nothing if hidden already
            if(_self.menu.is(":hidden")) {
                return;
            }

            //do nothing if mouse is on button
            var target = $(e.target);
            if(target.is(_self.button)||_self.button.has(target).length > 0) {
                return;
            }

            //hide overlay if mouse is outside of overlay except button
            var offset = _self.menu.offset();
            if(e.pageX < offset.left ||
                e.pageX > offset.left + _self.menu.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.menu.height()) {

                _self.button.removeClass('ui-state-focus ui-state-hover');
                _self.hide();
            }
        });

        //hide overlay on window resize
        var resizeNS = 'resize.' + this.id;
        $(window).unbind(resizeNS).bind(resizeNS, function() {
            if(_self.menu.is(':visible')) {
                _self.menu.hide();
            }
        });

        //aria
        this.button.attr('role', 'button').attr('aria-disabled', this.button.is(':disabled'));
    },
    
    setupDialogSupport: function() {
        var dialog = this.button.parents('.ui-dialog:first');

        if(dialog.length == 1) {        
            this.menu.css('position', 'fixed');
        }
    },
    
    show: function() {
        this.alignPanel();

        this.menu.show();
    },
    
    hide: function() {
        this.menu.fadeOut('fast');
    },
    
    alignPanel: function() {
        var fixedPosition = this.menu.css('position') == 'fixed',
        win = $(window),
        positionOffset = fixedPosition ? '-' + win.scrollLeft() + ' -' + win.scrollTop() : null;

        this.cfg.position.offset = positionOffset;

        this.menu.css({left:'', top:'','z-index': ++PrimeFaces.zindex}).position(this.cfg.position);
    }
    
});


/*
 * PrimeFaces ContextMenu Widget
 */
PrimeFaces.widget.ContextMenu = PrimeFaces.widget.TieredMenu.extend({
    
    init: function(cfg) {
        cfg.autoDisplay = true;
        this._super(cfg);
        
        var _self = this,
        documentTarget = (this.cfg.target === undefined);

        //event
        this.cfg.event = this.cfg.event||'contextmenu';

        //target
        this.jqTargetId = documentTarget ? document : PrimeFaces.escapeClientId(this.cfg.target);
        this.jqTarget = $(this.jqTargetId);

        //trigger
        if(this.jqTarget.hasClass('ui-datatable')) {
            this.trigger = this.jqTargetId + ' .ui-datatable-data tr';
        }
        else if(this.jqTarget.hasClass('ui-treetable')) {
            this.trigger = this.jqTargetId + ' .ui-treetable-data ' + (this.cfg.nodeType ? 'tr.ui-treetable-selectable-node.' + this.cfg.nodeType : 'tr.ui-treetable-selectable-node');
        }
        else if(this.jqTarget.hasClass('ui-tree')) {
            this.trigger = this.jqTargetId + ' ' + (this.cfg.nodeType ? 'li.' + this.cfg.nodeType + ' .ui-tree-selectable-node': '.ui-tree-selectable-node');
        }
        else {
            this.trigger = this.jqTargetId;
        }

        //append to body
        if(!this.jq.parent().is(document.body)) {
            this.jq.appendTo('body');
        }

        //attach contextmenu
        if(documentTarget) {
            $(document).off('contextmenu.ui-contextmenu').on('contextmenu.ui-contextmenu', function(e) {
                _self.show(e);
            });
        }
        else {
            var event = this.cfg.event + '.ui-contextmenu';
            $(document).off(event, this.trigger).on(event, this.trigger, null, function(e) {
                _self.show(e);
            });
        }
    },
    
    refresh: function(cfg) {
        var jqId = PrimeFaces.escapeClientId(cfg.id),
        instances = $(jqId);
        
        if(instances.length > 1) {
            $(document.body).children(jqId).remove();
        }

        this.init(cfg);
    },
    
    bindItemEvents: function() {
        this._super();
        
        var _self = this;
        
        //hide menu on item click
        this.links.bind('click', function() {
            _self.hide();
        });
    },
    
    bindDocumentHandler: function() {
        var _self = this;

        //hide overlay when document is clicked
        $(document.body).bind('click.ui-contextmenu', function (e) {
            if(_self.jq.is(":hidden")) {
                return;
            }
                        
            _self.jq.find('li.ui-menuitem-active').each(function() {
                _self.deactivate($(this), true);
            });
         
            _self.hide();
        });
    },
    
    show: function(e) {  
        //hide other contextmenus if any
        $(document.body).children('.ui-contextmenu:visible').hide();

        var win = $(window),
        left = e.pageX,
        top = e.pageY,
        width = this.jq.outerWidth(),
        height = this.jq.outerHeight();

        //collision detection for window boundaries
        if((left + width) > (win.width())+ win.scrollLeft()) {
            left = left - width;
        }
        if((top + height ) > (win.height() + win.scrollTop())) {
            top = top - height;
        }

        this.jq.css({
            'left': left,
            'top': top,
            'z-index': ++PrimeFaces.zindex
        }).show();

        e.preventDefault();
    },
    
    hide: function() {
        this.jq.hide();
    },
    
    isVisible: function() {
        return this.jq.is(':visible');
    }

});

/**
 * PrimeFaces MegaMenu Widget
 */
PrimeFaces.widget.MegaMenu = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.rootList = this.jq.children('ul.ui-menu-list');
        this.rootLinks = this.rootList.find('> li.ui-menuitem > a.ui-menuitem-link:not(.ui-state-disabled)');                  
        this.subLinks = this.jq.find('.ui-menu-child a.ui-menuitem-link:not(.ui-state-disabled)');
        
        this.bindEvents();
    },
    
    bindEvents: function() {
        var _self = this;
  
        this.rootLinks.mouseenter(function(e) {
            var link = $(this),
            menuitem = link.parent();
            
            var current = menuitem.siblings('.ui-menuitem-active');
            if(current.length > 0) {
                _self.deactivate(current, false);
            }
            
            if(_self.cfg.autoDisplay||_self.active) {
                _self.activate(menuitem);
            }
            else {
                _self.highlight(menuitem);
            }
            
        });
        
        if(this.cfg.autoDisplay == false) {
            this.rootLinks.data('primefaces-megamenu', this.id).find('*').data('primefaces-megamenu', this.id)
            
            this.rootLinks.click(function(e) {
                var link = $(this),
                menuitem = link.parent(),
                submenu = link.next();

                if(submenu.length == 1) {
                    if(submenu.is(':visible')) {
                        _self.active = false;
                        _self.deactivate(menuitem, true);
                    }
                    else {                                        
                        _self.active = true;
                        _self.activate(menuitem);
                    }
                }
            });
        }

        this.subLinks.mouseenter(function() {
            $(this).addClass('ui-state-hover');
        })
        .mouseleave(function() {
            $(this).removeClass('ui-state-hover');
        });
        
        this.rootList.mouseleave(function(e) {
            var activeitem = _self.rootList.children('.ui-menuitem-active');
            if(activeitem.length == 1) {
                _self.deactivate(activeitem, false);
            }
        });
        
        this.rootList.find('> li.ui-menuitem > ul.ui-menu-child').mouseleave(function(e) {            
            e.stopPropagation();
        });
        
        $(document.body).click(function(e) {
            var target = $(e.target);
            if(target.data('primefaces-megamenu') == _self.id) {
                return;
            }
            
            _self.active = false;
            _self.deactivate(_self.rootList.children('li.ui-menuitem-active'), true);
        });
    },
    
    deactivate: function(menuitem, animate) {
        var link = menuitem.children('a.ui-menuitem-link'),
        submenu = link.next();
        
        menuitem.removeClass('ui-menuitem-active');
        link.removeClass('ui-state-hover');
        
        if(submenu.length > 0) {
            if(animate)
                submenu.fadeOut('fast');
            else
                submenu.hide();
        }
    },
    
    highlight: function(menuitem) {
        var link = menuitem.children('a.ui-menuitem-link');

        menuitem.addClass('ui-menuitem-active');
        link.addClass('ui-state-hover');
    },
    
    activate: function(menuitem) {
        var submenu = menuitem.children('.ui-menu-child'),
        _self = this;
        
        _self.highlight(menuitem);
        
        if(submenu.length > 0) {
            _self.showSubmenu(menuitem, submenu);
        }
    },
    
    showSubmenu: function(menuitem, submenu) {
        submenu.css('z-index', ++PrimeFaces.zindex);

        submenu.css({
            'left': 0
            ,'top': menuitem.outerHeight()
        });

        submenu.show();
    }
    
});

/**
 * PrimeFaces PanelMenu Widget
 */
PrimeFaces.widget.PanelMenu = PrimeFaces.widget.BaseWidget.extend({

    init: function(cfg) {
        this._super(cfg);
        this.headers = this.jq.children('h3.ui-panelmenu-header:not(.ui-state-disabled)');
        this.menuitemLinks = this.jq.find('.ui-menuitem-link:not(.ui-state-disabled)');
        this.treeLinks = this.jq.find('.ui-menu-parent > .ui-menuitem-link:not(.ui-state-disabled)');
        this.bindEvents();
        this.stateKey = 'panelMenu-' + this.id;
        
        this.restoreState();
    },

    bindEvents: function() {
        var _self = this;

        this.headers.mouseover(function() {
            var element = $(this);
            if(!element.hasClass('ui-state-active')) {
                element.addClass('ui-state-hover');
            }
        }).mouseout(function() {
            var element = $(this);
            if(!element.hasClass('ui-state-active')) {
                element.removeClass('ui-state-hover');
            }
        }).click(function(e) {
            var header = $(this);

            if(header.hasClass('ui-state-active')) {
                _self.collapseRootSubmenu($(this));
            }
            else {
                _self.expandRootSubmenu($(this), false);
            }

            e.preventDefault();
        });

        this.menuitemLinks.mouseover(function() {
            $(this).addClass('ui-state-hover');
        }).mouseout(function() {
            $(this).removeClass('ui-state-hover');
        });

        this.treeLinks.click(function(e) {
            var link = $(this),
            submenu = link.next();

            if(submenu.is(':visible')) {
                _self.collapseTreeItem(link, submenu);
            }
            else {
                _self.expandTreeItem(link, submenu, false);
            }

            e.preventDefault();
        });
    },

    collapseRootSubmenu: function(header) {
        var panel = header.next();

        header.attr('aria-expanded', false).removeClass('ui-state-active ui-corner-top').addClass('ui-state-hover ui-corner-all')
                            .children('.ui-icon').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');

        panel.attr('aria-hidden', true).slideUp('normal', 'easeInOutCirc');
        
        this.removeAsExpanded(panel);
    },

    expandRootSubmenu: function(header, restoring) {
        var panel = header.next();

        header.attr('aria-expanded', false).addClass('ui-state-active ui-corner-top').removeClass('ui-state-hover ui-corner-all')
                .children('.ui-icon').removeClass('ui-icon-triangle-1-e').addClass('ui-icon-triangle-1-s');

        if(restoring) {
            panel.attr('aria-hidden', false).show();
        }
        else {
            panel.attr('aria-hidden', false).slideDown('normal', 'easeInOutCirc');
            
            this.addAsExpanded(panel);
        }
    },

    expandTreeItem: function(link, submenu, restoring) {
        link.children('.ui-panelmenu-icon').addClass('ui-icon-triangle-1-s');
        submenu.show();
        
        if(!restoring) {
            this.addAsExpanded(link);
        }
    },

    collapseTreeItem: function(link, submenu) {
        link.children('.ui-panelmenu-icon').removeClass('ui-icon-triangle-1-s');
        submenu.hide();
        
        this.removeAsExpanded(link);
    },
    
    saveState: function() {
        var expandedNodeIds = this.expandedNodes.join(',');
        
        PrimeFaces.setCookie(this.stateKey, expandedNodeIds);
    },
    
    restoreState: function() {
        var expandedNodeIds = PrimeFaces.getCookie(this.stateKey);
        
        if(expandedNodeIds) {
            this.expandedNodes = expandedNodeIds.split(',');
            for(var i = 0 ; i < this.expandedNodes.length; i++) {
                var element = $(PrimeFaces.escapeClientId(this.expandedNodes[i]));
                if(element.is('div.ui-panelmenu-content')) {
                    this.expandRootSubmenu(element.prev(), true);
                }
                else if(element.is('a.ui-menuitem-link')) {
                    this.expandTreeItem(element, element.next(), true);
                }
            }
        }
        else {
            this.expandedNodes = [];
        }
    },
    
    removeAsExpanded: function(element) {
        var id = element.attr('id');
        
        this.expandedNodes = $.grep(this.expandedNodes, function(value) {
            return value != id;
        });
        
        this.saveState();
    },

    addAsExpanded: function(element) {
        this.expandedNodes.push(element.attr('id'));
        
        this.saveState();
    },
    
    clearState: function() {
        PrimeFaces.setCookie(this.stateKey, null);
    }

});
/**
 * PrimeFaces NotificationBar Widget
 */
PrimeFaces.widget.NotificationBar = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        var _self = this;
	
        //relocate
        this.jq.css(this.cfg.position, '0').appendTo($('body'));

        //display initially
        if(this.cfg.autoDisplay) {
            $(this.jq).css('display','block')
        }

        //bind events
        this.jq.children('.ui-notificationbar-close').click(function() {
            _self.hide();
        });
    },
    
    show: function() {
        if(this.cfg.effect === 'slide')
            $(this.jq).slideDown(this.cfg.effect);
        else if(this.cfg.effect === 'fade')
            $(this.jq).fadeIn(this.cfg.effect);
        else if(this.cfg.effect === 'none')
            $(this.jq).show();
    },
    
    hide: function() {
        if(this.cfg.effect === 'slide')
            $(this.jq).slideUp(this.cfg.effect);
        else if(this.cfg.effect === 'fade')
            $(this.jq).fadeOut(this.cfg.effect);
        else if(this.cfg.effect === 'none')
            $(this.jq).hide();
    },
    
    isVisible: function() {
        return this.jq.is(':visible');
    },

    toggle: function() {
        if(this.isVisible())
            this.hide();
        else
            this.show();
    }
    
});
/**
 * PrimeFaces Panel Widget
 */
PrimeFaces.widget.Panel = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        this.onshowHandlers = [];
        
        if(this.cfg.toggleable) {
            this.toggler = $(this.jqId + '_toggler');
            this.toggleStateHolder = $(this.jqId + '_collapsed');
            this.content = $(this.jqId + '_content');

            this.setupToggleTrigger();
        }

        if(this.cfg.closable) {
            this.visibleStateHolder = $(this.jqId + "_visible");

            this.setupCloseTrigger();
        }

        if(this.cfg.hasMenu) {
            this.visibleStateHolder = $(this.jqId + "_visible");

            this.setupMenuTrigger();
        }
        
        this.jq.data('widget', this);
    },
    
    toggle: function() {
        if(this.cfg.collapsed) {
            this.toggler.removeClass('ui-icon-plusthick').addClass('ui-icon-minusthick');
            this.cfg.collapsed = false;
            this.toggleStateHolder.val(false);
        }
        else {
            this.toggler.removeClass('ui-icon-minusthick').addClass('ui-icon-plusthick');
            this.cfg.collapsed = true;
            this.toggleStateHolder.val(true);
        }

        var _self = this;

        this.content.slideToggle(this.cfg.toggleSpeed, 'easeInOutCirc',
            function(e) {
                if(_self.cfg.behaviors) {
                    var toggleBehavior = _self.cfg.behaviors['toggle'];
                    if(toggleBehavior) {
                        toggleBehavior.call(_self, e);
                    }
                }
                
                if(_self.onshowHandlers.length > 0) {
                    _self.invokeOnshowHandlers();
                }
            });
    },
    
    close: function() {
        this.visibleStateHolder.val(false);

        var _self = this;

        $(this.jqId).fadeOut(this.cfg.closeSpeed,
            function(e) {
                if(_self.cfg.behaviors) {
                    var closeBehavior = _self.cfg.behaviors['close'];
                    if(closeBehavior) {
                        closeBehavior.call(_self, e);
                    }
                }
            }
        );
    },
    
    show: function() {
        var _self = this;
        $(this.jqId).fadeIn(this.cfg.closeSpeed, function() {
            _self.invokeOnshowHandlers();
        });

        this.visibleStateHolder.val(true);
    },
    
    setupToggleTrigger: function() {
        var _self = this,
        trigger = this.toggler.parent();

        this.setupTriggerVisuals(trigger);

        trigger.click(function() {_self.toggle();});
    },
    
    setupCloseTrigger: function() {
        var _self = this,
        trigger = $(this.jqId + '_closer').parent();

        this.setupTriggerVisuals(trigger);

        trigger.click(function() {_self.close();});
    },
    
    setupMenuTrigger: function() {
        var trigger = $(this.jqId + '_menu').parent();

        this.setupTriggerVisuals(trigger);
    },
    
    setupTriggerVisuals: function(trigger) {
        trigger.mouseover(function() {$(this).addClass('ui-state-hover');})
                .mouseout(function() {$(this).removeClass('ui-state-hover');});
    },
    
    addOnshowHandler: function(fn) {
        this.onshowHandlers.push(fn);
    },
    
    invokeOnshowHandlers: function() {
        this.onshowHandlers = $.grep(this.onshowHandlers, function(fn) {
            return !fn.call();
        });
    }

});
/**
 * PrimeFaces Poll Widget
 */
PrimeFaces.widget.Poll = PrimeFaces.widget.BaseWidget.extend({

    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        this.active = false;

        if(this.cfg.autoStart) {
            this.start();
        }
    },
    
    refresh: function(cfg) {
        if(this.isActive()) {
            this.stop();
        }
        
        this.init(cfg);
    },

    start: function() {
        this.timer = setInterval(this.cfg.fn, (this.cfg.frequency * 1000));
        this.active = true;
    },

    stop: function() {
        clearInterval(this.timer);
        this.active = false;
    },

    handleComplete: function(xhr, status, args) {
        if(args.stop) {
            this.stop();
        }
    },

    isActive: function() {
        return this.active;
    }
});
/**
 * PrimeFaces OrderList Widget
 */
PrimeFaces.widget.OrderList = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.list = this.jq.find('.ui-orderlist-list'),
        this.items = this.list.children('.ui-orderlist-item');
        this.input = $(this.jqId + '_values');
        this.cfg.effect = this.cfg.effect||'fade';
        this.cfg.disabled = this.jq.hasClass('ui-state-disabled');
        var _self = this;

        if(!this.cfg.disabled) {
            this.generateItems();

            this.setupButtons();

            this.bindEvents();

            //Enable dnd
            this.list.sortable({
                revert: true,
                start: function(event, ui) {
                    PrimeFaces.clearSelection();
                } 
                ,update: function(event, ui) {
                    _self.onDragDrop(event, ui);
                }
            });
        }
    },
    
    generateItems: function() {
        var _self = this;

        this.list.children('.ui-orderlist-item').each(function(i, item) {
            var item = $(this),
            itemValue = item.data('item-value');

            _self.input.append('<option value="' + itemValue + '" selected="selected">' + itemValue + '</option>');
        });
    },
    
    bindEvents: function() {

        this.items.mouseover(function(e) {
            var element = $(this);

            if(!element.hasClass('ui-state-highlight'))
                $(this).addClass('ui-state-hover');
        })
        .mouseout(function(e) {
            var element = $(this);

            if(!element.hasClass('ui-state-highlight'))
                $(this).removeClass('ui-state-hover');
        })
        .mousedown(function(e) {
            var element = $(this),
            metaKey = (e.metaKey||e.ctrlKey);

            if(!metaKey) {
                element.removeClass('ui-state-hover').addClass('ui-state-highlight')
                .siblings('.ui-state-highlight').removeClass('ui-state-highlight');
            }
            else {
                if(element.hasClass('ui-state-highlight'))
                    element.removeClass('ui-state-highlight');
                else
                    element.removeClass('ui-state-hover').addClass('ui-state-highlight');
            }
        });
    },
    
    setupButtons: function() {
        var _self = this;

        PrimeFaces.skinButton(this.jq.find('.ui-button'));

        this.jq.find(' .ui-orderlist-controls .ui-orderlist-button-move-up').click(function() {_self.moveUp(_self.sourceList);});
        this.jq.find(' .ui-orderlist-controls .ui-orderlist-button-move-top').click(function() {_self.moveTop(_self.sourceList);});
        this.jq.find(' .ui-orderlist-controls .ui-orderlist-button-move-down').click(function() {_self.moveDown(_self.sourceList);});
        this.jq.find(' .ui-orderlist-controls .ui-orderlist-button-move-bottom').click(function() {_self.moveBottom(_self.sourceList);});
    },
    
    onDragDrop: function(event, ui) {
        ui.item.removeClass('ui-state-highlight');

        this.saveState();
    },
    
    saveState: function() {
        this.input.children().remove();

        this.generateItems();
    },
    
    moveUp: function(list) {
        var _self = this;

        this.items.filter('.ui-state-highlight').each(function() {
            var item = $(this);

            if(!item.is(':first-child')) {
                item.hide(_self.cfg.effect, {}, 'fast', function() {
                    item.insertBefore(item.prev()).show(_self.cfg.effect, {}, 'fast', function() {
                        _self.saveState();
                    });
                });
            }
        });
    },
    
    moveTop: function(list) {
        var _self = this;

        this.items.filter('.ui-state-highlight').each(function() {
            var item = $(this);

            if(!item.is(':first-child')) {
                item.hide(_self.cfg.effect, {}, 'fast', function() {
                    item.prependTo(item.parent()).show(_self.cfg.effect, {}, 'fast', function(){
                        _self.saveState();
                    });
                });
            }

        });
    },
    
    moveDown: function(list) {
        var _self = this;

        this.items.filter('.ui-state-highlight').each(function() {
            var item = $(this);

            if(!item.is(':last-child')) {
                item.hide(_self.cfg.effect, {}, 'fast', function() {
                    item.insertAfter(item.next()).show(_self.cfg.effect, {}, 'fast', function() {
                        _self.saveState();
                    });
                });
            }

        });
    },
    
    moveBottom: function(list) {
        var _self = this;

        this.items.filter('.ui-state-highlight').each(function() {
            var item = $(this);

            if(!item.is(':last-child')) {
                item.hide(_self.cfg.effect, {}, 'fast', function() {
                    item.appendTo(item.parent()).show(_self.cfg.effect, {}, 'fast', function() {
                        _self.saveState();
                    });
                });
            }
        });
    }

});
/**
 * PrimeFaces OverlayPanel Widget
 */
PrimeFaces.widget.OverlayPanel = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.targetId = PrimeFaces.escapeClientId(this.cfg.target);
        this.target = $(this.targetId);
    
        //configuration
        this.cfg.my = this.cfg.my||'left top';
        this.cfg.at = this.cfg.at||'left bottom';
        this.cfg.showEvent = this.cfg.showEvent||'mousedown';
        this.cfg.hideEvent = this.cfg.hideEvent||'mousedown';

        this.bindEvents();

        if(this.cfg.appendToBody) {
            this.jq.appendTo(document.body);
        }

        //dialog support
        this.setupDialogSupport();
    },
    
    bindEvents: function() {
        //mark target and descandants of target as a trigger for a primefaces overlay
        this.target.data('primefaces-overlay-target', this.id).find('*').data('primefaces-overlay-target', this.id);

        //show and hide events for target
        if(this.cfg.showEvent == this.cfg.hideEvent) {
            var event = this.cfg.showEvent;
            
            $(document).off(event, this.targetId).on(event, this.targetId, this, function(e) {
                var _self = e.data;
                
                if(_self.jq.hasClass('ui-overlay-hidden')) {
                    _self.show();
                } 
                else {
                    _self.hide();
                }
            });
        }
        else {
            var showEvent = this.cfg.showEvent + '.ui-overlay',
            hideEvent = this.cfg.hideEvent + '.ui-overlay';
            
            $(document).off(showEvent + ' ' + hideEvent, this.targetId).on(showEvent, this.targetId, this, function(e) {
                var _self = e.data;

                if(_self.jq.hasClass('ui-overlay-hidden')) {
                    _self.show();
                }
            })
            .on(hideEvent, this.targetId, this, function(e) {
                var _self = e.data;

                if(_self.jq.hasClass('ui-overlay-visible')) {
                    _self.hide();
                }
            });
        }
        
        var _self = this;

        //hide overlay when mousedown is at outside of overlay
        $(document.body).bind('mousedown.ui-overlay', function (e) {
            if(_self.jq.hasClass('ui-overlay-hidden')) {
                return;
            }

            //do nothing on target mousedown
            var target = $(e.target);
            if(_self.target.is(target)||_self.target.has(target).length > 0) {
                return;
            }

            //hide overlay if mousedown is on outside
            var offset = _self.jq.offset();
            if(e.pageX < offset.left ||
                e.pageX > offset.left + _self.jq.outerWidth() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + _self.jq.outerHeight()) {

                _self.hide();
            }
        });

        //Hide overlay on resize
        var resizeNS = 'resize.' + this.id;
        $(window).unbind(resizeNS).bind(resizeNS, function() {
            if(_self.jq.hasClass('ui-overlay-visible')) {
                _self.hide();
            }
        });
    },
    
    show: function() {
        if(!this.loaded && this.cfg.dynamic) {
            this.loadContents();
        }
        else {
            this._show();
        }
    },
    
    _show: function() {
        var _self = this;

        this.align();

        //replace visibility hidden with display none for effect support, toggle marker class
        this.jq.removeClass('ui-overlay-hidden').addClass('ui-overlay-visible').css({
            'display':'none'
            ,'visibility':'visible'
        });

        if(this.cfg.showEffect) {
            this.jq.show(this.cfg.showEffect, {}, 200, function() {
                _self.postShow();
            });
        }
        else {
            this.jq.show();
            this.postShow();
        }
    },
    
    align: function() {
        var fixedPosition = this.jq.css('position') == 'fixed',
        win = $(window),
        positionOffset = fixedPosition ? '-' + win.scrollLeft() + ' -' + win.scrollTop() : null;

        this.jq.css({'left':'', 'top':'', 'z-index': ++PrimeFaces.zindex})
                .position({
                    my: this.cfg.my
                    ,at: this.cfg.at
                    ,of: document.getElementById(this.cfg.target)
                    ,offset: positionOffset
                });
    },
    
    hide: function() {
        var _self = this;

        if(this.cfg.hideEffect) {
            this.jq.hide(this.cfg.hideEffect, {}, 200, function() {
                _self.postHide();
            });
        }
        else {
            this.jq.hide();
            this.postHide();
        }
    },
    
    postShow: function() {
        if(this.cfg.onShow) {
            this.cfg.onShow.call(this);
        }
    },
    
    postHide: function() {
        //replace display block with visibility hidden for hidden container support, toggle marker class
        this.jq.removeClass('ui-overlay-visible').addClass('ui-overlay-hidden').css({
            'display':'block'
            ,'visibility':'hidden'
        });
        
        if(this.cfg.onHide) {
            this.cfg.onHide.call(this);
        }

        
    },
    
    setupDialogSupport: function() {
        var dialog = this.target.parents('.ui-dialog:first');

        if(dialog.length == 1) {
            //set position as fixed to scroll with dialog
            this.jq.css('position', 'fixed');

            //append to body if not already appended by user choice
            if(!this.cfg.appendToBody) {
                this.jq.appendTo(document.body);
            }
        }
    },
    
    loadContents: function() {
        var options = {
            source: this.id,
            process: this.id,
            update: this.id
        },
        _self = this;

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    _self.jq.html(content);
                    _self.loaded = true;
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            return true;
        };

        options.oncomplete = function() {
            _self._show();
        };

        options.params = [
            {name: this.id + '_contentLoad', value: true}
        ];

        PrimeFaces.ajax.AjaxRequest(options);
    }

});
PrimeFaces.widget.Paginator = function(cfg){
    this.cfg = cfg;
    this.jq = $();
    
    var _self = this;
    $.each(this.cfg.id, function(index, id){
        _self.jq = _self.jq.add($(PrimeFaces.escapeClientId(id)));
    });
    
    //elements
    this.pagesContainer = this.jq.children('.ui-paginator-pages');
    this.pageLinks = this.pagesContainer.children('.ui-paginator-page');
    this.rppSelect = this.jq.children('.ui-paginator-rpp-options');
    this.jtpSelect = this.jq.children('.ui-paginator-jtp-select');
    this.firstLink = this.jq.children('.ui-paginator-first');
    this.prevLink  = this.jq.children('.ui-paginator-prev');
    this.nextLink  = this.jq.children('.ui-paginator-next');
    this.endLink   = this.jq.children('.ui-paginator-last');
    this.currentReport = this.jq.children('.ui-paginator-current');
    
    //metadata
    this.cfg.rows = this.cfg.rows == 0 ? this.cfg.rowCount : this.cfg.rows;
    this.cfg.pageCount = Math.ceil(this.cfg.rowCount / this.cfg.rows)||1;
    this.cfg.pageLinks = this.cfg.pageLinks||10;
    this.cfg.currentPageTemplate = this.cfg.currentPageTemplate||'({currentPage} of {totalPages})';
    
    //event bindings
    this.bindEvents();
}

PrimeFaces.widget.Paginator.prototype.bindEvents = function(){
    var _self = this;
    
    //visuals for first,prev,next,last buttons
    this.jq.children('span.ui-state-default').mouseover(function(){
        var item = $(this);
        if(!item.hasClass('ui-state-disabled')) {
            item.addClass('ui-state-hover');
        }
    }).mouseout(function(){
        $(this).removeClass('ui-state-hover');
    });
    
    //page links
    this.bindPageLinkEvents();
    
    //records per page selection
    PrimeFaces.skinSelect(this.rppSelect);
    this.rppSelect.change(function(e) {
        if(!$(this).hasClass("ui-state-disabled")){
            _self.setRowsPerPage(parseInt($(this).val()));
        }
    });
    
    //jump to page
    PrimeFaces.skinSelect(this.jtpSelect);
    this.jtpSelect.change(function(e) {
        if(!$(this).hasClass("ui-state-disabled")){
            _self.setPage(parseInt($(this).val()));
        }
    });
    
    //First page link
    this.firstLink.click(function() {
        PrimeFaces.clearSelection();
        
        if(!$(this).hasClass("ui-state-disabled")){
            _self.setPage(0);
        }
    });
    
    //Prev page link
    this.prevLink.click(function() {
        PrimeFaces.clearSelection();
        
        if(!$(this).hasClass("ui-state-disabled")){
            _self.setPage(_self.cfg.page - 1);
        }
    });
    
    //Next page link
    this.nextLink.click(function() {
        PrimeFaces.clearSelection();
        
        if(!$(this).hasClass("ui-state-disabled")){
            _self.setPage(_self.cfg.page + 1);
        }
    });
    
    //Last page link
    this.endLink.click(function() {
        PrimeFaces.clearSelection();
        
        if(!$(this).hasClass("ui-state-disabled")){
            _self.setPage(_self.cfg.pageCount - 1);
        }
    });
}

PrimeFaces.widget.Paginator.prototype.bindPageLinkEvents = function(){
    var _self = this;
    
    this.pagesContainer.children('.ui-paginator-page').bind('click', function(e){
        var link = $(this);

        if(!link.hasClass('ui-state-disabled')&&!link.hasClass('ui-state-active')) {
            _self.setPage(parseInt(link.text()) - 1);
        }
    }).mouseover(function(){
        var item = $(this);
        if(!item.hasClass('ui-state-disabled')&&!item.hasClass('ui-state-active')) {
            item.addClass('ui-state-hover');
        }
    }).mouseout(function(){
        $(this).removeClass('ui-state-hover');
    });
}

PrimeFaces.widget.Paginator.prototype.updateUI = function() {  
    //boundaries
    if(this.cfg.page == 0) {
        this.firstLink.removeClass('ui-state-hover').addClass('ui-state-disabled');
        this.prevLink.removeClass('ui-state-hover').addClass('ui-state-disabled');
    }
    else {
        this.firstLink.removeClass('ui-state-disabled');
        this.prevLink.removeClass('ui-state-disabled');
    }
    
    if(this.cfg.page == (this.cfg.pageCount - 1)){
        this.nextLink.removeClass('ui-state-hover').addClass('ui-state-disabled');
        this.endLink.removeClass('ui-state-hover').addClass('ui-state-disabled');
    }
    else {
        this.nextLink.removeClass('ui-state-disabled');
        this.endLink.removeClass('ui-state-disabled');
    }
    
    //current page report
    var startRecord = (this.cfg.page * this.cfg.rows) + 1,
    endRecord = (this.cfg.page * this.cfg.rows) + this.cfg.rows;
    if(endRecord > this.cfg.rowCount) {
        endRecord = this.cfg.rowCount;
    }
    
    var text = this.cfg.currentPageTemplate
        .replace("{currentPage}", this.cfg.page + 1)
        .replace("{totalPages}", this.cfg.pageCount)
        .replace("{totalRecords}", this.cfg.rowCount)
        .replace("{startRecord}", startRecord)
        .replace("{endRecord}", endRecord);
    this.currentReport.text(text);
    
    //rows per page dropdown
    this.rppSelect.attr('value', this.cfg.rows);
    
    //jump to page dropdown
    if(this.jtpSelect.length > 0) {
        this.jtpSelect.children().remove();
        
        for(var i=0; i < this.cfg.pageCount; i++) {
            this.jtpSelect.append("<option value=" + i + ">" + (i + 1) + "</option>");
        }
        this.jtpSelect.attr('value', this.cfg.page);
    }
    
    //page links
    this.updatePageLinks();
}

PrimeFaces.widget.Paginator.prototype.updatePageLinks = function() {
    var start, end, delta;
    
    //calculate visible page links
    this.cfg.pageCount = Math.ceil(this.cfg.rowCount / this.cfg.rows)||1;
    var visiblePages = Math.min(this.cfg.pageLinks, this.cfg.pageCount);

    //calculate range, keep current in middle if necessary
    start = Math.max(0, Math.ceil(this.cfg.page - ((visiblePages) / 2)));
    end = Math.min(this.cfg.pageCount - 1, start + visiblePages - 1);
    
    //check when approaching to last page
    delta = this.cfg.pageLinks - (end - start + 1);
    start = Math.max(0, start - delta);

    //update dom
    this.pagesContainer.children().remove();
    for(var i = start; i <= end; i++) {
        var styleClass = 'ui-paginator-page ui-state-default ui-corner-all';
        if(this.cfg.page == i) {
            styleClass += " ui-state-active";
        }
        
        this.pagesContainer.append('<span class="' + styleClass + '">' + (i + 1) + '</span>')   
    }
    
    this.bindPageLinkEvents();
}

PrimeFaces.widget.Paginator.prototype.setPage = function(p, silent) {
    if(p >= 0 && p < this.cfg.pageCount && this.cfg.page != p){        
        var newState = {
            first: this.cfg.rows * p,
            rows: this.cfg.rows,
            page: p
        };

        if(silent) {
            this.cfg.page = p;
            this.updateUI();
        }
        else {
            this.cfg.paginate.call(this, newState);
        }
    }
}

PrimeFaces.widget.Paginator.prototype.setRowsPerPage = function(rpp) {
    var first = this.cfg.rows * this.cfg.page,
    page = parseInt(first / rpp);
    
    this.cfg.rows = rpp;
    
    this.cfg.pageCount = Math.ceil(this.cfg.rowCount / this.cfg.rows);
    
    this.cfg.page = -1;
    this.setPage(page);
}

PrimeFaces.widget.Paginator.prototype.setTotalRecords = function(value) {
    this.cfg.rowCount = value;
    this.cfg.pageCount = Math.ceil(value / this.cfg.rows)||1;
    this.cfg.page = 0;
    this.updateUI();
}

PrimeFaces.widget.Paginator.prototype.getCurrentPage = function() {
    return this.cfg.page;
}
/**
 * PrimeFaces PickList Widget
 */
PrimeFaces.widget.PickList = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.sourceList = this.jq.find('.ui-picklist-source');
        this.targetList = this.jq.find('.ui-picklist-target');
        this.sourceInput = $(this.jqId + '_source');
        this.targetInput = $(this.jqId + '_target');
        this.items = this.jq.find('.ui-picklist-item:not(.ui-state-disabled)');

        //generate input options
        this.generateItems(this.sourceList, this.sourceInput);
        this.generateItems(this.targetList, this.targetInput);

        //Buttons
        this.setupButtons();

        if(this.cfg.disabled) {
            $(this.jqId + ' li.ui-picklist-item').addClass('ui-state-disabled');
            $(this.jqId + ' button').attr('disabled', 'disabled').addClass('ui-state-disabled');
        }
        else {
            var _self = this;

            //Sortable lists
            $(this.jqId + ' ul').sortable({
                cancel: '.ui-state-disabled',
                connectWith: this.jqId + ' .ui-picklist-list',
                revert: true,
                update: function(event, ui) {
                    ui.item.removeClass('ui-state-highlight');

                    _self.saveState();
                },
                receive: function(event, ui) {
                    _self.fireOnTransferEvent(ui.item, ui.sender, ui.item.parents('ul.ui-picklist-list:first'), 'dragdrop');
                }
            });

            //Visual selection and Double click transfer
            this.items.mouseover(function(e) {
                var element = $(this);

                if(!element.hasClass('ui-state-highlight'))
                    $(this).addClass('ui-state-hover');
            })
            .mouseout(function(e) {
                var element = $(this);

                if(!element.hasClass('ui-state-highlight'))
                    $(this).removeClass('ui-state-hover');
            })
            .mousedown(function(e) {
                var element = $(this),
                metaKey = (e.metaKey||e.ctrlKey);

                if(!metaKey) {
                    element.removeClass('ui-state-hover').addClass('ui-state-highlight')
                    .siblings('.ui-state-highlight').removeClass('ui-state-highlight');
                }
                else {
                    if(element.hasClass('ui-state-highlight'))
                        element.removeClass('ui-state-highlight');
                    else
                        element.removeClass('ui-state-hover').addClass('ui-state-highlight');
                }
            })
            .dblclick(function() {
                var item = $(this);

                item.hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
                    if($(this).parent().hasClass('ui-picklist-source'))
                        _self.transfer($(this), _self.sourceList, _self.targetList, 'dblclick');
                    else
                        _self.transfer($(this), _self.targetList, _self.sourceList, 'dblclick');
                });

                PrimeFaces.clearSelection();
            });
        }
    },
    
    generateItems: function(list, input) {   
        list.children('.ui-picklist-item').each(function() {
            var item = $(this),
            itemValue = item.attr('data-item-value');

            input.append('<option value="' + itemValue + '" selected="selected">' + itemValue + '</option>');
        });
    },
    
    setupButtons: function() {
        var _self = this;

        //visuals
        PrimeFaces.skinButton(this.jq.find('.ui-button'));

        //events
        $(this.jqId + ' .ui-picklist-button-add').click(function() {_self.add();});
        $(this.jqId + ' .ui-picklist-button-add-all').click(function() {_self.addAll();});
        $(this.jqId + ' .ui-picklist-button-remove').click(function() {_self.remove();});
        $(this.jqId + ' .ui-picklist-button-remove-all').click(function() {_self.removeAll();});

        if(this.cfg.showSourceControls) {
            $(this.jqId + ' .ui-picklist-source-controls .ui-picklist-button-move-up').click(function() {_self.moveUp(_self.sourceList);});
            $(this.jqId + ' .ui-picklist-source-controls .ui-picklist-button-move-top').click(function() {_self.moveTop(_self.sourceList);});
            $(this.jqId + ' .ui-picklist-source-controls .ui-picklist-button-move-down').click(function() {_self.moveDown(_self.sourceList);});
            $(this.jqId + ' .ui-picklist-source-controls  .ui-picklist-button-move-bottom').click(function() {_self.moveBottom(_self.sourceList);});
        }

        if(this.cfg.showTargetControls) {
            $(this.jqId + ' .ui-picklist-target-controls .ui-picklist-button-move-up').click(function() {_self.moveUp(_self.targetList);});
            $(this.jqId + ' .ui-picklist-target-controls .ui-picklist-button-move-top').click(function() {_self.moveTop(_self.targetList);});
            $(this.jqId + ' .ui-picklist-target-controls .ui-picklist-button-move-down').click(function() {_self.moveDown(_self.targetList);});
            $(this.jqId + ' .ui-picklist-target-controls .ui-picklist-button-move-bottom').click(function() {_self.moveBottom(_self.targetList);});
        }
    },
    
    add: function() {
        var _self = this;

        this.sourceList.children('li.ui-picklist-item.ui-state-highlight').removeClass('ui-state-highlight').hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
            _self.transfer($(this), _self.sourceList, _self.targetList, 'command');
        });
    },
    
    addAll: function() {
        var _self = this;

        this.sourceList.children('li.ui-picklist-item:not(.ui-state-disabled)').removeClass('ui-state-highlight').hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
            _self.transfer($(this), _self.sourceList, _self.targetList, 'command');
        });
    },
    
    remove: function() {
        var _self = this;

        this.targetList.children('li.ui-picklist-item.ui-state-highlight').removeClass('ui-state-highlight').hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
            _self.transfer($(this), _self.targetList, _self.sourceList, 'command');
        });
    },
    
    removeAll: function() {
        var _self = this;

        this.targetList.children('li.ui-picklist-item:not(.ui-state-disabled)').removeClass('ui-state-highlight').hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
            _self.transfer($(this), _self.targetList, _self.sourceList, 'command');
        });
    },
    
    moveUp: function(list) {
        var _self = this;

        list.children('.ui-state-highlight').each(function() {
            var item = $(this);

            if(!item.is(':first-child')) {
                item.hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
                    item.insertBefore(item.prev()).show(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
                        _self.saveState();
                    });
                });
            }
        });
    },
    
    moveTop: function(list) {
        var _self = this;

        list.children('.ui-state-highlight').each(function() {
            var item = $(this);

            if(!item.is(':first-child')) {
                item.hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
                    item.prependTo(item.parent()).show(_self.cfg.effect, {}, _self.cfg.effectSpeed, function(){
                        _self.saveState();
                    });
                });
            }

        });
    },
    
    moveDown: function(list) {
        var _self = this;

        list.children('.ui-state-highlight').each(function() {
            var item = $(this);

            if(!item.is(':last-child')) {
                item.hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
                    item.insertAfter(item.next()).show(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
                        _self.saveState();
                    });
                });
            }

        });
    },
    
    moveBottom: function(list) {
        var _self = this;

        list.children('.ui-state-highlight').each(function() {
            var item = $(this);

            if(!item.is(':last-child')) {
                item.hide(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
                    item.appendTo(item.parent()).show(_self.cfg.effect, {}, _self.cfg.effectSpeed, function() {
                        _self.saveState();
                    });
                });
            }

        });
    },
    
    /**
     * Clear inputs and repopulate them from the list states 
     */ 
    saveState: function() {
        this.sourceInput.children().remove();
        this.targetInput.children().remove();

        this.generateItems(this.sourceList, this.sourceInput);
        this.generateItems(this.targetList, this.targetInput);
    },
    
    transfer: function(item, from, to, type) {    
        var _self = this;

        item.appendTo(to).removeClass('ui-state-highlight').show(this.cfg.effect, {}, this.cfg.effectSpeed, function() {
            _self.saveState();
            _self.fireOnTransferEvent(item, from, to, type);
        });
    },
    
    fireOnTransferEvent: function(item, from, to, type) {
        if(this.cfg.onTransfer) {
            var obj = {};
            obj.item = item;
            obj.from = from;
            obj.to = to;
            obj.type = type;

            this.cfg.onTransfer.call(this, obj);
        }
    }

});
/**
 * PrimeFaces ProgressBar widget
 */
PrimeFaces.widget.ProgressBar = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.jqValue = this.jq.children('.ui-progressbar-value');
        this.jqLabel = this.jq.children('.ui-progressbar-label');
        this.value = this.cfg.initialValue;

        if(this.cfg.ajax) {
            this.cfg.formId = this.jq.parents('form:first').attr('id');
        }

        this.enableARIA();
    },
    
    setValue: function(value) {
        if(value >= 0 && value<=100) {
            if(value == 0) {
                this.jqValue.hide().css('width', '0%').removeClass('ui-corner-right');

                this.jqLabel.hide();
            }
            else {
                this.jqValue.show().animate({
                    'width': value + '%' 
                }, 500, 'easeInOutCirc');

                if(this.cfg.labelTemplate) {
                    var formattedLabel = this.cfg.labelTemplate.replace(/{value}/gi, value);

                    this.jqLabel.html(formattedLabel).show();
                }
            }

            this.value = value;
            this.jq.attr('aria-valuenow', value);
        }
    },
    
    getValue: function() {
        return this.value;
    },
    
    start: function() {
        var _self = this;

        if(this.cfg.ajax) {

            this.progressPoll = setInterval(function() {
                var options = {
                    source: _self.id,
                    process: _self.id,
                    formId: _self.cfg._formId,
                    async: true,
                    oncomplete: function(xhr, status, args) {
                        var value = args[_self.id + '_value'];
                        _self.setValue(value);

                        //trigger complete listener
                        if(value === 100) {
                            _self.fireCompleteEvent();
                        }
                    }
                };

                PrimeFaces.ajax.AjaxRequest(options);

            }, this.cfg.interval);
        }
    },
    
    fireCompleteEvent: function() {
        clearInterval(this.progressPoll);

        if(this.cfg.behaviors) {
            var completeBehavior = this.cfg.behaviors['complete'];

            if(completeBehavior) {
                completeBehavior.call(this);
            }
        }
    },
    
    cancel: function() {
        clearInterval(this.progressPoll);
        this.setValue(0);
    },
    
    enableARIA: function() {
        this.jq.attr('role', 'progressbar')
                .attr('aria-valuemin', 0)
                .attr('aria-valuenow', this.value)
                .attr('aria-valuemax', 100);
    }

});
/**
 * PrimeFaces Rating Widget
 */
PrimeFaces.widget.Rating = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        this.jqInput = $(this.jqId + '_input');
        this.value = this.getValue();
        this.stars = this.jq.children('.ui-rating-star');
        this.cancel = this.jq.children('.ui-rating-cancel');
        
        if(!this.cfg.disabled && !this.cfg.readonly) {
            this.bindEvents();
        }
        
        if(this.cfg.readonly) {
            this.jq.children().css('cursor', 'default');
        }
    },
    
    bindEvents: function() {
        var _self = this;
        
        this.stars.click(function() {
            var value = _self.stars.index(this) + 1;   //index starts from zero
            
            _self.setValue(value);
        });
        
        this.cancel.hover(function() {
            $(this).toggleClass('ui-rating-cancel-hover');
        })
        .click(function() {
            _self.reset();
        });
    },
    
    unbindEvents: function() {        
        this.stars.unbind('click');
        
        this.cancel.unbind('hover click');
    },
    
    getValue: function() {
        var inputVal = this.jqInput.val();
        
        return inputVal == '' ? null : parseInt(inputVal);
    },
    
    setValue: function(value) {
        //set hidden value
        this.jqInput.val(value);
        
        //update visuals
        this.stars.removeClass('ui-rating-star-on');
        for(var i = 0; i < value; i++) {
            this.stars.eq(i).addClass('ui-rating-star-on');
        }
        
        //invoke callback
        if(this.cfg.onRate) {
            this.cfg.onRate.call(this, value);
        }

        //invoke ajax rate behavior
        if(this.cfg.behaviors) {
            var rateBehavior = this.cfg.behaviors['rate'];
            if(rateBehavior) {
                rateBehavior.call(this);
            }
        }
    },
    
    enable: function() {
        this.cfg.disabled = false;
        
        this.bindEvents();
        
        this.jq.removeClass('ui-state-disabled');
    },
    
    disable: function() {
        this.cfg.disabled = true;
        
        this.unbindEvents();
        
        this.jq.addClass('ui-state-disabled');
    },
    
    reset: function() {
        this.jqInput.val('');
        
        this.stars.filter('.ui-rating-star-on').removeClass('ui-rating-star-on');
        
        //invoke ajax cancel behavior
        if(this.cfg.behaviors) {
            var cancelBehavior = this.cfg.behaviors['cancel'];
            if(cancelBehavior) {
                cancelBehavior.call(this);
            }
        }
    }
});
/** 
 * PrimeFaces Resizable Widget
 */
PrimeFaces.widget.Resizable = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jqTarget = $(PrimeFaces.escapeClientId(this.cfg.target));

        if(this.cfg.ajaxResize) {
            this.cfg.formId = $(this.target).parents('form:first').attr('id');
        }

        var _self = this;

        this.cfg.stop = function(event, ui) {
            if(_self.cfg.onStop) {
                _self.cfg.onStop.call(_self, event, ui);
            }

            _self.fireAjaxResizeEvent(event, ui);
        }

        this.cfg.start = function(event, ui) {
            if(_self.cfg.onStart) {
                _self.cfg.onStart.call(_self, event, ui);
            }
        }

        this.cfg.resize = function(event, ui) {
            if(_self.cfg.onResize) {
                _self.cfg.onResize.call(_self, event, ui);
            }
        }

        this.jqTarget.resizable(this.cfg);
        
        $(this.jqId + '_s').remove();
    },
    
    fireAjaxResizeEvent: function(event, ui) {
        if(this.cfg.behaviors) {
            var resizeBehavior = this.cfg.behaviors['resize'];
            if(resizeBehavior) {
                var ext = {
                    params: [
                        {name: this.id + '_width', value: ui.helper.width()},
                        {name: this.id + '_height', value: ui.helper.height()}
                    ]
                };

                resizeBehavior.call(this, event, ext);
            }
        }
    }
    
});
/* 
 * PrimeFaces ScrollPanel Widget 
 */
PrimeFaces.widget.ScrollPanel = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        if(this.id) {
            this.jqId = PrimeFaces.escapeClientId(this.id);
            this.jq = $(this.jqId);
        } else {
            this.jq = this.cfg.jq;
        }

        if(this.cfg.mode != 'native') {

            var _self = this;

            if(this.jq.is(':visible')) {
                this.render();
            } 
            else {
                var hiddenParent = this.jq.parents('.ui-hidden-container:first'),
                hiddenParentWidget = hiddenParent.data('widget');

                if(hiddenParentWidget) {
                    hiddenParentWidget.addOnshowHandler(function() {
                        return _self.render();
                    });
                }
            }
        }
        
        $(this.jqId + '_s').remove();
    },
    
    generateDOM: function() {
        this.jq.wrapInner('<div class="ui-scrollpanel-container" />');
        this.container = this.jq.children('.ui-scrollpanel-container');

        this.container.wrapInner('<div class="ui-scrollpanel-wrapper" />');
        this.wrapper = this.container.children('.ui-scrollpanel-wrapper');

        this.content.removeAttr("style").addClass('ui-scrollpanel-content');

        var hbarDOM = '<div class="ui-scrollpanel-hbar ui-widget-header ui-corner-bottom">';
        hbarDOM += '<div class="ui-scrollpanel-handle ui-state-default ui-corner-all"><span class="ui-icon ui-icon-grip-solid-vertical"></span></div>';
        hbarDOM += '<div class="ui-scrollpanel-bl ui-state-default ui-corner-bl"><span class="ui-icon ui-icon-triangle-1-w"></span></div>';
        hbarDOM += '<div class="ui-scrollpanel-br ui-state-default ui-corner-br"><span class="ui-icon ui-icon-triangle-1-e"></span></div></div>';

        var vbarDOM = '<div class="ui-scrollpanel-vbar ui-widget-header ui-corner-bottom">';
        vbarDOM += '<div class="ui-scrollpanel-handle ui-state-default ui-corner-all"><span class="ui-icon ui-icon-grip-solid-horizontal"></span></div>';
        vbarDOM += '<div class="ui-scrollpanel-bt ui-state-default ui-corner-bl"><span class="ui-icon ui-icon-triangle-1-n"></span></div>';
        vbarDOM += '<div class="ui-scrollpanel-bb ui-state-default ui-corner-br"><span class="ui-icon ui-icon-triangle-1-s"></span></div></div>';

        this.container.append(hbarDOM);
        this.container.append(vbarDOM);
    },
    
    render: function(){
        if(this.jq.is(':hidden')) {
            return false;
        }

        //look into
        this.jq.wrapInner('<div style="display:inline-block;"/>');
        this.content = this.jq.children('div');

        var containerWidth = this.jq.width(),
        containerHeight = this.jq.height(),

        contentWidth = this.content.outerWidth(true),
        contentHeight = this.content.outerHeight(true),

        xScrolled = contentWidth > containerWidth,
        yScrolled = contentHeight > containerHeight;

        //no need to scroll and unwrap
        if(!(xScrolled||yScrolled)) {
            this.content.replaceWith(this.content.html());
            return;
        }

        this.generateDOM();

        this.container.css({width: containerWidth, height: containerHeight});

        var hbar = this.container.children('.ui-scrollpanel-hbar'),
        vbar = this.container.children('.ui-scrollpanel-vbar'),
        wrapperWidth = containerWidth - (yScrolled ? vbar.width() : 0),
        wrapperHeight = containerHeight - (xScrolled ? hbar.height() : 0);
        this.wrapper.css({width: wrapperWidth, height: wrapperHeight});

        if(xScrolled){
            this.h = {
                bar  : hbar,
                hand : hbar.children('.ui-scrollpanel-handle'),
                grip : hbar.find('.ui-scrollpanel-handle > span.ui-icon-grip-solid-vertical'),
                up   : hbar.children('.ui-scrollpanel-bl'),
                down : hbar.children('.ui-scrollpanel-br'),
                wlen : wrapperWidth,
                diff : contentWidth - wrapperWidth,
                dir  : 'x'
            };

            this.initScroll(this.h);
        }

        if(yScrolled){
            this.v = {
                bar  : vbar,
                hand : vbar.children('.ui-scrollpanel-handle'),
                grip : vbar.find('.ui-scrollpanel-handle > span.ui-icon-grip-solid-horizontal'),
                up   : vbar.children('.ui-scrollpanel-bt'),
                down : vbar.children('.ui-scrollpanel-bb'),
                wlen : wrapperHeight,
                diff : contentHeight - wrapperHeight,
                dir  : 'y'
            };

            this.initScroll(this.v);
        }

        return true;
    },
    
    initScroll: function(s) {
        s.bar.css({display : 'block'});

        if(s.dir === 'x'){
            var barWidth = s.wlen - s.up.outerWidth(true) - s.down.outerWidth(true),
            scrollable = barWidth - s.hand.outerWidth(true);
            s.bar.css({width : barWidth});
            s.upLen = parseFloat(s.up.outerWidth(true));

            if( scrollable > s.diff){
                s.scrollable = s.diff;
                s.controller = s.diff;
                s.ratio = 1;
                s.hand.outerWidth((barWidth - s.diff));
                s.grip.css('margin-left', (s.hand.innerWidth() - s.grip.outerWidth(true))/2);
            }
            else{
                s.scrollable = scrollable;
                s.controller = scrollable;
                s.ratio = s.diff / scrollable;
            }
        }
        else{
            var barHeight = s.wlen - s.up.outerHeight(true) - s.down.outerHeight(true),
            scrollable = barHeight - s.hand.outerHeight(true);
            s.bar.css({height : barHeight});
            s.upLen = parseFloat(s.up.outerHeight(true));

            if( scrollable > s.diff){
                s.scrollable = s.diff;
                s.controller = s.diff;
                s.ratio = 1;
                s.hand.outerHeight((barHeight - s.diff));
                s.grip.css('margin-top', (s.hand.innerHeight() - s.grip.outerHeight(true))/2);
            }
            else{
                s.scrollable = scrollable;
                s.controller = scrollable;
                s.ratio = s.diff / scrollable;
            }
        }

        this.bindEvents(s);
    },
    
    bindEvents: function(s){
        var scroll = s, _self = this;

        //visuals
        $.each([scroll.hand, scroll.up, scroll.down], function(i, e){
            e.mouseover(function() {
                $(this).addClass('ui-state-hover');
            }).mouseout(function() {
                $(this).removeClass('ui-state-hover');
            }).mouseup(function() {
                $(this).removeClass('ui-state-active');
            }).mousedown(function() {
                $(this).addClass('ui-state-active');
            });
        });

        //wheel
        this.wrapper.bind("mousewheel",  function(event, move){ 
            if(_self.scrollWithRatio('y', move, true))
                event.preventDefault();
        });
        scroll.bar.bind("mousewheel",  function(event, move){ 
            _self.scrollWithRatio( scroll.dir, move, true);
            event.preventDefault();
        });

        var dragOffset = undefined;

        //drag
        scroll.hand.draggable({
            axis: scroll.dir,

            drag: function (e, data) {
                var p = data.position;
                dragOffset = dragOffset || p;

                if(scroll.dir === 'x'){
                    _self.scrollWithRatio('x', dragOffset.left - p.left);
                }
                else{
                    _self.scrollWithRatio('y', dragOffset.top - p.top);
                }

                dragOffset = p;
            },
            containment: "parent",
            scroll: false,
            stop: function (e) {
                $(e.target).removeClass("ui-state-active");
            }
        });

        //buttons
        var mouseInterval, mouseDown = false, mouseCount = 0;
        scroll.up.mousedown(function(e){
            mouseDown = true;
            mouseCount = 0;
            mouseInterval = setInterval(function(){
                mouseCount++;
                _self.scrollWithRatio(scroll.dir, 2, true);
            }, 10);

            e.preventDefault();
        }).mouseenter(function(){
            if(mouseDown)
                $(this).mousedown();
        }).mouseup(function(){
            mouseDown = false;
            clearInterval(mouseInterval);
        }).mouseleave(function(){
            clearInterval(mouseInterval);
            $(this).removeClass('ui-state-active');
        }).click(function(){
            if(mouseCount < 5)
                _self.scrollWithRatio(scroll.dir, 20, true)
        });

        scroll.down.mousedown(function(e){
            mouseDown = true;
            mouseCount = 0;
            mouseInterval = setInterval(function(){
                mouseCount++;
                _self.scrollWithRatio(scroll.dir, -2, true);
            }, 10);

            e.preventDefault();
        }).mouseenter(function(){
            if(mouseDown)
                $(this).mousedown();
        }).mouseup(function(){
            mouseDown = false;
            clearInterval(mouseInterval);
        }).mouseleave(function(){
            clearInterval(mouseInterval);
            $(this).removeClass('ui-state-active');
        }).click(function(){
            if(mouseCount < 5)
                _self.scrollWithRatio(scroll.dir, -20, true)
        });

        $(document.body).bind('mouseup.scrollpanel', function(){
            clearInterval(mouseInterval);
            scroll.hand.removeClass('ui-state-active');
            mouseDown = false;
        });
    },
    
    scrollTo: function(x, y) {
        this.scrollX(x);
        this.scrollY(y);
    },
    
    scrollToRatio: function(x, y, moveBars) {
        this.scrollWithRatio('x', x, moveBars === false ? false : true);
        this.scrollWithRatio('y', y, moveBars === false ? false : true);
    },
    
    checkScrollable: function(o, d){
        if( o && d){
            if(o.controller + d < 0)
                return -o.controller;
            else if(o.controller + d > o.scrollable)
                return o.scrollable - o.controller;
            else
                return d;
        }
        return 0;
    },
    
    scrollWithRatio: function(dir, d, wheel){
        if(dir === 'x'){
            d = this.checkScrollable(this.h, d);

            //invalid move
            if(!d) return false;

            this.h.controller += d;
            var scrolled = this.h.scrollable - this.h.controller,
            newLeft = -scrolled * this.h.ratio;

            this.content.css({left : newLeft});

            if(wheel){
                this.h.hand.css({left : this.h.upLen + scrolled});
            }
        }
        else{
            d = this.checkScrollable(this.v, d);

            //invalid move
            if(!d) return false;

            this.v.controller += d;
            var scrolled = this.v.scrollable - this.v.controller,
            newTop = -scrolled * this.v.ratio;

            this.content.css({top : newTop});

            if(wheel){
                this.v.hand.css({top : this.v.upLen + scrolled});
            }
        }

        return true;
    },
    
    scrollX: function(x){
        this.content.css({left : typeof(x) == 'string' ? x : -x});
    },
    
    scrollY: function(y){
        this.content.css({top : typeof(y) == 'string' ? y : -y});
    }
 
});
/**
 * PrimeFaces Slider Widget
 */
PrimeFaces.widget.Slider = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.input = $(PrimeFaces.escapeClientId(this.cfg.input));
        if(this.cfg.output) {
            this.output = $(PrimeFaces.escapeClientId(this.cfg.output));
        }
        var _self = this;

        //Create slider
        this.jq.slider(this.cfg);

        //Slide handler
        this.jq.bind('slide', function(event, ui) {
            _self.onSlide(event, ui);
        });

        //Slide start handler
        if(this.cfg.onSlideStart) {
            this.jq.bind('slidestart', function(event, ui) {_self.cfg.onSlideStart.call(this, event, ui);});
        }

        //Slide end handler
        this.jq.bind('slidestop', function(event, ui) {_self.onSlideEnd(event, ui);});

        this.input.keypress(function(e){
            var charCode = (e.which) ? e.which : e.keyCode
            if(charCode > 31 && (charCode < 48 || charCode > 57))
                return false;
            else
                return true;
        });

        this.input.keyup(function(){
        _self.setValue(_self.input.val());
        });
    },
    
    onSlide: function(event, ui) {
        //User callback
        if(this.cfg.onSlide) {
            this.cfg.onSlide.call(this, event, ui);
        }

        //Update input and output(if defined)
        this.input.val(ui.value);

        if(this.output) {
            this.output.html(ui.value);
        }
    },
    
    onSlideEnd: function(event, ui) {
        //User callback
        if(this.cfg.onSlideEnd) {
            this.cfg.onSlideEnd.call(this, event, ui);
        }

        if(this.cfg.behaviors) {
            var slideEndBehavior = this.cfg.behaviors['slideEnd'];

            if(slideEndBehavior) {
                var ext = {
                    params: [
                        {name: this.id + '_ajaxSlideValue', value: ui.value}
                    ]
                };

                slideEndBehavior.call(this, event, ext);
            }
        }
    },
    
    getValue: function() {
        return this.jq.slider('value');
    },
    
    setValue: function(value) {
        this.jq.slider('value', value);
    },
    
    enable: function() {
        this.jq.slider('enable');
    },
    
    disable: function() {
        this.jq.slider('disable');
    }

});
/**
 * PrimeFaces Spinner Widget
 */
PrimeFaces.widget.Spinner = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.input = this.jq.children('.ui-spinner-input');
        this.upButton = this.jq.children('a.ui-spinner-up');
        this.downButton = this.jq.children('a.ui-spinner-down');

        //init value from input
        this.initValue();

        //aria
        this.addARIA();

        if(this.input.prop('disabled')||this.input.prop('readonly')) {
            return;
        }

        this.bindEvents();
        
        //pfs metadata
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);

        PrimeFaces.skinInput(this.input);
    },
    
    bindEvents: function() {
        var _self = this;

        //visuals for spinner buttons
        this.jq.children('.ui-spinner-button')
            .mouseover(function() {
                $(this).addClass('ui-state-hover');
            }).mouseout(function() {
                $(this).removeClass('ui-state-hover ui-state-active');

                if(_self.timer) {
                    clearInterval(_self.timer);
                }
            }).mouseup(function() {
                clearInterval(_self.timer);
                $(this).removeClass('ui-state-active').addClass('ui-state-hover');
            }).mousedown(function(e) {
                var element = $(this),
                dir = element.hasClass('ui-spinner-up') ? 1 : -1;

                element.removeClass('ui-state-hover').addClass('ui-state-active');
                
                if(_self.input.is(':not(:focus)')) {
                    _self.input.focus();
                }

                _self.repeat(null, dir);

                //keep focused
                e.preventDefault();
        });

        this.input.keydown(function (e) {        
            var keyCode = $.ui.keyCode;
            
            switch(e.which) {            
                case keyCode.UP:
                    _self.spin(_self.cfg.step);
                break;

                case keyCode.DOWN:
                    _self.spin(-1 * _self.cfg.step);
                break;

                default:
                    //do nothing
                break;
            }
        });

        
        this.input.keyup(function () { 
            //update value from manual user input
            _self.updateValue();
        })
        .blur(function () { 
            //format value onblur
            _self.format();
        })
        .focus(function () {
            //remove formatting
            _self.input.val(_self.value);
        });
        
        //mousewheel
        this.input.bind('mousewheel', function(event, delta) {
            if(_self.input.is(':focus')) {
                if(delta > 0)
                    _self.spin(_self.cfg.step);
                else
                    _self.spin(-1 * _self.cfg.step);
                
                return false;
            }
        });

        //client behaviors
        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors);
        }
    },
    
    repeat: function(interval, dir) {
        var _self = this,
        i = interval || 500;

        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            _self.repeat(40, dir);
        }, i);

        this.spin(this.cfg.step * dir);
    },
    
    spin: function(step) {
        var newValue = this.value + step;

        if(this.cfg.min != undefined && newValue < this.cfg.min) {
            newValue = this.cfg.min;
        }

        if(this.cfg.max != undefined && newValue > this.cfg.max) {
            newValue = this.cfg.max;
        }

        this.input.val(newValue);
        this.value = newValue;
        this.input.attr('aria-valuenow', newValue);

        this.input.change();
    },
    
    /**
     * Parses value on keyup
     */
    updateValue: function() {
        var value = this.input.val();

        if(value == '') {
            if(this.cfg.min != undefined)
                this.value = this.cfg.min;
            else
                this.value = 0;
        }
        else {
            if(this.cfg.step)
                value = parseFloat(value);
            else
                value = parseInt(value);
            
            if(!isNaN(value)) {
                this.value = value;
            }
        }
    },
    
    /**
     * Parses value on initial load
     */
    initValue: function() {
        var value = this.input.val();

        if(value == '') {
            if(this.cfg.min != undefined)
                this.value = this.cfg.min;
            else
                this.value = 0;
        }
        else {
            if(this.cfg.prefix)
                value = value.split(this.cfg.prefix)[1];

            if(this.cfg.suffix)
                value = value.split(this.cfg.suffix)[0];

            if(this.cfg.step)
                this.value = parseFloat(value);
            else
                this.value = parseInt(value);
        }
    },
     
    format: function() {
        var value = this.value;

        if(this.cfg.prefix)
            value = this.cfg.prefix + value;

        if(this.cfg.suffix)
            value = value + this.cfg.suffix;
        
        this.input.val(value);
    },
    
    addARIA: function() {
        this.input.attr('role', 'spinner');
        this.input.attr('aria-multiline', false);
        this.input.attr('aria-valuenow', this.value);

        if(this.cfg.min != undefined) 
            this.input.attr('aria-valuemin', this.cfg.min);

        if(this.cfg.max != undefined) 
            this.input.attr('aria-valuemax', this.cfg.max);

        if(this.input.prop('disabled'))
            this.input.attr('aria-disabled', true);

        if(this.input.prop('readonly'))
            this.input.attr('aria-readonly', true);
    }
    
});
/**
 * PrimeFaces TabView Widget
 */
PrimeFaces.widget.TabView = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.navContainer = this.jq.children('.ui-tabs-nav');
        this.panelContainer = this.jq.children('.ui-tabs-panels');
        this.stateHolder = $(this.jqId + '_activeIndex');
        this.cfg.selected = parseInt(this.stateHolder.val());
        this.onshowHandlers = [];

        this.bindEvents();

        //Cache initial active tab
        if(this.cfg.dynamic && this.cfg.cache) {
            this.markAsLoaded(this.panelContainer.children().eq(this.cfg.selected));
        }

        this.jq.data('widget', this);
    },
    
    bindEvents: function() {
        var _self = this;

        //Tab header events
        this.navContainer.children('li')
                .bind('mouseover.tabview', function(e) {
                    var element = $(this);
                    if(!element.hasClass('ui-state-disabled')) {
                        element.addClass('ui-state-hover');
                    }
                })
                .bind('mouseout.tabview', function(e) {
                    var element = $(this);
                    if(!element.hasClass('ui-state-disabled')) {
                        element.removeClass('ui-state-hover');
                    }
                })
                .bind('click.tabview', function(e) {
                    var element = $(this);

                    if($(e.target).is(':not(.ui-icon-close)')) {
                        var index = element.index();

                        if(!element.hasClass('ui-state-disabled') && index != _self.cfg.selected) {
                            _self.select(index);
                        }
                    }

                    e.preventDefault();
                });

        //Closable tabs
        this.navContainer.find('li .ui-icon-close')
            .bind('click.tabview', function(e) {
                _self.remove($(this).parent().index());

                e.preventDefault();
            });
    },
    
    /**
     * Selects an inactive tab given index
     */
    select: function(index) {
        //Call user onTabChange callback
        if(this.cfg.onTabChange) {
            var result = this.cfg.onTabChange.call(this, index);
            if(result == false)
                return false;
        }

        var newPanel = this.panelContainer.children().eq(index),
        shouldLoad = this.cfg.dynamic && !this.isLoaded(newPanel);

        //update state
        this.stateHolder.val(index);
        this.cfg.selected = index;

        if(shouldLoad) {
            this.loadDynamicTab(newPanel);
        }
        else {
            if(this.hasBehavior('tabChange')) {
                this.fireTabChangeEvent(newPanel);
            }
            else {
                this.show(newPanel);
            }
        }

        return true;
    },
    
    show: function(newPanel) {
        var headers = this.navContainer.children(),
        oldHeader = headers.filter('.ui-state-active'),
        newHeader = headers.eq(newPanel.index()),
        oldPanel = this.panelContainer.children('.ui-tabs-panel:visible'),
        _self = this;

        //aria
        oldPanel.attr('aria-hidden', true);
        oldHeader.attr('aria-expanded', false);
        newPanel.attr('aria-hidden', false);
        newHeader.attr('aria-expanded', true);

        if(this.cfg.effect) {
                oldPanel.hide(this.cfg.effect.name, null, this.cfg.effect.duration, function() {
                oldHeader.removeClass('ui-state-focus ui-tabs-selected ui-state-active');

                newHeader.addClass('ui-state-focus ui-tabs-selected ui-state-active');
                newPanel.show(_self.cfg.effect.name, null, _self.cfg.effect.duration, function() {
                    _self.postTabShow(newPanel);
                });
            });
        }
        else {
            oldHeader.removeClass('ui-state-focus ui-tabs-selected ui-state-active');
            oldPanel.hide();

            newHeader.addClass('ui-state-focus ui-tabs-selected ui-state-active');
            newPanel.show();

            this.postTabShow(newPanel);
        }
    },
    
    /**
     * Loads tab contents with ajax
     */
    loadDynamicTab: function(newPanel) {
        var _self = this,
        options = {
            source: this.id,
            process: this.id,
            update: this.id
        },
        tabindex = newPanel.index();

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    newPanel.html(content);

                    if(_self.cfg.cache) {
                        _self.markAsLoaded(newPanel);
                    }
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            return true;
        };

        options.oncomplete = function() {
            _self.show(newPanel);
        };
        
        options.params = [
            {name: this.id + '_contentLoad', value: true},
            {name: this.id + '_newTab', value: newPanel.attr('id')},
            {name: this.id + '_tabindex', value: tabindex}
        ];

        if(this.hasBehavior('tabChange')) {
            var tabChangeBehavior = this.cfg.behaviors['tabChange'];

            tabChangeBehavior.call(this, newPanel, options);
        }
        else {
            PrimeFaces.ajax.AjaxRequest(options);
        }
    },
    
    /**
     * Removes a tab with given index
     */
    remove: function(index) {    
        var header = this.navContainer.children().eq(index),
        panel = this.panelContainer.children().eq(index);

        this.fireTabCloseEvent(panel);

        header.remove();
        panel.remove();

        //active next tab if active tab is removed
        if(index == this.cfg.selected) {
            var newIndex = this.cfg.selected == this.getLength() ? this.cfg.selected - 1: this.cfg.selected;
            this.select(newIndex);
        }
    },
    
    getLength: function() {
        return this.navContainer.children().length;
    },
    
    getActiveIndex: function() {
        return this.cfg.selected;
    },
    
    fireTabChangeEvent: function(panel) {
        var tabChangeBehavior = this.cfg.behaviors['tabChange'],
        _self = this,
        ext = {
            params: [
                {name: this.id + '_newTab', value: panel.attr('id')},
                {name: this.id + '_tabindex', value: panel.index()}
            ]
        };
        
        ext.oncomplete = function() {
            _self.show(panel);
        };

        tabChangeBehavior.call(this, panel, ext);
    },
    
    fireTabCloseEvent: function(panel) {    
        if(this.hasBehavior('tabClose')) {
            var tabCloseBehavior = this.cfg.behaviors['tabClose'],
            ext = {
                params: [
                    {name: this.id + '_closeTab', value: panel.attr('id')},
                    {name: this.id + '_tabindex', value: panel.index()}
                ]
            };

            tabCloseBehavior.call(this, null, ext);
        }
    },
    
    hasBehavior: function(event) {
        if(this.cfg.behaviors) {
            return this.cfg.behaviors[event] != undefined;
        }

        return false;
    },
    
    markAsLoaded: function(panel) {
        panel.data('loaded', true);
    },
    
    isLoaded: function(panel) {
        return panel.data('loaded') == true;
    },
    
    disable: function(index) {
        this.navContainer.children().eq(index).addClass('ui-state-disabled');
    },
    
    enable: function(index) {
        this.navContainer.children().eq(index).removeClass('ui-state-disabled');
    },
    
    addOnshowHandler: function(fn) {
        this.onshowHandlers.push(fn);
    },
    
    postTabShow: function(newPanel) {    
        //execute user defined callback
        if(this.cfg.onTabShow) {
            this.cfg.onTabShow.call(this, newPanel);
        }

        //execute onshowHandlers and remove successful ones
        this.onshowHandlers = $.grep(this.onshowHandlers, function(fn) {
            return !fn.call();
        });
    }

});
/**
 * PrimeFaces TagCloud Widget
 */
PrimeFaces.widget.TagCloud = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.jq.find('li').mouseover(function() {
            $(this).addClass('ui-state-hover');
        }).mouseout(function() {
            $(this).removeClass('ui-state-hover');
        });
    }
    
});
/**
 * PrimeFaces Tooltip Widget
 */
PrimeFaces.widget.Tooltip = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        var _self = this;

        //remove previous element to support ajax updates
        $(document.body).children(this.jqId).remove();

        this.jq = $(this.jqId);
        this.cfg = cfg;
        this.target = $(PrimeFaces.escapeClientId(this.cfg.target));

        //options
        this.cfg.showEvent = this.cfg.showEvent ? this.cfg.showEvent : 'mouseover';
        this.cfg.hideEvent = this.cfg.hideEvent ? this.cfg.hideEvent : 'mouseout';
        this.cfg.showEffect = this.cfg.showEffect ? this.cfg.showEffect : 'fade';
        this.cfg.hideEffect = this.cfg.hideEffect ? this.cfg.hideEffect : 'fade';

        //bind tooltip to the target
        this.bindEvents();

        //append to body
        this.jq.appendTo(document.body);

        //use target title if value is blank
        if($.trim(this.jq.html()) == '') {
            this.jq.html(this.target.attr('title'));
        }

        //remove target's title
        this.target.removeAttr('title');

        //Hide overlay on resize
        var resizeNS = 'resize.' + this.id;
        $(window).unbind(resizeNS).bind(resizeNS, function() {
            if(_self.jq.is(':visible')) {
                _self.hide();
            }
        });
        
        $(this.jqId + '_s').remove();
    },
    
    bindEvents: function() {
        var _self = this;

        this.target.bind(this.cfg.showEvent, function() {
            _self.show();
        })
        .bind(this.cfg.hideEvent, function() {
            _self.hide();
        });
    },
    
    show: function() {
        var _self = this;

        this.jq.css({
            left:'', 
            top:'',
            'z-index': ++PrimeFaces.zindex
        })
        .position({
            my: 'left top',
            at: 'right bottom',
            of: this.target
        });

        this.timeout = setTimeout(function() {
            _self.jq.show(_self.cfg.showEffect, {}, 400);
        }, 150);
    },
    
    hide: function() {
        clearTimeout(this.timeout);

        this.jq.hide(this.cfg.hideEffect, {}, 400, function() {
            $(this).css('z-index', '');
        });
    }
    
});
/**
 * PrimeFaces Tree Widget
 */
PrimeFaces.widget.Tree = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.cfg.formId = this.jq.parents('form:first').attr('id');

        if(this.cfg.selectionMode) {
            this.selectionHolder = $(this.jqId + '_selection');
            var selectionsValue = this.selectionHolder.val();
            this.selections = selectionsValue === '' ? [] : selectionsValue.split(',');

            if(this.cfg.selectionMode == 'checkbox')
                this.preselectCheckboxPropagation();
        }

        this.bindEvents();
    },
    
    bindEvents: function() {
        var _self = this,
        selectionMode = this.cfg.selectionMode,
        iconSelector = this.jqId + ' .ui-tree-icon',
        nodeSelector = this.jqId  + ' .ui-tree-node-content';

        //expand-collapse
        $(document).off('click', iconSelector)
                    .on('click', iconSelector, null, function(e) {
                        var icon = $(this),
                        node = icon.parents('li:first');

                        if(icon.hasClass('ui-icon-triangle-1-e'))
                            _self.expandNode(node);
                        else
                            _self.collapseNode(node);
                    });

        //selection hover
        if(selectionMode && this.cfg.highlight) {
            $(document).off('hover.tree', nodeSelector)
                        .on('hover.tree', nodeSelector, null, function() {
                            var element = $(this);

                            if(!element.hasClass('ui-state-highlight') && element.hasClass('ui-tree-selectable-node')) {
                                $(this).toggleClass('ui-state-hover');
                            }
                        });
                
        }
        
        //node click
        $(document).off('click.tree contextmenu.tree', nodeSelector)
                        .on('click.tree', nodeSelector, null, function(e) {
                            _self.nodeClick(e, $(this));
                        })
                        .on('contextmenu.tree', nodeSelector, null, function(e) {
                            _self.nodeClick(e, $(this));
                            e.preventDefault();
                        });
    },
    
    nodeClick: function(e, nodeContent) {
        PrimeFaces.clearSelection();
        
        var node = nodeContent.parents('li:first');

        if($(e.target).is(':not(.ui-tree-icon)')) {
            if(this.cfg.onNodeClick) {
                this.cfg.onNodeClick.call(this, node);
            }
            
            if(nodeContent.hasClass('ui-tree-selectable-node')) {
                if(this.isNodeSelected(node))
                    this.unselectNode(e, node);
                else
                    this.selectNode(e, node);
            };
        }
    },
    
    expandNode: function(node) {    
        var _self = this;

        if(this.cfg.dynamic) {

            if(this.cfg.cache && node.children('.ui-tree-nodes').children().length > 0) {
                this.showNodeChildren(node);

                return;
            }

            if(node.data('processing')) {
                PrimeFaces.debug('Node is already being expanded, ignoring expand event.');
                return;
            }

            node.data('processing', true);

            var options = {
                source: this.id,
                process: this.id,
                update: this.id,
                formId: this.cfg.formId
            };

            options.onsuccess = function(responseXML) {
                var xmlDoc = $(responseXML.documentElement),
                updates = xmlDoc.find("update");

                for(var i=0; i < updates.length; i++) {
                    var update = updates.eq(i),
                    id = update.attr('id'),
                    content = update.text();

                    if(id == _self.id){
                        node.children('.ui-tree-nodes').append(content);

                        _self.showNodeChildren(node);
                    }
                    else {
                        PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                    }
                }

                PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

                return true;
            };

            options.oncomplete = function() {
                node.removeData('processing');
            }

            options.params = [
                {name: this.id + '_expandNode', value: _self.getRowKey(node)}
            ];

            if(this.hasBehavior('expand')) {
                var expandBehavior = this.cfg.behaviors['expand'];

                expandBehavior.call(this, node, options);
            }
            else {
                PrimeFaces.ajax.AjaxRequest(options);
            }
        }
        else {
            //expand dom
            this.showNodeChildren(node);
            this.fireExpandEvent(node);
        }
    },
    
    fireExpandEvent: function(node) {
        if(this.cfg.behaviors) {
            var expandBehavior = this.cfg.behaviors['expand'];
            if(expandBehavior) {
                var ext = {
                    params: [
                        {name: this.id + '_expandNode', value: this.getRowKey(node)}
                    ]
                };

                expandBehavior.call(this, node, ext);
            }
        }
    },
    
    collapseNode: function(node) {
        var _self = this,
        icon = node.find('.ui-tree-icon:first'),
        lastClass = node.attr('class').split(' ').slice(-1),
        nodeIcon = icon.next(),
        iconState = this.cfg.iconStates[lastClass];

        icon.addClass('ui-icon-triangle-1-e').removeClass('ui-icon-triangle-1-s');

        if(iconState) {
            nodeIcon.removeClass(iconState.expandedIcon).addClass(iconState.collapsedIcon);
        }

        //aria
        node.children('.ui-tree-node').attr('aria-expanded', false);

        var childNodeContainer = node.children('.ui-tree-nodes');
        childNodeContainer.hide();

        if(_self.cfg.dynamic && !_self.cfg.cache) {
            childNodeContainer.empty();
        }

        _self.fireCollapseEvent(node);
    },
    
    fireCollapseEvent: function(node) {
        if(this.cfg.behaviors) {
            var collapseBehavior = this.cfg.behaviors['collapse'];
            if(collapseBehavior) {
                var ext = {
                    params: [
                        {name: this.id + '_collapseNode', value: this.getRowKey(node)}
                    ]
                };

                collapseBehavior.call(this, node, ext);
            }
        }
    },
    
    showNodeChildren: function(node) {
        //aria
        node.children('.ui-tree-node').attr('aria-expanded', true);

        var icon = node.find('.ui-tree-icon:first'),
        lastClass = node.attr('class').split(' ').slice(-1),
        nodeIcon = icon.next(),
        iconState = this.cfg.iconStates[lastClass];

        icon.addClass('ui-icon-triangle-1-s').removeClass('ui-icon-triangle-1-e');

        if(iconState) {
            nodeIcon.removeClass(iconState.collapsedIcon).addClass(iconState.expandedIcon);
        }

        node.children('.ui-tree-nodes').show();
    },
    
    selectNode: function(e, node) {
        var metaKey = (e.metaKey||e.ctrlKey);

        if(this.isCheckboxSelection()) {
            this.toggleCheckbox(node, true);
        }
        else {
            if(this.isSingleSelection() || (this.isMultipleSelection() && !metaKey)) {
                //clean all selections
                this.selections = [];
                this.jq.find('.ui-tree-node-content.ui-state-highlight').each(function() {
                    $(this).removeClass('ui-state-highlight').parent().attr('aria-selected', false);
                });
            }

            //select node
            node.children('.ui-tree-node').attr('aria-selected', true);
            node.find('.ui-tree-node-content:first').removeClass('ui-state-hover').addClass('ui-state-highlight');

            this.addToSelection(this.getRowKey(node));
        }

        this.writeSelections();

        this.fireNodeSelectEvent(node);
    },
    
    unselectNode: function(e, node) {
        var rowKey = this.getRowKey(node),
        metaKey = (e.metaKey||e.ctrlKey);

        //select node
        if(this.isCheckboxSelection()) {
            this.toggleCheckbox(node, false);
            this.writeSelections();
            this.fireNodeUnselectEvent(node);
        }
        else if(metaKey) {
            //remove visual style    
            node.find('.ui-tree-node-content:first').removeClass('ui-state-highlight');

            //aria
            node.children('.ui-tree-node').attr('aria-selected', false);

            //remove from selection
            this.removeFromSelection(rowKey);

            this.writeSelections();

            this.fireNodeUnselectEvent(node);
        } 
        else if(this.isMultipleSelection()){
            this.selectNode(e, node);
        }
    },
    
    writeSelections: function() {    
        this.selectionHolder.val(this.selections.join(','));
    },
    
    fireNodeSelectEvent: function(node) {
        if(this.cfg.behaviors) {
            var selectBehavior = this.cfg.behaviors['select'];

            if(selectBehavior) {
                var ext = {
                    params: [
                        {name: this.id + '_instantSelection', value: this.getRowKey(node)}
                    ]
                };

                selectBehavior.call(this, node, ext);
            }
        }
    },
    
    fireNodeUnselectEvent: function(node) {
        if(this.cfg.behaviors) {
            var unselectBehavior = this.cfg.behaviors['unselect'];

            if(unselectBehavior) {
                var ext = {
                    params: [
                        {name: this.id + '_instantUnselection', value: this.getRowKey(node)}
                    ]
                };

                unselectBehavior.call(this, node, ext);
            }
        }
    },
    
    getRowKey: function(node) {
        return node.attr('data-rowkey');
    },
    
    isNodeSelected: function(node) {
        return $.inArray(this.getRowKey(node), this.selections) != -1;
    },
    
    isSingleSelection: function() {
        return this.cfg.selectionMode == 'single';
    },
    
    isMultipleSelection: function() {
        return this.cfg.selectionMode == 'multiple';
    },
    
    isCheckboxSelection: function() {
        return this.cfg.selectionMode == 'checkbox';
    },
    
    addToSelection: function(rowKey) {
        this.selections.push(rowKey);
    },
    
    removeFromSelection: function(rowKey) {
        this.selections = $.grep(this.selections, function(r) {
            return r != rowKey;
        });
    },
    
    toggleCheckbox: function(node, check) {
        var _self = this;

        //propagate selection down
        node.find('.ui-tree-checkbox-icon').each(function() {
            var icon = $(this),
            treeNode = icon.parents('li:first'),
            rowKey = _self.getRowKey(treeNode);

            if(check) {
                if($.inArray(rowKey, _self.selections) == -1) {
                    icon.addClass('ui-icon ui-icon-check');

                    _self.addToSelection(rowKey);

                    //aria
                    treeNode.children('.ui-tree-node').attr('aria-checked', true).attr('aria-selected', true);
                }
            }
            else {
                icon.removeClass('ui-icon ui-icon-check');

                _self.removeFromSelection(rowKey);

                //aria
                treeNode.children('.ui-tree-node').attr('aria-checked', false).attr('aria-selected', false);
            }
        });

        //propagate selection up
        node.parents('li').each(function() {
            var parentNode = $(this),
            rowKey = _self.getRowKey(parentNode),
            icon = parentNode.find('> .ui-tree-node > .ui-tree-selectable-node > .ui-tree-checkbox'),
            checkedChildren = parentNode.children('.ui-tree-nodes').find('.ui-tree-checkbox-icon.ui-icon-check'),
            allChildren = parentNode.children('.ui-tree-nodes').find('.ui-tree-checkbox-icon');

            if(check) {
                if(checkedChildren.length == allChildren.length) {
                    icon.removeClass('ui-icon ui-icon-minus').addClass('ui-icon ui-icon-check');

                    _self.addToSelection(rowKey);

                    //aria
                    parentNode.children('.ui-tree-node').attr('aria-checked', true).attr('aria-selected', true);
                } 
                else {
                    icon.removeClass('ui-icon ui-icon-check').addClass('ui-icon ui-icon-minus');

                    //aria
                    parentNode.children('.ui-tree-node').attr('aria-checked', false).attr('aria-selected', false);
                }
            }
            else {
                if(checkedChildren.length > 0) {
                    icon.removeClass('ui-icon ui-icon-check').addClass('ui-icon ui-icon-minus');

                } else {
                    icon.removeClass('ui-icon ui-icon-minus ui-icon-check');
                }

                _self.removeFromSelection(rowKey);

                //aria
                parentNode.children('.ui-tree-node').attr('aria-checked', false).attr('aria-selected', false);
            }

        });
    },
    
    preselectCheckboxPropagation: function() {
        this.jq.find('.ui-tree-checkbox-icon').not('.ui-icon-check').each(function() {
            var icon = $(this),
            node = icon.parents('li:first');

            if(node.children('.ui-tree-nodes').find('.ui-tree-checkbox-icon.ui-icon-check').length > 0) {
                icon.addClass('ui-icon ui-icon-minus');
            }
        });
    },
    
    hasBehavior: function(event) {
        if(this.cfg.behaviors) {
            return this.cfg.behaviors[event] != undefined;
        }

        return false;
    }
    
});
/**
 * PrimeFaces TreeTable Widget
 */
PrimeFaces.widget.TreeTable = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.cfg.scrollable = this.jq.hasClass('ui-treetable-scrollable');
        this.cfg.resizable = this.jq.hasClass('ui-treetable-resizable');

        this.bindToggleEvents();

        //scrolling
        if(this.cfg.scrollable) {
            this.setupScrolling();
        }

        //selection
        if(this.cfg.selectionMode) {
            this.jqSelection = $(this.jqId + '_selection');
            var selectionValue = this.jqSelection.val();

            this.selection = selectionValue === "" ? [] : selectionValue.split(',');

            this.bindSelectionEvents();
        }
    },
    
    bindToggleEvents: function() {
        var _self = this;

        //expand and collapse
        $(this.jqId + ' .ui-treetable-toggler').die('click.treetable')
            .live('click.treetable', function(e) {
                var toggler = $(this),
                node = toggler.parents('tr:first');

                if(toggler.hasClass('ui-icon-triangle-1-e'))
                    _self.expandNode(e, node);
                else {
                    _self.collapseNode(e, node);
                }
            });
    },
    
    bindSelectionEvents: function() {
        var _self = this;

        $(this.jqId + ' .ui-treetable-data tr.ui-treetable-selectable-node').die('mouseover.treetable mouseout.treetable click.treetable contextmenu.treetable')
                .live('mouseover.treetable', function(e) {
                    var element = $(this);

                    if(!element.hasClass('ui-state-highlight')) {
                        element.addClass('ui-state-hover');
                    }
                })
                .live('mouseout.treetable', function(e) {
                    var element = $(this);

                    if(!element.hasClass('ui-state-highlight')) {
                        element.removeClass('ui-state-hover');
                    }
                })
                .live('click.treetable', function(e) {
                    _self.onRowClick(e, $(this));
                    e.preventDefault();
                })           
                .live('contextmenu.treetable', function(event) {
                _self.onRowClick(event, $(this));
                event.preventDefault();
                });
    },
    
    expandNode: function(e, node) {
        var options = {
            source: this.id,
            process: this.id,
            update: this.id
        },
        _self = this,
        nodeKey = node.attr('id').split('_node_')[1];

        options.onsuccess = function(responseXML) {
            var xmlDoc = $(responseXML.documentElement),
            updates = xmlDoc.find("update");

            for(var i=0; i < updates.length; i++) {
                var update = updates.eq(i),
                id = update.attr('id'),
                content = update.text();

                if(id == _self.id){
                    node.replaceWith(content);
                    node.find('.ui-treetable-toggler:first').addClass('ui-icon-triangle-1-s').removeClass('ui-icon-triangle-1-e');
                    node.attr('aria-expanded', true);
                }
                else {
                    PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                }
            }

            PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

            return true;
        };

        options.params = [
            {name: this.id + '_expand', value: nodeKey}
        ];

        if(this.hasBehavior('expand')) {
            var expandBehavior = this.cfg.behaviors['expand'];

            expandBehavior.call(this, e, options);
        }
        else {
            PrimeFaces.ajax.AjaxRequest(options);
        }
    },
    
    collapseNode: function(e, node) {
        node.siblings('[id^="' + node.attr('id') + '_"]').remove();

        node.find('.ui-treetable-toggler:first').addClass('ui-icon-triangle-1-e').removeClass('ui-icon-triangle-1-s');

        node.attr('aria-expanded', false);

        if(this.hasBehavior('collapse')) {
            var collapseBehavior = this.cfg.behaviors['collapse'],
            nodeKey = node.attr('id').split('_node_')[1];

            var ext = {
                params : [
                    {name: this.id + '_collapse', value: nodeKey}
                ]
            };

            collapseBehavior.call(this, e, ext);
        }
    },
    
    onRowClick: function(e, node) {
    
        //Check if rowclick triggered this event not an element in row content
        if($(e.target).is('div.ui-tt-c,td')) {
            var selected = node.hasClass('ui-state-highlight');

            if(selected)
                this.unselectNode(e, node);
            else
                this.selectNode(e, node);

            PrimeFaces.clearSelection();
        }
    },
    
    selectNode: function(e, node) {
        var nodeKey = node.attr('id').split('_node_')[1],
        metaKey = (e.metaKey||e.ctrlKey);

        //unselect previous selection
        if(this.isSingleSelection() || (this.isMultipleSelection() && !metaKey)) {
            node.siblings('.ui-state-highlight').removeClass('ui-state-highlight').attr('aria-selected', false);
            this.selection = [];
        }

        //add to selection
        node.removeClass('ui-state-hover').addClass('ui-state-highlight').attr('aria-selected', true);
        this.addSelection(nodeKey);

        //save state
        this.writeSelections();

        this.fireSelectNodeEvent(e, nodeKey);
    },
    
    unselectNode: function(e, node) {
        var nodeKey = node.attr('id').split('_node_')[1],
        metaKey = metaKey = (e.metaKey||e.ctrlKey);

        if(metaKey) {
            //remove visual style
            node.removeClass('ui-state-highlight');

            //aria
            node.attr('aria-selected', false);

            //remove from selection
            this.removeSelection(nodeKey);

            //save state
            this.writeSelections();

            this.fireUnselectNodeEvent(e, nodeKey);
        }
        else if(this.isMultipleSelection()){
            this.selectNode(e, node);
        }
    },
    
    hasBehavior: function(event) {
        if(this.cfg.behaviors) {
            return this.cfg.behaviors[event] != undefined;
        }

        return false;
    },
    
    /**
     * Remove given rowIndex from selection
     */
    removeSelection: function(nodeKey) {
        var selection = this.selection;

        $.each(selection, function(index, value) {
            if(value === nodeKey) {
                selection.remove(index);

                return false;       //break
            } 
            else {
                return true;        //continue
            }
        });
    },
    
    /**
     * Adds given rowIndex to selection if it doesn't exist already
     */
    addSelection: function(nodeKey) {
        if(!this.isSelected(nodeKey)) {
            this.selection.push(nodeKey);
        }
    },
    
    isSelected: function(nodeKey) {
        var selection = this.selection,
        selected = false;

        $.each(selection, function(index, value) {
            if(value === nodeKey) {
                selected = true;

                return false;       //break
            } 
            else {
                return true;        //continue
            }
        });

        return selected;
    },
    
    isSingleSelection: function() {
        return this.cfg.selectionMode == 'single';
    },
    
    isMultipleSelection: function() {
        return this.cfg.selectionMode == 'multiple';
    },
    
    /**
     * Writes selected row ids to state holder
     */
    writeSelections: function() {
        this.jqSelection.val(this.selection.join(','));
    },
    
    fireSelectNodeEvent: function(e, nodeKey) {
        if(this.hasBehavior('select')) {
            var selectBehavior = this.cfg.behaviors['select'],
            ext = {
                params: [
                    {name: this.id + '_instantSelect', value: nodeKey}
                ]
            };

            selectBehavior.call(this, e, ext);
        }
    },
    
    fireUnselectNodeEvent: function(e, nodeKey) {
        if(this.hasBehavior('unselect')) {
            var unselectBehavior = this.cfg.behaviors['unselect'],
             ext = {
                params: [
                    {name: this.id + '_instantUnselect', value: nodeKey}
                ]
            };
            
            unselectBehavior.call(this, e, ext);
        }
    },
    
    setupScrolling: function() {
        var scrollHeader = $(this.jqId + ' .ui-treetable-scrollable-header'),
        scrollBody = $(this.jqId + ' .ui-treetable-scrollable-body'),
        scrollFooter = $(this.jqId + ' .ui-treetable-scrollable-footer');

        scrollBody.scroll(function() {
            scrollHeader.scrollLeft(scrollBody.scrollLeft());
            scrollFooter.scrollLeft(scrollBody.scrollLeft());
        });
    }
});
/**
 * PrimeFaces Wizard Component
 */
PrimeFaces.widget.Wizard = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.content = $(this.jqId + '_content');
        this.backNav = $(this.jqId + '_back');
        this.nextNav = $(this.jqId + '_next');
        this.cfg.formId = this.jq.parents('form:first').attr('id');
        this.currentStep = this.cfg.initialStep;
        
        var _self = this;
        
        //Step controls
        if(this.cfg.showStepStatus) {
            this.stepControls = $(this.jqId + ' .ui-wizard-step-titles li.ui-wizard-step-title');
        }

        //Navigation controls
        if(this.cfg.showNavBar) {
            var currentStepIndex = this.getStepIndex(this.currentStep);
            
            //visuals
            PrimeFaces.skinButton(this.backNav);
            PrimeFaces.skinButton(this.nextNav);

            //events
            this.backNav.click(function() {_self.back();});
            this.nextNav.click(function() {_self.next();});

            if(currentStepIndex == 0)
                this.backNav.hide();
            else if(currentStepIndex == this.cfg.steps.length - 1)
                this.nextNav.hide();
        }
    },
    
    back: function() {
        if(this.cfg.onback) {
            var value = this.cfg.onback.call(this);
            if(value == false) {
                return;
            }
        }

        var stepToGo = this.cfg.steps[this.getStepIndex(this.currentStep) - 1];

        this.loadStep(stepToGo, true);
    },
    
    next: function() {
        if(this.cfg.onnext) {
            var value = this.cfg.onnext.call(this);
            if(value == false) {
                return;
            }
        }

        var stepToGo = this.cfg.steps[this.getStepIndex(this.currentStep) + 1];

        this.loadStep(stepToGo, false);
    },
    
    loadStep: function(stepToGo, isBack) {
        var _self = this;

        var options = {
            source:this.id,
            process:this.id,
            update:this.id,
            formId:this.cfg.formId,
            onsuccess: function(responseXML) {
                var xmlDoc = $(responseXML.documentElement),
                updates = xmlDoc.find('update');

                PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);

                _self.currentStep = this.args.currentStep;

                for(var i=0; i < updates.length; i++) {
                    var update = updates.eq(i),
                    id = update.attr('id'),
                    content = update.text();

                    if(id == _self.id){
                        //update content
                        _self.content.html(content);
                        
                        if(!this.args.validationFailed) {
                            //update navigation controls
                            var currentStepIndex = _self.getStepIndex(_self.currentStep);

                            if(_self.cfg.showNavBar) {
                                if(currentStepIndex == _self.cfg.steps.length - 1) {
                                    _self.hideNextNav();
                                    _self.showBackNav();
                                } else if(currentStepIndex == 0) {
                                    _self.hideBackNav();
                                    _self.showNextNav();
                                } else {
                                    _self.showBackNav();
                                    _self.showNextNav();
                                }
                            }

                            //update step status
                            if(_self.cfg.showStepStatus) {
                                _self.stepControls.removeClass('ui-state-highlight');
                                $(_self.stepControls.get(currentStepIndex)).addClass('ui-state-highlight');
                            }

                        }

                    }
                    else {
                        PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
                    }
                }

                return true;
            },
            error: function() {
                PrimeFaces.error('Error in loading dynamic tab content');
            }
        };

        options.params = [
            {name: this.id + '_wizardRequest', value: true},
            {name: this.id + '_stepToGo', value: stepToGo}
        ];

        if(isBack) {
            options.params.push({name: this.id + '_backRequest', value: true});
        }

        PrimeFaces.ajax.AjaxRequest(options);
    },
    
    getStepIndex: function(step) {
        for(var i=0; i < this.cfg.steps.length; i++) {
            if(this.cfg.steps[i] == step)
                return i;
        }

        return -1;
    },
    
    showNextNav: function() {
        this.nextNav.fadeIn();
    },
    
    hideNextNav: function() {
        this.nextNav.fadeOut();
    },
    
    showBackNav: function() {
        this.backNav.fadeIn();
    },
    
    hideBackNav: function() {
        this.backNav.fadeOut();
    }
    
});

