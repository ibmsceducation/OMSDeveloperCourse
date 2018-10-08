/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/

Ext.namespace("sci.ide");

sci.ide.ScreenExtension = Ext.extend(sc.plat.ui.EmptyExtension, {
    getConfigOverlays: function() {
        return []
    }
});

// this override must be rechecked in future versions of the program.
sc.plat.ui.ExtensibleScreen.superclass.constructor = function(config) {
    this._constructorConfig = Ext.apply({}, config || {});
    sc.plat.ui.Screen.call(this, config);
}

Ext.override(sc.plat.ui.ExtensibleScreen, {
    getExtendedConfig: function(baseConfig) {
        // original UI config, without extensions applied to it.
        
        if(!this.constructor.prototype.baseUIConfig) {    // cache it only if we dont have it already.
            var baseUIConfig = this.getUIConfig();
            this.constructor.prototype.baseUIConfig = baseUIConfig;
            if(this.sciId) {
                baseUIConfig._original_sciId = baseUIConfig.sciId;
                baseUIConfig.sciId = this.sciId;
            }
        }
        this.extendedUIConfig = sc.plat.overlay.Utils.overlay(baseConfig, this.extension.getConfigOverlays());
        if(this.sciId) {
            baseConfig._original_sciId = baseConfig.sciId;
        }
        return this.extendedUIConfig;
    }
});

sci.ide.ConfigObject = function(config, owner, asProperty) {
    this.config = config;
    this.owner = owner;
    this.asProperty = asProperty;
    
    var cn = this.children = {}, v, id,
        self = this;
    for(var name in config) {
        v = config[name];
        if(Ext.isArray(v)) {    // currently going inside tree.
            cn[name] = {};
            Ext.each(v, function(v) {
                id = v.sciId;
                if(v.sciId) {
                    cn[name][id] = new sci.ide.ConfigObject(v, self, name);
                }
            });
        }
    }
}

Ext.override(sci.ide.ConfigObject, {
    find: function(key, value) {
        var cn = this.children,
            propertyName,
            configObjects,
            sciId,
            child,
            find;
        if(this.config[key] === value) {
            return this;
        }
        for(propertyName in cn) {
            configObjects = cn[propertyName];
            for(sciId in configObjects) {
                child = configObjects[sciId];
                find = child.find(key, value);
                if(find) return find;
            }
        }
        return null;
    }
});

sci.ide.ExtensionContext = Ext.extend(Ext.util.Observable, {
    /**
     * @param screen {json object} the value of "model" property in the .json file of base screen.
     * @param file {}
     * @param config {json object} the json object contained in _extn.json file of extended screen.
     */
    constructor: function(screenClassName, file, config) {
        this.screenClassName = screenClassName;
        this.file = file;
        this.config = config;
        this.context = config;
        this.className = config.extension.className; // must be available.
        sci.ide.ExtensionContext.superclass.constructor.call(this);
        
        // XXX care must be taken to clean/update the cache regularly.
        this.cache = {};
        this.addEvents({
            "change": true
            , "insert": true
        });
        //variable to maintain seeding index of controls in a screen.
        this.idIndex = -1;
        
        this.load(screenClassName, config);
        this.loadExtensionClazz(screenClassName);
    }
    /**
     * Loads extension class definition and registers it to make sure everything
     * is in order.
     */
    , loadExtensionClazz: function(screenClassName) {
        var className = this.className;
        var self = this;
		var existingClazz = null;
        try {
            existingClazz = eval("("+className+")");
        } catch(e) {
            // in case of error default to an ampty function
            existingClazz = function(){};
            console.log("extension class def not found. creating default: ", className);
        }
		// If no error occured, then still default to empty function. This is possible if defaultNamespace.<classname> is defined for some other screen.
		if(Ext.isEmpty(existingClazz)) {
			existingClazz = function(){};
            console.log("extension class def not found. creating default: ", className);
		}
        var clazz;
        if(existingClazz instanceof sc.plat.ui.Extension) {
            clazz = existingClazz;
            Ext.override(clazz, {
                getConfigOverlays: function() {
                    return self.getOverlays(this);
                },
                className: className
            });
        } else {
            clazz = Ext.extend(existingClazz, sci.ide.ScreenExtension, {
                getConfigOverlays: function() {
                    return self.getOverlays(this);
                },
                className: className
            });
        }
        if(clazz) {
            sc.plat.ScreenExtnMgr.add(screenClassName, clazz);
            this.clazz = clazz;
        } else {
            console.error("extension class could not be found for screen: ", screen);
        }
    }
    , refresh: function() {
        this.clearCache();
        if(this.baseUIConfig) {
            this.loadUIConfig(this.baseUIConfig.config);
        }
    }
    /**
     * Finds and optionally creates and retuns overlay defined for a component.
     * Presence of a model object simplifies presence of an unknown component
     * definition.
     */
    , getOverlayModelsFor: function(config, def, createDefault) {
        var id = config._original_sciId || config.sciId;
        var cache = this.cache;
        var forId = cache[id];
        if(!forId) {
            forId = {};
            Ext.each(this.overlays, function(overlay) {
                if(id === overlay.forId()) {
                    forId[overlay.def.op] = overlay;
                }
            });
            cache[id] = forId;
        }
        // default has to be created only if its not an insert and needs to be
        // changed
        if(!forId["insert"] && !forId["change"] && createDefault) {
            forId["change"] = this.createOverlay_change(id, def);
        }
        return cache[id];
    }
    // here we need to provide easy way to perform operation that we would
    // support in the workbench. operation that we support are to:
    //  1. change
    //  2. insert
    //  3. move
    // our aim should be to create utility funtions for performing these
    // operations. for each type of operation, we will need specific function
    // arguments.
    , createOverlay_change: function(sciId, def) {
        var overlay = new sci.ide.Overlay({
            op: "change"
            , sciId: sciId
            , config: {
                defid: def.id
            }
        }, this);
        this.overlays.push(overlay);
        return overlay;
    }
    , getConfigDefid: function(config) {
        var defid = config.defid || config.xtype;
        return defid;
    }
    , getOverlaySciId: function(currOverlay) {
        var sciId = currOverlay.get('sciId') ? currOverlay.get('sciId') : (currOverlay.get('config') ? currOverlay.get('config').getName() : currOverlay.get('remove').sciId);
        return sciId;
    }
    //XXX: see if its required to keep "idToIgnore"- maybe as it saves extra overlay 
    //XXX: being generated for an existing component that is being moved.
    //XXX: ie it avoids presence of 1 overlay twice.
    //XXX: Also, if child.sciId doesnt exist, then it ignores the component.
    , getChildSciIds: function(owner, property, idToIgnore) {
        var children = owner.config[property],
            sciIdArray = [];
        if(children) {
            for(var i = 0; i < children.length; i++) {
                var child = children[i];
                if(idToIgnore && idToIgnore === child.sciId) {
                    continue;
                } else if(Ext.isEmpty(child.sciId)){
                    continue;
                } else {
                    sciIdArray.push(child.sciId);
                }
            }
        }
        this.owner = owner;
        return sciIdArray;
    }
    , isDeNormalized: function(sciIdArray) {
        // XXXperformance check
        var overlays_sciId, move, insert;
        this.clearCache();
        for(var i = 0, len = sciIdArray.length; i < len; i++) {
            var sciId = sciIdArray[i];
            overlays_sciId = this.getOverlayModelsFor({
                sciId: sciId
            }, null, false);
            move = overlays_sciId['move'];
            insert = overlays_sciId['insert'];
            if(!move && !insert) {
                return false;
            }
            if(move && move.get('insert') && move.get('insert').pos !== 'in') {
                return false;
            }
            if(insert && insert.get('pos') !== 'in') {
                return false;
            }
        }
        return true;
    }
    , deNormalize: function(sciIdArray, currOwnerCompo, currOwnerId) {
        // XXXperformance check
        //overlayArray contains all overlays incl "change"
        //arrangedOverlayArray includes only "inserts" and "moves"
        var overlays = this.overlays,
            overlayArray = [],
            arrangedOverlayArray = new Array(sciIdArray.length),
            insertsAndMoves = [],
            length = overlays.length,
            j = 0;
        while(j < length) {
            var overlaySciId = this.getOverlaySciId(overlays[j]);
            var operation = overlays[j].def.op;
            for(var i = 0; i < sciIdArray.length; i++) {
                if(overlaySciId === sciIdArray[i]) {
                    //(operation !== 'insert')
                    overlayArray.push(overlays[j]);
                    if(operation !== 'change') {
                        insertsAndMoves.push(sciIdArray[i]);
                        overlays.splice(j, 1);
                        length --;
                        j--;
                    }
                }
            }
            j++;
        }
        for(var i = 0; i < sciIdArray.length; i++) {
            for(var j = 0; j < overlayArray.length; j++) {
                var overlaySciId = this.getOverlaySciId(overlayArray[j]);
                if(sciIdArray[i] === overlaySciId) {
                    if(overlayArray[j].def.op !== 'change') {
                        arrangedOverlayArray[i] = overlayArray[j];
                    } else if(!insertsAndMoves.has(sciIdArray[i])) {
                        arrangedOverlayArray[i] = overlayArray[j];
                    }
                }
            }
        }
        arrangedOverlayArray.reverse();
        sciIdArray.reverse();
        Ext.each(arrangedOverlayArray, function(eachOverlay, index) {
            if(eachOverlay.def.op === 'change') {
                var insertConfig = {
                    ownerId: currOwnerId
                    , property: currOwnerCompo.find('sciId', sciIdArray[index]).asProperty
                    , refId: /*currOwnerId*/undefined
                    , pos: 'in'
                };
                var currOverlay = this._createOverlay_move(insertConfig, sciIdArray[index]);
                this.overlays.splice(0, 0 , currOverlay);
            } else {
                if(eachOverlay.def.op == 'move') {
                    eachOverlay.get('insert').pos = 'in';
                    eachOverlay.get('insert').refId = undefined;
                } else {
                    eachOverlay.set('pos', 'in');
                    eachOverlay.set('refId', undefined);
                }
                this.overlays.splice(0, 0, eachOverlay);
            }
        }, this);
        
        //return arrangedOverlayArray;
    }
    , createOverlay_insert: function(insertConfig, model, notify) {
        var refId = insertConfig.refId,
            overlay,
            refOverlay;
        //XXX: common stuff between insert and move
        //------            
        var ownerId = insertConfig.ownerId;
        var currOwnerCompo = this.uiConfig.find('sciId', ownerId);
        if(!currOwnerCompo && this.uiConfig.config.sciId === ownerId) {
            //if compo is added with parent as screen.
            currOwnerCompo = this.uiConfig;
        }
        var sciIdArray = this.getChildSciIds(currOwnerCompo, insertConfig.property);
        if(!this.isDeNormalized(sciIdArray)) {
            sciIdArray.remove(model.getValue('sciId'));
            this.deNormalize(sciIdArray, currOwnerCompo, ownerId);
        }
        
        var overlays = this.overlays;
        //------
        overlay = new sci.ide.Overlay({
            op: 'insert'
            , pos: 'in'
            , ownerId: insertConfig.ownerId
            , property: insertConfig.property
        }, this);
        overlay.set('config', model);
        //------
        var index;
        for(index = 0, len = overlays.length; index < len; index++) {
            refOverlay = overlays[index];
            if(refOverlay.def.op == 'move') {
                if(refId === refOverlay.get('remove').sciId) {
                    index += insertConfig.pos === 'before' ? 0 : 1;
                    break;
                }
                
            } else if(refOverlay.def.op == 'insert') {
                if(refId === refOverlay.get('config').getValue('sciId')) {
                    index += insertConfig.pos === 'before' ? 0 : 1;
                    break;
                }
            }
        }
        overlays.splice(index, 0, overlay);
        //------
        // XXXperformance check refresh intelligently so that we dont need to
        // recompute ui config everytime
        this.refresh();
        if(notify !== false) {
            this.fireEvent('insert', overlay, this);
        }
        return overlay;
    }
    // XXX move may not be used in this manner. instead, from usage perspective,
    // i would like to call a function to perform move rather than getting an
    // overlay object.
    , createOverlay_move: function(insertConfig, sciId, notify) {
        //XXX: common stuff between insert and move
        //------
        var ownerId = insertConfig.ownerId,
            refId = insertConfig.refId;
        var currOwnerCompo = this.uiConfig.find('sciId', ownerId);
        if(!currOwnerCompo && this.uiConfig.config.sciId === ownerId) {
            //if compo is added with parent as screen.
            currOwnerCompo = this.uiConfig;
        }
        var sciIdArray = this.getChildSciIds(currOwnerCompo, insertConfig.property, sciId);
        if(!this.isDeNormalized(sciIdArray)) {
            this.deNormalize(sciIdArray, currOwnerCompo, ownerId);
        }
        
        var overlays = this.overlays;
        //------
        var index;
        for(index = 0, len = overlays.length; index < len; index++) {
            refOverlay = overlays[index];
            if(refOverlay.def.op == 'move') {
                if(refId === refOverlay.get('remove').sciId) {
                    index += insertConfig.pos === 'before' ? 0 : 1;
                    break;
                }
                
            } else if(refOverlay.def.op == 'insert') {
                if(refId === refOverlay.get('config').getValue('sciId')) {
                    index += insertConfig.pos === 'before' ? 0 : 1;
                    break;
                }
            }
        }
        insertConfig.pos = 'in';
        insertConfig.refId = undefined;
        var overlay = this._createOverlay_move(insertConfig, sciId);
        overlays.splice(index, 0, overlay);
        //------
        this.refresh();
        this.fireEvent('insert', overlay, this);
        //Not used notify.
        if(notify !== false) {
        }
        return overlay;
    }
    , _createOverlay_move: function(insertConfig, sciId) {
        var config = this.baseUIConfig.find('sciId', sciId);
        var removeConfig = {
            ownerId: config.owner.config.sciId
            , property: config.asProperty
            , sciId: sciId
        };
        
        var overlay = new sci.ide.Overlay({
            op: 'move',
            remove: removeConfig,
            insert: insertConfig
        });
        return overlay;
    }
    //XXX: dont need to move child components if parent is moved.
    , do_move: function(sciId, ownerId, refId, pos, addAsProp, notify) {
        var overlay = this.getOverlayModelsFor({
            sciId: sciId
        }, null, false);
        var insertConfig = {
            ownerId: ownerId
            , property: addAsProp
            , refId: refId
            , pos: pos
        };
        if(overlay['insert']) {
            var overlayInsert = overlay['insert'], overlays = this.overlays, length = overlays.length;
            for(var i = 0; i < length; i++) {
                if(overlayInsert === overlays[i]) {
                    overlays.splice(i, 1);
                    break;
                }
            }
            this.createOverlay_insert(insertConfig, overlayInsert.properties.config, notify);
        } else {
            if(overlay['move'] != null) {
                this.overlays.remove(overlay['move']);
            }
            this.createOverlay_move(insertConfig, sciId, notify);
        }
    }
    , removeOverlay: function(overlay, sciId, notify) {
        //get all overlays & remove the ones that have ownerId === sciId.
        //changing refId not required as only removing extended components is allowed.
        var childOverlays = [];
        var overlays = this.overlays;
        var length = overlays.length;
        //XXX: create util function to get all overlays overlays having specified ownerId.
        for(var i = 0; i < length; i++) {
            if(overlays[i].def.op === 'move') {
                if(overlays[i].properties.insert.ownerId === sciId) {
                    childOverlays.push(overlays[i]);
                }
            } else if(overlays[i].def.op === 'insert') {
                if(overlays[i].properties.ownerId === sciId) {
                    childOverlays.push(overlays[i]);
                }
            }
        }
        //XXX: make it better performance-wise.
        childOverlays.push(overlay);
        for(var i = 0; i < childOverlays.length; i++) {
            var currId = this.getOverlaySciId(childOverlays[i]);
            var currConfig = this.uiConfig.find('sciId', currId);
            var props = ['items', 'columns', 'buttons', 'tbar', 'bbar'];
            var sciIdArray = [];
            //XXX: remove current overlay 1st bcos if its a gridpanel, then removing all cols gives errors.
            //XXX: hopefully deeply nested component deletion would not give errors.
            overlays.remove(childOverlays[i]);
            //if(new sci.ide.ObjectModel(currConfig.xtype).def instanceof sci.ide.DefContainer) {
                for(var j = 0; j < props.length; j++) {
                    Ext.each(this.getChildSciIds(currConfig, props[j]), function(sciId) {
                        sciIdArray.push(sciId);
                    }, this);
                }
                Ext.each(sciIdArray, function(sciId) {
                    var overlayz = this.getOverlayModelsFor({
                        sciId: sciId
                    }, null, false);
                    for(p in overlayz) {
                        if(p !== 'change') {
                            this.removeOverlay(overlayz[p], sciId, false);
                        }
                    }
                }, this);
            //}
        }
        if(notify !== false) {
            this.refresh();
        }
        this.fireEvent('insert', overlay, this);
    }
    , getConfigObject: function(sciId) {
        return this.uiConfig.find('sciId', sciId);
    }
    /**
     * returns a json object representing the final UI config for a screen.
     */
    , getUIConfig: function(screen) {
        var config = sci.ide.Utils.copy(this.baseUIConfig.config);
        return sc.plat.overlay.Utils.overlay(config, screen.extension.getConfigOverlays());
    }
    /**
     * This is usually a one time setup process. Wheenver an opportunity is
     * found to load UI config for a screen, call this function to create and
     * cache config and corresponding default overlay values.
     */
    , loadBaseUIConfig: function(screen) {
        var baseUIConfig = screen.baseUIConfig;
        var cached_objects = [];
        var config = sci.ide.Utils.copy(baseUIConfig, {}, function(o) {
            // in case of a possible cycle, returning a dummy object
            if(Ext.type(o) == 'object') {
                if(o.constructor !== Object) return {};
                if(cached_objects.has(o)) return {};
                cached_objects.push(o);
                return false;
            }
            return o === screen ? {} : false;
        });
        // TODO create a object representing config object and relationship
        // between its properties and values
        if(config._original_sciId) {
            config.sciId = config._original_sciId;
        }
        this.baseUIConfig = new sci.ide.ConfigObject(config);
        this.loadUIConfig(config);
        this.clearCache();
        this.cacheOverlays(config, this.getConfigDefid(config));
        this.init_idIndex(this.baseUIConfig);
    }
    , loadUIConfig: function(config) {
        config = sci.ide.Utils.copy(config);
        this.uiConfig = new sci.ide.ConfigObject(sc.plat.overlay.Utils.overlay(config, this.getOverlays()));
        this.init_idIndex(this.uiConfig);
    }
    , clearCache: function() {
        this.cache = {};
    }
    /**
     * caches (and creates if required) overlay definitions for a config.
     */
    , cacheOverlays: function(componentConfig, defid) {
        // TODO load default overlay definitions now.
        var def = sci.ide.RegDefObject.get(defid) ||
                  sci.ide.RegDefObject.get('customct');
        this.getOverlayModelsFor(componentConfig, def, true);
        var uiChildren = [], child, defaultDefid;
        
        if(def instanceof sci.ide.DefContainer) {
            if(def instanceof sci.ide.cmpdefs.GridPanel) {
                // XXX grid column children dont have xtype set. so need to
                // hardcode this here. are there any more similar cases?
                defaultDefid = "grid-column";
            }
            var children = def.addChildrenAs();
            Ext.each(children, function(child) {
                if(componentConfig[child]) {
                    Ext.each(componentConfig[child], function(component) {
                        if(component.sciId) {
                            uiChildren.push(component);
                        }
                    });
                }
            });
            for(var i = 0; uiChildren && i < uiChildren.length; i++) {
                child = uiChildren[i];
                this.cacheOverlays(child, this.getConfigDefid(child) || defaultDefid);
            }
        }
    }
    /**
     * Utility function to create and load screen overlays for a screen and its
     * extension. Its puprpose would be to dynamically reflect the extension
     * values in a screen construction.
     */
    , getOverlays: function(scope) {
        // TODO create and return the extension context
        var final_overlays = [];
        Ext.each(this.overlays, function(overlay, index) {
            final_overlays[index] = overlay.toObj();
        });
        return final_overlays;
    }
    /**
     * reads and loads screen extension definition for from extension metadata.
     */
    , load: function(screenClassName, config) {
        // TODO load extension definition from the loaded config object.
        var cache = this.cache;
        var self = this;
        this.context = config;
		this.context._verificationText = this.context._verificationText || 'VerificationText';
        this.extension = config.extension || {};
        if(screenClassName !== this.extension.screenClassName) {
            throw "Incorrect extension being applied to the screen.";
        }
        
        var overlays = this.extension.overlays || [];
        delete this.extension.overlays;
        
        var os = this.overlays = [];
        Ext.each(overlays, function(overlay, index, array) {
            overlay = new sci.ide.Overlay(overlay, self);
            os[index] = overlay;
            var id = overlay.forId();
            if(!cache[id]) {
                cache[id] = {};
            }
            cache[id][overlay.def.op] = overlay;
        });
    }
    /**
     * serializes extension and its context to a string.
     */
    , toSrc: function() {
        var arrey_src = [];
        var o = Ext.apply({}, this.context);
        var extension = Ext.apply({}, o.extension);
        delete o.extension;
        
        for(var name in o) {
            arrey_src.push(name + ":" + Ext.encode(o[name]));
        }
        var arrey_overlays_src = [];
        
        this.normalize(this.baseUIConfig);
        
        Ext.each(this.overlays, function(overlay){
            arrey_overlays_src.push(overlay.toSrc());
        });
        
        var arrey_extension_src = [],
            extension = this.extension;
        for(var name in extension) {
            arrey_extension_src.push(name + ":" + Ext.encode(extension[name]));
        }
        arrey_extension_src.push('overlays:' + '['+ arrey_overlays_src.join(',')+']');
        arrey_src.push('extension:' + '{'+ arrey_extension_src.join(',')+'}');
        return '{' + arrey_src.join(',') +'}';
    }
    //XXX: Change approach to 1st normalize all parents...next children and so on...
    , normalize: function(config) {
        //console.log('config: ', config);
        var children = config.children;
        for(var propertyName in children) {
            var childConfigs = children[propertyName];
            
            var originalSciIds = this.getSciIds(childConfigs);
            //XXX: Change the way we determine modified sciIds. As its possible that a move overlay for a child may be removed in a normalized parent. Have put a check but look for better options. But have commented it out now.
            var modifiedSciIds = this.getModifiedSciIds(config, propertyName);
            var remainingSciIds = this.getCommonEntries(originalSciIds, modifiedSciIds);
            //console.log(modifiedSciIds, remainingSciIds);
            var unorderedIndex = [];
            Ext.each(remainingSciIds, function(aSciId) {
                unorderedIndex.push(originalSciIds.indexOf(aSciId));
            });
            var unmovedOriginalIndexes = this.getLongestSequence(unorderedIndex);
            var unmovedOriginalSciIds = [];
            Ext.each(unmovedOriginalIndexes, function(index) {
                unmovedOriginalSciIds.push(originalSciIds[index]);
            });
            this.arrangeOverlays(unmovedOriginalSciIds, modifiedSciIds);
            
            for(var sciId in childConfigs) {
                var childConfig = childConfigs[sciId];
                var isEmpty = this.isEmptyObject(childConfig.children);
                if(!isEmpty) {
                    if(childConfig.children) {
                        this.normalize(childConfig);
                    }
                }
            }
        }
    }
    , arrangeOverlays: function(unmovedOriginalSciIds, modifiedSciIds) {
        //remove all "change" overlays from "this.overlays" in "modifiedSciIds"
        var overlays = this.overlays,
            referenceIndex = unmovedOriginalSciIds.length === 0 ?
                             -1 : modifiedSciIds.indexOf(unmovedOriginalSciIds[0]),
            unmovedSciIdIndex = 0;
        var lastUnmovedIndex = unmovedOriginalSciIds.length === 0 ?
                                -1 : modifiedSciIds.indexOf(unmovedOriginalSciIds[unmovedOriginalSciIds.length - 1]);
        // TODO handle
        Ext.each(modifiedSciIds, function(sciId, currIndex) {
            var overlayz = this.getOverlayModelsFor({
                sciId: sciId
            }, null, false);
            if(overlayz['change'] && this.isEmptyObject(overlayz['change'].properties.config.props)) {
                overlays.remove(overlayz['change']);
            }
            if(referenceIndex == -1) {
                return;
            }
            if(currIndex >= referenceIndex) {
                unmovedSciIdIndex += 1;
                referenceIndex = modifiedSciIds.indexOf(unmovedOriginalSciIds[unmovedSciIdIndex]);
            }
            if(unmovedOriginalSciIds.has(sciId)) {
                if(overlayz['move']) {
                    overlays.remove(overlayz['move']);
                }
            } else if(currIndex > lastUnmovedIndex) {
                if(overlayz['move']) {
                    overlayz['move'].properties.insert.pos = 'in';
                    delete overlayz['move'].properties.insert['refId'];
                } else if(overlayz['insert']) {
                    overlayz['insert'].properties.pos = 'in';
                    delete overlayz['insert'].properties['refId'];
                }
            } else if(currIndex < referenceIndex) {
                var refId = modifiedSciIds[referenceIndex];
                if(overlayz['move']) {
                    overlayz['move'].properties.insert.pos = 'before';
                    overlayz['move'].properties.insert.refId = refId;
                } else {
                    overlayz['insert'].properties.pos = 'before';
                    overlayz['insert'].properties.refId = refId;
                }
            }
        }, this);
    }
    //MOVE isEmpty() TO UTILS.
    , isEmptyObject: function(obj) {
        var isEmpty = true;
        for(var p in obj) {
            isEmpty = false;
            break;
        }
        return isEmpty;
    }
    , getSciIds: function(childConfigs) {
        var sciIdArray = [];
        for(var sciId in childConfigs) {
            sciIdArray.push(sciId);
        }
        return sciIdArray;
    }
    , getModifiedSciIds: function(config, propertyName) {
        var configComponent = this.uiConfig.find('sciId', config.config.sciId);
        var sciIdArray = [], children = configComponent.children;
        sciIdArray = this.getSciIds(configComponent.children[propertyName]);
        return sciIdArray;
    }
    , getCommonEntries: function(originalArrey, modifiedArrey) {
        var commonEntries = [];
        Ext.each(modifiedArrey, function(sciId) {
            for(var i = 0; i < originalArrey.length; i++) {
                if(sciId === originalArrey[i]) {
                    commonEntries.push(sciId);
                    break;
                }
            }
        });
        return commonEntries;
    }
    , getLongestSequence: function(a) {
        var iArray = [];
        for(var i = 0; i < a.length; i++) {
            var kArray;
            for(var j = i + 1; j < a.length; j++) {
                kArray = [a[i]];
                if(a[j] > a[i]) {
                    kArray.push(a[j]);
                }
                for(var k = j + 1; k < a.length; k++) {
                    if(a[k] > kArray[kArray.length - 1]) {
                        kArray.push(a[k]);
                    }
                }
                iArray.push(kArray);
            }
        }
        var maxLength = 0, index = 0;
        for(var p = 0; p < iArray.length; p++) {
            if(iArray[p].length > maxLength) {
                maxLength = iArray[p].length;
                index = p;
            }
        }
        return iArray.length > 0 ? iArray[index] : iArray;
    }
    
    , toOverlaySrc: function() {
        var arrey_src = [];
        Ext.each(this.overlays, function(overlay) {
            arrey_src.push(overlay.toJSSrc());
        });
        return '[' + arrey_src.join(',') +']';
    }
    , init_idIndex: function(currentConfig) {
        var cn = currentConfig.children;
        var getIndexStr = sci.ide.Utils.getIndexStr;
        var idIndex;
        for(var propertyName in cn) {
            var configObjects = cn[propertyName];
            for(var sciId in configObjects) {
                var child = configObjects[sciId];
                idIndex = getIndexStr(child.config.sciId);
                if(!Ext.isEmpty(idIndex)) {
                    idIndex = parseInt(idIndex);
                }
                if(idIndex > this.idIndex) {
                    this.idIndex = idIndex;
                }
                this.init_idIndex(child);
            }
        }
    }
    , genId: function(seed) {
        return seed + (++this.idIndex);
    }
    /*, isNew: function(sciId) {
        var overlays = this.getOverlayModelsFor({
            sciId: sciId
        }, null, false);
        return overlays.insert != null;
    }*/
});


/**
 * Oversees overlay editing related functions for a screen.
 */
sci.ide.OverlayEditor = function(screenClassName) {
    this.screenClassName = screenClassName;
    sci.ide.OverlayEditor.superclass.constructor.call(this);
    this.addEvents({
        change: true
    });
    this.loadScreenMetadata(screenClassName);
};
Ext.extend(sci.ide.OverlayEditor, Ext.util.Observable, {
    loadExtension: function(screen) {
        if(!this.extensionContext) {
            this.resolveExtensionClass(screen);
        }
        if(this.extensionContext) {
            this.extensionContext.loadBaseUIConfig(screen);
        }
        return this.hasExtension();
    }
    , hasExtension:function() {
        return this.extensionContext != null;
    }
    // recreates the current screen. should be used when a component cannot be
    // recreated without recreating the whole screen.
    , recreateScreen: function(screen) {
        var startTime = new Date().getTime();

        var oldScreenId = screen.screenId;
        var constructorConfig = screen._constructorConfig;
        // we need to remove the screen manually since the destroy event is not
        // fired
        sc.plat.ScreenMgr.removeKey(oldScreenId);
        this.recreateComponent(screen, constructorConfig);
        console.log("time taken to recreate screen (in ms): ", 
                     new Date().getTime() - startTime);
    }
    /**
     * recreates the component found in the screen.
     */
    , recreateComponent: function(component, config) {
        var ownerCt = component.ownerCt;
        var componentEl = component.getEl();
        //var dom = component.getEl().dom;
        //var parentDom = dom.parentNode;
        var items = component.items;
        
        config = config || component.initialConfig;

        //var componentId = component.getId();
        //config.id = componentId;
        
        // fix the size of the old element so that existing layout is not messed
        if(!Ext.isEmpty(componentEl))
            componentEl.setSize(componentEl.getWidth(), componentEl.getHeight());
        
        // destroy immediate children
        if(items) {
            while(items && items.getCount() > 0) {
                component.remove(items.get(0), true);
            }
        }
        for(var name in component) {
            delete component[name];
        }
        // this is valid for cases where we follow the standard way of passing
        // config options
        component.constructor.call(component, config);
        
        // render component to 
        component.render(Ext.get("designer-extn-componentfactory"));
        if(!Ext.isEmpty(componentEl))
        	componentEl.replaceWith(component.getEl());
        // XXX do we need to update the parent's references to reflect the changes.
        // because of certain events, this component might have been removed from 
        // the parent? Need to test this thoroughly.
    }
    , resolveExtensionClass: function(screen) {
        var clazz, context;
        var self = this;
        var screenClassName = this.screenClassName,
            extension = sc.plat.ScreenExtnMgr.extensions.get(screenClassName);
        if(extension) {
            if(extension.superclass === sci.ide.ScreenExtension) {
                // nothing to do. the extension was created and loaded by
                // extensibility workbench.
            } else {
                // extension_src should have been found by now. if not found,
                // its an error case
                var metadata = this.loadExtesionMetadata(extension.prototype.className);
                if(!metadata[1]) {
                    sci.ide.LibraryMgr.init();
                    metadata = this.loadExtesionMetadata(extension.prototype.className);
                }
                this.createExtensionContext(screenClassName, metadata[0], metadata[1]);
            }
        } else {
            // no extension has been registered need to create a new one.
            this.createNewExtension(screenClassName, screen);
        }
    }
    /**
     * creates extension context
     */
    , createExtensionContext: function(screenClassName, file, config) {
        // TODO Try to find the clazz name from config model. If not found
        // create a new one else use the same one.
        var oldCtx = this.extensionContext;
        if(oldCtx) {
            oldCtx.un("change", this.onChange, this);
            oldCtx.un("insert", this.onInsert, this);
        }
        this.extensionContext = new sci.ide.ExtensionContext(screenClassName, file, config);
        this.extensionContext.on("change", this.onChange, this);
        this.extensionContext.on("insert", this.onInsert, this);
        return this.extensionContext;
    }
    , onChange: function() {
        this.fireEvent("change", this);
    }
    , onInsert: function() {
        this.fireEvent("insert", this);
    }
    , loadExtesionMetadata: function(extensionClassName) {
        var o,
            f,
            name,
            extension_src,
            resources = sci.ide.LibraryMgr.findMappedResourcesInExtns(/\.js$/);
            files = resources.extnFiles;
        if(files.length === 0) {
            return [];
        }
        for(var i = 0, len = files.length; i < len;i++) {
            name = files[i].name;
            f = files[i].getParent().
                getFile(name.substring(0, name.lastIndexOf(".")) + ".json");
            if(!f.exists()) {
                continue;
            }
            try {
                o = Ext.decode(f.read());
            } catch(e) {
                //ignore... bad file content
            }
            if(o &&
               o.type === "SCREEN_EXTENSION" &&
               o.extension.className === extensionClassName) {
                extension_src = o;
                break;
            }
        }
        return [f, extension_src];
    }
    , loadScreenMetadata: function(className) {
        var o,
            f,
            name,
            src,
            files = sci.ide.LibraryMgr.findMappedResources(/\.js$/);
        //Ext.isEmpty() also checks for empty array in 3.0. Hence checking for undefined or null.
        if(files != null){
            for(var i = 0, len = files.length; i < len;i++) {
                name = files[i].name;
                f = files[i].getParent().
                    getFile(name.substring(0, name.lastIndexOf(".")) + ".json");
                if(!f.exists()) {
                    continue;
                }
                try {
                    o = Ext.decode(f.read());
                } catch(e) {
                    //ignore... bad file content
                }
                if(o &&
                   o.type === "SCREEN" &&
                   o.model.className.value === className) {
                    src = o;
                    break;
                }
            }            
        } else {
            alert('No mapped resources found.');
        }
        if(src) {
            this.screenFile = f;
            this.screenContext = sci.ide.Utils.readCode(src, true);
        }
    }
    , pref: new sci.ide.Preference({
        id: 'overlay-files'
    })
    , getFileFromPreference: function(screenClassName) {
        var value = this.pref.getValue();
        if(value) {
            try {
                return Ext.decode(value)[screenClassName];
            } catch(e) {
                //ignore
            }
        }
        return null;
    }
    , setFilePreference: function(screenClassName, filepath) {
        var pref = this.pref;
        var value = pref.getValue();
        if(value) {
            try {
                value = Ext.decode(value);
            } catch(e) {
                //ignore
            }
        }
        if(!value) {
            value = {};
        }
        value[screenClassName] = filepath;
        pref.setValue(Ext.encode(value));
    }
    , createNewExtension: function(screenClassName, screen) {
        var win,
            self = this;
        var osi = sci.ide.OS.getInterface();
        function loadExtensionFile(file) {
            var extension_src;
            if(file.exists()) {
                // TODO add validations for file contents that we may override.
                var src = file.read().trim();
                if(src.length > 0) {
                    try {
                        extension_src = Ext.decode(src);
                        // validations for a valid file
                        var type = extension_src.type,
                            old_screenClassName = extension_src.extension ? extension_src.extension.screenClassName : null;
                        if("SCREEN_EXTENSION" !==  type || screenClassName !== old_screenClassName) {
                            if(!confirm("Selected file contains source that does not match with the current screen.\n"+
                                        "Click \"OK\" to overwrite old contents or \"Cancel\" to choose a different file.\n\n" +
                                        "Adding extension for screen: " + screenClassName + "\n"+
                                        "Values in chosen file:\n" +
                                        "Type: " + type + "\n" +
                                        "Extension for screen: " + old_screenClassName
                                       )
                              ) {
                                return false;
                            } else {
                                extension_src = undefined;
                            }
                        }
                    } catch(e) {
                        console.error("File does not contain valid JSON source.", e);
                    }
                }
            } else {
                console.log("File does not exist.", file.path);
            }
            if(!extension_src) {
                var contextRoot = sci.ide.PreferenceMgr.getValue("contextroot");
                var path = file.path, fileSep = osi.FILE_SEP;
                var namespace = '';
                if(contextRoot) {
                    contextRoot = contextRoot.replace(':', '');
                    path = path.replace(':', '');
                    var contextRootArray = contextRoot.split(fileSep);
                    var filePathArray = path.split(fileSep);
                    filePathArray.pop();
                    var nameSpaceArray = [], i;
                    for(i = 0; i < contextRootArray.length; i++) {
                        if(filePathArray[i] && filePathArray[i] === contextRootArray[i]) {
                            continue;
                        } else {
                            break;
                        }
                    }
                    if(contextRootArray.length > filePathArray.length) {
                        nameSpaceArray.push('defaultNamespace');
                    } else {
                        for(var j = i ; j < filePathArray.length; j++) {
                            nameSpaceArray.push(filePathArray[j]);
                        }
                    }
                    namespace = nameSpaceArray.join('.');
                } else {
                    console.log('contextRoot not found.');
                    return false;
                }
                
                console.log("Created new extension with default contents.");
                namespace = Ext.isEmpty(namespace) ? 'defaultNamespace' : namespace;
                extension_src = self.createDefaultExtension(screenClassName, namespace);
            }
            self.createExtensionContext(screenClassName, file, extension_src).loadBaseUIConfig(screen);
            return true;
        }
        // try and get previously chosen file and load it.
        var prefFile = osi.getFile(this.getFileFromPreference(screenClassName));
        if(prefFile && prefFile.exists() && !prefFile.isDir) {
            if(loadExtensionFile(prefFile)) {
                return;
            }
        }
        function onOk() {
            var file = osi.getFile(sci.ide.PreferenceMgr.getValue('projectpath'), textfield.getValue());
            // TODO check file name's consistency
            if(!/.json$/i.test(file.name)) {
                alert("Entered file must end with json extension.");
                return;
            }
            loadExtensionFile(file);
            self.setFilePreference(screenClassName, file.path);
            win.close();
        }
        
        var textfield = new Ext.form.TextField({
            width: 325
            , listeners: {
                change: function() {
                    // TODO show info to the user when text is changed.
                }
            }
        });
        win = new Ext.Window({
            title: 'Add extension file for screen: ' + screenClassName
            , designer_id: 'id-extensibility-wb-add-extension-win'
            , layout: 'fit'
            , plain: true
            , width: 500
            , height: 200
            , modal: true
            , manager: sci.ide.DialogGroup
            , stateId: 'extn-wb-screen_overlay_editor-add-extension-file-win'
            , items: [{
                xtype: "panel"
                , layout:  "table"
                , layoutConfig: {
                    columns: 3
                }
                , items: [{
                    xtype: "label"
                    , text: "Extension file: "
                }, textfield, {
                    xtype: "button"
                    , text: "..."
                    , handler: function() {
                        new sci.ide.ProjectFileDialog({
                            callback: (function(path) {
                                if(!Ext.isEmpty(path)) {
                                    textfield.setValue(path);
                                }
                            }).createDelegate(this)
                            , relativeToDir: sci.ide.PreferenceMgr.getValue('projectpath')
                            , filter: /\.json$/
                        }).show();
                    }
                }]
            }]
            , buttons: [{
                text: "OK"
                , handler: onOk
            }, {
                text: "Cancel"
                , handler: function() {
                    win.close();
                }
            }]
        });
        win.show();
    }
    , createDefaultExtension: function(screenClassName, namespace) {
        // XXX How to get a good default value for namespace?
        var className = namespace +
                        screenClassName.substring(screenClassName.lastIndexOf(".")) +
                        "Extension";
        return {
            "type": "SCREEN_EXTENSION"
            , "version": "0.0.1"
            , "extension": {
                "screenClassName": screenClassName
                , "className": className
                , "overlays":[]
            }
			, "_verificationText": "VerificationText"
        }
    }
});
