/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/
Ext.namespace('sci.ide');

sci.ide.ControlDetailsView = function(config) {
    config = config || {};
    Ext.applyIf(config, {
        id: 'extn-wb-control-details-view'
		, title: 'Control Details'
		, autoScroll: true
        , layout: 'fit'
    });
    sci.ide.ControlDetailsView.superclass.constructor.call(this, config);
    var wb = sci.ide.WorkbenchMgr;
	//DO we need part listener?
    wb.registerSelectionListener(this);
}

Ext.extend(sci.ide.ControlDetailsView, Ext.Panel, {
    updateControlDetails: function(component, screen) {
		var oldCmp = this.selectedCmp;
		var oldScreen = this.currScreen;
		this.selectedCmp = component;
		this.currScreen = screen;
		if(oldCmp && (oldCmp.sciId === this.selectedCmp.sciId)) {
			//no change...Not need to do anything.
		} else {
			var propObj = this.getPropertyObj(this.selectedCmp, this);
			this.removeAll();
			this.updateUI(propObj);
		}
    }
	, getPropertyObj: function(selectedCmp, currentInstance) {
		var controlPropObj = {
			'Control Properties': {
				'sciId': selectedCmp.sciId
				, 'xtype': function() {
					var xtype = selectedCmp.xtype || selectedCmp.type;
					return xtype;
				}()
				, 'editor': function() {
					var editorType = '';
					if(selectedCmp._isColumn) {
						var editor = selectedCmp.editor;
						//editor.getXType() returns undefined.
						editorType = !Ext.isEmpty(editor) ? editor.field.getXType() : '';
					}
					return editorType;
				}()
				, 'dataIndex': function() {
					var dataIndex = '';
					if(selectedCmp._isColumn) {
						if(!Ext.isEmpty(selectedCmp.dataIndex)) {
							dataIndex = selectedCmp.dataIndex;
						}
					}
					return dataIndex;
				}()
			}
			, 'Parent Screen Properties': {
				'className': this.currScreen.className
				, 'screenId': this.currScreen.screenId
				, 'sciId': this.currScreen.sciId
			}
			, 'Control Datatype Properties': function() {
				var dataType = null;
				var dataTypeObj = {};
				if(selectedCmp._isColumn) {
					dataType = sc.plat.DataTypeManager.getDataTypeForColumn(selectedCmp);
				} else {
					dataType = sc.plat.DataTypeManager.getDataTypeFor(selectedCmp);
				}
				if(!Ext.isEmpty(dataType)) {
					for(var p in dataType) {
						if(Ext.type(dataType[p]) !== 'function' && !Ext.isEmpty(dataType[p])) {
							dataTypeObj[p] = Ext.encode(dataType[p]);
						}
					}
				}
				return dataTypeObj;
			}()
			, 'Control Binding Properties': function() {
				var bindingData = selectedCmp.bindingData;
				var bindingPropObj = {};
				if(!Ext.isEmpty(bindingData)) {
					var retBindingObj = currentInstance.processBindingDataObj(bindingData);
					for(var p in retBindingObj) {
						bindingPropObj[p] = Ext.encode(retBindingObj[p]);
					}
				}
				return bindingPropObj;
			}()
			, 'Control Listener Properties' : function() {
				if(!Ext.isEmpty(selectedCmp.initialConfig)) {
					var listenrs = selectedCmp.initialConfig.listeners;
					var listenerObj = {};
					if(!Ext.isEmpty(listenrs)){
						var retListenerObj = currentInstance.processListeners(listenrs);
						for(var p in retListenerObj){
							listenerObj[p] = Ext.encode(retListenerObj[p]);
						}
					}
					return listenerObj;
				}
			}()
		};
		return controlPropObj;
	}
	/*
	 Function returns a bindingObj after removing all objectmodel properties. This
	 is required as encoding objectmodel causes recursion error.
	*/
	, processBindingDataObj: function(inputObj) {
		var processedObj = {};
		for(var p in inputObj) {
			if(p !== 'objectmodel' && p !== 'defid') {
				var val = inputObj[p];
				if(Ext.type(val) === 'object') {
					val = this.processBindingDataObj(val);
				}
				processedObj[p] = val;
			} else {
				continue;
			}
		}
		return processedObj;
	}
	, processListeners : function(inputObj){
		var processedObj = {};
		for(var p in inputObj) {
			if(p !== 'scope' && p !== 'defid') {
				var val = inputObj[p];
				var type = Ext.type(val);
				if(Ext.type(val) === 'object') {
					val = this.processListeners(val);
				}
				processedObj[p] = val.toString();
			} else {
				continue;
			}
		} 
		return processedObj; 
	}
	, updateUI: function(propObj) {
		var pnl = new Ext.Panel({
			layout: 'table'
			, layoutConfig: {
			    columns: 3
			}
			, header: false
			, border: false
			, autoScroll: true
		});
		for(var q in propObj) {
			pnl.add(new Ext.Panel({
				title: q
				, colspan: 3
				, cellCls: 'sc-designer-app-color-panel-cell-grab'
				, bodyStyle: 'height:0px'
			}));
			var childPropObj = propObj[q];
			var oddRow = true;
			for(var p in childPropObj) {
				if(!Ext.isEmpty(childPropObj[p])) {
					pnl.add(new Ext.form.Label({
						text: p
						, cellCls: oddRow ? 'sc-designer-app-color-U-border-odd' : 'sc-designer-app-color-U-border-even'
					}));
					pnl.add(new Ext.form.Label({
						text: childPropObj[p]
						, colspan: 2
						, cls: 'sc-designer-label-left'
						, cellCls: oddRow ? 'sc-designer-app-color-U-border-grab-odd' : 'sc-designer-app-color-U-border-grab-even'
					}));
					oddRow = oddRow ? false : true;
				}
			}
		}
		this.add(pnl);
		this.doLayout();
	}
	//Put in utils??
	, findColumnInGrid: function(aGrid, sciId) {
		var columnConfig = aGrid.getColumnModel().getColumnsBy(function(colConfig) {
			if(colConfig.sciId === sciId)
				return true;
		})[0];
		return columnConfig;
	}
	, obtainComponentFromScreen: function(screen, sciId) {
		//Looking for all columns in all grids in current screen.
		var component = null;
		var gridArray = screen.findBy(function(cmp, container) {
			if(cmp.getXType() === 'grid' || cmp.getXType() === 'editorgrid') {
				return true;
			}
		}, screen);
		for(var i = 0; i < gridArray.length; i++) {
			component = this.findColumnInGrid(gridArray[i], sciId);
			if(!Ext.isEmpty(component)) {
				//Will this Logic hold for tpl columns or xtyped columns??
				//In their case we wont be setting the xtype.
				if(Ext.isEmpty(component.xtype)) {
					component.xtype = 'grid-column';
					component._isColumn = true;
				} else {
					component._isColumn = true;
				}
				break;
			}
		}
		//If its still empty, then screen itself must be selected.
		if(Ext.isEmpty(component)) {
			component = screen;
		}
		return component;
	}
    , selectionChanged: function(event) {
        if(event instanceof sci.ide.OverlaySelectionEvent) {
            var selection = event.selection,
				sciId = selection.sciId,
                screen = selection.screen,
				component = screen.findScreenItemsBy(function(cmp, container) {
					if(cmp.sciId === sciId) {
						return true;
					}
				}, screen, {findRecursive: false, findFirst: true})[0];
			//If its not there in tbar, bbar, buttons, then maybe a column.
			if(Ext.isEmpty(component)) {
				//component not completely correct name. Column is not a component.
				component = this.obtainComponentFromScreen(screen, sciId);
			}
            this.updateControlDetails(component, screen);
        }
    }
});