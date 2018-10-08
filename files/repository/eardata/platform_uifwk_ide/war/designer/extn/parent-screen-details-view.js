/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/
Ext.namespace('sci.ide');

sci.ide.ParentScreenDetailsView = function(config) {
    config = config || {};
    Ext.applyIf(config, {
        id: 'extn-wb-screen-details-view'
        , title: 'Parent Screen Details'
        , autoScroll: true
        , layout: 'fit'
    });
    sci.ide.ParentScreenDetailsView.superclass.constructor.call(this, config);
    var wb = sci.ide.WorkbenchMgr;
	//DO we need part listener?
    wb.registerSelectionListener(this);
}

Ext.extend(sci.ide.ParentScreenDetailsView, Ext.Panel, {
    updateScreenDetails: function(screen) {
		var oldScreen = this.currScreen;
		this.currScreen = screen;
		
		if(oldScreen && (oldScreen.sciId === this.currScreen.sciId)) {
			
		} else {
			var screenPropObj = this.getPropertyObj(this.currScreen);
			/*
			 Put this check for Ext 2.2.1 as removeAll() gives an error if this.items
			 is undefined.
			 Ext 3.0.3 handles this case.
			*/
			if(this.items) {
				this.removeAll();
			}
			this.updateUI(screenPropObj);
		}
    }
	, getPropertyObj: function(currScreen) {
		var superclassVar = currScreen.constructor ? currScreen.constructor.superclass : null;
		var superclassName = !Ext.isEmpty(superclassVar) ? superclassVar.className : '';
		var screenPropObj = {
			'Screen Config Properties': {
				'sciId': currScreen.sciId
				, 'className': currScreen.className
				, 'superclassName': superclassName
			}
			, 'Target Namespaces and Description': function() {
				//If namespaces are not defined, we form a one-to-one mapping between
				//bindingData source and target and namespacesDesc.
				var retTargetObj = {};
				var namespaces = currScreen.namespaces || currScreen.bindingData;
				var namespacesDesc = currScreen.namespacesDesc;
				if(!Ext.isEmpty(namespaces) && (!Ext.isEmpty(namespaces.target) || !Ext.isEmpty(namespaces.targetBinding))) {
					var targetNS = namespaces.target || namespaces.targetBinding;
					var targetNSDesc = [];
					if(!Ext.isEmpty(namespacesDesc) && !Ext.isEmpty(namespacesDesc.targetDesc)) {
						targetNSDesc = namespacesDesc.targetDesc;
					}
					for(var i = 0; i < targetNS.length; i++) {
						var ns = targetNS[i],
							nsDesc = !Ext.isEmpty(targetNSDesc[i]) ? Ext.encode(targetNSDesc[i]) : '';
						retTargetObj[ns] = nsDesc;
					}
				}
				return retTargetObj;
			}()
			, 'Source Namespaces and Description': function() {
				var retSourceObj = {};
				var namespaces = currScreen.namespaces || currScreen.bindingData;
				var namespacesDesc = currScreen.namespacesDesc;
				if(!Ext.isEmpty(namespaces) && (!Ext.isEmpty(namespaces.source) || !Ext.isEmpty(namespaces.sourceBinding))) {
					var sourceNS = namespaces.source || namespaces.sourceBinding;
					var sourceNSDesc = [];
					if(!Ext.isEmpty(namespacesDesc) && !Ext.isEmpty(namespacesDesc.sourceDesc)) {
						sourceNSDesc = namespacesDesc.sourceDesc;
					}
					for(var i = 0; i < sourceNS.length; i++) {
						var ns = sourceNS[i],
							nsDesc = !Ext.isEmpty(sourceNSDesc[i]) ? Ext.encode(sourceNSDesc[i]) : '';
						retSourceObj[ns] = nsDesc;
					}
				}
				return retSourceObj;
			}()
		};
		return screenPropObj;
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
		this.add(pnl);
		this.doLayout();
	}
    , selectionChanged: function(event) {
        if(event instanceof sci.ide.OverlaySelectionEvent) {
            var selection = event.selection,
				sciId = selection.sciId,
                screen = selection.screen;
            this.updateScreenDetails(screen);
        }
    }
});