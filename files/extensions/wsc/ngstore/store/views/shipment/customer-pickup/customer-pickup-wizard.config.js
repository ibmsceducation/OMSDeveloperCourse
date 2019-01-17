/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10), IBM Order Management (5737-D18), IBM Store Engagement (5737D58)
 * (C) Copyright IBM Corp. 2017 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/




/**
 *@iscdoc wizardinfo
 *@wizardname store.views.shipment.customer-pickup.customer-pickup-wizard
 *@package store.views.shipment.customer-pickup
 *@class customer-pickup-wizard
 *@wizardtemplate init ./store/views/shipment/customer-pickup/customer-pickup-init.tpl.html
 *@wizardtemplate finish ./store/views/shipment/customer-pickup/customer-pickup-finish.tpl.html
 *@wizardcontroller	init store.views.shipment.customer-pickup.customer-pickup-init
 *@wizardcontroller finish store.views.shipment.customer-pickup.customer-pickup-finish
 *@wizardpage singlepagepickup "./store/views/shipment/customer-pickup/customer-pickup-single-page.tpl.html" "store.views.shipment.customer-pickup.customer-pickup-page"
 *@description Handles the wizard navigation for 'Customer Pickup' flow.
 *
 */
angular.module('store').config(['iscStateProvider',
	function(iscStateProvider) {
		iscStateProvider.state('customer-pickup',{
		/**
		 *@iscdoc wizardconfig
		 *@wizardname store.views.shipment.customer-pickup.customer-pickup-wizard
		 *@configtype State
		 *@description Sets the state for the 'Customer Pickup' wizard.
		 *@configdata stateName "customer-pickup" The state to transition to
		 *@configdata templateUrl "./store/views/shipment/customerpickup/customer-pickup-wizard.tpl.html" Template file to load for state change
		 *@configdata addToHistory "false" The state needs not be considered for 'Back' button handling
		 *
		 */
		  templateUrl: './store/views/shipment/customer-pickup/customer-pickup-wizard.tpl.html',
          resourceId:'WSC000068',
		  addToHistory:false
    });
}]);

