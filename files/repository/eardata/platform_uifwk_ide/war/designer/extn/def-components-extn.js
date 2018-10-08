/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/
Ext.override(sci.ide.DefObject, {
    filterExtnProperty: function(model) {
        // default does nothing
        return {};
    }
});
Ext.override(sci.ide.DefContainer, {
    filterExtnProperty: function(model) {
        var filters = {};
        Ext.apply(filters, sci.ide.DefContainer.superclass.filterExtnProperty.call(this, model));
		filters.items = model.removeValue('items');
        return filters;
    }
});
Ext.override(sci.ide.cmpdefs.Panel, {
    filterExtnProperty: function(model) {
        var filters = {};
        Ext.apply(filters, sci.ide.cmpdefs.Panel.superclass.filterExtnProperty.call(this, model));
        filters.bbar = model.removeValue('bbar');
        filters.tbar = model.removeValue('tbar');
        filters.buttons = model.removeValue('buttons');
        return filters;
    }
});
Ext.override(sci.ide.cmpdefs.GridPanel, {
    filterExtnProperty: function(model) {
        var filters = {};
        Ext.apply(filters, sci.ide.cmpdefs.GridPanel.superclass.filterExtnProperty.call(this, model));
		filters.columns = model.removeValue('columns');
        return filters;
    }
});
