package com.services;

import org.w3c.dom.Document;

import com.yantra.custom.api.CustomApiImpl;
import com.yantra.interop.japi.YIFApi;
import com.yantra.interop.japi.YIFClientFactory;
import com.yantra.yfc.dom.YFCDocument;
import com.yantra.yfc.dom.YFCElement;
import com.yantra.yfc.util.YFCCommon;
import com.yantra.yfs.japi.YFSEnvironment;
import com.yantra.yfs.japi.YFSException;


public class CustomerWishList {

	/**
	 * Calls an internal API by calling the YIFClientFactory invoke method.  Takes the environment, apiname, input and output template as potential parameters.
	 * 
	 * @param env
	 * @param sApiName
	 * @param input
	 * @param dTemplate
	 * @return
	 */
	private YFCDocument callApi (YFSEnvironment env, String sApiName, YFCDocument input, YFCDocument dTemplate) {
		try {
			YIFApi localApi = YIFClientFactory.getInstance().getLocalApi();
			if(!YFCCommon.isVoid(dTemplate)) {
				env.setApiTemplate(sApiName, dTemplate.getDocument());
			}
			Document response = localApi.invoke(env, sApiName, input.getDocument());
			if(!YFCCommon.isVoid(response)) {
				return YFCDocument.getDocumentFor(response);
			}			
		} catch (Exception yex) {
			System.out.println("The error thrown was: ");
			System.out.println(yex.toString());
			yex.printStackTrace();
		}
		return null;
	}
	
	/**
	 * Is a manageWishList api that utilizes the updated CustomApiImpl from the entities.jar to invoke the different
	 * generated APIs for the customerWishListItem entity.
	 * 
	 * The entities.jar is updated during the build process, and can be pulled out of the runtime/jars/platform/<version>/ directory.
	 * 
	 * This will be required for every new entity.
	 * 
	 * @param env
	 * @param input
	 * @return
	 * @throws YFSException
	 */
	public Document manageWishList(YFSEnvironment env, Document input) throws YFSException {
		/* YFCDocument dInput = YFCDocument.getDocumentFor(input);
		YFCElement eInput = dInput.getDocumentElement();
		CustomApiImpl cai = new CustomApiImpl();
		
		// Checking if there is an Action attribute on the input and if it is DELETE we will invoke the deleteCustomerWishListItem function.
		if(!YFCCommon.isVoid(eInput.getAttribute("Action")) && YFCCommon.equals(eInput.getAttribute("Action").toUpperCase(), "DELETE")) {
			return cai.deleteCustomerWishListItem(env, input);
		}
		
		YFCDocument testDoc = YFCDocument.createDocument("CustomerWishListItem");
		YFCElement eTest = testDoc.getDocumentElement();
		// If the input has a CustomerWishListItemKey, we will check if that already exists in the database.
		if(!YFCCommon.isVoid(eInput.getAttribute("CustomerWishListItemKey"))) {
			eTest.setAttribute("CustomerWishListItemKey", eInput.getAttribute("CustomerWishListItemKey"));
		} else {
			// If not, we need a CustomerKey and an ItemKey as unique criteria.
			String sCustomerKey = null;
			String sItemKey = null;
			
			// If the CustomerKey is in the input, we will store it for later.
			// Otherwise we will check if there is a Customer element under the root, and perform a customer lookup
			// With that element.  If we get a Customer record back, we store the Customer Key
			if (!YFCCommon.isVoid(eInput.getAttribute("CustomerKey"))) {
				sCustomerKey = eInput.getAttribute("CustomerKey");
			} else if(!YFCCommon.isVoid(eInput.getChildElement("Customer"))) {
				
				YFCDocument dCustomer = YFCDocument.createDocument("Customer");
				dCustomer.getDocumentElement().setAttributes(eInput.getChildElement("Customer").getAttributes());
				YFCDocument dCustomerList = this.callApi(env, "getCustomerList", dCustomer, null);
				if(!YFCCommon.isVoid(dCustomerList)) {
					YFCElement eCustomerList = dCustomerList.getDocumentElement();
					if (eCustomerList.getChildNodes().getLength() == 1) {
						sCustomerKey = eCustomerList.getFirstChildElement().getAttribute("CustomerKey");
					}
				}
			}
			
			// If at this point, we have no Customer Key, we will throw an error.  Otherwise, proceed to checking for ItemKey
			if(!YFCCommon.isVoid(sCustomerKey)) {
				// If the ItemKey exists, we store it for later.
				// If not, we check if an Item element exists under the root, and lookup the Item storing the located ItemKey.
				if(!YFCCommon.isVoid(eInput.getAttribute("ItemKey"))) {
					sItemKey = eInput.getAttribute("ItemKey");
				} else if(!YFCCommon.isVoid(eInput.getChildElement("Item"))) {
					YFCDocument dItem = YFCDocument.createDocument("Item");
					dItem.getDocumentElement().setAttributes(eInput.getChildElement("Item").getAttributes());
					YFCDocument dItemList = this.callApi(env, "getItemList", dItem, null);
					if(!YFCCommon.isVoid(dItemList)) {
						YFCElement eItemList = dItemList.getDocumentElement();
						if (eItemList.getChildNodes().getLength() == 1) {
							sItemKey = eItemList.getFirstChildElement().getAttribute("ItemKey").trim();
						}
					}
				}
			} else {
				throw new YFSException("No Customer Defined");
			}
			
			// If no Item Key is defined at this point, throw an error
			// Otherwise, we have the unique criteria, and we can set the in the test and the input.
			if(!YFCCommon.isVoid(sItemKey)) {
				eTest.setAttribute("CustomerKey", sCustomerKey);
				eTest.setAttribute("ItemKey", sItemKey);
				eInput.setAttribute("CustomerKey", sCustomerKey);
				eInput.setAttribute("ItemKey", sItemKey);
			} else {
				throw new YFSException("No Item Defined");
			}
		}
		
		// Check for the existing Customer Wish List Item record
		Document dResponse = cai.getCustomerWishListItemList(env, testDoc.getDocument());
		if(!YFCCommon.isVoid(dResponse)) {
			// If the record exists we will call changeCustomerWishListItem
			// If not, we call createCustomerWishListItem.
			// These api's automatically update the CreateTS, ModifyTS, CreateuserID, ModifyUserID, CreateProgID, ModifyProgID and LockID
			
			YFCElement eResponse = YFCDocument.getDocumentFor(dResponse).getDocumentElement();
			if(eResponse.hasChildNodes()) {
				eInput.setAttribute("CustomerWishListItemKey", eResponse.getFirstChildElement().getAttribute("CustomerWishListItemKey"));
				dResponse = cai.changeCustomerWishListItem(env, dInput.getDocument());
			} else {
				dResponse = cai.createCustomerWishListItem(env, dInput.getDocument());
			}
		} else {
			dResponse = cai.createCustomerWishListItem(env, dInput.getDocument());	
		}
		return dResponse;
		*/
		
		return input;
	}
}
