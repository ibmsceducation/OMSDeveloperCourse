/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/
Ext.namespace("sci.ide");

sci.ide.ComponentOutline = function(config) {
	config = config || {};
    Ext.applyIf(config, {
        id: 'extn-wb-overlay-outline'
        , autoScroll: true
        , containerScroll: true
        , rootVisible:false
        , animate: false
        , enableDD: true
        , tbar: [{
            iconCls: 'expand-all'
            , handler: function() {
                this.root.expand(true);
            }
            , scope: this
        }, {
            iconCls: 'collapse-all'
            , handler: function() {
                this.root.collapse(true);
            }
            , scope: this
        }]
        , loader: new Ext.tree.TreeLoader()
        , root: new Ext.tree.TreeNode({
            text: 'Root node'
            , children: []
        })
        , listeners: {
            nodedragover: function(e) {
                var isIn = (e.point === 'append'),
                    parent = isIn ? e.target : e.target.parentNode,
                    addToParentAs = 'items';
				if(e.target.attributes.sciId === '[unknown component]') {
					return false;
				}
                //if parent node is 'items'/'columns'/'bbar'/'tbar'/'buttons' then get its parent.
                if(!parent.attributes.def) {
                    addToParentAs = parent.attributes.propId;
                    parent = parent.parentNode;
                } else {
                    addToParentAs = this.getOMDef(parent).getChildrenId();
                }
                var parentDef = this.getOMDef(parent);
                var linker = parentDef.resolveLink(null, {
                    model: undefined
                    , deftoadd: this.getOMDef(e.dropNode)
                    , sciId: this.getOMId(parent)
//XXX: holderId should be holder of parent or holder for child? Here its child's.
                    , holderId: addToParentAs
                    , parentSciId: this.getOMId(parent)
                    , cmp: null
                    , event: e
                }, this.getOMId(parent));
                this.linker = linker;
                return (linker && linker.canAccept());
            }
            , nodedrop: function(e) {
                var oe = this.overlayEditor;
                var ec = oe.extensionContext;
                var target = e.target, drop = e.dropNode;
                var dropId = this.getOMId(drop);
                var targetId = this.getOMId(target);
                var isIn = (e.point === 'append');
                if(isIn) {
                    if(target.attributes.def) {
                        var childNodes = target.childNodes;
                        var defaultPropnode = target.attributes.def.getChildrenId();
                        for(var i = 0; i < childNodes.length; i++) {
                            if(childNodes[i].attributes.propId === defaultPropnode) {
                                target = childNodes[i];
                                target.appendChild(drop);
                                break;
                            }
                        }
                    }
                }
                if(isIn) {
                    ec.do_move(dropId, targetId, null, 'in', this.linker.propertyId);
                } else {
                    ec.do_move(dropId,
                               this.getOMId(target.parentNode),
                               targetId, e.point === 'below' ? 'after' : 'before',
                               this.linker.propertyId);
                }
				//XXX:Possible Bug! It takes feedback b4 but refid is panel if we add just above bbar etc.
				//Thats y you see a small difference sometimes in position of new node.
				/*
				if(isIn) {
					console.log('isIn: ', isIn, '\n', dropId, targetId, null, 'in', this.linker.propertyId);
				} else {
					console.log('isIn: ', isIn, '\n', dropId,
                               this.getOMId(target.parentNode),
                               targetId, e.point === 'below' ? 'after' : 'before',
                               this.linker.propertyId);
				}
				 */
            }
            , contextmenu: function(node, e) {
                e.preventDefault();
                this._contextmenu = new Ext.menu.Menu({
                    //3.0.2 removed id. CAN PUT IN 2.2.1 TOO.
                    items: [{
                        text: 'Delete selections',
                        iconCls: 'icon-delete',
                        hideDelay: 10,
                        handler: function(){
                            this.deleteSelected(node);
                        },
                        scope: this
                    }]
                });
                var sm =  this.getSelectionModel();
                if(!sm.isSelected(node)) {
                    sm.select(node);
                }
                if(node.parentNode.parentNode && node.attributes.config && !this.isBaseComponent(this.getOMId(node))) {
                    this._contextmenu.showAt(e.getXY());
                }
            }
            , scope: this
        }
    });
    sci.ide.ComponentOutline.superclass.constructor.call(this, config);
    this.getSelectionModel().on('selectionChange', function(sm, node) {
        if(!node) return;
        var attributes = node.attributes;
        var config = attributes.config;
        var oe = this.overlayEditor;
		var overlays = null;
		if(attributes.def && attributes.sciId !== null) {
			overlays = oe.extensionContext.getOverlayModelsFor(config, attributes.def, true);
		}
        //Check required as items, bbar, tbar etc have no overlays.
        //Also these properties cant be selected in canvas. So dont need to notify.
        if(overlays) {
            wb.notifySelectionListeners(new sci.ide.OverlaySelectionEvent(this, {
                sciId: config.sciId
                , config: config
                , overlay: overlays["change"] || overlays["insert"]
                , screen: this.screen
                , editor: this.overlayEditor
            }));
        }
    }, this);
    this.addEvents({
        'componentdrop': true
	});
    this.on('componentdrop', this.updateOnDrop, this);
    var wb = sci.ide.WorkbenchMgr;
    wb.registerSelectionListener(this);
    wb.registerPartListener(this);
}

Ext.extend(sci.ide.ComponentOutline, Ext.tree.TreePanel, {
    update: function(config) {
        var root = this.getRootNode();
        root.eachChild(function(child) {
            child.remove();
        }, root);
        var node = this.getNodeFor(config, config.xtype);
        root.appendChild(node);
        root.expand(true);
    }
    , updateOnDrop: function(part) {
        this.update(part.uiConfig.config);
    }
    , deleteSelected: function(node) {
        var extensionContext = this.overlayEditor.extensionContext,
            overlays = extensionContext.getOverlayModelsFor({
                sciId: this.getOMId(node)
            }, null, false);
        for(var p in overlays) {
            extensionContext.removeOverlay(overlays[p], this.getOMId(node));
        }
        //XXX tree could listen to insert event and recreate trees if required.
        sci.ide.WorkbenchMgr.partChanged(extensionContext);
    }
    , getNodeFor: function(config, defid) {
        var def = sci.ide.RegDefObject.get(defid) ||
                  sci.ide.RegDefObject.get('customct');
		var nodeCss = def instanceof sci.ide.cmpdefs.Panel ? 'sc-designer-extn-bold-text' : '';
        var node = new Ext.tree.TreeNode({
            iconCls: def ? def.iconCls : "widgets-controls-custom"
            , text: config.sciId ? config.sciId : '<font color = "red">' + '[unknown component]' + '</font>'
			, cls: nodeCss
            , sciId: config.sciId ? config.sciId : null
			, allowDrag: config.sciId ? true : false
			, allowDrop: config.sciId ? true : false
            , def: def
            , config: config
        });
        var allProps, uiChildren, child, defaultDefid;
        
        if(def instanceof sci.ide.DefContainer) {
            if(def instanceof sci.ide.cmpdefs.GridPanel) {
                // XXX grid column children dont have xtype set. so need to
                // hardcode this here. are there any more similar cases?
                defaultDefid = "grid-column";
            }
			//TODO: checks seem to be increasing. Added separate for toolbar.
            if(def instanceof sci.ide.cmpdefs.Panel || def instanceof sci.ide.cmpdefs.tb.Toolbar) {
                allProps = def.addChildrenAs();
                Ext.each(allProps, function(prop) {
                    if(config[prop]) {
                        var node2 = new Ext.tree.TreeNode({
                            iconCls: 'icon-childProperty'
                            , propId: prop
                            , allowDrag: false
                            , text: prop + ' (' + config.sciId + ')'
							, cls: 'sc-designer-extn-italic-blue-node-txt'
                            , sciId: config.sciId
        //XXX: config or config[prop]
                            , config: config
                        });
                        node.appendChild(node2);
                        uiChildren = config[prop];
                        for(var i = 0; uiChildren && i < uiChildren.length; i++) {
                            child = uiChildren[i];
                            node2.appendChild(this.getNodeFor(child, child.xtype || defaultDefid));
                        }
                    }
                }, this);
            }
        }
        return node;
    }
    , checkContextChange: function(oe, screen) {
        var oldOe = this.overlayEditor,
            extensionContext = oe.extensionContext;
        this.screen = screen;
        if(!oldOe ||
           oe.screenClassName !== oldOe.screenClassName) {
            this.overlayEditor = oe;
            this.update(extensionContext.getUIConfig(screen));
        }
    }
    , selectionChanged: function(event) {
        if(event instanceof sci.ide.OverlaySelectionEvent) {
            var selection = event.selection,
                sciId = selection.sciId,
                overlay = selection.overlay,
                screen = selection.screen,
                overlayEditor = selection.editor,
                sm = this.getSelectionModel();
			//console.log('overlays: ', overlayEditor.extensionContext.overlays);
            this.checkContextChange(overlayEditor, screen);
            var selectedNode;
            this.getRootNode().cascade(function(node) {
                if(node.attributes.sciId === sciId) {
                    selectedNode = node;
                }
                return selectedNode == null;
            });
            sm.suspendEvents();
            sm.clearSelections();
            sm.select(selectedNode);
            sm.resumeEvents();
        }
    }
    , partChanged: function(part) {
        this.update(part.uiConfig.config);
        var screenClassName = this.overlayEditor.screenClassName;
        var parent = this.findParentBy(function(container, compo) {
            return container instanceof Ext.Window;
        });
        if(parent) {
            parent.setTitle(parent.initialConfig.title + ' for ' + screenClassName);
        }
    }
    , getOMDef: function(node) {
        return node.attributes.def;
    }
    , getOMId: function(node) {
        return node.attributes.config.sciId;
    }
    , isBaseComponent: function(sciId) {
        return this.overlayEditor.extensionContext.baseUIConfig.find('sciId', sciId) !== null;
    }
    
});
