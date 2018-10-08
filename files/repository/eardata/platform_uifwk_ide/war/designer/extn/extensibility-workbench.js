/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/

Ext.namespace("sci.ide.ui");

sci.ide.OverlaySelectionEvent = Ext.extend(sci.ide.SelectionEvent, {
});

(function(){

var WorkbnechUI = function(workbench) {
    this.windows = new Ext.util.MixedCollection();
    this.workbench = workbench;
    this.init();
	workbench.on('activestatechanged', function(active){
		this.toolbar.items.get(0).setIconClass(active ? "icon-stop" :
											   "icon-start");
	}, this);
	sci.ide.WorkbenchMgr.registerPartListener(this);
	this.windowGroup.zseed = 13500;
}

WorkbnechUI.prototype = {
    windows: null,
    windowGroup: new Ext.WindowGroup(),
    init: function() {
        var self = this;
        var workbench = this.workbench;
        var anchorEl = this.anchorEl = Ext.getBody().createChild({
            cls: "designer-extn-body"
        });
        Ext.getBody().createChild({
            id: "designer-extn-componentfactory"
            , cls: "x-hidden"
        });
        var tb = this.toolbar = new Ext.Toolbar({
            cls: "designer-extn-taskbar w-toolbar"
			, designer_id: 'id-extensibility-wb-toolbar'
            , border: true
            , buttons: [{
                xtype: "button"
                , iconCls: "icon-start"
                , handler: function() {
                    workbench.toggleListener();
                }
            }, "|", "|", {
                iconCls: 'icon-minus'
                , handler: this.hideWindows
                , scope: this
            }, {
                iconCls: 'icon-plus'
                , handler: this.showWindows
                , scope: this
            }, '->', {
				xtype: 'sclink'
				, html: '<span style="font-size: medium;">Design new screens</span>'
				//Temp fix: Ideal would be to remove hard coded path.
				, href: '/' + window.location.href.split('/', 4)[3]+ '/designer/platform_workbench.html'
			}]
        });
        tb.render(anchorEl, 0);
    }
	, setVisible: function(visible) {
		if(visible) {
			this.anchorEl.removeClass('x-hidden');
			this.showWindows();
		} else {
			this.hideWindows(true);
			this.anchorEl.addClass('x-hidden');
		}
	}
	, isVisible: function() {
		return !this.anchorEl.hasClass('x-hidden');
	}
	, hideWindows: function(force) {
		this.windows.each(function(w, index){
			if(force === true) {
				w.hide();
			}
			else if(index !== (this.windows.getCount() - 1)) {
				w.hide();
			}
		}, this);
	}
	, showWindows: function() {
		var delay = 50;
		this.windows.each(function(w, index){
			delay += delay;
			if(index !== (this.windows.getCount() - 1)) {
				w.show.defer(delay, w);
			}
		}, this);
	}
	, edit_parts: []
    , setScreenData: function(screen_data) {
        var tabPnl = this.screenTabPnl;
        var old_data = this.screen_data || {};
		var edit_parts = this.edit_parts;
        for(var className in screen_data) {
            if(!old_data[className]) {
                var edit_part = new WorkbnechUI.
                                ScreenClassEditPart(className, screen_data[className]);
                edit_parts.push(edit_part);
            }
        }
        this.screen_data = screen_data;
		var i = 0, len = edit_parts.length;
		while(i < len) {
			var className = edit_parts[i].className;
			if(this.screen_data[className]) {
				edit_parts[i].updateInstances(this.screen_data);
			} else {
				edit_parts.splice(i, 1);
				len--;
				i--;
			}
			i++;
		}
    }
	, partChanged: function(extensionContext) {
		if(extensionContext) {
			var className = extensionContext.extension.screenClassName;
			this.createScreenTabs(className);
		}
    }
	, createScreenTabs: function(className) {
		var tabPnl = this.windows.get(0).items.get(0),
			edit_parts = this.edit_parts,
			currPnl = null;
		Ext.each(edit_parts, function(edit_part) {
			if(edit_part.className === className) {
				currPnl = tabPnl.getComponent('extensibility-wb-' + className + '-viewer');
				if(!currPnl) {
					currPnl = edit_part.createViewer();
					tabPnl.add(currPnl);
				}
				tabPnl.setActiveTab(currPnl);
				tabPnl.doLayout();
			}
		});
	}
    /**
     * Adds an item to the extensibility panel for quicker acees. THese panels
     * will be managed by the framework for quicker access to the available
     * parts in the workbench.
     */
    , addWindow: function(aWindowConfig) {
        var w = this.windows;
        Ext.applyIf(aWindowConfig, {
            closeAction: "hide"
            , maximizable: false
            , minimizable: true
            , closable: false
            , hideMode: "offsets"
			, stateId: 'extn-wb-floating-windows-'+w.getCount()
			, manager: this.windowGroup
        });
        var aWindow = new Ext.Window(aWindowConfig);
        w.add(aWindow);
        var button = this.toolbar.insertButton(w.length + 1, {
            text: aWindow.title
            , handler: function() {
                if(aWindow.hidden === true) {
                    aWindow.show();
                } else {
                    aWindow.hide();
                }
            }
        });
        aWindow._tb_button = button;
        aWindow.addListener("titlechange", this.onAWindowTitleChange, this);
        aWindow.addListener("minimize", function(w) {
            w.hide();
        });
        aWindow.show();
        aWindow.hide();
        // set animateTarget only after it has been hidden
        aWindow.setAnimateTarget(button.getEl());
        return aWindow;
    },
    onAWindowTitleChange: function(window, title) {
        window._tb_button.setText(title);
    }
};

/**
 * Class holding info regarding a screen class being edited.
 */
WorkbnechUI.ScreenClassEditPart= function(className, screen_data) {
    this.className = className;
    this.clazz = screen_data.clazz;
    this.instances = screen_data.screens;
    this.overlayEditor = screen_data.overlayEditor;
    this.overlayEditor.on("change", this.onChange, this);
	this.overlayEditor.on("insert", this.refreshOnInsert, this);
}

Ext.extend(WorkbnechUI.ScreenClassEditPart, Ext.util.Observable, {
	createViewer: function() {
		var self = this;
		var ec = self.overlayEditor.extensionContext;
        var viewer = this.viewer =  new Ext.Panel({
			id: 'extensibility-wb-' + this.className + '-viewer'
			, title: this.className.substring(this.className.lastIndexOf('.') + 1)
			, closable: true
            , border: false
			, layout: 'table'
			, layoutConfig: {
				columns: 2
			}
            , tbar: new Ext.Toolbar({
                cls: "designer-slimtb w-toolbar"
                , forClassName: this.className
                , buttons: [{
                    text: "Save"
					, iconCls: 'icon-save'
                    , handler: this.save
                    , scope: this
                }, /*{
                    text: "Redo"
					, iconCls: 'icon-redo'
                    , handler: this.redo
                    , scope: this
                }, {
                    text: "Undo"
					, iconCls: 'icon-undo'
                    , handler: this.undo
                    , scope: this
                },*/ {
                    text: "Refesh instances"
					, iconCls: 'icon-refresh'
                    , handler: this.refreshAll
                    , scope: this
                }/*, {
					text: 'View Source'
					, handler: this.viewSource
					, scope: this
				}*/, {
					text: 'Localize'
					, handler: this.localize
					, scope: this
				}]
            })
            , items: [{
				xtype: 'label'
				, text: 'Extending class: ' + this.className
				, colspan: 2
				, style: 'text-align:left;'
			}, {
				xtype: 'label'
				, text: 'Extension Class Name:'
				, width: 80
			}, {
				xtype: 'textfield'
				, value: ec.extension.className
				, width: 200
				, listeners: {
					change: function(f, newValue, oldValue) {
						ec.extension.className = newValue;
						ec.fireEvent('change');
					}
				}
			}, {
				xtype: 'label'
				, text: 'File path: ' + this.overlayEditor.extensionContext.file.path
				, colspan: 2
				, style: 'text-align:left;'
			}]
        })
		return viewer;
    }
    , refreshAll: function() {
        var editor  = this.overlayEditor;
		var extensionContext = editor.extensionContext;
		if(extensionContext) {
			Ext.each(this.instances, function(aScreen) {
				editor.recreateScreen(aScreen);
			});
		}
    }
    , save: function() {
        var ec = this.overlayEditor.extensionContext;
        var src = ec.toSrc();
        if(typeof js_beautify === "function") {
            src = js_beautify(src, 2);
        }
        ec.file.write(src);
        this._validateCorrectVerificationText();
		sci.ide.ExtnSourceGenerator.save(ec);
		var v = this.viewer;
		if(v) {
			v.setTitle(v.initialConfig.title);
		}
    }
    , _validateCorrectVerificationText: function() {
		var ecFileSrc = this.overlayEditor.extensionContext.file.read();
		var ecFileSrcObj = Ext.decode(ecFileSrc);
		if((!Ext.isEmpty(ecFileSrcObj) && Ext.isEmpty(ecFileSrcObj._verificationText)) || ecFileSrcObj._verificationText !== 'VerificationText') {
			var ec = this.overlayEditor.extensionContext;
			if(Ext.isEmpty(ec.context._verificationText)) {
				ec.context._verificationText = 'VerificationText';
			}
			var src = ec.toSrc();
			if(typeof js_beautify === "function") {
				src = js_beautify(src, 2);
			}
			ec.file.write(src);
			this._validateCorrectVerificationText();
		}
	}
    , undo: function() {
        console.log("Not implemeted yet")
    }
    , redo: function() {
        console.log("Not implemeted too")
    }
	, viewSource: function() {
		console.log('Open window showing contents after normalizing.')
	}
	, localize: function() {
		var ec = this.overlayEditor.extensionContext;
		var self = this;
		function handleOk() {
			self.onChange();
		}
		sci.ide.LocalizationHelper.showExtnLocalizer(ec, handleOk);
	}
    , onChange: function() {
		this.dirty = true;
		var v = this.viewer;
		if(v) {
			v.setTitle(v.initialConfig.title + "*");
		}
    }
    , refreshOnInsert: function() {
    	this.onChange();
    	this.refreshAll();
    }
	, updateInstances: function(screen_data) {
		var updated_screen = screen_data[this.className];
		this.clazz = updated_screen.clazz;
		this.instances = updated_screen.screens;
		this.overlayEditor = updated_screen.overlayEditor;
	}
});

var ExtnWorkbench = function(config) {
    var self = this;
    this.screen_overlay_editors = {};
    this._actions = [];
    var actions = {};
    ExtnWorkbench.superclass.constructor.call(this, config);
    var self = this;
    new Ext.KeyMap(document, {
        key: Ext.EventObject.SPACE
        , shift: true
        , stopEvent: true
        , fn: function() {
			sci.ide.LibraryMgr.init();
			function doInit(preInitComplete) {
				if(!preInitComplete) return;
				if(!self.initDone) {
					self.init(true);
				} else {
					var visible = self.ui.isVisible();
					if(visible) {
						if(self.listening) {
							self.toggleListener();
						}
						self.highlight(null, visible);
						self.ui.setVisible(!visible);
					} else {
						if(!self.listening) {
							self.toggleListener();
						}
						self.highlight(null, visible);
						self.ui.setVisible(!visible);
					}
				}
			}
			ExtnWorkbench.preInit(doInit);
        }
    });
	sci.ide.WorkbenchMgr.registerSelectionListener(this);
	this.addEvents({
		'activestatechanged': true
		, 'componentdrop': true
	});
};

var Tips = function() {
	this.tip = new Ext.QuickTip({
		target: Ext.getBody()
		, width: 200
		, html: "O_O - somethings's not right if you are able to see this."
		, dissmissDelay: 1
		, trackMouse: true
	});
}

Ext.override(Tips, {
	tpls: {
		'addfile' : new Ext.XTemplate(
			'Click to add/browse extension file for screen\t{screen}'
		)
		, 'add': new Ext.XTemplate(
			'Click to add <span class="name">{name}</span>\t',
			'<b>{position}</b> <span class="name">{reference}</span>.'
		)
		, 'edit': new Ext.XTemplate(
			'Click to select and edit\t',
			'<span class="name">{name}</span>'
		)
        , 'none': new Ext.XTemplate(
			'<div style="color:red;">Cannot add : ',
			'<span class="name">{name}</span> '+
			'<tpl if="reference">',
			'to <span class="name">{reference}</span></div>',
			'</tpl>'
		)
		, 'options': new Ext.XTemplate(
			'Click to view the ways in which <span class="name">{name}</span> '
			+ 'can be added to <span class="name">{reference}</span>.'
		)
		, 'cantextend': new Ext.XTemplate(
			'Can not extend {screen} as it is not an instance of '
			+ 'sc.plat.ui.ExtensibleScreen.'
		)
	}
	, setMessage: function(templateName, values) {
		// rignt now its implicit that if you want to show message, it has to be
		// enabled.
		var tpls = this.tpls, tip = this.tip;
		var tpl = tpls[templateName] || tpls['none'];
		if(tpl) {
			try {
				this.tip.show();
				this.tip.body.dom.innerHTML = tpl.apply(values);
			} catch(e) {}//not logging.
		}
	}
	, setEnabled: function(enabled) {
		this.tip[enabled ? 'show' : 'hide']();
	}	
});

Ext.extend(ExtnWorkbench, Ext.util.Observable, {
	id: 'extensibility-workbench-V1'
    , navigator: null
    , palette: null
    , dataView: null
    , init: function(showMask) {
		function randomizeSeed() {
			var n = Math.random() * (100 - 10) + 10;
			var getId = Ext.Component.prototype.getId;
			for(var i = 0; i < n; i++) {
				getId.call({});
			}
		}
        this.initDone = true;
        var palette = this.palette = new sci.ide.ui.ComponentsTree()
		var navigator = this.navigator = new sci.ide.ui.PackageExplorer();
        var ui = this.ui = new WorkbnechUI(this);
		ui.addWindow({
			title: 'Screen Details View'
			, width: 350
			, height: 200
			, autoScroll: true
			, closable: false
			, minimizable: true
			, maximizable: true
			, layout: 'fit'
			, items: new Ext.TabPanel({
				activeTab: 0
				, layoutOnTabChange: true
			})
			, listeners: {
				'minimize': function(win) {
					win.hide();
				}
				, scope: this
			}
		});
        ui.addWindow({
            title: "Palette & Files"
            , width: 200
            , height: 450
            , x: 10
            , layout: "fit"
            , items: new Ext.TabPanel({
                activeTab: 0
                , deferredRender: false
                , items: [
                    palette,
                    new sci.ide.datasource.ConfigPanel(),
                    navigator
                ]
            })
        });
        var propertyPanel = new sci.ide.ui.PropertyPanel({header: false});
		var originalPropertyGrid = new sci.ide.ui.OriginalPropertyGrid({hidden: true});
		propertyPanel.items.get(0).on('beforepropertyadd', function(id, model) {
			// TODO add validation rules and return false to disallow adding
			// properties not supported.
			if(!model || !model.def) {
				return true;
			}
			var def = model.def;
			return def.acceptProperty(id);
		});
		propertyPanel.items.get(0).on('propertyadd', function(name, property, model) {
			var configObj = originalPropertyGrid.config;
			if(Ext.isEmpty(configObj)) {
				return;
			}
			var initialConfig = configObj.config;
			var value = initialConfig[name];
			if(Ext.isEmpty(value)) {
				return;
			}
			var type = Ext.type(value);
			if(['boolean', 'string', 'number'].has(type)) {
				property.type = type;
				property.value = value;
			} else if(type === 'array') {
				var val = [];
				Ext.each(value, function(eachAttr) {
				//--------------------------------------Code Repeated.
					var defid = eachAttr.defid;
					if(!defid) {
						//TODO what to do when defid is not found?
						return;
					}
					var type = model.findTypeForDefid(property.name, defid);
					if(type == null) {
						//Type not matching. No defaulting to be done.
						return;
					}
					var def = type.getDefObject();
					if(def == null) {
						//TODO what to do when defid is not found?
						return;
					}
					var objM = sci.ide.Utils.createModelFromConfig(eachAttr, def);
				//--------------------------------------Code Repeated.
					val.push(objM);
				}, this);
				property.type = 'array';
				property.value = val;
			} else if(type === 'object') {
				var defid = value.defid;
				if(!defid) {
					//TODO what to do when defid is not found?
					return;
				}
				var type = model.findTypeForDefid(property.name, defid);
				if(type == null) {
					//Type not matching. No defaulting to be done.
					return;
				}
				var def = type.getDefObject();
				if(def == null) {
					//TODO what to do when defid is not found?
					return;
				}
				/*var objM = new sci.ide.ObjectModel(def, {
					properties: this.getProperties(value, objM)
				});*/
				var objM = sci.ide.Utils.createModelFromConfig(value, def);
				property.type = type.type;
				property.value = objM;
			}
		}, this);
		//what was the other event required for???
        ui.addWindow({
            title: "Properties"
            , width: 250
            , height: 300
			, autoScroll: true
            , layout: "anchor"
            , x: (document.body.clientWidth - 650 - 20)
            , items: [
                propertyPanel
				, originalPropertyGrid
            ]
        });
		ui.addWindow({
			title: "Outline"
			, width: 300
			, height: 500
			, layout: 'fit'
			, x: (document.body.clientWidth - 300 - 20)
			, items: new Ext.TabPanel({
				activeTab: 0
				, layoutOnTabChange: true
				, items: [
					new sci.ide.ComponentOutline({
						title: 'Components'
					})
					, new sci.ide.OverlayOutline({
						title: 'Overlays'
					})
				]
			})
		});
		ui.addWindow({
			title: "Control Details View"
			, designer_id: 'id-extensibility-wb-ctrl-details-view'
			, width: 600
			, height: 400
			, layout: 'fit'
			, x: (document.body.clientWidth - 800 - 20)
			, items: new Ext.TabPanel({
				activeTab: 0
				, layoutOnTabChange: true
				, items: [
					new sci.ide.ControlDetailsView()
					, new sci.ide.ParentScreenDetailsView()
				]
			})
		});
        
        sc.plat.ScreenMgr.collection.addListener("add",
                                                 this.updateScreenCollection,
                                                 this, {
                                                    buffer: 500
                                                });
        this.updateScreenCollection();
        this.initEvents();
		this.initTips();
		this.toggleListener();
		//randomizeSeed();
    }
	//can be util function.
	, getProperties: function(obj, model) {
		var configObj = {}, property;
		for(var p in obj) {
			if(p === 'xtype' || p === 'defid') {
				continue;
			}
			var value = obj[p];
			var type = Ext.type(value);
			if(['boolean', 'string', 'number'].has(type)) {
				configObj[p] = {
					id: p,
					type: type,
					value: value
				};
			} else if(type === 'array') {
				configObj[p] = [];
				Ext.each(value, function(eachElement) {
					var eachType = Ext.type(eachElement);
					if(['boolean', 'string', 'number'].has(type)) {
						configObj[p].push(eachElement);
					} else {
						configObj[p].push(this.getProperties(eachElement));
					}
				}, this);
				// TODO copy array
			} else if(type === 'object') {
				var defid = value.defid;
				if(!defid) {
					//TODO what to do when defid is not found?
					continue;
				}
				var type = model.findTypeForDefid(property.name, defid);
				var def = type.getDefObject();
				if(def == null) {
					//TODO what to do when defid is not found?
					continue;
				}
				var objM = new sci.ide.ObjectModel(def, {
					properties: this.getProperties(value)
				});
				configObj[p] = {
					id: p,
					type: type.type,
					value: objM
				};
			}
		}
		return configObj;
	}
    , updateScreenCollection: function() {
        var screens = sc.plat.ScreenMgr.collection.items;
        // TODO here, we need to interpret this collection of screens
        var oldDefs = this.screen_defs;
        var defs = this.screen_defs = {};
        Ext.each(screens, function(screen){
            var screenClassName = screen.className;
            var data = defs[screenClassName] = defs[screenClassName] || {
                clazz: screen.constructor
                , screens: []
                , overlayEditor: this.getScreenOverlayEditor(screenClassName)
            };
            data.screens.push(screen);
        }, this);
        this.ui.setScreenData(defs);
    }
    , initEvents: function() {
        var onmousehover = this.onmousehover;
		var onmousedown = (this.onmousedown).createDelegate(this);
        var body = Ext.getBody();
        body.on({
            'mousemove': onmousehover,
            'mouseover': onmousehover,
            'mouseout': this.onmouseout,
            //'mousedown': this.onmousedown,
            'mouseup': this.onmouseup,
            'scope': this
        });
		if (window.addEventListener) {
			body.dom.addEventListener("mousedown", onmousedown, true);
		} else if (window.attachEvent) {
			body.dom.attachEvent("onmousedown", onmousedown);
		}
    }
	, initTips: function() {
		this.tips = new Tips();
	}
	, linker: null
	// XXX shouldnt we use drag-n-drop for our editing purposes?
    , onmousehover: function(e) {
        var ctx = this.findEventContext(e);
        if(!ctx) {
			this.tips.setEnabled(false);
			return;
		}
        e.preventDefault();
		var component = ctx[0], screen = ctx[1], editor = ctx[2];
        // TODO resolve for the given component.
        // TODO create tooltip element 
        if(!editor.hasExtension()) {
			var isExtensibleScreen = screen instanceof sc.plat.ui.ExtensibleScreen;
			if(isExtensibleScreen) {
				this.tips.setMessage('addfile', {
					screen: editor.screenClassName
				});
			} else {
				this.tips.setMessage('cantextend', {
					screen: editor.screenClassName
				});
			}
        } else {
			this.handleOperation(e, component, screen, editor);
        }
    }
	, handleOperation: function(e, component, screen, editor) {
		var x,
			selection = this.selection,
			def = this.getDefFor(component, editor),
			configObject = editor.extensionContext.getConfigObject(component.sciId);
		if(!configObject)  {
			//console.warn('No configObject');
			return;
		}
		var el = component.el,
			eXY = e.xy,		
			elXY = el.getXY(),	//we can use getX() instead?
			elWidth = el.getWidth(),
			factor = 4;
		var isIn = elWidth * (1/factor) < (eXY[0] - elXY[0]) &&
                       elWidth * ((factor - 1)/factor) > (eXY[0] - elXY[0]);
		var getDef = sci.ide.RegDefObject.get,
			ref = {
				model: null
				, sciId: component.sciId
				//XXX: holderId should be holder of parent or holder for child? Here it is the prop to which parent was added.
				, holderId: configObject.asProperty
				, parentSciId: component.ownerCt ? component.ownerCt.sciId : null
				, cmp: component
				, deftoadd: selection.id === 'selection' ? null : getDef(selection.id)
				, event: e
			};
		var parentContainer = this.getCmp(component.getEl().dom.parentNode);
		var defid = editor.extensionContext.getConfigDefid(component), 
			componentDef = sci.ide.RegDefObject.get(defid);
		var sciIdToShow = componentDef instanceof sci.ide.cmpdefs.Panel ? component.sciId : (parentContainer ? parentContainer.sciId : null);
		
		if(isIn) {
			this.linker = def.resolveLink(null, ref, component.sciId);
			if((!this.linker || !this.linker.canAccept()) && parentContainer) {
				this.linker = this.getDefFor(parentContainer, editor).resolveLink(parentContainer, ref, parentContainer.sciId);
			}
		} else {
			if(parentContainer) {
				this.linker = this.getDefFor(parentContainer, editor).resolveLink(parentContainer, ref, parentContainer.sciId);
			} if(!this.linker || !this.linker.canAccept()) {
				this.linker = def.resolveLink(component, ref, component.sciId);
			}
		}
		this.displayTips(e, component, sciIdToShow);
	}
	, displayTips: function(e, component, sciIdToShow) {
		var selection = this.selection;
		if(selection.id === 'selection') {
			this.tips.setMessage('edit', {
				name: component.sciId
				, position: "aPos"
				, reference: "aRef"
			});
			return;
		}
		if(e.ctrlKey) {
			if(this.linker.indicator) {
				this.linker.indicator.clear();
			}
			if(selection.id !== 'selection') {
				this.tips.setMessage('options', {
					name: selection.id
					, reference: sciIdToShow
				});
			}
		} else {
			if(this.linker && this.linker.canAccept()) {
				if(this.linker.indicator) {
					this.linker.indicator.show();
				}
				this.tips.setMessage('add', {
					name: selection.id
					, position: this.linker.position
					, reference: this.linker.sciId
				});
				return;
			} else {
				this.tips.setMessage('none', {
					name: selection.id
					, reference: (this.linker && this.linker.sciId) ? this.linker.sciId : undefined
				});
			}
		}
	}
	, getCmp: function(el) {
		return sci.ide.Utils.getCmpBy(el, function(cmp) {
			return Ext.isEmpty(cmp.sciId);
		});
	}
	, getDefFor: function(component, editor) {
		var defid = editor.extensionContext.getConfigDefid(component);
		var def = sci.ide.RegDefObject.get(defid);
		var overlays = editor.extensionContext.getOverlayModelsFor(component.initialConfig, def, true);
		var overlay = overlays['change'] || overlays['insert'];
		var config = overlay.get("config");
		return config.def;//config ? config.def : sci.ide.RegDefObject.get('customct');
	}
	, onmouseout: function(e) {
		if(this.linker && this.linker.indicator) {
            this.linker.indicator.clear();
        }
		// XXX should we disable only if we are not in a screen?
		this.tips.setEnabled(false);
	}
    , onmousedown: function(e) {
		var ctx = this.findEventContext(e);
        if(!ctx) return;
		if(e.preventDefault) {
			e.preventDefault();
		}
		var component = ctx[0], screen = ctx[1], editor = ctx[2],
			linker = this.linker,
			selection = this.selection;
/*			
		if(editor.extensionContext && screen) {
			var overlaysArray = editor.extensionContext.overlays,
				sourceNS = [],
				targetNS = [];
			for(var i = 0; i < overlaysArray.length; i++) {
				var anOverlay = overlaysArray[i];
				if(anOverlay.def.op === 'change') {
					if(!Ext.isEmpty(anOverlay.properties.config.getProperty('namespaces'))) {
						var namespaces = anOverlay.properties.config.getValue('namespaces');
						console.log(namespaces);
						sourceNS = namespaces.getValue('source');
						targetNS = namespaces.getValue('target');
						console.log(sourceNS, targetNS);
					}
				}
			}
			var screenNamespaces = screen.namespaces;
			if(!Ext.isEmpty(sourceNS)) {
				Ext.each(sourceNS, function(aSource) {
					if(!screenNamespaces.source.has(aSource.value)) {
						screenNamespaces.source.push(aSource.value);
					}
				});
			}
			if(!Ext.isEmpty(targetNS)) {
				Ext.each(targetNS, function(aTarget) {
					if(!screenNamespaces.target.has(aTarget.value)) {
						screenNamespaces.target.push(aTarget.value);
					}
				});
			}
			
		}
*/		
		if(screen instanceof sc.plat.ui.ExtensibleScreen) {
			if(!editor.loadExtension(screen)) {
			    // should not do anything. extension has not been loaded yet.
			    return;
			}
		} else {
			return;
		}
		var extensionContext = editor.extensionContext;
		var componentConfig = component.initialConfig;
        var overlays = editor.extensionContext.getOverlayModelsFor(componentConfig, screen, true);
		
		var currentPart = sci.ide.WorkbenchMgr.getCurrentPart();
		if(!currentPart || currentPart !== extensionContext) {
			sci.ide.WorkbenchMgr.partChanged(extensionContext);
		}
		if(e.ctrlKey) {
			this.showOptions(e, component, screen, editor, componentConfig, overlays, extensionContext);
		} else {
			this.handleDrop(component, screen, editor, componentConfig, overlays, extensionContext);
		}
    }
	, showOptions: function(e, component, screen, editor, componentConfig, overlays, extensionContext) {
		var linker = this.linker,
			selection = this.selection,
			options = [],
			containerComponent = component,
			defid = editor.extensionContext.getConfigDefid(containerComponent),
			def = sci.ide.RegDefObject.get(defid);
			
		while(!(def instanceof sci.ide.cmpdefs.Panel) && containerComponent) {
			var parentContainer = this.getCmp(containerComponent.getEl().dom.parentNode);
			containerComponent = parentContainer;
			defid = editor.extensionContext.getConfigDefid(containerComponent);
			def = sci.ide.RegDefObject.get(defid);
		}
		var defToAdd = sci.ide.RegDefObject.get(selection.id);
		options = def.addDefAs(defToAdd);
		if(options.length === 0) {
			alert("Can't add " + selection.id + " to " + containerComponent.sciId);
			return;
		}
		//XXX: Very Hacky!! Must fix this using multiple linkers or changing the way linker works.
		//XXX: Would give error if add to a component in tbar/bbar.
		if(selection.id !== 'selection' && options.length !== 0) {
			var optionsList = [];
			Ext.each(options, function(option, index) {
				optionsList.push({
					id: 'extensibility-wb-optionList-' + index
					, text: option
					, handler: function() {
						linker.position = 'in';
						linker.propertyId = option;
						linker.sciId = containerComponent.sciId;
						this.handleDrop(component, screen, editor, componentConfig, overlays, extensionContext);
					}
					, scope: this
				})
			}, this);
			var optionsMenu = new Ext.menu.Menu({
				id: 'extensibility-wb-component-drop-options-menu'
				, items: optionsList
			});
			optionsMenu.showAt([e.clientX, e.clientY]);
		}
	}
	, handleDrop: function(component, screen, editor, componentConfig, overlays, extensionContext) {
		var selection = this.selection,
			linker = this.linker;
		switch(selection.id) {
			case 'selection':
				if(overlays && (overlays["change"] || overlays["insert"])) {
					sci.ide.WorkbenchMgr.notifySelectionListeners(new sci.ide.OverlaySelectionEvent(this, {
						sciId: component.sciId
						, config: componentConfig
						, overlay: overlays["change"] || overlays["insert"]
						, screen: screen
						, editor: editor
					}));
				} else {
					console.log("overlay not found for component: ", component);
				}
				break;
			default:
			if(linker && linker.canAccept()) {
				var position = linker.position;
				var sciId = linker.sciId;
				var configObject = extensionContext.getConfigObject(linker.sciId);
				var isIn = position === 'in';
				var objModels = (typeof selection.getModels === 'function') ?
						selection.getModels() : new sci.ide.ObjectModel(selection.id);
				var overlay;
				//reverse objModels (ie creation of overlays) if pos is 'after' let it be same if its 'before'
				if(objModels.length && position === 'after') {
					objModels.reverse();
				}
				Ext.each(objModels, function(objModel) {
					overlay = this.createOverlay_insert_forModel({
						ownerId: isIn ? sciId : configObject.owner.config.sciId
						, property: linker.propertyId
						, refId: !isIn ? sciId : null
						, pos: position
					}, objModel, extensionContext);
				}, this);
				extensionContext.fireEvent('insert', overlay, extensionContext);
				if(linker.indicator) {
					linker.indicator.clear();
				}
				//XXX: a better way to fire event on drop.
				this.fireEvent('componentdrop', extensionContext);
				this.ui.windows.get(3).items.get(0).items.get(0).fireEvent('componentdrop', extensionContext);
				//sci.ide.WorkbenchMgr.partChanged(extensionContext);
			} else {
				console.error("invalid drop", linker, selection);
			}
			this.palette.selectDefault();
		}
	}
	, createOverlay_insert_forModel: function(insertConfig, model, extensionContext) {
		// provide extesion point to filter model properties.
		var sciId = model.getValue('sciId').replace(/[0-9]/g, '');
		if(sciId.substring(0, 5) !== 'extn_') {
			model.setValue('sciId', extensionContext.genId('extn_' + sciId));
		} else{
			model.setValue('sciId', extensionContext.genId(sciId));
		}
		var filterdProperties = model.def.filterExtnProperty(model);
		var overlay = extensionContext.createOverlay_insert(insertConfig, model, false);
		for(var p in filterdProperties) {
			var val = filterdProperties[p];
			if(val) {
				Ext.each(val.value, function(child){
					this.createOverlay_insert_forModel({
						ownerId: model.getValue('sciId')
						, property: val.id
						, refId: undefined
						, pos: 'in'
						}, child.value, extensionContext);
				}, this);
			}
		}
		/*Ext.each(insertConfigArray, function(childInsertConfig) {
			for(var i = 0; i < )
			this.createOverlay_insert_forModel(childInsertConfig, );
		}, this);*/
		return overlay;
	}
    , onmouseup: function(e) {
        var ctx = this.findEventContext(e);
        if(! ctx) return;
        e.preventDefault();
    }
    , findEventContext: function(e) {
        if(!this.listening) return null;
		var trgt = e.target || e.srcElement;
        var cmp = this.getCmp(trgt);
        if(!cmp) return null;
		/*if(!cmp.sciId) {
			cmp = cmp.ownerCt ? cmp.ownerCt : (cmp.ownerScr ? cmp.ownerScr : cmp);
			console.log('Not found sciId so new cmp: ', cmp);
		}*/
        // XXX we may need to find the owner screen based on element heirarchy
        // when not found in component heirarchy. e.g. for tbar and its items.
        
		//XXX: shall we put screen = cmp if v hover over a screen?
        var screen = /*cmp instanceof sc.plat.ui.Screen ? cmp :*/sc.plat.ScreenMgr.findOwnerScr(cmp);
		
		var parent = cmp;
		
		while(!screen && parent) {
			var el = parent.el.dom.parentNode;
			parent = this.getCmp(el);
			screen = parent ? sc.plat.ScreenMgr.findOwnerScr(parent) : null;
		}
        // TODO if screen is not found yet, try searching using parentNode.
        if(!screen) return null;
        
        return [cmp, screen, this.getScreenOverlayEditor(screen.className)];
    }
    , getScreenOverlayEditor: function(screenClassName) {
        var oe = this.screen_overlay_editors[screenClassName];
        if(oe == null) {
            oe = new sci.ide.OverlayEditor(screenClassName);
            this.screen_overlay_editors[screenClassName] = oe;
        }
        return oe;
    }
    , toggleListener: function() {
        this.listening = ! this.listening;
		this.fireEvent('activestatechanged', this.listening);
        return this.listening;
    }
    // Open editor may not fit in the current scenario.
    , openEditor: function(file) {
        // TODO
    }
    ,_actionsRendered: false
    , registerAction: function(action) {
        this._actions.push(action);
        if(this._actionsRendered) {
            this.renderAction(action);
        }
    }
    /**
     * Called to render actions
     */
    , renderActions: function() {
        Ext.each(this._actions, this.renderAction, this);
        this._actionsRendered = true;
    }
    , renderAction: function(action) {
        var tb = this.toolbar;
        switch(action.initialConfig.category) {
            case "edit":
                break;
            case "tool":
                break;
            default:
        }
    }
	, highlight: function(selection, visible) {
		var scr = this;
		if(scr.selectedComponent) {
			scr.selectedComponent.removeClass('selection');
		}
		//if the extensibility WB was open then only remove class.
		if(!selection && visible) {
			return;
		} else if(!selection && !visible) {
		//if it was closed and has been reopened, then last selected component should be highlighted(except screen).
			if(scr.selectedComponent) {
				scr.selectedComponent.addClass('selection');
			}
			return;
		}
		this.selectedComponent = selection.screen.find('sciId', selection.sciId)[0];
		if(Ext.isEmpty(this.selectedComponent)) {
			return;
		}
		this.selectedComponent.addClass('selection');
	}
	, selectionChanged: function(event) {
        if(event instanceof sci.ide.OverlaySelectionEvent) {
            this.highlight(event.selection);
        } else if(event instanceof sci.ide.ObjectSelectionEvent) {
            this.selection = event.selection;
        }
	}
});

ExtnWorkbench.preInit = function(callBack) {
	ExtnWorkbench.proposeTOC(function(accepted) {
		if(accepted) {
			ExtnWorkbench.doSetup(function(setupComplete) {
				callBack(setupComplete);
			});
		} else {
			callBack(false);
		}
	});
}

ExtnWorkbench.acceptedTOC = false;
ExtnWorkbench.proposeTOC = function(callback) {
	if(ExtnWorkbench.acceptedTOC) {
		callback(true);
		return;
	}
	var win = new Ext.Window({
		title: 'Extensibility Workbench Usage Terms and Conditions',
		layout: "fit",
		modal: true,
		closable: false,
		autoScroll: true,
		height: 250,
		width: 500,
		stateId: 'extn-wb-toc-win',
		items: [{
			xtype: 'panel',
			autoLoad: '/' + sc.plat.info.Application.getApplicationContext() + '/designer/extn/toc.html'
		}],
		buttons: [{
			text: 'Accept',
			iconCls: 'icon-accept',
			handler: function accept() {
				win.close();
				ExtnWorkbench.acceptedTOC = true;
				callback(true);
			}
		}, {
			text: 'Decline',
			iconCls: 'icon-delete_png',
			handler: function reject() {
				win.close();
				ExtnWorkbench.acceptedTOC = false;
				callback(false);
			}
		}]
	});
	win.show();
}

ExtnWorkbench.doSetup = function(callBack) {
	if(!sci.ide.OS.getInterface()) {
		sci.ide.OS.showSetupHelp();
		callBack(false);
		return;
	}
	var Prefs = sci.ide.PreferenceMgr;
	var Lib = sci.ide.LibraryMgr;
	var url = window.location.href.split('/', 4).join('/');
	url = url.search(/\/extn$/)!== -1 ? url : url + '/extn';
	var prefUrl = '';
	if(!Ext.isEmpty(Prefs.getValue("resourcemappping"))) {
		prefUrl = Prefs.getValue("resourcemappping").split('<=>')[0];
	}
	
	function checkMapping(mapping) {
		if(!Ext.isEmpty(mapping) || !Ext.isEmpty(Prefs.getValue("resourcemappping"))) {
			var mappedResources = Lib.findMappedResourcesInExtns(/\.js$/, mapping);
			if(!Ext.isEmpty(prefUrl) && url !== prefUrl) {
				return false;
			} else if(mappedResources.emptyExtnLibs) {
				return true;
			} else if(mappedResources.extnFiles.length > 0) {
				return true;
			}
		}
		return false;
	}
	if(checkMapping()) {
		callBack(true);
		return;
	}
	var setupWindow = new Ext.Window({
		title: 'Mapping Preferences',
		designer_id: 'id-extensibility-mapping-preferences',
		layout: "fit",
		modal: true,
		closable: false,
		autoScroll: true,
		height: 200,
		width: 500,
		stateId: 'extn-wb-map-preferences-win',
		items: [{
			xtype: "panel",
			layout: "table",
			layoutConfig: {
				columns: 7
			},
			items: [{
				xtype: "label",
				cls: 'x-form-item',
				html: "<b class = 'name'>URL</b> to map to <b>Project Directory:</b> ",
				colspan: 2
			},
			{
				xtype: "label",
				id: "designer-extn-url-label",
				cls: 'x-form-item',
				width: 250,
				html: function() {
					var preference = Prefs.getValue("resourcemappping");
					var url = window.location.href.split('/', 4).join('/');
					/*if(!Ext.isEmpty(preference)) {
						url = preference.split('<=>')[0];
					}*/
					url = url.search(/\/extn$/)!== -1 ? url : url + '/extn';
					return url;
				}(),
				colspan: 4
			},
			{
				xtype: "hidden"
			},
			{
				xtype: "label",
				cls: 'x-form-item',
				html: "<b>Workspace directory</b> which contains extension files for current screen: ",
				colspan: 2
			},
			{
				xtype: "textfield",
				id: 'designer-extn-path-textfield',
				grow: true,
				growMin: 250,
				growMax: 500,
				value: function() {
					var preference = Prefs.getValue("resourcemappping");
					var path = '';
					if(!Ext.isEmpty(preference)) {
						path = preference.split('<=>')[1];
					}
					return path;
				}(),
				colspan: 4
			},
			{
				xtype: "button",
				id: "lookup-button",
				text: "Browse",
				handler: function() {
					new sci.ide.DirectoryDialog({
						callback: function(path) {
							if(path) {
								Ext.getCmp('designer-extn-path-textfield').setValue(path);
							}
						}
					}).show();
				}
			}]
		}],
		buttons: [{
			text: 'OK'
			, handler: function() {
				var urlPath = Ext.getCmp('designer-extn-url-label').html;
				var oldPrefUrl = prefUrl;
				prefUrl = urlPath;
				var filePath = Ext.getCmp('designer-extn-path-textfield').getValue();
				if(Ext.isEmpty(filePath)) {
					prefUrl = oldPrefUrl;
					alert('The Workspace Directory path can not be empty!');
				/*
				 Might need to put sterner checks for mapping. Like should begin with Directory letters
				 and not space etc. But might kead to too many checks!
				*/
				} else {
					if(checkMapping([urlPath, filePath])) {
						Prefs.setValue("resourcemappping", urlPath + "<=>" + filePath);
						if(Ext.isEmpty(Prefs.getValue('cwd'))) {
							Prefs.setValue('cwd', filePath);
						}
						if(Ext.isEmpty(Prefs.getValue('contextroot'))) {
							Prefs.setValue('contextroot', filePath);
						}
						// TODO default the project path by finding the project directory
						setupWindow.close();
						callBack(true);
					} else {
						alert('Invalid directory and url mapping.')
					}
				}
			}
		}, {
			text: 'Cancel'
			, handler: function() {
				setupWindow.close();
				callBack(false);
			}
			, scope: this
		}]
	});
	setupWindow.show();
}

sci.ide.WorkbenchMgr.setWorkbenchClass(ExtnWorkbench);

Ext.override(sci.ide.ObjectModel, {
	validateProperties: function() {
		// TODO add validation logic for extension models.
	}
})
})();
Ext.onReady(function(){
	var ctx = sc.plat.info.Application.getApplicationContext();
	var uri = '/' + ctx + '/designer/css/designer.css';
	sci.ide.LibraryMgr.loadRemoteFile(uri);
});
