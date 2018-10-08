/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/

/**
 * This file contains the functions that provide a list of properties in extensibility that:
 * 1. Can not be added for a particular xtype. If you add those properties,
 *    you get a log in console telling the property is not allowed..
 * 2. Can be conditionally associated/removed depending on overlay type. This
 *    silently adds/removes a property from properties's dropdown list.
 */

Ext.namespace('sci.ide');

Ext.override(sci.ide.DefObject, {
    acceptProperty: function(propertyId) {
        return this.getPropertyIdFilters().indexOf(propertyId) < 0;
    },
    getPropertyIdFilters: function() {
        if(!this.propertyIdFilters) {
            this.propertyIdFilters = ['defid', 'id', '_original_sciId', 'sciId', 'xtype'];
        }
        return this.propertyIdFilters;
    },
	//returns all properties that can be associated on 'insert' overlay.
	getAdditionalProperties_OverlayInsert: function() {
		return new Ext.util.MixedCollection();
	},
	//returns all properties that can be associated on 'change' and 'move' overlays.
	getAdditionalProperties_OverlayOthers: function() {
		return new Ext.util.MixedCollection();
	},
	//returns array of property ids that are to be removed in case of 'insert' overlay.
	getPropertyIdsToRemoveFor_OverlayInsert: function() {
		return ['extn_bindingData'];
	},
	//returns array of property ids that are to be removed in case of 'change' or 'move' overlay.
	getPropertyIdsToRemoveFor_OverlayOthers: function() {
		return ['bindingData'];
	}
	/*
	TODO: merge acceptProperty() and getPropertyIdFilters() logic with latest methods.
	But, don't remove them. We need to still validate if someone adds a blacklisted property.
	*/
});

Ext.override(sci.ide.cmpdefs.Text, {
    getPropertyIdFilters: function() {
        if(!this.propertyIdFilters) {
            sci.ide.cmpdefs.Text.superclass.getPropertyIdFilters.call(this);
            this.propertyIdFilters.splice(0, 0, 'vtype');
        }
        return this.propertyIdFilters;
    }
});

Ext.override(sci.ide.DefContainer, {
    getPropertyIdFilters: function() {
        if(!this.propertyIdFilters) {
        	sci.ide.DefContainer.superclass.getPropertyIdFilters.call(this);
        	this.propertyIdFilters.splice(0, 0, 'items');
        }
        return this.propertyIdFilters;
    }
});

Ext.override(sci.ide.cmpdefs.Panel, {
    getPropertyIdFilters: function() {
        if(!this.propertyIdFilters) {
            sci.ide.cmpdefs.Panel.superclass.getPropertyIdFilters.call(this);
            this.propertyIdFilters.splice(0, 0, 'tbar', 'bbar', 'buttons');
        }
        return this.propertyIdFilters;
    }
});

Ext.override(sci.ide.cmpdefs.GridPanel, {
    getPropertyIdFilters: function() {
        if(!this.propertyIdFilters) {
            sci.ide.cmpdefs.GridPanel.superclass.getPropertyIdFilters.call(this);
            this.propertyIdFilters.splice(0, 0, 'columns');
        }
        return this.propertyIdFilters;
    },
	getAdditionalProperties_OverlayOthers: function() {
		var propList = sci.ide.RegDefProperty.get(
			['extn_bindingData']
		);
		propList.addAll(sci.ide.cmpdefs.GridPanel.superclass.getAdditionalProperties_OverlayOthers(this).items);
		return propList;
	}
});

Ext.override(sci.ide.cmpdefs.Screen, {
    getPropertyIdFilters: function() {
        if(!this.propertyIdFilters) {
            sci.ide.cmpdefs.Screen.superclass.getPropertyIdFilters.call(this);
            this.propertyIdFilters.splice(0, 0, 'className', 'classId',
                'superclassName', 'regXtype');
        }
        return this.propertyIdFilters;
    }
});
//Do we need to add code to control bindingData, scuidatatype etc??