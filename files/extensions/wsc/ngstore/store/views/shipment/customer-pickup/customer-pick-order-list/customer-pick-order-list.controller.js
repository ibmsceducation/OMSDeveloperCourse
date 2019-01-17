/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/

/**
 *@iscdoc viewinfo
 *@viewname store.views.shipment.customer-pickup.customer-pick-order-list.customer-pick-order-list
 *@package store.views.shipment.customer-pickup.customer-pick-order-list
 *@class customer-pick-order-list
 *@description Customer pickup orders screen is the list of Orders which are in Ready for customer pick. 
 *
 */

angular.module("store").controller("store.views.shipment.customer-pickup.customer-pick-order-list.customer-pick-order-list",[
	"$scope","iscScreen","iscState","iscModal","iscI18n","iscMashup","iscAppContext","$timeout","iscShipment","$filter",
	function($scope,iscScreen,iscState,iscModal,iscI18n, iscMashup, iscAppContext,$timeout,iscShipment,$filter){
		
		iscScreen.initializeScreen($scope,{  
			model:{
				/**
				 *@description Holds the Output of getShipmentList API.
				 */
				shipmentList:{}
			},
            mashupRefs:[
                {
            	   /**
				    *@iscdoc mashup
		   			*@viewname store.views.shipment.customer-pickup.customer-pick-order-list.customer-pick-order-list
		   			*@mashupid store.views.shipment.customer-pick-order-list.getPickupOrderList
	   			    *@mashuprefid getShipmentList
		   			*@description Fetches the list of shipments based on the shipment status.
		   			*/
                    mashupRefId: 'getShipmentList',
                    mashupId: 'store.views.shipment.customer-pick-order-list.getPickupOrderList',
                    modelName:'shipmentList',
                    isPaginated: true,
					pageSize : 15,//iscAppContext.getFromContext("listApiPageSize"),
					append : true,
					appendPath : 'Shipments.Shipment'
                }
               
            ],
            ui : {
            	/**
				 *@property {Boolean} apiCallInProgress - flag to identify if any mashup call is in progress.
				 */
                apiCallInProgress:false,
                
                /**
				 *@property {String} selectedShipmentKey - ShipmentKey of the selected shipment from the list.
				 */	
                selectedShipmentKey:"",
                
                /**
				 *@property {Number} recordShownCount - pageSize of the shipment list for continuous scrolling.
				 */	
                recordShownCount:15, 
                
                /**
				 *@property {Number} numOfOrders - Number of Shipments for a active tab.
				 */	
                numOfOrders : -1,
                
                /**
				 *@property {Object} statusArray - Status filter for Pickup Orders.
				 */	
                statusArray:[],
                
                /**
				 *@property {String} sortOptions - Holds the sorting order of shipments.
				 */	
                sortOptions:'N'
			},
			
			/**
			 *@description Initializes the Customer pickup orders screen by invoking the required mashup calls.
			 */
			initialize : function(){
				 this.ui.statusArray.push('1100.70.06.30');
				 var apiInput = iscShipment.prepareGetShipmentListApiInput('N','PICK',this.ui.statusArray);
			     iscMashup.callPaginatedMashup(this,'getShipmentList',apiInput,"START",{}).then(this.processPaginatedShipmentList.bind(this),angular.noop);
			},
		
			/**
			*@description call back handler for  getShipmentList api.
			 */ 	
           processPaginatedShipmentList:function(response) {
                this.ui.apiCallInProgress = false;
                var output = iscMashup.getMashupOutput(response,"getShipmentList");
                this.ui.numOfOrders =  $filter('number')(output.Page.Output.Shipments.TotalNumberOfRecords);
                if(output.Page.Output.Shipments.Shipment){
                	if(iscCore.isVoid(this.ui.selectedShipmentKey)){
	            		this.ui.selectedShipmentKey = output.Page.Output.Shipments.Shipment[0].ShipmentKey;
	            	}
                    this.processShipment(output.Page.Output.Shipments);
                }
            },
            
            /**
			 *@description This method handles on click of cancel button in cart details screen.
			 */
			uiClose : function(){
				iscState.goToState("/home", {}, {});
            },
         
            /**
		     *@description Massage shipment object with UI attributes
			 */
            processShipment : function(shipments){
                for(var i = 0; i < shipments.Shipment.length; i++){
                    var shipment = shipments.Shipment[i];
                    shipment.OrderNoToDisplay = iscShipment.getDisplayOrderNumber(shipment.DisplayOrderNo, '|', ', ', true);
                    shipment.StatusDescriptionToDisplay = iscShipment.getShipmentStatusDescription(shipment);
                }
                
            },
            
            /**
			 *@description Identifies the Shipment chosen by the User from the list.
			 */
			uiSelectShipment : function(shipment){
				this.ui.selectedShipmentKey = shipment.ShipmentKey;
			},
            
			/**
			 *@description Validates if next page action should be performed by checking whether the last page is already fetched.
			 */
	        uiOrderListScrollActionValidator : function(){
	        	return true;
	        },
	        
	        /**
			 *@description Gets the Paginated records for getShipmentList api when the next page action is performed.
			 */
	        uiGetNextPickingRecords: function() {
				if (this.model.shipmentList.Page.IsLastPage !=="N") {
					return;
				}
				this.ui.apiCallInProgress = true;
				apiInput=iscShipment.prepareGetShipmentListApiInput(this.ui.sortOptions,'PICK',this.ui.statusArray);
				
				iscMashup.callPaginatedMashup(this, "getShipmentList", apiInput, "NEXT", {}) .then(this.processPaginatedShipmentList.bind(this));
			},
		
			/**
			 *@description Opens Customer pickup flow for the selected shipment from the list.
			 */	
           uipickOrder : function(shipmentKey){
				iscState.goToState("customer-pickup", {input:{"Shipment" : { "ShipmentKey" : shipmentKey}}}, {});
			},
		
			/**
			 *@description Opens Shipment summary screen for the selected shipment from the list.
			 */	
           uiGoToShipmentSummary:function(shipment){
				iscState.goToState('shipmentsummary',{input:{Shipment:{ShipmentKey: shipment.ShipmentKey},flowName:'CustomerPickup'}},{}); 
			},
			
			/**
			 *@description This method handles Sorting of Shipments.
			 */
			uiApplySortOptions : function(data){
				  var apiInput = {};
	        		if(data.sortOption == 'NEW_TO_OLD'){
	        			this.ui.sortOptions = 'Y';
	    			}else if(data.sortOption == 'OLD_TO_NEW'){
	    				this.ui.sortOptions = 'N';
	    			}	
				
	        	apiInput=iscShipment.prepareGetShipmentListApiInput(this.ui.sortOptions,'PICK',this.ui.statusArray);
				this.model.shipmentList = {};
				iscMashup.callMashup(this,"getShipmentList",apiInput,{}).then(this.processPaginatedShipmentList.bind(this),angular.noop);  

			}
            
        });
    }]);
			 
			 
            
