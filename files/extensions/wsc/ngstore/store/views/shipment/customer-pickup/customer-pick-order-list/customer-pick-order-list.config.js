/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/


/**
 *@iscdoc viewmodalrootconfig
 *@viewname store.views.shipment.list.shipment-list
 *@package store.views.shipment.list
 *@class shipment-list
 *@description Shows shipment list.
 *@modaltemplate ./store/views/shipment/list/shipment-list.tpl.html
 */
 
angular.module("store").config([
	"iscStateProvider", function(iscStateProvider) {
		iscStateProvider.state("customerpickorderlist", {
			templateUrl: "./store/views/shipment/customer-pickup/customer-pick-order-list/customer-pick-order-list.tpl.html",
			controller: "store.views.shipment.customer-pickup.customer-pick-order-list.customer-pick-order-list"
		});
	}
]);
