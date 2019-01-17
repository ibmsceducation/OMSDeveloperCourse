/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/

/**
 *@iscdoc viewinfo
 *@viewname store.views.shipment.customer-pickup.customer-pickup-page
 *@package store.views.shipment.customer-pickup
 *@class customer-pickup-page
 *@description Displays 'singlepagepickup' page of the 'Customer Pickup' wizard.
 */

angular.module('store').controller('store.views.shipment.customer-pickup.customer-pickup-page',
  ['$scope','$rootScope','iscScreen','iscStateParams','iscMashup','iscModal','iscResourcePermission','iscI18n','iscAppContext','iscState','iscAppInfo','iscShipment', '$timeout','iscPrint','iscWizard','$locale','$filter','iscObjectUtility','iscScrollUtility','iscCustomerPickup',
	function($scope,$rootScope,iscScreen,iscStateParams,iscMashup,iscModal,iscResourcePermission,iscI18n,iscAppContext,iscState,iscAppInfo,iscShipment,$timeout,iscPrint,iscWizard,$locale,$filter,iscObjectUtility,iscScrollUtility,iscCustomerPickup) {
		iscWizard.initializeWizardPage($scope,{
			model: {
				/**
                *@description This model contains the getShipmentDetails api output. It will have header level shipment information.
                */
                "shipmentDetails" : {},
                /**
                *@description This model contains the getShipmentLineList api output. It will have all the shipment lines.
                */
                "shipmentLineList" : {} ,
                /**
                *@description This model contains the list for customer verification methods.
                */
                "custVeriMethodList" : {}
			},
			mashupRefs:[
				/**
                 *@description This mashup is invoked to fetch header level shipment information.
                 */
                {  
                    mashupRefId: 'getShipmentDetails',
                    mashupId: 'store.views.shipment.customer-pickup.getShipmentSummaryDetails',
                    modelName : 'shipmentDetails'
                },
                /**
                 *@description This mashup is invoked to fetch all shipment lines.
                 */
                {
                    mashupRefId: 'getShipmentLineList',
                    mashupId: 'store.views.shipment.customer-pickup.getShipmentLineDetails',
                    modelName : 'shipmentLineList'
                },
                /**
                 *@description This mashup is invoked to fetch list of customer verification methods.
                 */
                {
                    mashupRefId: 'getCustomerVerficationMethodList',
                    mashupId: 'store.views.shipment.customer-pickup.getCustomerVerficationMethodList',
                    modelName : 'custVeriMethodList'
                },
                /**
                 *@description This mashup is invoked to fetch barcode translations details for a product.
                 */
                {	 
                    mashupRefId: 'registerBarCodeForCustomerPickup',
                    mashupId: 'store.views.shipment.customer-pickup.registerBarCodeForCustomerPickup',
                    modelName : 'lastScannedProduct'					
                },
                /**
                 *@description This mashup is invoked when all shipment lines are picked together.
                 */
                {	
                    mashupRefId: 'pickAllShipmentLines',
                    mashupId: 'store.views.shipment.customer-pickup.pickupAllShipmentLines'
                },
                /**
                 *@description This mashup is invoked to get the updated shipment line details.
                 */
                {
                    mashupRefId: 'getUpdatedShipmentLineDetails',
                    mashupId: 'store.views.shipment.customer-pickup.getShipmentLineDetailsPostChangeShipment'
                }, 
                /**
                 *@description This mashup updates the picked up quantity for the shipment line.
                 */
                {
                    mashupRefId: 'updatePickedupQuantityForShipmentLine',
                    mashupId: 'store.views.shipment.customer-pickup.updatePickedupQuantityForShipmentLine'
                }, 
                /**
                 *@description This mashup records the shortage for the shipment line.
                 */
                {
                    mashupRefId: 'recordShortageForShipmentLine',
                    mashupId: 'store.views.shipment.customer-pickup.recordShortageForShipmentLine'

                },
                /**
                 *@description This mashup records the shortage for the remaining shipment lines.
                 */
                {
                    mashupRefId: 'recordShortageForAllShipmentLines',
                    mashupId: 'store.views.shipment.customer-pickup.recordShortageForAllShipmentLines'
                },
                /**
                 *@description This mashup is invoked to call recordCustomerPickup api on finish of customer pickup.
                 */
                {	
                    mashupRefId: 'recordCustomerPickup',
                    mashupId: 'store.views.shipment.customer-pickup.recordCustomerPickup'                    			
                },
                /**
                 *@description This mashup is invoked to rule which determines staging location is required or not.
                 */
                {
                    mashupRefId: 'getStagingLocationRequiredRuleDetails',
                    mashupId: 'store.views.shipment.getStagingLocationRequiredRuleDetails'
                }
			],
			
			ui : {
                /**
                 *@property {Boolean} showCustomerPickupUI Flag to indicate to show the screen content. Used in initial loading of the screen.
                 */
                showCustomerPickupUI:false,
                /**
                 *@property {String} shipmentKey Holds the shipment key.
                 */
				shipmentKey: "",
                /**
                 *@property {String} customerVerificationMethod Holds the selected customer verification method.
                 */
				customerVerificationMethod: "",
                /**
                 *@property {Boolean} showCustomerVerificationMethodError Flag to indicate to show the error message for customer verification method.
                 */
				showCustomerVerificationMethodError: false,
                /**
                 *@property {String} customerVerificationMethodErrorDesc Holds the error message for customer verification method.
                 */
				customerVerificationMethodErrorDesc: iscI18n.translate('customerpickup.MESSAGE_CustomerVerificationMethodNotFound'),
                /**
                 *@property {Number} recordShownCount Number of shipment lines to show on load. Used for client side paginigation.
                 */
                recordShownCount:iscAppContext.isMobile()?6:10,
                /**
                 *@property {String} selectedShipmentLineKey Holds selected shipment line key.
                 */
                selectedShipmentLineKey:"",
                /**
                 *@property {String} currentlySelectedShipmentLine Holds currenlty selected shipment line key.
                 */
                currentlySelectedShipmentLine:"",
                /**
                 *@property {Boolean} focusOnFirstLine Flag to indicate to focus on the first shipment line on page load.
                 */
                focusOnFirstLine:true,
                /**
                 *@property {Number} productListIndex Number of shipment lines.
                 */
                productListIndex:0,
                /**
                 *@property {String}  selectedCustomerContact - Pickup Customer's Name.
                 */
                "selectedCustomerContact":"",
                /**
                 *@property {Boolean} isStagingLocationRuleEnabled Flag to indicate to show staging location information or not.
                 */
                isStagingLocationRuleEnabled:true,
                /**
                 *@property {Boolean} hasStagingLocation Flag to indicate whether these is valid staging location information or not.
                 */
                hasStagingLocation:false
			},
			/**
			*@description Reads wizard model and loads shipment details.
			*/
			initialize: function(){
				var shipmentKey = iscStateParams.params.input.Shipment.ShipmentKey;
				this.ui.shipmentKey = shipmentKey;
                var shipmentDetailsMashupInput = {};
				shipmentDetailsMashupInput.Shipment = {};
				shipmentDetailsMashupInput.Shipment.ShipmentKey = shipmentKey;
				
				var shipmentLineListMashupInput = {};
				shipmentLineListMashupInput.ShipmentLine = {};
				shipmentLineListMashupInput.ShipmentLine.ShipmentKey = shipmentKey;
				
				var mashupArray = [];
				mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentDetails',shipmentDetailsMashupInput));
				mashupArray.push(iscMashup.getMashupRefObj(this,'getCustomerVerficationMethodList',{}));
				mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentLineList',shipmentLineListMashupInput));
                mashupArray.push(iscMashup.getMashupRefObj(this,'getStagingLocationRequiredRuleDetails',{Rule:{}}));
				
				iscMashup.callMashups(this,mashupArray,{})
                    .then(this.handleInitMashupOutput.bind(this),angular.noop);
			},
			/**
			 *@description Callback handler for  init mashups call made from the 'initialize' method.
			 *@param {Object} response - Output data of mashups call
			 */
			handleInitMashupOutput: function(controllerData) {
				this.ui.showCustomerPickupUI = true;
                /*var custVerMethodList = iscMashup.getMashupOutput(controllerData,"getCustomerVerficationMethodList");
                if(custVerMethodList){
                    var commonCodes = iscCore.getValueFromJsonPath(custVerMethodList,"CommonCodeList.CommonCode");
                    if(commonCodes && angular.isArray(commonCodes) && commonCodes.length > 0){
                        this.ui.custVerificationMethod = commonCodes[0];
                    }
                }
                */
                var shipmentDetails = iscMashup.getMashupOutput(controllerData,"getShipmentDetails");
                if(shipmentDetails && shipmentDetails.Shipment){
                    shipmentDetails.Shipment.DisplayOrderNoDesc = iscShipment.getDisplayOrderNumber(shipmentDetails.Shipment.DisplayOrderNo, '|', ', ', false);
                }
                
                this.ui.hasStagingLocation = !iscCore.isVoid(shipmentDetails.Shipment.HoldLocation);
                this.ui.selectedCustomerContact = shipmentDetails.Shipment.CustomerContacts.CustomerContact[0];
				this.model.shipmentLineList = iscMashup.getMashupOutput(controllerData,"getShipmentLineList");
                
                if(!iscCore.isVoid(this.model.shipmentLineList) && !iscCore.isVoid(this.model.shipmentLineList.ShipmentLines) 
                   && !iscCore.isVoid(this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords)) {
                    
                    this.ui.numberOfPickableProducts = $filter('number')(this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords);
                    this.ui.shipmentFullyPicked = (this.ui.numberOfPickableProducts == 0 ) ? true : false;
                    if(this.ui.focusOnFirstLine && this.ui.numberOfPickableProducts > 0) {
                         this.ui.currentlySelectedShipmentLine = this.model.shipmentLineList.ShipmentLines.ShipmentLine[0];
                         this.ui.selectedShipmentLineKey = this.ui.currentlySelectedShipmentLine.ShipmentLineKey;
                         this.uiStampCustomerPickupQuantityAttrs(this.ui.currentlySelectedShipmentLine);
                    }
                }
				//iscDomUtility.setFocus(document.getElementById('productScanInput'));
				
                var slaImageRelativePath = shipmentDetails.Shipment.ImageUrl;
                if(slaImageRelativePath) {
                    this.ui.slaImageFullURL =  iscShipment.getFullURLForImage(slaImageRelativePath);
                }
                
                var ruleDetails = iscMashup.getMashupOutput(controllerData,"getStagingLocationRequiredRuleDetails");
				this.ui.isStagingLocationRuleEnabled = (ruleDetails && ruleDetails.Rules.RuleSetValue == "Y") ? true : false;
				//this.ui.isStagingLocationRuleEnabled = false;	        	
			},
			
            
            /**
			 *@description Gets the next count to show shipment lines. Used in client side pagination.
			 */
            uiGetNextShipmentLineRecords : function(){
								
              if(this.ui.recordShownCount <= this.model.shipmentLineList.ShipmentLines.ShipmentLine.length){
                  this.ui.recordShownCount += 6;
                }

            },
            /*
			uiOnValueChange: function() {
				this.ui.showCustomerVerificationMethodError = false;
			},
            */
			/**
             *@description This method closes the wizard.
             */
			uiCancel:function() {
				this.handleWizardExitAndClose("close");
			},
			/**
             *@description Handler method called on wizard exit event.
             */
			handleWizardExit:function() {
				return this.handleWizardExitAndClose("exit");
			},
			/**
             *@description Handler method called on wizard back event.
             */
			handleWizardBack:function() {
				var isDirty = $scope.customerPickupForm.$dirty;
                return iscWizard.handleWizardBack(isDirty,'customerpickup.MESSAGE_CancelWarningMessage');
			},
			/**
             *@description Handler method called on wizard back and exit event.
             */
			handleWizardExitAndClose: function(wizardAction) {
				var isDirty = $scope.customerPickupForm.$dirty;
                return iscWizard.handleWizardExitAndClose(wizardAction,isDirty,'customerpickup.MESSAGE_CancelWarningMessage');
			},
			
            
            /**
             *@description This method updates the shipment line qauntity for barcode scanning.
             */
            uiScanBarCodeData:function() {
					  			
                if(!iscCore.isVoid(this.model.barCodeData)){

                    var that = this;
                    this.model.barCodeData = iscObjectUtility.trimString(this.model.barCodeData);
                    var registerBarCodeForCPInput = { 'BarCode' :{'BarCodeData': this.model.barCodeData,ShipmentContextualInfo:{}}};
                    registerBarCodeForCPInput.BarCode.ShipmentContextualInfo.ShipmentKey = this.model.shipmentDetails.Shipment.ShipmentKey; 
                    registerBarCodeForCPInput.BarCode.ShipmentContextualInfo.SellerOrganizationCode = this.model.shipmentDetails.Shipment.SellerOrganizationCode; 

                    iscMashup.callMashup(this,"registerBarCodeForCustomerPickup",registerBarCodeForCPInput,{}).then(this.processRegisterBarCodeOutput.bind(this),function(errorResponse) {
                        that.handleMashupErrors(errorResponse);
                    }); 
                }
                else {
                    iscModal.showErrorMessage(iscI18n.translate('customerpickup.MESSAGE_InvalidBarCodeData'));
                }

            },
            /**
			 *@description Callback handler for 'registerBarCodeForCustomerPickup' mashup call.
             *@param {Object} errorResponse - Error Output data of 'registerBarCodeForCustomerPickup' mashup call
			 */
            handleMashupErrors:function(errorResponse) {

                var that = this;
                var errorMsg = errorResponse.Errors.Error[0].ErrorDescription;
                var errorCode = errorResponse.Errors.Error[0].ErrorCode;
                if(iscI18n.hasKey("apierror."+errorCode)){
                    errorMsg = iscI18n.translate("apierror."+errorCode);
                    iscModal.showErrorMessage(errorMsg,null,null).then(function(callbackData) {
                        that.resetData();
                    });				
                } else {
                    iscModal.showErrorMessage(errorMsg,null,null).then(function(callbackData) {
                        that.resetData();
                    });				
                }

            },
            /**
			 *@description Callback handler for 'registerBarCodeForCustomerPickup' mashup call.
             *@param {Object} response - Output data of 'registerBarCodeForCustomerPickup' mashup call
			 */
            processRegisterBarCodeOutput:function(response) {

                var apiOutput = iscMashup.getMashupOutput(response,"registerBarCodeForCustomerPickup");
                this.updateShipmentLineListModel(apiOutput.BarCode.Shipment.ShipmentLine);
                this.highlightLastPickedProduct(apiOutput.BarCode.Shipment.ShipmentLine);
                this.resetData();
            },

            /**
             *@description This method updates the shipment line qaunity.
             *@param {Object} shipmentLine Shipment line for which quantity needs to be updated.
             *@param {String} newCustomerPickedQty New customer picked quantity.
             */
            uiUpdateShipmentLineQuantity : function(shipmentLine,newCustomerPickedQty){
                var mashupArray = [];
				mashupArray.push(iscMashup.getMashupRefObj(this,'updatePickedupQuantityForShipmentLine',iscCustomerPickup.getQuantityUpdateInput(this.ui.shipmentKey,shipmentLine.ShipmentLineKey,newCustomerPickedQty)));
				mashupArray.push(iscMashup.getMashupRefObj(this,'getUpdatedShipmentLineDetails',iscCustomerPickup.getShipmentLineDetailsInput(this.ui.shipmentKey,shipmentLine.ShipmentLineKey)));
				

                iscMashup.callMashups(this,mashupArray,{})
                    .then(this.postPickupQuantityUpdate.bind(this));
            },
            /**
			 *@description Callback handler for mashup call made for updating the shipment line quantity.
             *@param {Object} response - Output data of mashup call
			 */
            postPickupQuantityUpdate:function(response) {
                var updatedShipmentModel = iscMashup.getMashupOutput(response,"getUpdatedShipmentLineDetails");
                if(updatedShipmentModel.ShipmentLines.ShipmentLine){
                    this.updateShipmentLineListModel(updatedShipmentModel.ShipmentLines.ShipmentLine[0]);
                }
                this.resetData();
            },
            
            /**
             *@description This method resets customer pickup data.
             */
            resetData:function() {
					  			
                this.model.barCodeData = "";
                if($scope.customerPickupForm) {
                    $scope.customerPickupForm.$setPristine();
                }
                if($scope.quantityForm) {
                    $scope.quantityForm.$setPristine();
                }
                //iscDomUtility.setFocus(document.getElementById('productScanInput'));

            },

            /**
             *@description This method updates the shipment line on mashup calls.
             *@param {Object} shipmentLine Shipment line which needs to be updatd
             */
            updateShipmentLineListModel:function(updatedShipmentModel) {

                if(!iscCore.isVoid(this.model.shipmentLineList) && !iscCore.isVoid(this.model.shipmentLineList.ShipmentLines) && !iscCore.isVoid(this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords)) {

                     var numOfShipmentLines = $filter('number')(this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords);
                     for(var i=0;i<numOfShipmentLines;i++) {

                         var shipmentLine = this.model.shipmentLineList.ShipmentLines.ShipmentLine[i];
                         this.ui.productListIndex++;
                         if(!iscCore.isVoid(shipmentLine) && shipmentLine.ShipmentLineKey == updatedShipmentModel.ShipmentLineKey) {
                             var shipmentLine = this.model.shipmentLineList.ShipmentLines.ShipmentLine[i];
                            shipmentLine.CustomerPickedQuantity = $filter('number') (updatedShipmentModel.CustomerPickedQuantity);
                            shipmentLine.EditableCustomerPickedQuantity = shipmentLine.CustomerPickedQuantity;
                            shipmentLine.Quantity = $filter('number') (updatedShipmentModel.Quantity);
                            shipmentLine.ShortageQty = $filter('number') (updatedShipmentModel.ShortageQty);
                            shipmentLine.ShortageResolutionReason = updatedShipmentModel.ShortageResolutionReason;
                            shipmentLine.ShortageResolutionReasonDesc = updatedShipmentModel.ShortageResolutionReasonDesc;
                            shipmentLine.CancelReason = updatedShipmentModel.CancelReason;
                            shipmentLine.CancelReasonDesc = updatedShipmentModel.CancelReasonDesc;
                            shipmentLine.IsCustomerPickComplete = updatedShipmentModel.IsCustomerPickComplete;
                            
                            this.uiStampCustomerPickupQuantityAttrs(this.model.shipmentLineList.ShipmentLines.ShipmentLine[i]);

                            break;
                         }
                     }
                 }

            },
            /**
             *@description This method highlights the shipment line which has last picked product .
             *@param {Object} updatedShipmentLineModel Shipment line which needs to be highlighted
             */
            highlightLastPickedProduct:function(updatedShipmentLineModel) {

                if(this.ui.recordShownCount < this.ui.productListIndex){
                    this.ui.recordShownCount = this.ui.productListIndex;
                }
                var that = this;
                $timeout(function(){
                        iscScrollUtility.scrollToElementWIthOffset(document.getElementById('shipmentDetials'), document.getElementById(updatedShipmentLineModel.ShipmentLineKey), 0, 100);
                    }, 0);
                this.ui.productListIndex = 1;
                this.uiSelectShipmentLine(updatedShipmentLineModel);

            },
            /**
             *@description This method selects the shipment line for further actions.
             *@param {Object} shipmentLine Shipment line which needs to be selected
             */
            uiSelectShipmentLine:function(shipmentLine) {
                this.ui.selectedShipmentLineKey = shipmentLine.ShipmentLineKey;
                this.uiStampCustomerPickupQuantityAttrs(shipmentLine);
                this.ui.currentlySelectedShipmentLine = shipmentLine;
                this.ui.focusOnFirstLine = false;
                //this._isInitSelection = false;
            },
            /**
             *@description This method stamps the attributes that are required for displaying the shipment line.
             *@param {Object} shipmentLine Shipment line for which the attributes needs to updated
             */
            uiStampCustomerPickupQuantityAttrs:function(shipmentLine) {
								
                var shortageQty = 0, zeroQty = 0;
                
                if(shipmentLine.CustomerPickedQuantity) {
                    shipmentLine.EditableCustomerPickedQuantity = angular.copy(shipmentLine.CustomerPickedQuantity);
                } else {
                    shipmentLine.EditableCustomerPickedQuantity = "0";
                    shipmentLine.CustomerPickedQuantity = "0";
                }

                
                var shipmentQuantity = angular.isNumber(Number(shipmentLine.Quantity)) ? Number(shipmentLine.Quantity) : zeroQty;
                var customerPickedQuantity =  angular.isNumber(Number(shipmentLine.CustomerPickedQuantity)) ? Number(shipmentLine.CustomerPickedQuantity) : zeroQty; 
                var shortageResolution = shipmentLine.ShortageResolutionReason;

                
                if(shortageResolution) {
                    shortageQty =  shipmentQuantity - customerPickedQuantity;
                }

                shipmentLine.ComputedShortageQty = shortageQty;

                shipmentLine.showQtyUpdate = "N";
                
                shipmentLine.IsLineCompletelyPickup = shipmentLine.CustomerPickedQuantity === shipmentLine.Quantity
                shipmentLine.IsLineShorted = !iscCore.isVoid(shipmentLine.ShortageResolutionReason);
                shipmentLine.canLineBeShorted = iscCore.isVoid(shipmentLine.ShortageResolutionReason) && shipmentLine.Quantity != 0 && shipmentLine.CustomerPickedQuantity != shipmentLine.Quantity ;
                shipmentLine.IsCompletelyShortedInBackroom = ((shipmentLine.OriginalQuantity == shipmentLine.ShortageQty) &&  iscCore.isVoid(shipmentLine.ShortageResolutionReason)) ? true : false;
            },

            /**
             *@description This method shows shortage resolution popup.
             *@param {Object} shipmentLine Shipment line that needs to be shorted
             */
            uiOpenRecordShortagePopup:function(shipmentLine) {

                var zeroQty = 0;
                var popInput = {};
                popInput.codeType = 'YCD_SHORT_RESOLU';
                popInput.shipmentLine = angular.copy(shipmentLine);

                var customerPickedQty = angular.isNumber(Number(shipmentLine.CustomerPickedQuantity)) ? Number(shipmentLine.CustomerPickedQuantity) : zeroQty;
                var shipmentQuantity = angular.isNumber(Number(shipmentLine.Quantity)) ? Number(shipmentLine.Quantity) : zeroQty;

                popInput.shipmentLine.DisplayQty = customerPickedQty
                popInput.shipmentLine.DisplayTotalQty = shipmentQuantity;
                popInput.shipmentLine.OrderLine = shipmentLine.OrderLine;
                popInput.shipmentLine.DisplayShortQty = shipmentQuantity - customerPickedQty;

                var recordShortagePopupInput = {
                         modalInput: function(){
                            return popInput;
                        }   

                    };

                iscModal.openModal('store.views.shipment.common.record-shortage.record-shortage',recordShortagePopupInput,{})
                    .then(function(callBackData){
                        if(callBackData.data !== null && callBackData.data !== undefined){
                            this.recordShortageForShipment(callBackData.data,shipmentLine);
                        }
                    }.bind(this),angular.noop);

            },

            /**
             *@description This method calls mashup for shorting the shipment lines.
             *@param {Object} shortagePopupData Shortage popup data
             *@param {Object} shipmentLineToBeShorted Shipment line that needs to be shorted
             */
            recordShortageForShipment:function(shortagePopupData, shipmentLineToBeShorted) {
 
                if(shortagePopupData.RecordShortage.MarkAllLines == true){
                    var shortageInput = iscCustomerPickup.getShortAllRemainingInput(this.ui.shipmentKey,this.model.shipmentLineList,shortagePopupData.RecordShortage.ShortageReasonCode,shortagePopupData.RecordShortage.CancellationReason);
                    iscMashup.callMashup(this,"recordShortageForAllShipmentLines",shortageInput,{})
                        .then(this.postRecordShortageForShipment.bind(this, "recordShortageForAllShipmentLines"),angular.noop);
                
                }
                else{
                    var mashupArray = [];
                    mashupArray.push(iscMashup.getMashupRefObj(this,'recordShortageForAllShipmentLines',iscCustomerPickup.getShortageLineInput(this.ui.shipmentKey,shipmentLineToBeShorted.ShipmentLineKey,shortagePopupData.RecordShortage.ShortageReasonCode,shortagePopupData.RecordShortage.CancellationReason)));
                    mashupArray.push(iscMashup.getMashupRefObj(this,'getUpdatedShipmentLineDetails',iscCustomerPickup.getShipmentLineDetailsInput(this.ui.shipmentKey,shipmentLineToBeShorted.ShipmentLineKey)));

                    iscMashup.callMashups(this,mashupArray,{})
                        .then(this.postRecordShortageForShipment.bind(this, "getUpdatedShipmentLineDetails"),angular.noop);

                }
            },

            /**
             *@description Callback handler for mashup that is invoked for shorting the lines.
             *@param {String} mashupRefId Mashup ref id
             *@param {Object} response Output data
             */
            postRecordShortageForShipment:function(mashupRefId, response) {
                
                if(mashupRefId == 'recordShortageForAllShipmentLines') {
                    var output = iscMashup.getMashupOutput(response,"recordShortageForAllShipmentLines");
                    if(iscCore.getValueFromJsonPath(output, 'Shipment.ShipmentLines.ShipmentLine')){
                        for(var i=0; i < output.Shipment.ShipmentLines.ShipmentLine.length; i++){
                            this.updateShipmentLineListModel(output.Shipment.ShipmentLines.ShipmentLine[i]);
                        }
                        this.ui.selectedShipmentLineKey = "";
                    }
                    iscModal.showConfirmationMessage(iscI18n.translate('customerpickup.MESSAGE_ShortAllRemainingLinesMessage')).then(function(callBackAction){
                        if(callBackAction === 'YES'){
                            this.invokeFinish(false);
                        } else {
                            // Do nothing
                        }
                    }.bind(this));
                } else {
                    var updatedShipmentModel = iscMashup.getMashupOutput(response,mashupRefId);
                    this.updateShipmentLineListModel(updatedShipmentModel.ShipmentLines.ShipmentLine[0]);
                    this.resetData();
                }
            },
            
            
            /**
             *@description This method is invoked to pick all shipment lines together.
             */
            uiPickupAll : function(){
                var input = { Shipment:{ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey,ShipmentLines:{}}};
                iscMashup.callMashup(this,'pickAllShipmentLines',iscCustomerPickup.getPickAllInput(this.model.shipmentDetails.Shipment.ShipmentKey,this.model.shipmentLineList),{})
                    .then(this.handlePickupAll.bind(this),angular.noop);
            },

            /**
             *@description This method is invoked after pickAllShipmentLines mashup call finishes. It is used to update the existing model for ShipmentLines with api output data. 
             *             It also checks for scan completion.
             *@param {Object} data - ouput object from mashup call.
             */
            handlePickupAll : function(data){
                var output = iscMashup.getMashupOutput(data,"pickAllShipmentLines");
                //console.log(output);
                if(iscCore.getValueFromJsonPath(output, 'Shipment.ShipmentLines.ShipmentLine')){
                    for(var i=0; i < output.Shipment.ShipmentLines.ShipmentLine.length; i++){
                        this.updateShipmentLineListModel(output.Shipment.ShipmentLines.ShipmentLine[i]);
                    }
                    this.ui.selectedShipmentLineKey = "";
                    this.checkForScanComplete();
                }
            },
            /**
             *@description This method internally calls isAllLinesComplete to check if all lines are picked up or not, if yes then it will prompt user to finish the 
             *             customer pickup process.
             */
            checkForScanComplete : function(){
                if(iscCustomerPickup.isAllLinesComplete(this.model.shipmentLineList)){
                    var confirmationMsg = iscI18n.translate('customerpickup.MESSAGE_ScanComplete');
                    var that = this;
                    iscModal.showConfirmationMessage(confirmationMsg).then(
                        function(callBackAction){
                            if(callBackAction === 'YES'){
                                that.invokeFinish(false);
                            }
                        },
                        function(callBackAction){
                            //		Do Nothing
                        }
                    );
                }
            },

            /**
             *@description This method invokes recordCustomerPickup if all validation passes and all lines are picked up.
             *@param {Boolean} checkScanComplete - Boolean attribute to tell whether checking for all lines picked up is required or not.
             */
            invokeFinish : function(checkScanComplete){
                var scanComplete = (checkScanComplete)?iscCustomerPickup.isAllLinesComplete(this.model.shipmentLineList):true;
                var customerVerificationDone = !iscCore.isVoid(this.ui.custVerificationMethod);
                if(!customerVerificationDone){
                    iscModal.showErrorMessage(iscI18n.translate('customerpickup.MESSAGE_Customer_verification_not_done'));
                }
                else if(scanComplete){
                    this.recordCustomerPickup();
                }else{
                    iscModal.showErrorMessage(iscI18n.translate('customerpickup.MESSAGE_PartiallyPickedUp'));
                    //console.log('pickup is not finished yet');
                }
            },
            /**
             *@description This method is used to invoke finish of customer pickup on click of Finish button.
             */
            uiInvokeFinish : function(){
                this.invokeFinish(true);
            },
			/**
             *@description This method is invoked to call recordCustomerPickup api.
             */
            recordCustomerPickup : function(){
                var input = {
                                "Shipment" : {
                                    "ShipmentKey" : this.model.shipmentDetails.Shipment.ShipmentKey,
                                    "Notes" : [
                                        {
                                            "Note" : {}
                                        }
                                    ]
                                }
                            };
                input.Shipment.Notes[0].Note = this.getCustomerVerificationDetails();
                iscMashup.callMashup(this,'recordCustomerPickup',input,{}).then(this.handleRecordCustomerPickup.bind(this),angular.noop);
            },

            /**
             *@description This method is used to get details for customer verification.
             */
            getCustomerVerificationDetails : function(){
                var cust = this.ui.selectedCustomerContact;
                var customerName = iscI18n.translate('address.LABEL_Display_name',{firstname: cust.FirstName,lastname: cust.LastName});
                return {
                            ContactUser : iscAppContext.getFromContext('currentLoginID'),
                            NoteText : iscI18n.translate("customerpickup.MESSAGE_Verfication_note",{customerName:customerName,verificationmethod:this.ui.custVerificationMethod.CodeShortDescription,user:iscAppContext.getFromContext('currentLoginID')}),
                            ReasonCode : "YCD_CUSTOMER_VERIFICATION",
                       };
            },
            
            
            /**
             *@description This method is invoked after recordCustomerPickup mashup call finishes. It is used to show print acknowledgement message if the call to 
             *             recordCustomerPickup api is a scuccess. It will display any error message if recordCustomerPickup didnot finish as expected.
             *@param {Object} data - ouput object from mashup call.
             */
            
            handleRecordCustomerPickup : function(controllerData){
                var shipmentStatus = iscMashup.getMashupOutput(controllerData,"recordCustomerPickup").Shipment.Status;
                if(!iscCore.isVoid(shipmentStatus)){
                    if(shipmentStatus.indexOf("9000") >-1){
                        iscModal.showInfoMessage("customerpickup.MESSAGE_Pickup_order_cancelled")
                            .then(function(action){
                                iscWizard.finishWizard();
                            }.bind(this));
                    }else if(shipmentStatus.indexOf("1400") >-1){
                        iscModal.showInfoMessage("customerpickup.MESSAGE_Pickup_success")
                            .then(function(action){
                                iscWizard.finishWizard();
                            }.bind(this));

                    }
                }
                else{
                    iscModal.showInfoMessage("customerpickup.MESSAGE_Pickup_not_processed")
                        .then(function(action){
                            iscWizard.finishWizard();
                        }.bind(this));
                }
            
            
            },
            /**
             *@description This method shows product details as popup.
             *@param {Object} itemDetails Item details of the product for which popup should be shown
             */
            uiOpenItemDetails:function(itemDetails){
                iscShipment.openProductDetail(itemDetails);
            }
			
		});
	}
]);
