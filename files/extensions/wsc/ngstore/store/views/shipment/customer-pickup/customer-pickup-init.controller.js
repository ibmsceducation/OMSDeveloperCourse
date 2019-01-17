/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/



/**
 *@iscdoc viewinfo
 *@viewname store.views.shipment.customer-pickup.customer-pickup-init
 *@package store.views.shipment.customer-pickup
 *@class customer-pickup-init
 *@description Initializes the Customer pickup wizard.
 *
 */


angular.module('store').controller('store.views.shipment.customer-pickup.customer-pickup-init',
  ['$scope','$rootScope','iscWizard','iscMashup','iscResourcePermission','iscModal','iscI18n','iscState','$filter','iscStateParams',
	function($scope,$rootScope,iscWizard,iscMashup,iscResourcePermission,iscModal, iscI18n, iscState,$filter,iscStateParams) {		
		iscWizard.initializeWizardPage($scope,{      
            model:{
    	       /**
				*@description Contains the 'getAppointmentDetails' mashup output for appointent details.
				*/
    	       shipmentDetails:{}
            },
  		    mashupRefs : [
  		        /**
                *@description Validates the shipment customer pickup flow.
                */      
                {
                     mashupRefId: 'validateShipmentForCustomerPickup',
                     mashupId: 'store.views.shipment.customer-pickup.ValidateShipmentForCustomerPickup'

                }
  		    ],
  		    
            ui:{
                /**
                 *@property {Object} stateParams Input to the wizard.
                 */
                stateParams:{params:""}
            },
  		    /**
			*@description Reads wizard input and validates the shipment for customer pickup flow and starts the wizard.
			*/
			initialize : function(){
					this.ui.stateParams.params = iscStateParams.params;
					this.validateShipmentForCustomerPickup();
			},
			/**
			*@description Reads wizard input and validates the shipment for customer pickup flow and starts the wizard.
			*/
			validateShipmentForCustomerPickup:function() {
				
				var shipmentModel = this.ui.stateParams.params.input;
				var apiInput = {Shipment:{ShipmentKey:shipmentModel.Shipment.ShipmentKey, Action:"CustomerPick"}};
				iscMashup.callMashup(this,"validateShipmentForCustomerPickup",apiInput,{})
                    .then(this.processShipmentDetailsForCustomerPickup.bind(this),angular.noop);
				
			},
			/**
			*@description Processes the shipment details for customer pickup and starts the wizard by opening singlepagepickup page.
			*/
			processShipmentDetailsForCustomerPickup:function(response) {
				
				var apiOutput = iscMashup.getMashupOutput(response,"validateShipmentForCustomerPickup");
				this.model.shipmentDetails = apiOutput;
				if(apiOutput.Shipment.Error) {
					this.handleShipmentValidationError(apiOutput)
				} else {
					iscWizard.setWizardModel("shipmentDetails",this.model.shipmentDetails);
                    iscWizard.startCustomWizard('singlepagepickup',this.ui.stateParams.params,{});
				}
				
			},
			/**
			*@description Validates the shipment details for customer pickup and shows error message.
			*/
			handleShipmentValidationError:function(shipmentDetails) {
				
				var errorDesc = shipmentDetails.Shipment.Error.ErrorDescription;
				var action = shipmentDetails.Shipment.Error.action;
				var that = this;

                if (errorDesc == "InvalidShipmentShipNode" || errorDesc.indexOf("InvalidTransactionAllowed_") > -1) {
					this.showCustomErrorModal(iscI18n.translate('customerpickup.MESSAGE_'+errorDesc), shipmentDetails)
				} 
				
			},
            
            /**
			 *@description This method displays error modal with 'Go Back' & 'Goto Shipment Summary' modal actions.
			 * 
			 *@param {Object} shipmentDetails - Shipment details JSON object
			 *@param {String} translatedMessage - message to be displayed in modal
			 */
			showCustomErrorModal:function(translatedMessage, shipmentDetails) {
				
				var that = this;
				
				var confirmModalOptions = { 
    					options: { 
    						headerText: "modal.TITLE_Error",
    						headerIconCss: "app-glyphicons app-icon-error_30",
    						action:[
    						  {
    						    actionName:"goBack",
    						    actionLabel:"customerpickup.ACTION_Go_back"
    						  },
    						  {
      						    actionName:"gotoSummary",
      						    actionLabel:"customerpickup.ACTION_Goto_shipment_summary"
      						  }
    						]
    					},
    					settings: { 
    						size: "md", 
    						type: "error" 
    					}
				};
				
				iscModal.showConfirmationMessage(translatedMessage, confirmModalOptions).then(function(action){
					if(action == "goBack"){
						that.closeCustomerPickupWizard();
        			} else if(action == "gotoSummary") {
                        iscState.goToState('shipmentsummary',{input: shipmentDetails},{});
        			}
        		});
				
				
			},
            
            /**
	    	   *@description This method closes the customer pickup wizard.
	    	   */
			closeCustomerPickupWizard:function() {
				iscWizard.setWizardModel("shipmentDetails",this.model.shipmentDetails);
				iscWizard.closeWizard();
			},
			
			
        });
	}
]);

