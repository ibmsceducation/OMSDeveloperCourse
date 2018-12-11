/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/





/**
 *@iscdoc viewmodal
 *@viewname store.views.shipment.containerpack.pack-products.pack-container-products
 *@package store.views.shipment.containerpack.pack-products
 *@class pack-container-products
 */

(function(){
    'use strict';
    
    angular.module('store').controller('store.views.shipment.containerpack.pack-products.pack-container-products',
  ['$scope','$rootScope','$uibModalInstance','iscScreen','iscWizard','modalInput','$filter', 'iscMashup','iscResourcePermission','iscI18n','iscModal',
	function($scope,$rootScope,$uibModalInstance,iscScreen,iscWizard,modalInput,$filter,iscMashup,iscResourcePermission,iscI18n,iscModal) {
		
		
		iscScreen.initializeModalScreen($scope,{


      /**
       *ModelList
       *Models that hold data
       * 
       */
  		model:{
            "shipmentLineDetails":{},
            "containerDetails":{}
  		},


  		/**
       *MashupRefs
       *array containing the list of mashups referred in this controller
       */
  		mashupRefs : [
  		        {
					
					/**
					*@description This mashup is used to get policy override reason list. 
					*/
					mashupRefId: 'getContainerShipmentLineList',
					mashupId: 'store.views.shipment.containerpack.getContainerShipmentLineList',
					modelName : 'shipmentLineDetails'								
				}
			],


			ui:{
				

			},
			
			  /**
	         * @scDoc Method
	         * @method initialize
	         * @description method to initialize the controller and loads the shipment lines for the container.
	         */
			initialize : function(){
				
                this.model.containerDetails = modalInput.containerDetails;
                this.ui.ScacIntegrationRequired = modalInput.ScacIntegrationRequired;
				
                var getShipmentLineListInput = {
                    ShipmentLine:{
                        ShipmentContainerKey : modalInput.ShipmentContainerKey,
                        ShipmentKey : modalInput.ShipmentKey,
                        ContainerDetails:{
                            ContainerDetail:{
                                Container:{
                                    ShipmentContainerKey : modalInput.ShipmentContainerKey,
                                    ShipmentKey : modalInput.ShipmentKey
                                }
                                
                            }
                        }
                    }
                };
                
				iscMashup.callMashup(this,'getContainerShipmentLineList',getShipmentLineListInput,{});
				
			},
			
			
			/**
			 *@description OnClick handler of "Cancel" button, closes the modal popup.
			 */
			uiClose : function () {
				$uibModalInstance.dismiss({});
			}

			
			
			
  	});
		
		
		
	}
]);
    
})();



