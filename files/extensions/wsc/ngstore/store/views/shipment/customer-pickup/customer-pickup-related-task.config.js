/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/




angular.module('store').config(['iscTaskProvider',
	function(iscTaskProvider) {
		var customerPickupRelatedTasksConfig = {
		'tasks':[
				{
					'taskId':'performCustomerPickup',
					'taskName':'Perform Customer Pickup',		
					getTask:function(shipmentModel,relatedTaskMode){
						
						if(shipmentModel.Status) {
							var task = {};					
							task.taskId = "performCustomerPickup";
							task.isPrimary = false;
							task.isDisabled = true;
							task.sequence = 30;
							var shipNode = (shipmentModel.ShipNode.ShipNode == null) ? shipmentModel.ShipNode : shipmentModel.ShipNode.ShipNode;
							var currentStoreName = iscCore.getFromContext("storeName");
							
							var allowedTransactionList = [];
							if(shipmentModel.AllowedTransactions && shipmentModel.AllowedTransactions.Transaction) {
								var allowedTransactions = shipmentModel.AllowedTransactions.Transaction;
								for(i=0;i<allowedTransactions.length;i++){
									allowedTransactionList.push(allowedTransactions[i].Tranid);
								}
							}
							
							task.resourcePermission = "WSC000068";
							
							if(shipmentModel.DeliveryMethod == 'PICK') {
								task.isHidden = false;
							} else {
								task.isHidden = true;
							}
							task.isDefault = false;
							
							if(currentStoreName == shipNode && shipmentModel.Status) {
								var shipmentStatus = shipmentModel.Status.Status?shipmentModel.Status.Status:shipmentModel.Status;
								
								if(allowedTransactionList.length > 0 && (allowedTransactionList.indexOf("CONFIRM_SHIPMENT") > -1 && shipmentModel.DeliveryMethod == 'PICK')){
									if(shipmentStatus.match("1100.70.06.30")) {
										task.isDisabled = false;
										task.isPrimary = true;
									}
								}
								
								if(shipmentStatus.match("1100.70.06.30")) {
									task.taskName = "shipmentsummary.ACTION_CustomerPick";
								} else {
									if(shipmentModel.DeliveryMethod == 'PICK') {
										task.taskName = "shipmentsummary.ACTION_CustomerPick";
									}
								}
							}
							
							task.action = ['iscState','$timeout','$q',function (iscState,$timeout,$q){
								var deferred = $q.defer();
								$timeout(function(){
									var returnData = {'taskName': task.taskId, 'taskAPIOutput': {}};
									deferred.resolve(returnData);
								},0);
								
								iscState.goToState("customer-pickup", {
									input: {
										Shipment: {
											ShipmentKey: shipmentModel.ShipmentKey
										}
									}
								}, {});
								
								return deferred.promise;
							}];
							
							return task;
						}
					}
				},
				
				{
					'taskId':'printPickupAck',
					'taskName':'Print Pickup Acknowledgement',		
					getTask:function(shipmentModel,relatedTaskMode){
						if(shipmentModel.Status) {
							var task = {};
							task.taskId = "printPickupAck";
							task.isPrimary = false;
							task.isDisabled = true;
							task.taskName = "shipmentsummary.ACTION_PrintPickupAcknowledgement";
							task.resourcePermission = "WSC000070";
                            task.sequence = 40;
							
							var shipNode = (shipmentModel.ShipNode.ShipNode == null) ? shipmentModel.ShipNode : shipmentModel.ShipNode.ShipNode;
							var currentStoreName = iscCore.getFromContext("storeName");
							
							if(shipmentModel.DeliveryMethod == 'PICK') {
								task.isHidden = false;
							} else {
								task.isHidden = true;
							}
							task.isDefault = false;
							
							if(currentStoreName == shipNode && shipmentModel.Status) {
								var shipmentStatus = shipmentModel.Status.Status?shipmentModel.Status.Status:shipmentModel.Status;
								var shipmentNode = shipmentModel.ShipNode.ShipNode?shipmentModel.ShipNode.ShipNode:shipmentModel.ShipNode;
								
								if(shipmentModel.DeliveryMethod == 'PICK' && shipmentStatus.match("1400")) {
									task.isDisabled = false;
									
									task.action = ['iscMashup','$timeout','$q','iscPrint','iscModal',function (iscMashup,$timeout,$q,iscPrint,iscModal){
										var deferred = $q.defer();
										var printAckInput = {
											Shipment:{
												ShipmentKey:shipmentModel.ShipmentKey,
												ShipNode : shipmentNode,
												Currency : shipmentModel.Currency
											}
										};
										
										iscMashup.callSimpleMashup(null,"store.views.shipment.customer-pickup.printAcknowledgement",printAckInput,{}).then(function(response){
											var printAckOutput = response.MashupRefs.MashupRef[0].Output;
											if(!iscCore.isVoid(printAckOutput.Output.out)){
												$timeout(function(){
													iscPrint.printHtmlOutput(printAckOutput);
													var returnData = {'taskName': task.taskId, 'taskAPIOutput': response};
													deferred.resolve(returnData);
												},0);
											}
											else{
												iscModal.showErrorMessage("shipmentsummary.Message_Print_failure");
											}
										}								
										);
										return deferred.promise;
									}];
								}	
							}
							return task;
						}
						
					}
				}
			]
		};

		iscTaskProvider.addTask('SHIPMENT','CUSTOMERPICKUP_RT',customerPickupRelatedTasksConfig);
}]);
