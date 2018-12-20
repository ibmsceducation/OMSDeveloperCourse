/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/

(function(){
    'use strict';

    angular.module('store').controller('store.views.shipment.containerpack.pack-products.pack-products',
  ['$scope','$rootScope','iscWizard','iscMashup','iscResourcePermission','iscModal','iscI18n','iscState','$filter','iscShipment','iscStateParams','$locale','iscPrint','$timeout',
	function($scope,$rootScope,iscWizard,iscMashup,iscResourcePermission,iscModal, iscI18n, iscState,$filter,iscShipment,iscStateParams,$locale,iscPrint,$timeout) {
		iscWizard.initializeWizardPage($scope,{
      model:{

    	  'shipmentDetails':{},
    	  'activeContainerModel':{},
    	  'scanItemInput':{
			  'barcodeData':''
		  },
		  'lastProductScanned':{},
		  'shipmentLineList':{},
          'shipmentContainerDetails':{},
          'containerContents':{}

      },
  		mashupRefs : [

						{
							 mashupRefId: 'getShipmentDetails',
							 mashupId: 'store.views.shipment.containerpack.getShipmentDetails'

						},
		  		        {
							mashupRefId: 'getContainerShipmentLineList',
							mashupId: 'store.views.shipment.containerpack.getContainerShipmentLineList',
							modelName : 'containerContents'
						},
						{
							 mashupRefId: 'registerBarcodeForPacking',
							 mashupId: 'store.views.shipment.containerpack.registerBarCodeForPacking'

						},
						{
							 mashupRefId: 'getShipmentLineList',
							 mashupId: 'store.views.shipment.containerpack.getShipmentLineList'

						},
						{
							mashupRefId: 'containerPack_packAll',
							mashupId: 'store.views.shipment.containerpack.packAll'

						},
                        {
                            mashupRefId: 'getShipmentContainerDetails',
                            mashupId: 'store.views.shipment.containerpack.getShipmentContainerList',
                            modelName:'shipmentContainerDetails'
                        },
                        {
                            mashupRefId: 'generateSCM',
                            mashupId: 'store.views.shipment.containerpack.generateSCM'
                        },
                        {
                            mashupRefId: 'deleteContainer',
                            mashupId: 'store.views.shipment.containerpack.deleteContainer'
                        },
                        {
                        	mashupRefId: 'manualPackForNewContainer',
                            mashupId: 'store.views.shipment.containerpack.manualPackForNewContainer'

                        },
                        {   mashupRefId: 'manualPackForExistingContainer',
                            mashupId: 'store.views.shipment.containerpack.manualPackForExistingContainer'
                        },
                        {
                        	mashupRefId: 'recordShortage',
                            mashupId: 'store.views.shipment.containerpack.recordShortage'

                        },
                        {
                            mashupRefId: 'generateTrackingNoAndPrintLabel',
                            mashupId: 'store.views.shipment.containerpack.StoreContainerLabel_94'
                        },
                        {
                            mashupRefId: 'reprintLabel',
                            mashupId: 'store.views.shipment.containerpack.StoreLabelReprint_94'
                        },
                        {
                            mashupRefId: 'getUpdatedContainerDetails',
                            mashupId: 'store.views.shipment.containerpack.getShipmentContainerDetails'
                        },
                        {
                            mashupRefId:"changeShipmentForWeight",
                            mashupId:"store.views.shipment.containerpack.changeShipmentForWeight"

                        },
                        {
                        	mashupRefId: 'getShipmentContainerList_NoScac',
                            mashupId: 'store.views.shipment.containerpack.getShipmentContainerList_NoScac'
                        },
                        {
                        	mashupRefId: 'getShipmentContainerList_Scac',
                            mashupId: 'store.views.shipment.containerpack.getShipmentContainerList_Scac'
                        },
                        {
                        	mashupRefId: 'finishpack_changeShipment',
                            mashupId: 'store.views.shipment.containerpack.finishpack_changeShipment'

                        },
                        {
                        	mashupRefId: 'voidTrackingNo',
                            mashupId: 'store.views.shipment.containerpack.voidTrackingNo'

                        },
                        {
                        	mashupRefId: 'print_packSlip',
                            mashupId: 'store.views.shipment.containerpack.print_packSlip'

                        }
  		],
  		/**
  		 *@scDoc UI
  		 */
  		ui:{

  			showLastScannedProduct : false,
  			showScanAccordion: true,
  			showProductsAccordion:true,
			slaImageFullURL:'',
			activeTab: '0',
			focusOnFirstLine:true,
			selectedShipmentLineKey:"",
            contianerView:false,
  			containerShownCount:5,
            showProductView:false,
            showPackageView:true,
            totalNoOfpackages:0,
            productLineFilter:"IN_PROGRESS",
			shipmentPreviewTemplate:'store/views/shipment/containerpack/pack-products/shipment-popover-preview.tpl.html',
            isManualPackEnabled:iscResourcePermission.hasPermission("WSC000066"),
            isUnpackAllowed:iscResourcePermission.hasPermission("WSC000063"),
            isPrintAllowed:iscResourcePermission.hasPermission("WSC000064"),
            currentlySelectedShipmentLine:"",
            ONE_QUANTITY:1,
            currentContainerDetails:{},
            draftContainerDetails:{},
            productsToPack: 0,
            selectDraftContainer: false,
            allProductsPacked: false,
            showSuccessMessagePanel: false,
            displayStatus:iscI18n.translate('containerPack.LABEL_1100_70_06_70'),
            successPanelMessage: iscI18n.translate('containerPack.Message_PackCompleted'),
            callGetContainerShipmentLineList : false,
            scacIntegrationReqd:'N'
  		},

  		_isInitSelection: true,

			initialize : function(){

				var pageInput = iscWizard.getWizardPageInput();
			    var apiInput = {Shipment:{ShipmentKey:pageInput.Shipment.ShipmentKey}};
			    if(!iscCore.isVoid(pageInput.Shipment.ItemID)){
			    	apiInput.Shipment.ItemID = pageInput.Shipment.ItemID;
			    	apiInput.Shipment.UnitOfMeasure = pageInput.Shipment.UnitOfMeasure;
			    	apiInput.Shipment.Quantity = pageInput.Shipment.Quantity;
			    }
				//iscMashup.callMashup(this,"getShipmentDetails",apiInput,{}).then(this.processShipmentDetails.bind(this));

				var getShipmentLineListInput = {};
				getShipmentLineListInput.ShipmentLine = {}
				getShipmentLineListInput.ShipmentLine.ShipmentKey = pageInput.Shipment.ShipmentKey;//this.model.shipmentDetails.Shipment.ShipmentKey;

				//iscMashup.callMashup(this,"getShipmentLineList",getShipmentLineListInput,{}).then(this.processGetShipmentLineList.bind(this));

				//var pageInput = iscWizard.getWizardPageInput();
	            var getShipmentContainerDetailsApiInput = {Shipment:{ShipmentKey:pageInput.Shipment.ShipmentKey}};
	            //iscMashup.callMashup(this,"getShipmentContainerDetails",getShipmentContainerDetailsApiInput,{}).then(this.handleShipmentContainerDetails.bind(this));

	        	var mashupArray = [];
	        	mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentDetails',apiInput));
	        	mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentLineList', getShipmentLineListInput));
	        	mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentContainerDetails', getShipmentContainerDetailsApiInput));
	        	//mashupArray.push(iscMashup.getMashupRefObj(this,'getNoteList', {"Note" : { "TableKey" : this.model.orderModel.Order.OrderHeaderKey}}));

	        	iscMashup.callMashups(this,mashupArray,{}).then(this.handleInitApiCalls.bind(this),angular.noop);


			},

			handleInitApiCalls : function(data){
				//var apiOutput = iscMashup.getMashupOutput(data,"getShipmentDetails");
				this.processShipmentDetails(data);

				//apiOutput = iscMashup.getMashupOutput(data,"getShipmentLineList");
				this.processGetShipmentLineList(data);

				//apiOutput = iscMashup.getMashupOutput(data,"getShipmentContainerDetails");
				this.handleShipmentContainerDetails(data);

			},

  		   processShipmentDetails:function(response){

		   if (typeof String.prototype.startsWith != 'function' ) {
				  String.prototype.startsWith = function( str ) {
				    return (this.substring( 0, str.length ) === str);
				  };
			}


  			 var apiOutput = iscMashup.getMashupOutput(response,"getShipmentDetails");
		     this.model.shipmentDetails = apiOutput;
		     this.ui.scacIntegrationReqd = this.model.shipmentDetails.Shipment.ScacIntegrationRequired;
		     this.setSLAImageURL();
  			 this.initializeactiveContainerModel(apiOutput);
  			 //this.loadProductsView();
		     //this.model.shipmentDetails = apiOutput;
  			if((this.model.shipmentDetails.Shipment.Status.Status.startsWith("1100.70.06.50"))){
  				this.ui.displayStatus=iscI18n.translate('containerPack.LABEL_1100_70_06_50');
  			}

  			if(Number(apiOutput.Shipment.ShipmentContainerizedFlag) === 3){
  				this.ui.allProductsPacked = true;
  				this.ui.showSuccessMessagePanel = true;
				//var that = this;
				/*var message = iscI18n.translate('containerPack.Message_PackCompleted');
				iscModal.showSuccessMessage(message, {}).then(
						function(callBackData){
							that.ui.showPackageView = true;
	       				});*/

			}else{
				this.ui.allProductsPacked = false;
				this.ui.showSuccessMessagePanel = false;
				var pageInput = iscWizard.getWizardPageInput();
			    if(!iscCore.isVoid(pageInput.Shipment.ItemID)){
			    	 /*pack products*/
			    	// this.loadProductsView(this.ui.productLineFilter);
			    	 this.ui.showScanAccordion = false;
			    	 this.ui.showProductsAccordion = true;
			    }
			}

  		   },

		 uiGetFormattedOrderNo:function(displayOrderNo) {
			return iscShipment.getDisplayOrderNumber(displayOrderNo,'|',', ',false);
		 },

  		 setSLAImageURL:function() {

	  			var slaImageRelativePath = this.model.shipmentDetails.Shipment.ImageUrl;
	  			if(slaImageRelativePath) {
					this.ui.slaImageFullURL =  iscShipment.getFullURLForImage(slaImageRelativePath);
	  			}

	  			//console.log("setSLAImageURL - ",this.ui.slaImageFullURL);

	  		},

  		 initializeactiveContainerModel:function(shipmentDetails){


  			var activeContainerInfo = {};
			activeContainerInfo.Container = {};

  			if(shipmentDetails.Shipment.Containers.TotalNumberOfRecords == 0){
  				/*its a draft container*/
  				activeContainerInfo.Container.ContainerScm = shipmentDetails.Shipment.Container.ContainerScm;
  				activeContainerInfo.Container.ShipmentContainerKey = "";
  				activeContainerInfo.Container.ContainerNo = iscI18n.translate('containerPack.draftContainer');
  				activeContainerInfo.Container.ContainerDetails = {};
  				activeContainerInfo.Container.ContainerDetails.TotalNumberOfRecords = '0';

  			}else{
  				activeContainerInfo.Container=shipmentDetails.Shipment.Containers.Container[0];
  				this.ui.totalNoOfpackages= shipmentDetails.Shipment.Containers.TotalNumberOfRecords;
  			}
  			this.model.activeContainerModel = activeContainerInfo;
  			this.ui.currentContainerDetails = activeContainerInfo.Container;
  		 },


  		 uiScanProduct : function(barcodedata){
  			var mashupArray = [];
  			if(iscCore.isVoid(barcodedata)){
				iscModal.showErrorMessage(iscI18n.translate('containerPack.MSG_NoProductScanned'));
			}
  			else{

	  			//var shipmentContainerKey = this.model.activeContainerModel.Container.ShipmentContainerKey;
				var shipmentContainerKey = this.ui.currentContainerDetails.ShipmentContainerKey;
	  			var registerBarcodeForPackingInput = {'BarCode':{'BarCodeData':barcodedata}};
				registerBarcodeForPackingInput.BarCode.ShipmentContextualInfo={};
				registerBarcodeForPackingInput.BarCode.ShipmentContextualInfo.ShipmentKey=this.model.shipmentDetails.Shipment.ShipmentKey;

				var input = {};
				input.ShipmentLine = {}
				input.ShipmentLine.ShipmentKey = this.model.shipmentDetails.Shipment.ShipmentKey;



	  			if(iscCore.isVoid(shipmentContainerKey)){
					registerBarcodeForPackingInput.BarCode.ShipmentContextualInfo.ContainerScm=this.model.activeContainerModel.Container.ContainerScm;
		  			//iscMashup.callMashup(this,"registerBarcodeForPacking",registerBarcodeForPackingInput,{}).then(this.handleBarCodeScanning.bind(this,shipmentContainerKey));
					mashupArray.push(iscMashup.getMashupRefObj(this,'registerBarcodeForPacking',registerBarcodeForPackingInput));
					mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentLineList', input));
					iscMashup.callMashups(this,mashupArray,{}).then(this.handleBarCodeScanning.bind(this,shipmentContainerKey),angular.noop);
	  			}else{
	  				registerBarcodeForPackingInput.BarCode.ShipmentContextualInfo.ShipmentContainerKey=shipmentContainerKey;

	  	            var getShipmentLineListInput = {
	  	                    ShipmentLine:{
	  	                        ShipmentContainerKey : shipmentContainerKey,
	  	                        ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey,
	  	                        ContainerDetails:{
	  	                            ContainerDetail:{
	  	                                Container:{
	  	                                    ShipmentContainerKey : shipmentContainerKey,
	  	                                    ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
	  	                                }

	  	                            }
	  	                        }
	  	                    }
	  	                };


		        	mashupArray.push(iscMashup.getMashupRefObj(this,'registerBarcodeForPacking',registerBarcodeForPackingInput));
		        	mashupArray.push(iscMashup.getMashupRefObj(this,'getContainerShipmentLineList', getShipmentLineListInput));
		        	//mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentContainerDetails', getShipmentContainerDetailsApiInput));
		        	//mashupArray.push(iscMashup.getMashupRefObj(this,'getNoteList', {"Note" : { "TableKey" : this.model.orderModel.Order.OrderHeaderKey}}));
		        	mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentLineList', input));
		        	iscMashup.callMashups(this,mashupArray,{}).then(this.handleBarCodeScanning.bind(this,shipmentContainerKey),angular.noop);

					//iscMashup.callMashup(this,'getContainerShipmentLineList',getShipmentLineListInput,{});

	  	  			//iscMashup.callMashup(this,"registerBarcodeForPacking",registerBarcodeForPackingInput,{}).then(this.handleScanOutput.bind(this,shipmentContainerKey));

	  			}
	  			this.model.scanItemInput.barcodeData = "";
  		   }
  		 },

  		 refreshCurrentContainerContents: function(){
            var getShipmentLineListInput = {
                    ShipmentLine:{
                        ShipmentContainerKey : this.ui.currentContainerDetails.ShipmentContainerKey,
                        ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey,
                        ContainerDetails:{
                            ContainerDetail:{
                                Container:{
                                    ShipmentContainerKey : this.ui.currentContainerDetails.ShipmentContainerKey,
                                    ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
                                }

                            }
                        }
                    }
                };

				iscMashup.callMashup(this,'getContainerShipmentLineList',getShipmentLineListInput,{});
  		 },
  		handleBarCodeScanning:function(shipmentContainerKey,response){
  			this.handleScanOutput(shipmentContainerKey,response);
  			if(!iscCore.isVoid(shipmentContainerKey)){
  				this.refreshCurrentContainerDetails(shipmentContainerKey);
  			}
  			//var apiOutput = iscMashup.getMashupOutput(response,"getContainerShipmentLineList");

  			var shipmentLineKey = "";
  			var isPackComplete = 'N';
  			var apiOutput = iscMashup.getMashupOutput(response,"registerBarcodeForPacking");
  			var count = 0;
  			this.model.shipmentLineList = iscMashup.getMashupOutput(response,"getShipmentLineList");
  			if(!iscCore.isVoid(apiOutput.BarCode) && (apiOutput.BarCode.Shipment) && (apiOutput.BarCode.Shipment.ShipmentLine) && (apiOutput.BarCode.Shipment.ShipmentLine.ShipmentLineKey)){

  				this.ui.selectedShipmentLineKey = apiOutput.BarCode.Shipment.ShipmentLine.ShipmentLineKey ;
  				this.ui.focusOnFirstLine = false;
  	  			shipmentLineKey = apiOutput.BarCode.Shipment.ShipmentLine.ShipmentLineKey ;
  	  			isPackComplete = apiOutput.BarCode.Shipment.ShipmentLine.IsPackComplete ;

  	  			if(!iscCore.isVoid(this.model.shipmentLineList) && !iscCore.isVoid(this.model.shipmentLineList.ShipmentLines) && !iscCore.isVoid(this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords)) {
  	  	  			var shipmentLines = [];

  	  	  			shipmentLines = this.model.shipmentLineList.ShipmentLines;

  	  	  			if(isPackComplete == 'Y'){
  	  	  	  			for(var i= 0; i < this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords; i++ ){
  	  	  	  				if(shipmentLineKey == this.model.shipmentLineList.ShipmentLines.ShipmentLine[i].ShipmentLineKey){
  	  	  	  					this.model.shipmentLineList.ShipmentLines.ShipmentLine[i].IsPackComplete = 'Y';
  	  	  	  				}
	  	  					if(!iscCore.isVoid(this.model.shipmentLineList.ShipmentLines.ShipmentLine[i].IsPackComplete) && this.model.shipmentLineList.ShipmentLines.ShipmentLine[i].IsPackComplete != 'Y'){
		  	  					count += 1;
		  	  				}else if(iscCore.isVoid(this.model.shipmentLineList.ShipmentLines.ShipmentLine[i].IsPackComplete)){
		  	  					count += 1;
		  	  				}
  	  	  	  			}
  	  	  	  			this.ui.productsToPack = count;
  	  	  			}

	  	  	  		for(var j= 0; j < this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords; j++ ){
	  	  	  			if(shipmentLineKey == this.model.shipmentLineList.ShipmentLines.ShipmentLine[j].ShipmentLineKey){
	  	  	  				var temp = this.model.shipmentLineList.ShipmentLines.ShipmentLine[j];
	  	  	  				this.model.shipmentLineList.ShipmentLines.ShipmentLine.splice(j,1);
	  	  	  				this.model.shipmentLineList.ShipmentLines.ShipmentLine.splice(0,0,temp);
	  	  	  			}
	  	  	  		}
  	  			}
  	  			if(!iscCore.isVoid(apiOutput.BarCode.Shipment.ShipmentLine.Instructions) && !iscCore.isVoid(apiOutput.BarCode.Shipment.ShipmentLine.Instructions.Instruction)){
  	  				this.uiopenPackInstructions(apiOutput.BarCode.Shipment.ShipmentLine);
  	  			}
  			}
  		},

  		handleScanOutput: function(shipmentContainerKey,response){

  			var apiOutput = iscMashup.getMashupOutput(response,"registerBarcodeForPacking");
  			if(iscCore.isVoid(shipmentContainerKey)){

  				/*update the activeContainerModel model*/
  				this.updateActiveContainerModel(apiOutput);

  			}
  			this.updateLastScannedProduct(apiOutput);
  			this.setPackableQty(this.model.lastProductScanned.ShipmentLine);
  			this.uiStampContainerDetailQty(this.model.lastProductScanned.ShipmentLine);
  			this.resetData();
  			if(Number(apiOutput.BarCode.Shipment.ShipmentContainerizedFlag) === 3){
  				this.ui.allProductsPacked = true;
  				this.ui.showSuccessMessagePanel = true;
				//var that = this;
				//var message = iscI18n.translate('containerPack.Message_PackCompleted');
				//iscModal.showSuccessMessage(message, {}).then({});
//						function(callBackData){
							/*paint packages view*/
	//						that.ui.showPackageView = true;
	  //     				});
			}else{
				this.ui.allProductsPacked = false;
				this.ui.showSuccessMessagePanel = false;
			}
  			var lineList = this.model.shipmentLineList.ShipmentLines ;
  			for(var i= 0; i < this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords; i++ ){
				if(!iscCore.isVoid(lineList.ShipmentLine[i].IsPackComplete) && lineList.ShipmentLine[i].IsPackComplete == 'Y' && lineList.ShipmentLine[i].ShortageQty > 0){
					this.ui.allProductsPacked = false;
				}
  			}
  		},
  		uiDisplayContainerDetails : function(container){

  			this.ui.currentContainerDetails = container;

  			if(iscCore.isVoid(container.ShipmentContainerKey)){
  				this.model.containerContents.ShipmentLines.ShipmentLine = {};
                this.ui.currentContainerDetails.ContainerDetails = {};
                this.ui.currentContainerDetails.ContainerDetails.TotalNumberOfRecords = "0";
                this.ui.currentContainerDetails.ActualWeight = "0";
  			}else{
	  			var getShipmentLineListInput = {
	                    ShipmentLine:{
	                        ShipmentContainerKey : container.ShipmentContainerKey,
	                        ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey,
	                        ContainerDetails:{
	                            ContainerDetail:{
	                                Container:{
	                                    ShipmentContainerKey : container.ShipmentContainerKey,
	                                    ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
	                                }
	                            }
	                        }
	                    }
	                };
	  			this.ui.selectDraftContainer = false;
  				iscMashup.callMashup(this,'getContainerShipmentLineList',getShipmentLineListInput,{});
  				this.refreshCurrentContainerDetails(container.ShipmentContainerKey);
  			}
  		},

  		updateActiveContainerModel :function(apiOutput){

  			var containers =[] ;
  			if(!iscCore.isVoid(apiOutput.BarCode)){
  				containers= apiOutput.BarCode.Containers.Container;
  			}else if(!iscCore.isVoid(apiOutput.Shipment)){
  				containers= apiOutput.Shipment.Containers.Container;
  			}

  			for(var j=0; j<containers.length; j++){
  				if(containers[j].ContainerScm == this.model.activeContainerModel.Container.ContainerScm ){
  					var activeContainerInfo = {};
  	  				activeContainerInfo.Container = {};
  	  			    activeContainerInfo.Container = containers[j];
  	  			    this.model.activeContainerModel = activeContainerInfo;
  	  			    //this.ui.currentContainerDetails = activeContainerInfo.Container;
  	  			    this.uiLoadShipmentContainerDetails();
  				}
  			}
  			this.model.shipmentContainerDetails.Containers.Container = containers;
  			this.ui.totalNoOfpackages = containers.length;
  		},


  		updateLastScannedProduct:function(apiOutput){

  			var lastScannedproduct = {};
  			lastScannedproduct.ShipmentLine={};
  			lastScannedproduct.ShipmentLine=apiOutput.BarCode.Shipment.ShipmentLine;
  			this.model.lastProductScanned= lastScannedproduct;
  			this.ui.showLastScannedProduct = true;
  		},

  		uiGetRemainingQuantity:function(shipmentLine) {

		 var quantity = Number(shipmentLine.Quantity);
       	 var backroomPickedQty = Number(shipmentLine.PlacedQuantity);
       	 var remainingQty =  quantity - backroomPickedQty;
       	 return remainingQty;

		},

		uiopenPackInstructions : function(shipmentLine){


			var messageOption = {
					options: {
						headerText: iscI18n.translate('containerPack.TITLE_PackInstructions'),
					    headerIconCss: "app-glyphicons app-icon-package_30"
					},

				};

		var instructionText =  shipmentLine.Instructions.Instruction.InstructionText;

		if(iscCore.isVoid(instructionText)){
			instructionText = shipmentLine.Instructions.Instruction[0].InstructionText
		}

		iscModal.showInfoMessage(instructionText,messageOption);
		},



		loadProductsView : function(filterData){


			var getShipmentLineListInput = {};
			getShipmentLineListInput.ShipmentLine = {}
			getShipmentLineListInput.ShipmentLine.ShipmentContainerKey = this.model.activeContainerModel.Container.ShipmentContainerKey;
			getShipmentLineListInput.ShipmentLine.ShipmentKey = this.model.shipmentDetails.Shipment.ShipmentKey;

			if(!iscCore.isVoid(filterData) && filterData == 'IN_PROGRESS'){
				getShipmentLineListInput.ShipmentLine.IsPackComplete='Y';
				getShipmentLineListInput.ShipmentLine.IsPackCompleteQryType='NE';
			}
			iscMashup.callMashup(this,"getShipmentLineList",getShipmentLineListInput,{}).then(this.processGetShipmentLineList.bind(this));
		},

		processGetShipmentLineList:function(response){
			//this._isInitSelection = true;
			var apiOutput = iscMashup.getMashupOutput(response,"getShipmentLineList");
			this.model.shipmentLineList= {};
			this.model.shipmentLineList = apiOutput;
			this.ui.allProductsPacked = true;
			var count = 0;
			if(!iscCore.isVoid(apiOutput) && !iscCore.isVoid(apiOutput.ShipmentLines) && !iscCore.isVoid(apiOutput.ShipmentLines.ShipmentLine) && !iscCore.isVoid(apiOutput.ShipmentLines.ShipmentLine.length) ){
				for(var i = 0; i < apiOutput.ShipmentLines.ShipmentLine.length ; i++){
					if(!iscCore.isVoid(apiOutput.ShipmentLines.ShipmentLine[i].IsPackComplete) && apiOutput.ShipmentLines.ShipmentLine[i].IsPackComplete == 'Y' && apiOutput.ShipmentLines.ShipmentLine[i].ShortageQty == 0){

					}else{
						this.ui.allProductsPacked = false;
						break;
					}
				}
				for(var i = 0; i < apiOutput.ShipmentLines.ShipmentLine.length ; i++){
					if(!iscCore.isVoid(apiOutput.ShipmentLines.ShipmentLine[i].IsPackComplete) && apiOutput.ShipmentLines.ShipmentLine[i].IsPackComplete != 'Y'){
						count += 1;
					}else if(iscCore.isVoid(apiOutput.ShipmentLines.ShipmentLine[i].IsPackComplete)){
						count += 1;
					}
				}
				if(this._isInitSelection == true){
					for(var i = 0; i < apiOutput.ShipmentLines.ShipmentLine.length ; i++){
						if(!iscCore.isVoid(apiOutput.ShipmentLines.ShipmentLine[i].IsPackComplete)){
							if(apiOutput.ShipmentLines.ShipmentLine[i].IsPackComplete != 'Y'){ //ui.selectedShipmentLineKey
								this.ui.selectedShipmentLineKey=apiOutput.ShipmentLines.ShipmentLine[i].ShipmentLineKey;
								break;
							}else if(apiOutput.ShipmentLines.ShipmentLine[i].IsPackComplete == 'Y' && apiOutput.ShipmentLines.ShipmentLine[i].ShortageQty != '0'){
								this.ui.selectedShipmentLineKey=apiOutput.ShipmentLines.ShipmentLine[i].ShipmentLineKey;
								break;
							}
						}else{
							this.ui.selectedShipmentLineKey=apiOutput.ShipmentLines.ShipmentLine[i].ShipmentLineKey;
							break;
						}
					}
					this._isInitSelection = false;
				}else{
					//this.ui.selectedShipmentLineKey
					for(var k = 0; k < this.model.shipmentLineList.ShipmentLines.ShipmentLine.length ; k++){
						if(!iscCore.isVoid(this.model.shipmentLineList.ShipmentLines.ShipmentLine[k].ShipmentLineKey)){
							if(this.model.shipmentLineList.ShipmentLines.ShipmentLine[k].ShipmentLineKey == this.ui.selectedShipmentLineKey){
		  	  	  				var temp = this.model.shipmentLineList.ShipmentLines.ShipmentLine[k];
		  	  	  				this.model.shipmentLineList.ShipmentLines.ShipmentLine.splice(k,1);
		  	  	  				this.model.shipmentLineList.ShipmentLines.ShipmentLine.splice(0,0,temp);
							}
						}
					}
				}
				this.ui.productsToPack = count;
			}
			//this.ui.selectedShipmentLineKey="";
			this.ui.currentlySelectedShipmentLine = this.model.shipmentLineList.ShipmentLines.ShipmentLine[0];
			if(iscCore.isVoid(this.ui.selectedShipmentLineKey) || (this.ui.selectedShipmentLineKey == "")){
				this.ui.focusOnFirstLine = true;
			}
			this.setPackableQty(this.ui.currentlySelectedShipmentLine);
			this.uiStampContainerDetailQty(this.ui.currentlySelectedShipmentLine);
		},


		expandOrCollapseScanView:function(showScanAccordion){

			if(showScanAccordion === true){
			   this.ui.showLastScannedProduct = false;
			   this.model.lastProductScanned={}
			}

		},

		expandOrCollapseProductsView:function(showProductAccordion){

			if(showProductAccordion === true){
				this.loadProductsView(this.ui.productLineFilter);
			}
		},

		uiOnProductsTabSelection:function(){
			if(this.ui.showScanAccordion === true){
				 this.ui.showLastScannedProduct = false;
				 this.model.lastProductScanned={}
			}
			else if(this.ui.showProductsAccordion === true){
				this.resetShipmentLineSelection();
				this.loadProductsView(this.ui.productLineFilter);
			 }

		},

		uiPackAll : function(){

			//var shipmentContainerKey = this.model.activeContainerModel.Container.ShipmentContainerKey;
			var shipmentContainerKey = this.ui.currentContainerDetails.ShipmentContainerKey;
			var packAllInputModel = {};
			var mashupArray = [];

			packAllInputModel.Shipment= {};
			packAllInputModel.Shipment.ShipmentKey= this.model.shipmentDetails.Shipment.ShipmentKey;
			packAllInputModel.Shipment.Containers = {};
			packAllInputModel.Shipment.Containers.Container={};
			packAllInputModel.Shipment.Containers.Container.ContainerScm = this.ui.currentContainerDetails.ContainerScm;
			packAllInputModel.Shipment.Containers.Container.ShipmentContainerKey = shipmentContainerKey;
			//iscMashup.callMashup(this,"containerPack_packAll",packAllInputModel,{}).then(this.handlePackAll.bind(this,shipmentContainerKey));
			mashupArray.push(iscMashup.getMashupRefObj(this,'containerPack_packAll',packAllInputModel));

            var getShipmentLineListInput = {
                    ShipmentLine:{
                        ShipmentContainerKey : this.ui.currentContainerDetails.ShipmentContainerKey,
                        ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey,
                        ContainerDetails:{
                            ContainerDetail:{
                                Container:{
                                    ShipmentContainerKey : this.ui.currentContainerDetails.ShipmentContainerKey,
                                    ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
                                }

                            }
                        }
                    }
                };
            mashupArray.push(iscMashup.getMashupRefObj(this,'getContainerShipmentLineList',getShipmentLineListInput));
				//iscMashup.callMashup(this,'getContainerShipmentLineList',getShipmentLineListInput,{}).then(this.sampleHandler.bind(this));
            iscMashup.callMashups(this,mashupArray,{}).then(this.handlePackAll.bind(this,shipmentContainerKey),angular.noop);
		},

		handlePackAll : function(shipmentContainerKey,response){
			var apiOutput = iscMashup.getMashupOutput(response,"containerPack_packAll");

			if(!iscCore.isVoid(apiOutput.Shipment.AlreadyPacked)){
				iscModal.showErrorMessage(iscI18n.translate('containerPack.MessageAllLinesPacked'));

			}else{
					if(iscCore.isVoid(shipmentContainerKey)){
		  				this.updateActiveContainerModel(apiOutput);
		  			}
					if(Number(apiOutput.Shipment.ShipmentContainerizedFlag) === 3){
						this.ui.showSuccessMessagePanel = true;
						/*var that = this;
						that.ui.allProductsPacked = true;
						var message = iscI18n.translate('containerPack.Message_PackCompleted');
						iscModal.showSuccessMessage(message, {}).then(
    							function(callBackData){
    								that.ui.showPackageView = true;
			       				});*/
					}else{
						this.ui.allProductsPacked = false;
						this.ui.showSuccessMessagePanel = false;
					}
					this.refreshCurrentContainerDetails(shipmentContainerKey);
					this.loadProductsView();
					//this.refreshCurrentContainerContents();
			}

		},


		checkForScreenDirtyBeforeClose:function() {

  			var that = this;
  			var isDirty = $scope.containerPackForm.$dirty;
        	if(isDirty) {
        		iscModal.showConfirmationMessage(iscI18n.translate('globals.MSG_Screen_dirty')).then(function(action){
        			if(action === 'YES'){
        				iscWizard.closeWizard();
        			}
        		});
        	} else {

        		iscModal.showConfirmationMessage(iscI18n.translate('containerPack.MSG_CancelWarningMessage')).then(function(action){
        			if(action === 'YES'){
        				iscWizard.closeWizard();
        			}
        		});

        	}

  		},

  		uiCancel:function() {
  			this.checkForScreenDirtyBeforeClose();
  		},


		uiApplyProductListFilter : function(callBackData){

 			//$scope.backroomPickForm.$setPristine();
			this.ui.productLineFilter = callBackData.filter;
  			this.loadProductsView(callBackData.filter);

  		},

  		handleRefreshProductList:function(mashupRefId, response) {

  			this.model.shipmentLineList = iscMashup.getMashupOutput(response,mashupRefId);
  			this.setPickableShipmentLineCount(this.model.shipmentLineList);
  			this.ui.focusOnFirstLine = true;
  			this.ui.selectedShipmentLineKey = '';

  		},

  		handleWizardBack:function() {

  			var isFirstPage = iscWizard.isFirstPage();
  			var isDirty = $scope.containerPackForm.$dirty;
			 if(isFirstPage){
				 if(isDirty){
					iscModal.showConfirmationMessage('globals.MSG_Screen_dirty').then(
							function(callBackAction){
								if(callBackAction === 'YES'){
									iscWizard.closeWizard();
								}
		       				});
					return true;
				 }else{
						iscModal.showConfirmationMessage('containerPack.MSG_CancelWarningMessage').then(
								function(callBackAction){
									if(callBackAction === 'YES'){
										iscWizard.closeWizard();
									}
			       				});
						return true;
				 }
			} else {
				return false;
			}
 		},

  		uiSelectShipmentLine:function(shipmentLine) {
  			this._isInitSelection = false;
  			this.ui.selectedShipmentLineKey = shipmentLine.ShipmentLineKey;
			this.ui.focusOnFirstLine = false;
			this.ui.currentlySelectedShipmentLine = shipmentLine;
			this.setPackableQty(shipmentLine);
			this.uiStampContainerDetailQty(shipmentLine);
  		},


  		resetShipmentLineSelection : function(){
  			this.ui.selectedShipmentLineKey = "";
  			this.ui.focusOnFirstLine = true;
  		},

        uiLoadShipmentContainerDetails : function(){
            this.ui.contianerView = true;
            var pageInput = iscWizard.getWizardPageInput();
            var apiInput = {Shipment:{ShipmentKey:pageInput.Shipment.ShipmentKey}};
            iscMashup.callMashup(this,"getShipmentContainerDetails",apiInput,{}).then(this.handleShipmentContainerDetails.bind(this),angular.noop);
        },

        handleShipmentContainerDetails : function(controllerData){
            var output = iscMashup.getMashupOutput(controllerData,"getShipmentContainerDetails");
            if(!iscCore.isVoid(this.ui.draftContainerDetails) && !iscCore.isVoid(this.ui.draftContainerDetails.ContainerNo)){
            	//this.model.shipmentContainerDetails.Containers.Container.push(this.ui.draftContainerDetails);
            	if(iscCore.isVoid(this.model.shipmentContainerDetails.Containers)){
            		this.model.shipmentContainerDetails.Containers = {};
            		this.model.shipmentContainerDetails.Containers.Container = [];
            	}else if(iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container)){
            		this.model.shipmentContainerDetails.Containers.Container = [];
            	}
            	this.model.shipmentContainerDetails.Containers.Container.splice(0,0,this.ui.draftContainerDetails);
            	this.ui.draftContainerDetails = {};
            }
            var pageInput = iscWizard.getWizardPageInput();
            if(!iscCore.isVoid(output.Containers.Container)){
                for(var i=0;i<output.Containers.Container.length;i++){
                    this.updateContainerFlags(output.Containers.Container[i]);
                }
                this.ui.currentContainerDetails = output.Containers.Container[0];
                if(!iscCore.isVoid(output.Containers.Container[0].ShipmentContainerKey)){
                    var getShipmentLineListInput = {
                            ShipmentLine:{
                                ShipmentContainerKey : output.Containers.Container[0].ShipmentContainerKey,
                                ShipmentKey : pageInput.Shipment.ShipmentKey,
                                ContainerDetails:{
                                    ContainerDetail:{
                                        Container:{
                                            ShipmentContainerKey : output.Containers.Container[0].ShipmentContainerKey,
                                            ShipmentKey : pageInput.Shipment.ShipmentKey
                                        }

                                    }
                                }
                            }
                        };
        				iscMashup.callMashup(this,'getContainerShipmentLineList',getShipmentLineListInput,{});
                }else{
                	this.model.containerContents = {};
                }
            }
            else{
                output.Containers.Container = [];
            }

        },

        uiValidateWeightAndUpdate : function(weightField,container){

            var formats = $locale.NUMBER_FORMATS;
            var newWeight = container.ActualWeight;
            if(newWeight){
                newWeight=newWeight.replace(formats.GROUP_SEP, '');
            }
            if(!iscCore.isVoid(newWeight) && weightField.oldWeight !== newWeight ){
                //&& Number(container.ActualWeight) != Number(container.ActualWeight)
                weightField.oldWeight = newWeight ;

                container.ActualWeight = newWeight;
                if(weightField.oldWeight !== newWeight){
                    weightField.oldWeight = newWeight ;
                }
                if(!iscCore.isVoid(container) && !iscCore.isVoid(container.TrackingNo)){
                	if(container.TrackingNo != ''){
                		var input = {
                                Container:{
                                    ShipmentContainerKey : container.ShipmentContainerKey,
                                    ShipmentKey : container.ShipmentKey
                                }
                            };
                		iscMashup.callMashup(this,"voidTrackingNo",input,{}).then(this.updateWeightAfterVoiding.bind(this,container));
                	}else{
                		this.saveContainerWeight(container);
                	}
                }else{
            		this.saveContainerWeight(container);
                }
            }
        },

        updateWeightAfterVoiding : function (container,response){
        	this.saveContainerWeight(container);
        },

        saveContainerWeight : function(container){

            if(Number(container.ContainerDetails.TotalNumberOfRecords) ===0 ){
                iscModal.showErrorMessage("containerPack.Message_EmptyContainer");
            }
            else{
                if(iscCore.isVoid(container.ActualWeight)){
                    iscModal.showErrorMessage("containerPack.Message_NoPackageWeight");
                }
                else if(Number(container.ActualWeight) < 0){
                    iscModal.showErrorMessage("containerPack.Message_NegativePackageWeight");
                }
                /*else if(){
                   //Check for quantity has changed or not
                }*/
                else{
                    var input = {
                        Shipment:{
                            ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey,
                            Containers:{
                                Container:{
                                    ActualWeight:container.ActualWeight,
                                    ShipmentContainerKey:container.ShipmentContainerKey,
                                    ActualWeightUOM:container.ActualWeightUOM

                                }
                            }
                        }
                    };
                    if(this.ui.scacIntegrationReqd==="N"){
                        input.Shipment.Containers.Container.IsPackProcessComplete = "Y";
                    }else{
                        if(!iscCore.isVoid(container.TrackingNo)){
                            input.Shipment.CallVoidTrackingNo="Y";
                        }
                    }


                    var container_input = {
                        Container:{
                            ShipmentContainerKey : container.ShipmentContainerKey,
                            ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
                        }
                    };

                    var mashupArray = [];
                    mashupArray.push(iscMashup.getMashupRefObj(this,'changeShipmentForWeight',input));
                    mashupArray.push(iscMashup.getMashupRefObj(this,'getUpdatedContainerDetails',container_input));

                    iscMashup.callMashups(this,mashupArray,{})
                        .then(function(controllerData){
                            this.handleContainerWeightUpdate(controllerData,container);
                        }.bind(this),angular.noop);


                }

            }

        },
        //model.shipmentDetails.Shipment.ScacIntegrationRequired === 'Y'
        uiShowTrackingNo : function(){
        	if(!iscCore.isVoid(this.model.shipmentDetails) && !iscCore.isVoid(this.model.shipmentDetails.Shipment) && !iscCore.isVoid(this.model.shipmentDetails.Shipment.ScacIntegrationRequired) ){
        		if(this.model.shipmentDetails.Shipment.ScacIntegrationRequired == 'Y'){
        			if(!iscCore.isVoid(this.ui.currentContainerDetails.TrackingNo) && this.ui.currentContainerDetails.TrackingNo != ''){
        				return true;
        			}
        		}
        	}
        	return false;
        },
        uiScrollLeft: function(){
        	//console.log(document.getElementById('containers').scrollLeft);
        	document.getElementById('containers').scrollLeft -= 120;

        },
        uiScrollRight: function(){
        	//console.log(document.getElementById('containers').scrollLeft);
        	document.getElementById('containers').scrollLeft += 120;
        },
        handleContainerWeightUpdate : function(controllerData,container){
            var containerOutput = iscMashup.getMashupOutput(controllerData,"getUpdatedContainerDetails");

            container.ActualWeight = containerOutput.Container.ActualWeight;
            container.TrackingNo = containerOutput.Container.TrackingNo;
            container.TrackingURL = containerOutput.Container.TrackingURL;

            this.updateContainerFlags(container);
            $scope.containerPackForm.$setPristine();
        },

        refreshCurrentContainerDetails : function (ShipmentContainerKey){
            var container_input = {
                    Container:{
                        ShipmentContainerKey : ShipmentContainerKey,
                        ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
                    }
                };

            iscMashup.callMashup(this,"getUpdatedContainerDetails",container_input,{}).then(this.handleRefreshCurrentContainerDetails.bind(this));

        },

        handleRefreshCurrentContainerDetails: function(response){
            var containerOutput = iscMashup.getMashupOutput(response,"getUpdatedContainerDetails");

            if(!iscCore.isVoid(containerOutput) && !iscCore.isVoid(containerOutput.Container)){
            	this.ui.currentContainerDetails = containerOutput.Container;
            }
        },

        uiShowWeightUpdateButton : function(weightField,container){
            var formats = $locale.NUMBER_FORMATS;
            var newWeight = container.ActualWeight;
  			if(newWeight){
  				newWeight=newWeight.replace(formats.GROUP_SEP, '');
            }
  			if((!iscCore.isVoid(newWeight)) && Number(weightField.oldWeight) !== Number(newWeight))
                container.showWeightUpdate ='Y';
            else
                container.showWeightUpdate ='N';
        },

        /**
         *@iscdoc uimethod
         *@viewname store.views.order.cart-details.cart-details
         *@methodname uiHideUpdateButton.
         *@description hides Update button for quantity field.
         *@param {Object} orderlineModel - orderLine data as JSON object.
         */

        uiHideWeightUpdateButton : function(container){
            container.showWeightUpdate ='N';
        },

        uiValidateWeight : function(validationResponseObj, angularErrorObject, modelValue, viewValue){

            /* check if the DataType Validation is successful */

            if(!iscCore.isVoid(angularErrorObject) && angularErrorObject.iscDatatypeValidator)
                return validationResponseObj;
            else
            var isWeight_a_Number = !isNaN(viewValue);
            if(!iscCore.isBooleanTrue(isWeight_a_Number) || iscCore.isVoid(viewValue)){
                validationResponseObj.booleanResponse = !isNaN(viewValue) && !iscCore.isVoid(viewValue);
                validationResponseObj.errorMesssage = iscI18n.translate("containerPack.ERROR_invalid_input");
            }

            return validationResponseObj;
        },



        uiAddNewContainer : function(){

        	if(!iscCore.isVoid(this.ui.currentContainerDetails) && !iscCore.isVoid(this.ui.currentContainerDetails.ShipmentContainerKey) && !(this.ui.currentContainerDetails.ShipmentContainerKey == "") ){
        		if(this.model.shipmentContainerDetails.Containers.Container.length > 1){
            		if(this.isDraftContainerPresent()){
            			//this.uiDisplayContainerDetails(this.model.shipmentContainerDetails.Containers.Container
            			if(!iscCore.isVoid(this.model.shipmentContainerDetails) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers) &&
            					!iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container.length) ){
            				if(this.model.shipmentContainerDetails.Containers.Container.length > 1){
            					this.uiDisplayContainerDetails(this.model.shipmentContainerDetails.Containers.Container[0]);
            				}
            			}
            			document.getElementById('containers').scrollLeft = 0;
            		}else{
                        var apiInput = {
                                generateSCM : {
                                    ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey,
                                    EnterpriseCode:this.model.shipmentDetails.Shipment.EnterpriseCode
                                }

                            };
                        iscMashup.callMashup(this,"generateSCM",apiInput,{}).then(this.handleGenerateSCM.bind(this),angular.noop);
            		}
        		}else{
                    var apiInput = {
                            generateSCM : {
                                ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey,
                                EnterpriseCode:this.model.shipmentDetails.Shipment.EnterpriseCode
                            }

                        };
                    iscMashup.callMashup(this,"generateSCM",apiInput,{}).then(this.handleGenerateSCM.bind(this),angular.noop);
        		}
        	}
        },
        isDraftContainerPresent : function(){
        	var containerList = this.model.shipmentContainerDetails.Containers.Container;

        	for(var i=0;i<containerList.length;i++){
        		if(containerList[i].ShipmentContainerKey == ""){
        			return true;
        		}
        	}
        },
        handleGenerateSCM : function(controllerData){

            var output = iscMashup.getMashupOutput(controllerData,"generateSCM");

            if(!iscCore.isVoid(iscCore.getValueFromJsonPath(output,"SCMs.SCM.SCM"))){
                this.model.activeContainerModel = {
                    Container:{}
                };
                this.model.activeContainerModel.Container.ContainerScm = output.SCMs.SCM.SCM;
                this.model.activeContainerModel.Container.ContainerNo = iscI18n.translate('containerPack.draftContainer');
                this.ui.currentContainerDetails = this.model.activeContainerModel.Container;
                this.ui.currentContainerDetails.ShipmentContainerKey = "";
                this.ui.selectDraftContainer = true;

                if(iscCore.isVoid(iscCore.getValueFromJsonPath(this.model.shipmentContainerDetails,"Containers.Container"))){
                    this.model.shipmentContainerDetails.Containers = {
                        Container : []
                    }
                }

                //this.model.shipmentContainerDetails.Containers.Container.push(this.model.activeContainerModel.Container);
                this.model.shipmentContainerDetails.Containers.Container.unshift(this.model.activeContainerModel.Container);
                this.model.shipmentContainerDetails.Containers.TotalNumberOfRecords = this.model.shipmentContainerDetails.Containers.Container.length;

                this.ui.showPackageView = false;
                this.ui.showProductView = true;
                this.uiOnProductsTabSelection();
                this.model.containerContents.ShipmentLines.ShipmentLine = {};
                this.ui.currentContainerDetails.ContainerDetails = {};
                this.ui.currentContainerDetails.ContainerDetails.TotalNumberOfRecords = "0";
                this.ui.currentContainerDetails.ActualWeight = "0";


            }

        },

        updateContainerFlags : function(container){

            if(this.ui.scacIntegrationReqd === "Y"){
                if(!iscCore.isVoid(container.TrackingNo)){
                    container.isComplete = true;
                }
                else{
                    container.isComplete = false;
                }
            }
            else{
                if(!iscCore.isVoid(container.ActualWeight) && Number(container.ActualWeight) > 0){
                    container.isComplete = true;
                }
                else{
                    container.isComplete = false;
                }
            }
            container.showWeightUpdate = "N";

        },

        uiGenerateTrackingNo : function(container){
        	if(!iscCore.isVoid(container.ShipmentContainerKey)){
                if(iscCore.isVoid(container.ActualWeight) || Number(container.ActualWeight) === 0){
                    iscModal.showErrorMessage("containerPack.Message_ContainerNotweighed");
                }
                else{
                    var input = {
                        Container:{
                            ShipmentContainerKey : container.ShipmentContainerKey,
                            ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
                        }
                    }

                    var mashupArray = [];
                    mashupArray.push(iscMashup.getMashupRefObj(this,'generateTrackingNoAndPrintLabel',input));
                    mashupArray.push(iscMashup.getMashupRefObj(this,'getUpdatedContainerDetails',input));

                    iscMashup.callMashups(this,mashupArray,{})
                        .then(function(controllerData){
                            this.handleGenerateTrackingNo(controllerData,container);
                        }.bind(this),angular.noop);
                }
        	}
        },


        handleGenerateTrackingNo : function(controllerData,container){
            var containerOutput = iscMashup.getMashupOutput(controllerData,"getUpdatedContainerDetails");
            var labelOutput = iscMashup.getMashupOutput(controllerData,"generateTrackingNoAndPrintLabel");

            this.updateContainerFlags(containerOutput.Container);

            if(!iscCore.isVoid(containerOutput.Container.TrackingNo)){
                container.TrackingNo = containerOutput.Container.TrackingNo;
                container.TrackingURL = containerOutput.Container.TrackingURL;
            }
            this.ui.currentContainerDetails = container;
            if(!iscCore.isVoid(labelOutput.Output.out)){
            	iscShipment.decodeShippingLabelURL(labelOutput);
                $timeout(function(){
                    iscPrint.printHtmlOutput(labelOutput);
                    //highlight panel
                },0);
            }
            else{
                iscModal.showErrorMessage("containerPack.Message_Print_failure");
                //highlight panel
            }


        },

        uiIsScacIntegrationRequired: function(){
        	if(!iscCore.isVoid(this.model.shipmentDetails) && !iscCore.isVoid(this.model.shipmentDetails.Shipment) && !iscCore.isVoid(this.model.shipmentDetails.Shipment.ScacIntegrationRequired) ){
        		return (this.model.shipmentDetails.Shipment.ScacIntegrationRequired == 'Y'?true:false);
        	}else{
        		return false;
        	}

        },
        uiNoInstructions : function(shipmentLine){
        	if(!iscCore.isVoid(shipmentLine.Instructions) && !iscCore.isVoid(shipmentLine.Instructions.Instruction)){
        		return false;
        	}else{
        		return true;
        	}
        },
        uiPackagesCount : function(count){
        	var newCount = Number(count);

        	if(!iscCore.isVoid(this.model.shipmentContainerDetails) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container)){
            	for(var i = 0; i < this.model.shipmentContainerDetails.Containers.Container.length; i++){
            		if(this.model.shipmentContainerDetails.Containers.Container[i].ContainerNo == iscI18n.translate('containerPack.draftContainer')){
            			newCount = newCount + 1 ;
            		}
            	}
        	}

        	return newCount;
        },
        uiViewContainerProducts:function(container){
            var that = this;
            var input = {
                     modalInput: function(){
                        return {
                            ShipmentContainerKey : container.ShipmentContainerKey,
                            ShipmentKey : that.model.shipmentDetails.Shipment.ShipmentKey,
                            containerDetails : container,
                            ScacIntegrationRequired : that.model.shipmentDetails.Shipment.ScacIntegrationRequired
                        };
                    }

                };

            //iscModal.openModal('store.views.shipment.containerpack.pack-products.pack-container-products',input,{})


        },
        uiPackSerial:function(shipmentLine, serialNumber, container) {
      		  //var shipmentContainerKey = this.model.activeContainerModel.Container.ShipmentContainerKey;
      			var shipmentContainerKey =  this.ui.currentContainerDetails.ShipmentContainerKey;
      			var apiInput = {Shipment:{ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey}};
      			apiInput.Shipment.Containers = {};
      			apiInput.Shipment.Containers.Container = {};
      			var mashupRefId = null;

      			if(iscCore.isVoid(shipmentContainerKey)){
      				apiInput.Shipment.Containers.Container.ContainerScm=this.model.activeContainerModel.Container.ContainerScm;
      				mashupRefId = "manualPackForNewContainer";
      			}else{
      				apiInput.Shipment.Containers.Container.ShipmentContainerKey=shipmentContainerKey;
      				if(this.ui.showProductsAccordion){
      					apiInput.Shipment.Containers.Container.VoidTrackingNo='Y';
      				}
      				mashupRefId = "manualPackForExistingContainer";
      			}
      			apiInput.Shipment.Containers.Container.ContainerDetails = {
              ContainerDetail: {
                Quantity: 1,
                QuantityPlaced: 1,
                ShipmentLineKey: shipmentLine.ShipmentLineKey,
                ShipmentTagSerials: {
                  ShipmentTagSerial: {
                    Quantity: 1,
                    SerialNo: serialNumber,
                    ShipmentLineKey: shipmentLine.ShipmentLineKey
                  }
                }
              }
            };
      			this.ui.selectedShipmentLineKey = shipmentLine.ShipmentLineKey;
      			this.ui.focusOnFirstLine = false;

      //		    iscMashup.callMashup(this,mashupRefId,apiInput,{}).then(this.postPackQuantityUpdate.bind(this,shipmentContainerKey,mashupRefId));
      			var getContainerShipmentLineListInput = {};
            	var mashupArray = [];
            	mashupArray.push(iscMashup.getMashupRefObj(this,mashupRefId,apiInput));

      			if(iscCore.isVoid(shipmentContainerKey)){
      				this.ui.callGetContainerShipmentLineList = true;

      			}else{
      				getContainerShipmentLineListInput = {
      	                    ShipmentLine:{
      	                        ShipmentContainerKey : shipmentContainerKey,
      	                        ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey,
      	                        ContainerDetails:{
      	                            ContainerDetail:{
      	                                Container:{
      	                                    ShipmentContainerKey : shipmentContainerKey,
      	                                    ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
      	                                }

      	                            }
      	                        }
      	                    }
      	                };
      	        	mashupArray.push(iscMashup.getMashupRefObj(this,'getContainerShipmentLineList', getContainerShipmentLineListInput));
      			}

    			var getShipmentLineListInput = {};
    			getShipmentLineListInput.ShipmentLine = {}
    			getShipmentLineListInput.ShipmentLine.ShipmentKey = this.model.shipmentDetails.Shipment.ShipmentKey;//this.model.shipmentDetails.Shipment.ShipmentKey;
        	mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentLineList', getShipmentLineListInput));

        	iscMashup.callMashups(this,mashupArray,{}).then(this.handleMultiApiCalls.bind(this,shipmentContainerKey,mashupRefId),angular.noop);
        },
        uiAddMoreContainerProducts:function(container){
            var active = this.selectActiveContainer(container.ShipmentContainerKey,this.model.shipmentContainerDetails);
            this.setActiveContainer(active);
            //goto products views
            this.ui.showPackageView = false;
            this.ui.showProductView = true;
            this.uiOnProductsTabSelection();
        },

        uiUnpackContainerProducts:function(container){
        	var draftContainerPresent = false;
        	this.model.shipmentContainerDetails.Containers.Container
        	if(!iscCore.isVoid(this.model.shipmentContainerDetails) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container.length) ){
        		if(this.model.shipmentContainerDetails.Containers.Container.length > 0){
        			for(var i = 0; i < Number(this.model.shipmentContainerDetails.Containers.Container.length); i++){
        				if(this.model.shipmentContainerDetails.Containers.Container[i].ContainerNo == iscI18n.translate('containerPack.draftContainer')){
        					this.ui.draftContainerDetails = this.model.shipmentContainerDetails.Containers.Container[i];
        					draftContainerPresent = true;
        					break;
        				}
        			}
        		}
        	}
        	if(!iscCore.isVoid(container.ShipmentContainerKey)){
                iscModal.showConfirmationMessage("containerPack.Message_Delete_container")
                .then(
                    function(action){
                        if(action === "YES"){
                            var input = {
                                Shipment:{
                                    ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey,
                                    Containers:{
                                        Container:{
                                            ShipmentContainerKey:container.ShipmentContainerKey
                                        }
                                    },
                                    isDraftContainer : container.ShipmentContainerKey === ""?"Y":"N"
                                }
                            };
                            this.ui.deletedShipmentContainerKey = container.ShipmentContainerKey;
                            iscMashup.callMashup(this,"deleteContainer",input,{})
                                .then(this.handleDeleteContainer.bind(this),angular.noop);
                        }
                    }.bind(this),angular.noop
                );
        	}
        },
        removeEmptyContainer:function(container){
        	if(!iscCore.isVoid(container.ShipmentContainerKey)){
                var input = {
                    Shipment:{
                        ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey,
                        Containers:{
                            Container:{
                                ShipmentContainerKey:container.ShipmentContainerKey
                            }
                        },
                        isDraftContainer : container.ShipmentContainerKey === ""?"Y":"N"
                    }
                };
                this.ui.deletedShipmentContainerKey = container.ShipmentContainerKey;
                iscMashup.callMashup(this,"deleteContainer",input,{});
                    //.then(this.handleDeleteContainer.bind(this),angular.noop);
        	}
        },

        uiIsGenerateTrackingNoDisabled : function(container){
            return !iscCore.isVoid(container.TrackingNo);
        },

        uiIsReprintDisabled : function(container){
            return iscCore.isVoid(container.TrackingNo);
        },

        uiReprintContainerLabel : function(container){

            if(!iscCore.isVoid(container.TrackingNo)){
                var input = {
                    Container:{
                        ShipmentContainerKey : container.ShipmentContainerKey,
                        ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
                    }
                }
                iscMashup.callMashup(this,"reprintLabel",input,{})
                    .then(function(controllerData){
                        this.handleReprintLabel(controllerData,container);
                    }.bind(this),angular.noop);
            }


        },

        handleReprintLabel : function(controllerData,container){
            var labelOutput = iscMashup.getMashupOutput(controllerData,"reprintLabel");

            if(!iscCore.isVoid(labelOutput.Output.out)){
            	iscShipment.decodeShippingLabelURL(labelOutput);
                $timeout(function(){
                    iscPrint.printHtmlOutput(labelOutput);
                    //highlight panel
                },0);
            }
            else{
                iscModal.showErrorMessage("containerPack.Message_Print_failure");
                //highlight panel
            }
        },

		handleDeleteContainer : function(controllerData){
            var ouput = iscMashup.getMashupOutput(controllerData,"deleteContainer");
            if(Number(ouput.Shipment.ShipmentContainerizedFlag) === 1){
                if(this.model.activeContainerModel.Container.ShipmentContainerKey === ""){
                    var active = this.selectActiveContainer("",this.model.shipmentContainerDetails);
                    this.setActiveContainer(active);
                    //this.model.shipmentContainerDetails.Containers.Container.push(this.model.activeContainerModel.Container);
                    this.ui.selectDraftContainer = true;
                    this.ui.currentContainerDetails = this.model.activeContainerModel.Container;
                    this.ui.currentContainerDetails.ShipmentContainerKey = "";
                    this.model.containerContents.ShipmentLines.ShipmentLine = {};
                    this.ui.currentContainerDetails.ContainerDetails.TotalNumberOfRecords = "0";
                    this.ui.currentContainerDetails.ActualWeight = "0";
                }
                else{
                    this.model.activeContainerModel = {
                        Container:ouput.Shipment.Containers.Container[0]
                    };

                    this.model.activeContainerModel.Container.ContainerNo = iscI18n.translate('containerPack.draftContainer');
                    this.model.activeContainerModel.Container.ShipmentContainerKey = "";

                    if(iscCore.isVoid(iscCore.getValueFromJsonPath(this.model.shipmentContainerDetails,"Containers.Container"))){
                        this.model.shipmentContainerDetails.Containers = {
                            Container : []
                        }
                    }

                    this.model.shipmentContainerDetails.Containers.Container.push(this.model.activeContainerModel.Container);
                    this.model.shipmentContainerDetails.Containers.TotalNumberOfRecords = this.model.shipmentContainerDetails.Containers.Container.length;
                    this.model.containerContents.ShipmentLines.ShipmentLine = {};
                    this.ui.currentContainerDetails = this.model.activeContainerModel.Container;
                    this.ui.currentContainerDetails.ContainerDetails = {};
                    this.ui.currentContainerDetails.ContainerDetails.TotalNumberOfRecords = "0";
                    this.ui.currentContainerDetails.ActualWeight = "0";
                    this.ui.selectDraftContainer = true;
                }
            }
            else{
                if(this.model.activeContainerModel.Container.ShipmentContainerKey === this.ui.deletedShipmentContainerKey){
                    if(ouput.Shipment.Containers.Container.length > 0){
                        this.model.activeContainerModel = {};
                        this.model.activeContainerModel.Container = ouput.Shipment.Containers.Container[0];
                        this.ui.currentContainerDetails = ouput.Shipment.Containers.Container[0];
                    }
                }

            }
            this.ui.showSuccessMessagePanel = false;
            this.model.shipmentContainerDetails.Containers.TotalNumberOfRecords = ouput.Shipment.Containers.TotalNumberOfRecords;
            //update container view
            this.ui.totalNoOfpackages = this.model.shipmentContainerDetails.Containers.TotalNumberOfRecords;
            this.uiLoadShipmentContainerDetails();
            this.loadProductsView();
        },


        selectActiveContainer : function(shipmentContainerKey,containerList){
            var activeContainer = null;

            for(var i=0;i<containerList.Containers.Container.length;i++){
                var containrInfo = containerList.Containers.Container[i];

                if(iscCore.isVoid(shipmentContainerKey) && iscCore.isVoid(containrInfo.ShipmentContainerKey)){
                    activeContainer = {}
                    activeContainer.Container = containrInfo;
                    break;
                }
                else if(shipmentContainerKey === containrInfo.ShipmentContainerKey){
                    activeContainer = {}
                    activeContainer.Container = containrInfo;
                    break;
                }

            }
            return activeContainer;

        },

        uiOnWeightFieldFocus:function (weightField,containerModel) {

			var formats = "";
			if($scope.containerPackForm.$valid)
				formats = $locale.NUMBER_FORMATS;

  			var oldWeight = containerModel.ActualWeight;
  			if(!iscCore.isVoid(oldWeight) && formats){
  				oldWeight=oldWeight.replace(formats.GROUP_SEP, '');
  			}
  			if(containerModel.showWeightUpdate !=='Y'){
  				weightField.oldWeight = oldWeight;
  			}

	    },

        setActiveContainer : function(containerInfo){
            this.model.activeContainerModel = containerInfo;
        },

        uiIsShipmentLinePackComplete:function(shipmentLine) {
			return (shipmentLine.IsPackComplete == 'Y'?true:false);
		},


		uiOnQuantityFieldFocus :function (qtyField,shipmentLineModel) {

			var formats = "";
			if($scope.containerPackForm.$valid)
				formats = $locale.NUMBER_FORMATS;

  			var oldQuantity = shipmentLineModel.ContainerDetail.QuantityPlaced;
  			if(!iscCore.isVoid(oldQuantity) && formats){
  				oldQuantity=oldQuantity.replace(formats.GROUP_SEP, '');
  			}
  			if(shipmentLineModel.showQtyUpdate !=='Y'){
  				qtyField.oldQty = oldQuantity;
  			}

	    },

	    uiShowUpdateButton : function(qtyField,shipmentLineModel){

		    var formats = $locale.NUMBER_FORMATS;
  			var newQuantity = shipmentLineModel.ContainerDetail.QuantityPlaced;
  			if(newQuantity)
  				newQuantity=newQuantity.replace(formats.GROUP_SEP, '');
  			if((!iscCore.isVoid(newQuantity)) && qtyField.oldQty !== newQuantity && Number(shipmentLineModel.ContainerDetail.QuantityPlaced) != Number(shipmentLineModel.ContainerDetail.EditableQtyPlaced))
  				shipmentLineModel.showQtyUpdate ='Y';
  			else
  				shipmentLineModel.showQtyUpdate ='N';

  		},


  		uiHideUpdateButton : function(shipmentLineModel){
  			shipmentLineModel.showQtyUpdate ='N';
  		},

  		uiValidateQuantityAndUpdate : function(qtyField,shipmentLine){


  			var that = this;
  			var formats = $locale.NUMBER_FORMATS;
  			var newQuantity = shipmentLine.ContainerDetail.QuantityPlaced;
  			if(newQuantity) {
  				newQuantity=newQuantity.replace(formats.GROUP_SEP, '');
  			}
  			if(!iscCore.isVoid(newQuantity) && qtyField.oldQty !== newQuantity && Number(shipmentLine.ContainerDetail.QuantityPlaced) != Number(shipmentLine.ContainerDetail.EditableQtyPlaced)){

  				qtyField.oldQty = newQuantity ;

	  			if (typeof newQuantity == "string") {
	  				newQuantity = parseInt(newQuantity,10);
	  			}
	  			var totalQty = Number(shipmentLine.PlacedQuantity);
	  			var containerDetailQty = 0;
	  			if(!iscCore.isVoid(shipmentLine.ContainerDetail)) {
		        	 containerDetailQty = Number(shipmentLine.ContainerDetail.EditableQtyPlaced);
				 }

		         var packedQtyinOtherContainer = totalQty -containerDetailQty;

		         var maxPackableQty = Number(shipmentLine.Quantity) - packedQtyinOtherContainer;

		  		if(newQuantity > maxPackableQty) {
		  			iscModal.showErrorMessage(iscI18n.translate('containerPack.MSG_MaxQuantityError'));
		  		}else{
		  			this.callChangeShipmentForManualPack(shipmentLine,newQuantity);
		  		}
	  			//this.callChangeShipmentForManualPack(shipmentLine,newQuantity);


  			}

  		},
  		uiShowBorderForHoldLocation : function(){
  			//(model.shipmentDetails.Shipment.HoldLocation == '')
  			if(!iscCore.isVoid(this.model.shipmentDetails.Shipment) && !iscCore.isVoid(this.model.shipmentDetails.Shipment.HoldLocation)){
  				if(this.model.shipmentDetails.Shipment.HoldLocation != ''){
  					return false;
  				}else{
  					return true;
  				}
  			}else{
  				return true;
  			}
  		},
  		uiValidateQuantity : function(validationResponseObj, angularErrorObject, modelValue, viewValue){

           	/* check if the DataType Validation is successful */


           	if(!iscCore.isVoid(angularErrorObject) && angularErrorObject.iscDatatypeValidator)
           		return validationResponseObj;
           	else
           	var isQty_a_Number = !isNaN(viewValue);
           	if(!iscCore.isBooleanTrue(isQty_a_Number) || iscCore.isVoid(viewValue)){
           		validationResponseObj.booleanResponse = !isNaN(viewValue) && !iscCore.isVoid(viewValue);
	            validationResponseObj.errorMesssage = iscI18n.translate("containerPack.ERROR_invalid_input");
   			}
           	/*else{

   				var maxQuantity = 0;
   				if(this.ui.showScanAccordion){
   					 maxQuantity = this.model.lastProductScanned.ShipmentLine.maxPackableQty;
   				}else{
   	   				 maxQuantity = this.ui.currentlySelectedShipmentLine.maxPackableQty;
   				}
   				if(Number(modelValue) > maxQuantity) {
		  			validationResponseObj.booleanResponse = false;
	            	validationResponseObj.errorMesssage = iscI18n.translate("containerPack.MSG_MaxQuantityError");
		  		}
   			}*/
           	return validationResponseObj;
           },


  		uiStampContainerDetailQty:function(shipmentLine) {
			if(iscCore.isVoid(shipmentLine.ContainerDetail)) {
				shipmentLine.ContainerDetail ={};
				shipmentLine.ContainerDetail.QuantityPlaced =0;
			}
			shipmentLine.ContainerDetail.EditableQtyPlaced = angular.copy(shipmentLine.ContainerDetail.QuantityPlaced);
			shipmentLine.showQtyUpdate = "N";
		},

		setPackableQty:function(shipmentLine){

			 var totalPlacedqty = Number(shipmentLine.PlacedQuantity);
	         var containerDetailQty = 0;
	         if(!iscCore.isVoid(shipmentLine.ContainerDetail)) {
	        	 containerDetailQty = Number(shipmentLine.ContainerDetail.QuantityPlaced);
			 }

	         var packedQtyinOtherContainer = totalPlacedqty -containerDetailQty;

	         var maxPackableQty = Number(shipmentLine.Quantity) - packedQtyinOtherContainer;
	         shipmentLine.maxPackableQty = maxPackableQty;
		},

		uiDecreaseQty:function(shipmentLine) {

  			var containerDetailQty = Number(shipmentLine.ContainerDetail.EditableQtyPlaced);
  			var newContainerDetailQty = containerDetailQty - this.ui.ONE_QUANTITY;

  			if(newContainerDetailQty < 0) {
  				iscModal.showErrorMessage(iscI18n.translate('containerPack.MSG_NegativeQtyError'));
  			}

  			this.callChangeShipmentForManualPack(shipmentLine,newContainerDetailQty);
  		},

  		uiIncreaseQty:function(shipmentLine) {

  			var containerDetailQty = Number(shipmentLine.ContainerDetail.EditableQtyPlaced);
  			var newContainerDetailQty = containerDetailQty + this.ui.ONE_QUANTITY;
	  		var maxQuantity = Number(shipmentLine.maxPackableQty);

	  		if(newContainerDetailQty > maxQuantity) {
	  			iscModal.showErrorMessage(iscI18n.translate('containerPack.MSG_MaxQuantityError'));
	  		}

	  		this.callChangeShipmentForManualPack(shipmentLine,newContainerDetailQty);


  		},

  		uiPackOneQty:function(shipmentLine) {
  			var containerDetailQty = 0;

  			var currentContainerLines;

  			if (!iscCore.isVoid(this.model.containerContents) && !iscCore.isVoid(this.model.containerContents.ShipmentLines) && !iscCore.isVoid(this.model.containerContents.ShipmentLines.ShipmentLine) ){
  				for(var i=0;i<this.model.containerContents.ShipmentLines.ShipmentLine.length;i++){
  					if(shipmentLine.ShipmentLineKey == this.model.containerContents.ShipmentLines.ShipmentLine[i].ShipmentLineKey){
  						containerDetailQty = Number(this.model.containerContents.ShipmentLines.ShipmentLine[i].ContainerDetail.QuantityPlaced) ;
  						break;
  					}
  				}
  			}
  			var newContainerDetailQty = containerDetailQty + this.ui.ONE_QUANTITY;
  			this.callChangeShipmentForManualPack(shipmentLine,newContainerDetailQty);

  			if(!iscCore.isVoid(shipmentLine.Instructions) && !iscCore.isVoid(shipmentLine.Instructions.Instruction)){
  				this.uiopenPackInstructions(shipmentLine);
  			}
  		},

  		callChangeShipmentForManualPack:function(shipmentLine,newContainerDetailQty) {

  			//var shipmentContainerKey = this.model.activeContainerModel.Container.ShipmentContainerKey;
  			var shipmentContainerKey =  this.ui.currentContainerDetails.ShipmentContainerKey;
  			var apiInput = {Shipment:{ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey}};
  			apiInput.Shipment.Containers = {};
  			apiInput.Shipment.Containers.Container = {};
  			var mashupRefId = null;

  			if(iscCore.isVoid(shipmentContainerKey)){
  				apiInput.Shipment.Containers.Container.ContainerScm=this.model.activeContainerModel.Container.ContainerScm;
  				mashupRefId = "manualPackForNewContainer";
  			}else{
  				apiInput.Shipment.Containers.Container.ShipmentContainerKey=shipmentContainerKey;
  				if(this.ui.showProductsAccordion){
  					apiInput.Shipment.Containers.Container.VoidTrackingNo='Y';
  				}
  				mashupRefId = "manualPackForExistingContainer";
  			}
  			apiInput.Shipment.Containers.Container.ContainerDetails = {};
  			apiInput.Shipment.Containers.Container.ContainerDetails.ContainerDetail ={};
  			apiInput.Shipment.Containers.Container.ContainerDetails.ContainerDetail.Quantity = newContainerDetailQty;
  			apiInput.Shipment.Containers.Container.ContainerDetails.ContainerDetail.QuantityPlaced =newContainerDetailQty;
  			apiInput.Shipment.Containers.Container.ContainerDetails.ContainerDetail.ShipmentLineKey =shipmentLine.ShipmentLineKey;
  			this.ui.selectedShipmentLineKey = shipmentLine.ShipmentLineKey;
  			this.ui.focusOnFirstLine = false;

  //		    iscMashup.callMashup(this,mashupRefId,apiInput,{}).then(this.postPackQuantityUpdate.bind(this,shipmentContainerKey,mashupRefId));
  			var getContainerShipmentLineListInput = {};
        	var mashupArray = [];
        	mashupArray.push(iscMashup.getMashupRefObj(this,mashupRefId,apiInput));

  			if(iscCore.isVoid(shipmentContainerKey)){
  				this.ui.callGetContainerShipmentLineList = true;

  			}else{
  				getContainerShipmentLineListInput = {
  	                    ShipmentLine:{
  	                        ShipmentContainerKey : shipmentContainerKey,
  	                        ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey,
  	                        ContainerDetails:{
  	                            ContainerDetail:{
  	                                Container:{
  	                                    ShipmentContainerKey : shipmentContainerKey,
  	                                    ShipmentKey : this.model.shipmentDetails.Shipment.ShipmentKey
  	                                }

  	                            }
  	                        }
  	                    }
  	                };
  	        	mashupArray.push(iscMashup.getMashupRefObj(this,'getContainerShipmentLineList', getContainerShipmentLineListInput));
  			}

			var getShipmentLineListInput = {};
			getShipmentLineListInput.ShipmentLine = {}
			getShipmentLineListInput.ShipmentLine.ShipmentKey = this.model.shipmentDetails.Shipment.ShipmentKey;//this.model.shipmentDetails.Shipment.ShipmentKey;

			//iscMashup.callMashup(this,"getShipmentLineList",getShipmentLineListInput,{}).then(this.processGetShipmentLineList.bind(this));


//			iscMashup.callMashup(this,'getContainerShipmentLineList',getShipmentLineListInput,{});
        	mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentLineList', getShipmentLineListInput));

        	iscMashup.callMashups(this,mashupArray,{}).then(this.handleMultiApiCalls.bind(this,shipmentContainerKey,mashupRefId),angular.noop);

  		},

  		handleMultiApiCalls : function(shipmentContainerKey,mashupRefId,response){
			this.postPackQuantityUpdate(shipmentContainerKey,mashupRefId,response);
			this.processGetShipmentLineList(response);
			this.refreshCurrentContainerDetails(shipmentContainerKey);
		},


  		postPackQuantityUpdate : function(shipmentContainerKey,mashupRefId,response){
			var apiOutput = iscMashup.getMashupOutput(response,mashupRefId);

					if(iscCore.isVoid(shipmentContainerKey)){
		  				this.updateActiveContainerModel(apiOutput);
		  			}
					if(this.ui.showScanAccordion){
						this.model.lastProductScanned.ShipmentLine = apiOutput.Shipment.ShipmentLine;
						this.model.lastProductScanned.ShipmentLine.showQtyUpdate ='N';
						this.setPackableQty(this.model.lastProductScanned.ShipmentLine);
  	  			        this.uiStampContainerDetailQty(this.model.lastProductScanned.ShipmentLine);
	   				}else{
	   					this.updateShipmentLineListModel(apiOutput.Shipment);
	   				}
		  			this.resetData();

					if(Number(apiOutput.Shipment.ShipmentContainerizedFlag) === 3){
						this.ui.showSuccessMessagePanel = true;
						var that = this;
						that.ui.allProductsPacked = true;
						/*var message = iscI18n.translate('containerPack.Message_PackCompleted');
						iscModal.showSuccessMessage(message, {}).then(
    							function(callBackData){
    								that.ui.showPackageView = true;
			       				});*/
					}else{
						this.ui.allProductsPacked = false;
						this.ui.showSuccessMessagePanel = false;
					}

		},

		updateShipmentLineListModel:function(updatedShipmentModel) {

  			if(!iscCore.isVoid(this.model.shipmentLineList) && !iscCore.isVoid(this.model.shipmentLineList.ShipmentLines) && !iscCore.isVoid(this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords)) {

  	       		 var numOfShipmentLines = this.model.shipmentLineList.ShipmentLines.TotalNumberOfRecords;
  	       		 for(var i=0;i<numOfShipmentLines;i++) {
  	       			 var shipmentLine = this.model.shipmentLineList.ShipmentLines.ShipmentLine[i];
  	       			 if(!iscCore.isVoid(shipmentLine) && shipmentLine.ShipmentLineKey == updatedShipmentModel.ShipmentLine.ShipmentLineKey) {
  	       			    this.model.shipmentLineList.ShipmentLines.ShipmentLine[i] = updatedShipmentModel.ShipmentLine;
  	       			    this.ui.currentlySelectedShipmentLine = updatedShipmentModel.ShipmentLine;
  	       				this.model.shipmentLineList.ShipmentLines.ShipmentLine[i].showQtyUpdate ='N';
  	       			    this.setPackableQty(updatedShipmentModel.ShipmentLine);
  	  			        this.uiStampContainerDetailQty(updatedShipmentModel.ShipmentLine);
  	       				break;
  	       			 }
  	       		 }
  	       	 }

  		},

  		resetData:function() {
  			if($scope.containerPackForm) {
  				$scope.containerPackForm.$setPristine();
  			}
  			if($scope.quantityForm) {
  				$scope.quantityForm.$setPristine();
  			}
  			if($scope.scanQuantityForm) {
  				$scope.scanQuantityForm.$setPristine();
  			}
  		},

  		uiOpenRecordShortagePopup:function(shipmentLine) {


  			var that=this;
			var popInput = {}
			popInput.codeType = 'YCD_PACK_SHORT_RESOL';
			popInput.shipmentLine = angular.copy(shipmentLine);

			popInput.shipmentLine.DisplayQty = shipmentLine.PlacedQuantity;
			popInput.shipmentLine.OrderLine = shipmentLine.OrderLine;
			popInput.shipmentLine.DisplayTotalQty = Number(shipmentLine.Quantity);
			popInput.shipmentLine.DisplayShortQty = Number(shipmentLine.Quantity) - Number(shipmentLine.PlacedQuantity);

			var recordShortagePopupInput = {
					 modalInput: function(){
		      			return popInput;
		      		}

				};

			iscModal.openModal('store.views.shipment.common.record-shortage.record-shortage',recordShortagePopupInput,{}).then(function(callBackData){
				if(callBackData.data !== null && callBackData.data !== undefined){
					that.recordShortageForShipmentLine.call(that,callBackData.data,shipmentLine);
				}
			});

  		},


  		recordShortageForShipmentLine:function(shortagePopupData,shipmentLineToBeShorted) {

  			//var shipmentContainerKey = this.model.activeContainerModel.Container.ShipmentContainerKey;
  			var shipmentContainerKey = this.ui.currentContainerDetails.ShipmentContainerKey;
  			var recordShortageApiInput = {Shipment:{ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey}};
  			recordShortageApiInput.Shipment.ShipmentLines = {};
  			recordShortageApiInput.Shipment.ShipmentLines.ShipmentLine = {};
  			recordShortageApiInput.Shipment.ShipmentLines.ShipmentLine.ShipmentLineKey = shipmentLineToBeShorted.ShipmentLineKey;
  			recordShortageApiInput.Shipment.ShipmentLines.ShipmentLine.ShortageReason = shortagePopupData.RecordShortage.ShortageReasonCode;
  			if(!iscCore.isVoid(shipmentContainerKey)){
  				recordShortageApiInput.Shipment.ShipmentContainerKey = shipmentContainerKey;
  			}

  			iscMashup.callMashup(this,"recordShortage",recordShortageApiInput,{}).then(this.postRecordShortageForShipmentLine.bind(this));
  		},

  		postRecordShortageForShipmentLine:function(response) {

  			var apiOutput = iscMashup.getMashupOutput(response,"recordShortage");
             if(apiOutput.Shipment.Status == '9000'){
            	 /*shipment is cancelled*/
            	var that = this;
  				var message = iscI18n.translate('containerPack.MSG_ShipmentCancelled');
  				iscModal.showInfoMessage(message, {}).then(
  						function(callBackData){
  							/*go to shipmentsummary*/
  							iscState.goToState("shipmentsummary", {
  								input: {
  									Shipment: {
  										ShipmentKey: that.model.shipmentDetails.Shipment.ShipmentKey
  									}
  								}
  							}, {});
  	       				});
             }
             else{
            	 this.updateShipmentLineListModel(apiOutput.Shipment);
       			 if(Number(apiOutput.Shipment.ShipmentContainerizedFlag) === 3){
       				this.ui.showSuccessMessagePanel = true;
     				var that = this;
     				that.ui.allProductsPacked = true;
     				if(!iscCore.isVoid(that.model.shipmentLineList) && !iscCore.isVoid(that.model.shipmentLineList.ShipmentLines) && !iscCore.isVoid(that.model.shipmentLineList.ShipmentLines.ShipmentLine) && !iscCore.isVoid(that.model.shipmentLineList.ShipmentLines.ShipmentLine.length) ){
     					for(var i = 0; i < that.model.shipmentLineList.ShipmentLines.ShipmentLine.length ; i++){
     						if(!iscCore.isVoid(that.model.shipmentLineList.ShipmentLines.ShipmentLine[i].IsPackComplete) && that.model.shipmentLineList.ShipmentLines.ShipmentLine[i].IsPackComplete == 'Y' && that.model.shipmentLineList.ShipmentLines.ShipmentLine[i].ShortageQty == 0){

     						}else{
     							that.ui.allProductsPacked = false;
     							break;
     						}
     					}
     				}
     				/*var message = iscI18n.translate('containerPack.Message_PackCompleted');
     				iscModal.showSuccessMessage(message, {}).then(
     						function(callBackData){
     							that.ui.showPackageView = true;
     	       				}); */
     			}else{
     				this.ui.allProductsPacked = false;
     				this.ui.showSuccessMessagePanel = false;
     			}
       			this.refreshCurrentContainerDetails(this.ui.currentContainerDetails.ShipmentContainerKey);
       			this.refreshCurrentContainerContents();
             }

  		},

  		uiFinishPack : function(){
  			var isDirty = $scope.containerPackForm.$dirty;
  			var that = this;
  			var apiInput = {};
  			var mashupRefId = "";
  			var mashupArray = [];
        	if(isDirty) {
        		iscModal.showConfirmationMessage(iscI18n.translate('globals.MSG_Screen_dirty')).then(function(action){
        			//var that = this;
          			var apiInput1 = {};
          			var mashupRefId1 = "";
          			var mashupArray1 = [];
        			if(action === 'YES'){
        	        	apiInput1 = {Container:{ShipmentKey:that.model.shipmentDetails.Shipment.ShipmentKey}};
        				if (that.ui.scacIntegrationReqd == 'N') {
        					mashupRefId1 = "getShipmentContainerList_NoScac";
        					mashupArray1.push(iscMashup.getMashupRefObj(that,'getShipmentContainerList_NoScac',apiInput1));
        					//iscMashup.callMashup(that,"getShipmentContainerList_NoScac",apiInput,{}).then(that.handleGetShipmentContainerList.bind(that,"getShipmentContainerList_NoScac"));
        				} else if (that.ui.scacIntegrationReqd == 'Y') {
        					mashupRefId1 = "getShipmentContainerList_Scac";
        					mashupArray1.push(iscMashup.getMashupRefObj(that,'getShipmentContainerList_Scac',apiInput1));
        					//iscMashup.callMashup(that,"getShipmentContainerList_Scac",apiInput,{}).then(that.handleGetShipmentContainerList.bind(that,"getShipmentContainerList_Scac"));
        				}
        	        	var getShipmentContainerDetailsApiInput = {Shipment:{ShipmentKey:that.model.shipmentDetails.Shipment.ShipmentKey}};
        	        	mashupArray1.push(iscMashup.getMashupRefObj(that,'getShipmentContainerDetails', getShipmentContainerDetailsApiInput));
        	        	iscMashup.callMashups(that,mashupArray1,{}).then(that.handleGetShipmentContainerList.bind(that,mashupRefId1),angular.noop);
        			}
        		});
        	} else {
            	apiInput = {Container:{ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey}};
    			if (this.ui.scacIntegrationReqd == 'N') {
    				mashupRefId = "getShipmentContainerList_NoScac";
    				mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentContainerList_NoScac',apiInput));
    				//iscMashup.callMashup(that,"getShipmentContainerList_NoScac",apiInput,{}).then(that.handleGetShipmentContainerList.bind(that,"getShipmentContainerList_NoScac"));
    			} else if (this.ui.scacIntegrationReqd == 'Y') {
    				mashupRefId = "getShipmentContainerList_Scac";
    				mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentContainerList_Scac',apiInput));
    				//iscMashup.callMashup(that,"getShipmentContainerList_Scac",apiInput,{}).then(that.handleGetShipmentContainerList.bind(that,"getShipmentContainerList_Scac"));
    			}
    			var getShipmentContainerDetailsApiInput = {Shipment:{ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey}};
	        	mashupArray.push(iscMashup.getMashupRefObj(this,'getShipmentContainerDetails', getShipmentContainerDetailsApiInput));
	        	iscMashup.callMashups(this,mashupArray,{}).then(this.handleGetShipmentContainerList.bind(this,mashupRefId),angular.noop);
        	}


  		},

  		handleGetShipmentContainerList : function(mashupRefId,response){

  			var apiOutput = iscMashup.getMashupOutput(response,mashupRefId);
            if(Number(apiOutput.Containers.ShipmentContainerizedFlag) === 3){
            	this.ui.allProductsPacked = true;
            	var actualContainersWithOutWeight = 0;
            	if(!iscCore.isVoid(this.model.shipmentContainerDetails) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container)){
                	for(var i = 0; i < this.model.shipmentContainerDetails.Containers.Container.length; i++){
                		if(Number(this.model.shipmentContainerDetails.Containers.Container[i].ActualWeight) == '0' && this.model.shipmentContainerDetails.Containers.Container[i].ContainerDetails.TotalNumberOfRecords != '0'){
                			actualContainersWithOutWeight = actualContainersWithOutWeight + 1;
                		}
                		if(this.ui.scacIntegrationReqd == 'Y'){
                			if(iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container[i].TrackingNo)){
                				actualContainersWithOutWeight = actualContainersWithOutWeight + 1;
                			}else if(this.model.shipmentContainerDetails.Containers.Container[i].TrackingNo == ''){
                				actualContainersWithOutWeight = actualContainersWithOutWeight + 1;
                			}
                		}

                	}
            	}
            	//if(Number(apiOutput.Containers.TotalNumberOfRecords) > 0){
            	if(Number(actualContainersWithOutWeight) > 0){
            		 var that = this;
            		 if(this.ui.scacIntegrationReqd == 'N') {
                     	iscModal.showConfirmationMessage(iscI18n.translate('containerPack.MSG_NotAllContainersWeighed')).then(function(action){
                 			if(action === 'YES'){
                 				iscState.goToState("shipmentsummary", {input: {Shipment: {ShipmentKey: that.model.shipmentDetails.Shipment.ShipmentKey}}}, {});
                 			}else{
                 				that.ui.showPackageView = true;
                 			}
                 		});

            		 }else if(this.ui.scacIntegrationReqd == 'Y'){

                      	iscModal.showConfirmationMessage(iscI18n.translate('containerPack.MSG_NotAllContainersTracked')).then(function(action){
                  			if(action === 'YES'){
                  				iscState.goToState("shipmentsummary", {input: {Shipment: {ShipmentKey: that.model.shipmentDetails.Shipment.ShipmentKey}}}, {});
                  			}else{
                  				that.ui.showPackageView = true;
                  			}
                  		});
            		 }

            	}else{

            		var changeShipmentInput = {Shipment:{ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey}};
            		var mashupArray = [];
            		var input = {};

            		if(!iscCore.isVoid(this.model.shipmentContainerDetails) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers) && !iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container)){
                    	for(var i = 0; i < this.model.shipmentContainerDetails.Containers.Container.length; i++){
                    		if(!iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container[i].ContainerDetails) && this.model.shipmentContainerDetails.Containers.Container[i].ContainerNo != iscI18n.translate('containerPack.draftContainer')){
                        		if(this.model.shipmentContainerDetails.Containers.Container[i].ContainerDetails.TotalNumberOfRecords == '0'){
                        			//this.removeEmptyContainer(this.model.shipmentContainerDetails.Containers.Container[i]);
                        			if(!iscCore.isVoid(this.model.shipmentContainerDetails.Containers.Container[i].ShipmentContainerKey)){
                                        input = {
                                            Shipment:{
                                                ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey,
                                                Containers:{
                                                    Container:{
                                                        ShipmentContainerKey:this.model.shipmentContainerDetails.Containers.Container[i].ShipmentContainerKey
                                                    }
                                                },
                                                isDraftContainer : this.model.shipmentContainerDetails.Containers.Container[i].ShipmentContainerKey === ""?"Y":"N"
                                            }
                                        };
                                        mashupArray.push(iscMashup.getMashupRefObj(this,'deleteContainer',input));
                        			}
                        		}
                    		}
                    	}
                	}
            		mashupArray.push(iscMashup.getMashupRefObj(this,'finishpack_changeShipment',changeShipmentInput));
            		iscMashup.callMashups(this,mashupArray,{}).then(this.handleFinishPack.bind(this),angular.noop);
            		//iscMashup.callMashup(this,"finishpack_changeShipment",changeShipmentInput,{}).then(this.handleFinishPack.bind(this));
            	}

            } else {
            	this.ui.allProductsPacked = false;
            	var that = this;
            	iscModal.showConfirmationMessage(iscI18n.translate('containerPack.MSG_NotAllLinesPacked')).then(function(action){
        			if(action === 'YES'){
        				iscState.goToState("shipmentsummary", {input: {Shipment: {ShipmentKey: that.model.shipmentDetails.Shipment.ShipmentKey}}}, {});
  		}

    });
	}

  		},


  		handleFinishPack : function(){
  		/*	var that = this;
  			iscModal.showConfirmationMessage(iscI18n.translate('containerPack.MSG_PackComplete')).then(function(action){
    			if(action === 'YES'){
    				var storePackSlipInput = {Shipment:{ShipmentKey:that.model.shipmentDetails.Shipment.ShipmentKey}};
            		iscMashup.callMashup(that,"print_packSlip",storePackSlipInput,{}).then(that.handlePrintPackSlip.bind(this,that.model.shipmentDetails.Shipment.ShipmentKey));

    				//iscState.goToState("shipment-summary", {input: {Shipment: {ShipmentKey: that.model.shipmentDetails.Shipment.ShipmentKey}}}, {});
    			}
    			else{
    	  			iscState.goToState("shipmentsummary", {input: {Shipment: {ShipmentKey: that.model.shipmentDetails.Shipment.ShipmentKey}}}, {});
    			}
    		});
    	*/
  			iscState.goToState("shipmentsummary", {input: {Shipment: {ShipmentKey: this.model.shipmentDetails.Shipment.ShipmentKey}}}, {});
  		},

  		handlePrintPackSlip : function(shipmentKey,response){

  			var packSlipOutput = iscMashup.getMashupOutput(response,"print_packSlip");
  			if(!iscCore.isVoid(packSlipOutput.Output.out)){
                $timeout(function(){
                    iscPrint.printHtmlOutput(packSlipOutput);
                },0);
            //iscState.goToState("shipmentsummary", {input: {Shipment: {ShipmentKey: shipmentKey}}}, {});
            }
            else{
                iscModal.showErrorMessage("containerPack.Message_Print_failure");
            }

  		},
  		uiHideNavigation: function(){

  			var width = Number(document.getElementById('containers').offsetWidth);
  			var pkgCount = Number(this.uiPackagesCount(this.ui.totalNoOfpackages));

  			if(width > (pkgCount * 100)){
  				return true;
  			}else{
  				return false;
  			}


  		},

  		uiPrintPackSlip: function(container){
  			if(!iscCore.isVoid(container.ContainerDetails)){
  	  			if(!iscCore.isVoid(container.ContainerDetails.TotalNumberOfRecords)){
  	    			if(container.ContainerDetails.TotalNumberOfRecords != 0){
  	    				var storePackSlipInput = {Shipment:{ShipmentKey:this.model.shipmentDetails.Shipment.ShipmentKey, ShipmentContainerKey : container.ShipmentContainerKey }};
  	    				//storePackSlipInput.ShipmentContainerKey = container.ShipmentContainerKey ;
  	    	    		iscMashup.callMashup(this,"print_packSlip",storePackSlipInput,{}).then(this.handlePrintPackSlip.bind(this,this.model.shipmentDetails.Shipment.ShipmentKey));
  	    			}else{
  	                  iscModal.showErrorMessage("containerPack.Message_Empty_Package");
  	              }

  	  			}
  			}
  		},

  		uiOpenItemDetails: function(shipmentLine){
  			//iscShipment.openProductDetail(shipmentLine);
  		}



    });
	}
]);

})();
