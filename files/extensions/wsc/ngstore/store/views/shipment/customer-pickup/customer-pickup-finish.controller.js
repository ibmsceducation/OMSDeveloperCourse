/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/


/**
 *@iscdoc viewinfo
 *@viewname store.views.shipment.customer-pickup.customer-pickup-finish
 *@package store.views.shipment.customer-pickup
 *@class customer-pickup-finish
 *@description Finishes the Customer Pickup wizard.
 *
 */



angular.module('store').controller('store.views.shipment.customer-pickup.customer-pickup-finish',
  ['$scope','$rootScope','iscWizard','iscMashup','iscResourcePermission','iscStateParams','iscModal','iscI18n','iscState',
	function($scope,$rootScope,iscWizard,iscMashup,iscResourcePermission,iscStateParams,iscModal, iscI18n, iscState) {		
		iscWizard.initializeWizardPage($scope,{      
            model:{
            },
  		    mashupRefs : [

  		    ],
            ui:{
            },
            /**
            *@description Opens shipment summary if the action is FINISH else open previous screen.
            */
			initialize : function(){
				if(iscWizard.getWizardAction()==="FINISH"){
					var shipmentDetailsModel = iscWizard.getWizardModel('shipmentDetails');
					var shipmentKey = shipmentDetailsModel.Shipment.ShipmentKey;
					iscState.goToState('shipmentsummary',{input:
						{
							Shipment:{ShipmentKey: shipmentKey},
							flowName:'CustomerPickup'
						}
					},{});
				} else if(iscWizard.getWizardAction()==="CLOSE"){
					iscState.goToPreviousState();
				}
			}
        });
	}
]);

