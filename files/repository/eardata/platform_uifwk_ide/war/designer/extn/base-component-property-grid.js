/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/
(function() {
    
sci.ide.ui.OriginalPropertyGrid = function(config) {
    config = config || {};
    Ext.applyIf(config, {
        header: true
        , autoHeight: true
        , stripeRows: true
        , trackMouseOver: true
        , collapsible: false
        , title: 'Original Properties'
        //, tbar: []
        , listeners: {
            cellcontextmenu: function(grid, rowIndex, cellIndex, e) {
                
            }
            , scope: this
        }
    });
    sci.ide.ui.OriginalPropertyGrid.superclass.constructor.call(this, config);
    var wb = sci.ide.WorkbenchMgr;
    wb.registerSelectionListener(this);
    wb.registerPartListener(this);
}

var OriginalPropertyRecord = Ext.data.Record.create([
    {name: 'name'}
    , {name: 'value'}
]);

Ext.extend(sci.ide.ui.OriginalPropertyGrid, Ext.grid.GridPanel, {
    id: 'base-properties-grid'
    , store: new Ext.data.SimpleStore({
        fields: ['name', 'value']
    })
    , cm: new Ext.grid.ColumnModel([
        {id: 'name-column', header: 'Name', dataIndex: 'name', width: 80}
        , {id: 'value-column', header: 'Value', dataIndex: 'value'}
    ])
    , autoExpandColumn: 'value-column'
    , partChanged: function(part) {
        if(part.model) {
            this.editModel(part.model);
        }
    }
    , getConfig: function(event) {
        this.store.removeAll();
        var sciId = event.selection.config.sciId;
        var baseUIConfig = event.selection.editor.extensionContext.baseUIConfig;
        var config;
        config = baseUIConfig.find('sciId', sciId);
        this.config = config;
        if(!Ext.isEmpty(config)) {
            this.show();
            this.displayProperty(config);
        } else {
            this.hide();
        }
    }
    , displayProperty: function(config) {
        var initialConfig = config.config;
        for(var p in initialConfig) {
            //Adding xtype to base property grid. Should be added to non-changable properties list.
            //And removing _original_sciId as it should not be visible.
            if(p !== 'defid' && p !== '_original_sciId') {
                var rec = new OriginalPropertyRecord({
                    name: p
                    , value: initialConfig[p]
                });
                this.store.add(rec);
            }
        }
    }
});

sci.implement(sci.ide.ui.OriginalPropertyGrid, sci.ide.ui.SelectionListener, {
    selectionChanged: function(event) {
        if(sci.ide.OverlaySelectionEvent && event instanceof sci.ide.OverlaySelectionEvent) {
            this.getConfig(event);
        }
    }
});
    
}());