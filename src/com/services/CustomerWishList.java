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
	
	public Document manageWishList(YFSEnvironment env, Document input) throws YFSException {
		YFCDocument dInput = YFCDocument.getDocumentFor(input);
		YFCElement eInput = dInput.getDocumentElement();
		CustomApiImpl cai = new CustomApiImpl();
		if(!YFCCommon.isVoid(eInput.getAttribute("Action")) && YFCCommon.equals(eInput.getAttribute("Action").toUpperCase(), "DELETE")) {
			return cai.deleteCustomerWishListItem(env, input);
		}
		
		YFCDocument testDoc = YFCDocument.createDocument("CustomerWishListItem");
		YFCElement eTest = testDoc.getDocumentElement();
		
		if(!YFCCommon.isVoid(eInput.getAttribute("CustomerWishListItemKey"))) {
			eTest.setAttribute("CustomerWishListItemKey", eInput.getAttribute("CustomerWishListItemKey"));
		} else {
			String sCustomerKey = null;
			String sItemKey = null;
			
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
			
			if(!YFCCommon.isVoid(sCustomerKey)) {
				if(!YFCCommon.isVoid(eInput.getAttribute("ItemKey"))) {
					sItemKey = eInput.getAttribute("ItemKey");
				} else if(!YFCCommon.isVoid(eInput.getChildElement("Item"))) {
					YFCDocument dItem = YFCDocument.createDocument("Item");
					dItem.getDocumentElement().setAttributes(eInput.getChildElement("Item").getAttributes());
					YFCDocument dItemList = this.callApi(env, "getItemList", dItem, null);
					if(!YFCCommon.isVoid(dItemList)) {
						YFCElement eItemList = dItemList.getDocumentElement();
						if (eItemList.getChildNodes().getLength() == 1) {
							sItemKey = eItemList.getFirstChildElement().getAttribute("ItemKey");
						}
					}
				}
			} else {
				throw new YFSException("No Customer Defined");
			}
			
			if(!YFCCommon.isVoid(sItemKey)) {
				eTest.setAttribute("CustomerKey", sCustomerKey);
				eTest.setAttribute("ItemKey", sItemKey);
			} else {
				throw new YFSException("No Item Defined");
			}
		}
		
		Document dResponse = cai.getCustomerWishListItemList(env, testDoc.getDocument());
		if(!YFCCommon.isVoid(dResponse)) {
			YFCElement eResponse = YFCDocument.getDocumentFor(dResponse).getDocumentElement();
			if(eResponse.hasChildNodes()) {
				eInput.setAttribute("CustomerWishListItemKey", eResponse.getFirstChildElement().getAttribute("CustomerWishListItemKey"));
				return cai.changeCustomerWishListItem(env, dInput.getDocument());
			} else {
				return cai.createCustomerWishListItem(env, dInput.getDocument());
			}
		} 
		return cai.createCustomerWishListItem(env, dInput.getDocument());
		
		
	}
}
