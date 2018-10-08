/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/
Ext.namespace("sci.ide");

sci.ide.OverlayOutline = function(config) {
	config = config || {};
    Ext.applyIf(config, {
        id: 'extn-wb-tree-outline'
        , autoScroll: true
        , containerScroll: true
        , rootVisible:false
        , animate: false
        , enableDD: false
        , tbar: [{
            xtype: 'button'
            , text: 'Click to View Overlays'
            , handler: this.showOverlays
            , scope: this
        }]
        , loader: new Ext.tree.TreeLoader()
        , root: new Ext.tree.TreeNode({
            text: 'Root Node'
            , children: []
        })
        , buttonClicked: false
        , listeners: {
            contextmenu: function(node, e) {
                e.preventDefault();
                this._contextmenu = new Ext.menu.Menu({
                    id: 'extn-wb-overlay-tree-contextmenu',
                    items: [{
                        text: 'Remove overlay',
                        iconCls: 'icon-delete',
                        hideDelay: 10,
                        handler: function() {
                            this.overlays.remove(node.attributes.overlay);
                            this.buttonClicked = true;
                            this.extensionContext.fireEvent('insert', node.attributes.overlay);
                            this.showOverlays();
                            //to refresh the tree
                            sci.ide.WorkbenchMgr.partChanged(this.extensionContext);
                        },
                        scope: this
                    }]
                });
                var sm =  this.getSelectionModel();
                if(!sm.isSelected(node)) {
                    sm.select(node);
                }
                if(node.attributes.overlay) {
                    this._contextmenu.showAt(e.getXY());
                }
            }
            , scope: this
        }
    });
    sci.ide.OverlayOutline.superclass.constructor.call(this, config);
    this.getSelectionModel().on('selectionChange', function(sm, node) {
        if(!node) return;
        var config = node.attributes.config;
        var overlays = null;
        if(node.attributes.def) {
            overlays = this.extensionContext.getOverlayModelsFor(config, node.attributes.def, true);
        }
        if(overlays) {
            wb.notifySelectionListeners(new sci.ide.OverlaySelectionEvent(this, {
                sciId: config.sciId
                , config: config
                //XXX: Why we use only insert and change??? mayb coz getDefFor() only uses the same.
                //XXX: We can .getConfigObject(sciId) and get def base on xtype or defid in getDefFor()
                , overlay: overlays["change"] || overlays["insert"]
                , screen: this.screen
                , editor: this.overlayEditor
                , overlayType: node.attributes.overlayType
            }));
        }
    }, this);
    var wb = sci.ide.WorkbenchMgr;
    wb.registerSelectionListener(this);
}

Ext.extend(sci.ide.OverlayOutline, Ext.tree.TreePanel, {
	checkAction: function() {
		if(!this.buttonClicked) {
			this.clearOldData();
		}
	}
    , showOverlays: function() {
		if(Ext.isEmpty(this.extensionContext)) {
			alert('No data to populate Overlay Tree.');
			this.buttonClicked = false;
			return;
		}
        this.extensionContext.normalize(this.extensionContext.baseUIConfig);
        this.clearOldData();
        this.createTree(this.createConfigObj());
        this.extensionContext.refresh();
		this.buttonClicked = false;
        //XXX: calling cacheOverlays so that new set of overlays are created for new uiConfig.
        //Is this correct way?
        this.extensionContext.cacheOverlays(this.screen.extendedUIConfig, this.extensionContext.getConfigDefid(this.screen.extendedUIConfig));
    }
    , createConfigObj: function() {
        var overlays = this.extensionContext.overlays;
        this.overlays = overlays;
        var config = {
            move: []
            , insert: []
            , change: []
        };
        for(var i = 0; i < overlays.length; i++) {
            var overlay = overlays[i];
            if(overlay.def.op === 'change') {
                var prop = overlay.properties.config.props;
                var isEmptyObj = true;
                //Check for empty object
                for(var p in prop) {
                    if(Ext.isEmpty(prop[p])) {
                        isEmptyObj = true;
                        break;
                    }
                    isEmptyObj = false;
                    break;
                }
                if(!isEmptyObj) {
                    config['change'].push(overlay);
                }
            } else {
                config[overlay.def.op].push(overlay);
            }
        }
        return config;
    }
    , clearOldData: function() {
        var root = this.getRootNode();
        var childNodes = root.childNodes;
        var length = childNodes.length;
        for(var i = length - 1; i > -1; i--) {
            root.removeChild(childNodes[i]);
        }
        //Strangely not working.
        /*root.eachChild(function(child) {
            if(child) {
                child.remove();
            }
        }, root);*/
    }
    , createTree: function(config) {
        var root = this.getRootNode();
        for(var p in config) {
            var node = new Ext.tree.TreeNode({
                iconCls: '' //change it
                , text: '<b>' + p + '</b>'
            });
            if(config[p].length > 0) {
                Ext.each(config[p], function(childConfig) {
                    //change OR move OR insert
                    var sciId = childConfig.properties.sciId ? childConfig.properties.sciId : (childConfig.properties.remove ? childConfig.properties.remove.sciId : childConfig.properties.config.props.sciId.value);
                    
                    var configObj = this.extensionContext.getConfigObject(sciId);
                    var def = sci.ide.RegDefObject.get(this.extensionContext.getConfigDefid(configObj.config));
                    var childNode = new Ext.tree.TreeNode({
                        iconCls: 'widgets-controls-custom'
                        , text: sciId
                        , overlay: childConfig
                        , config: configObj.config
                        , def: def
                        , overlayType: p
                    });
                    node.appendChild(childNode);
                }, this);
            }
            root.appendChild(node);
        }
        root.expand(true);
    }
    , selectionChanged: function(event) {
        if(event instanceof sci.ide.OverlaySelectionEvent) {
            var selection = event.selection,
                sciId = selection.sciId,
                overlayType = selection.overlayType,
                overlay = selection.overlay,
                screen = selection.screen,
                overlayEditor = selection.editor,
                sm = this.getSelectionModel();
            this.screen = screen;
            this.overlayEditor = overlayEditor;
            this.oldEC;
            this.extensionContext = overlayEditor.extensionContext;
            var selectedNode;
            this.getRootNode().cascade(function(node) {
                if(node.attributes.text === sciId && overlayType === node.attributes.overlayType) {
                    selectedNode = node;
                }
                return selectedNode == null;
            });
			this.extensionContext.on('insert', this.checkAction, this);
            sm.suspendEvents();
            sm.clearSelections();
            sm.select(selectedNode);
            sm.resumeEvents();
        }
    }
});