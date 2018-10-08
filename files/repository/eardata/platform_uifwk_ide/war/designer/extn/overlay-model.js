/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/
Ext.namespace("sci.ide");


/**
 * An object holding an overlay's properties.
 */
sci.ide.Overlay = function(overlay, owner) {
    this.properties = {};
    this.load(overlay);
    this.addEvents({
        "change": true
    })
    this.owner = owner;
    this.on("change", this.notifyParent, this);
};

Ext.extend(sci.ide.Overlay, Ext.util.Observable, {
    load: function(config) {
        var def = this.def = sci.ide.Overlay.OP[config.op];
        if(def) {
            this.properties = def.load(config, this);
        } else {
            console.error("overlay type not found. config: ", config);
        }
    }
    , get: function(propertyId) {
        return this.properties[propertyId];
    }
    , set: function(propertyId, value) {
        var oldValue = this.properties[propertyId];
        // TODO cleanup old object and its associated listeners
        this.properties[propertyId] = value;
    }
    , notifyParent: function(model) {
        if(this.owner) {
            this.owner.fireEvent("change", this);
        }
    }
    /**
     * returns an object representation of the overlay object
     */
    , toObj: function(scope) {
        var o = this.def.toObj(this.properties, scope);
        return o;
    }
    , toSrc: function() {
        return this.def.toSrc(this.properties);
    }
    , toJSSrc: function() {
        var def = this.def;
        if(typeof def.toJSSrc === 'function') {
            return def.toJSSrc(this.properties);
        } else {    // XXX only for time-being, eventually should be refactored
            return def.toSrc(this.properties);
        }
    }
    , forId: function() {
        return this.def.forId(this.properties);
    }
});


// overlay definitions
sci.ide.Overlay.OP = {};
sci.ide.Overlay.OP["change"] = {
    //property definitions required for editing an overlay definition.
    op: "change"
    , properties: {
        "sciId": Ext.applyIf({
        }, sci.ide.DefProperty)
        , "config":  Ext.applyIf({
            type: "config"
        }, sci.ide.DefProperty)
    }
    , forId: function(properties) {
        return properties.sciId;
    }
    , load: function(config, owner) {
        var model_extn = new sci.ide.ObjectModelExtn(config.config, config.sciId);
        model_extn.on("change", function(){
            owner.fireEvent("change", model_extn);
        });
        return {
            sciId: config.sciId
            , config: model_extn
        };
    }
    , toObj: function(properties, scope) {
        return Ext.applyIf({
            op: "change"
            , config: properties.config.toObj(scope)
        }, properties);
    }
    , toSrc: function(properties) {
        var arrey_src = [];
        var o = Ext.apply({
            op: "change"
        }, properties);
        delete o.config;
        for(var name in o) {
            arrey_src.push(name+ ':' +Ext.encode(o[name]));
        }
        arrey_src.push("config:" + Ext.encode(properties.config.toSrc()));
        return "{" + arrey_src.join(",") + "}";
    }
    , toJSSrc: function(properties) {
        var arrey_src = [];
        var o = Ext.apply({
            op: "change"
        }, properties);
        delete o.config;
        for(var name in o) {
            arrey_src.push(name+ ':' +Ext.encode(o[name]));
        }
        arrey_src.push("config:" + properties.config.toObjSrc());
        return "{" + arrey_src.join(",") + "}";
    }
};

sci.ide.Overlay.OP["insert"] = {
    op: "insert"
    , properties: {
        "ownerId": ""
        , "property": ""
        , "refId":""
        , "pos": ""
    }
    , forId: function(properties) {
        return properties.config.getValue('sciId');
    }
    , load: function(config, owner) {
        var properties = {};
        for(var name in this.properties) {
            properties[name] = config[name];
        }
        if(config.config) {
            var model = new sci.ide.ObjectModel(config.config);
            properties.config = model;
            model.on("change", function(){
                owner.fireEvent("change", model);
            });
        }
        return properties;
    }
    , toObj: function(properties, scope) {
        return Ext.applyIf({
            op: "insert"
            , config: properties.config ? properties.config.toObj(scope) : null
        }, properties);
    }
    , toSrc: function(properties) {
        var arrey_src = [];
        var o = Ext.apply({
            op: "insert"
        }, properties);
        delete o.config;
        for(var name in o) {
            arrey_src.push(name+ ':' +Ext.encode(o[name]));
        }
        if(!Ext.isEmpty(properties.config)) {
            arrey_src.push("config:" + Ext.encode(properties.config.toSrc()));
        }
        return "{" + arrey_src.join(",") + "}";
    }
    , toJSSrc: function(properties) {
        var arrey_src = [];
        var o = Ext.apply({
            op: "insert"
        }, properties);
        delete o.config;
        for(var name in o) {
            arrey_src.push(name+ ':' +Ext.encode(o[name]));
        }
        arrey_src.push("config:" + properties.config.toObjSrc());
        return "{" + arrey_src.join(",") + "}";
    }
};

sci.ide.Overlay.OP["remove"] = {
    op: "remove"
    , properties: {
        "ownerId": ""
        , "property": ""
        , "sciId":""
    }
    , load: function(config, owner) {
        var properties = {};
        for(var name in this.properties) {
            properties[name] = config[name];
        }
        return properties;
    }
    , forId: function(properties) {
        return properties.sciId;
    }
    , toObj: function(properties, scope) {
        return Ext.applyIf({
            op: "remove"
        }, properties);
    }
    , toSrc: function(properties) {
        var arrey_src = [];
        var o = Ext.apply({
            op: "remove"
        }, properties);
        delete o.config;
        for(var name in o) {
            arrey_src.push(name+ ':' +Ext.encode(o[name]));
        }
        return "{" + arrey_src.join(",") + "}";
    }
};

sci.ide.Overlay.OP["move"] = {
    op: "move"
    , properties: {
        "remove": ""
        , "insert" : ""
    }
    , forId: function(properties) {
        return sci.ide.Overlay.OP["remove"].forId(properties.remove);
    }
    , load: function(config, owner) {
        var properties = {}
        properties.remove = sci.ide.Overlay.OP["remove"].load(config.remove);
        properties.insert = sci.ide.Overlay.OP["insert"].load(config.insert);
        return properties;
    }
    , toObj: function(properties, scope) {
        return Ext.applyIf({
            op: "move",
            remove: sci.ide.Overlay.OP["remove"].toObj(properties.remove, scope),
            insert: sci.ide.Overlay.OP["insert"].toObj(properties.insert, scope)
        }, properties);
    }
    , toSrc: function(properties) {
        var arrey_src = [
            'op:"move"',
            "remove:" + sci.ide.Overlay.OP["remove"].toSrc(properties.remove),
            "insert:" + sci.ide.Overlay.OP["insert"].toSrc(properties.insert)
        ];
        return "{" + arrey_src.join(",") + "}";
    }
};


sci.ide.ObjectModelExtn = Ext.extend(sci.ide.ObjectModel, {
    constructor: function(config, forId) {
        sci.ide.ObjectModelExtn.superclass.constructor.call(this, config);
        this.forId = forId;
    }
    , applyDefaults: function() {
        // do nothing here
    }
    , setDef: function(def, notify) {
        this.def = def;
        this.isCmp = def instanceof sci.ide.DefComponent;
        
        // in case of object model extensions, this has to be done dynamically.
        // should we get and store the original model here?
        this.setExtns();
    }
    , setExtns: function() {
        var props = this.props;
        
        var aModel = sci.ide.Utils.createModelFromConfig(this.baseConfig, this.def);
        var aModelProps = aModel.getProperties();
        for(var name in props) {
            aModelProps[name] = props[name];
        }
        
        var extns = sci.ide.RegDefObjectExtn.getForModel(aModel);
        this._setExtns.call(this, extns);
    }
    , setBaseConfig: function(baseConfig) {
        this.baseConfig = baseConfig;
    }
    , getName: function() {
        return this.forId || sci.ide.ObjectModelExtn.superclass.getName.call(this);
    }
    // TODO need to set extensions for the object extension
    , addChild: function() {
        throw "Unsupported operation for an extension model";
    }
    , validateProperties: function() {
        // how to validate the set of properties combined with extensiosn
        // properties? quick fixes may not be available here.
    }
});