package com.ue;

import java.io.IOException;

import org.w3c.dom.Document;
import org.xml.sax.SAXException;
import com.yantra.interop.japi.YIFApi;
import com.yantra.interop.japi.YIFClientFactory;
import com.yantra.yfc.dom.YFCDocument;
import com.yantra.yfc.dom.YFCElement;
import com.yantra.yfc.log.YFCLogCategory;
import com.yantra.yfc.util.YFCCommon;
import com.yantra.yfs.japi.YFSEnvironment;
import com.yantra.yfs.japi.YFSUserExitException;
import com.yantra.yfs.japi.ue.YFSBeforeCreateOrderUE;

public class DemoCreateCustomerForOrder implements YFSBeforeCreateOrderUE {

	private static YFCLogCategory logger = YFCLogCategory.instance(DemoCreateCustomerForOrder.class);

	@Override
	public String beforeCreateOrder(YFSEnvironment arg0, String arg1) throws YFSUserExitException {
		YFCDocument dOutput = null;
		if (!YFCCommon.isVoid(arg1)) {
			try {
				YFCDocument dInput = YFCDocument.parse(arg1);
				dOutput = beforeCreateOrder(arg0, dInput);
			} catch (SAXException e) {
				logger.debug(e.toString());
			} catch (IOException e) {
				logger.debug(e.toString());
			}
		}
		if (!YFCCommon.isVoid(dOutput)) {
			try {
				return dOutput.serializeToString();
			} catch (IOException e) {
				logger.debug(e.toString());
			}
		}
		return null;
	}

	@Override
	public Document beforeCreateOrder(YFSEnvironment arg0, Document arg1) throws YFSUserExitException {
		YFCDocument dOutput = null;
		dOutput = beforeCreateOrder(arg0, YFCDocument.getDocumentFor(arg1));
		if (!YFCCommon.isVoid(dOutput)) {
			return dOutput.getDocument();
		}
		return null;
	}

	private YFCDocument beforeCreateOrder(YFSEnvironment env, YFCDocument input) {
		YFCElement eOrder = input.getDocumentElement();
		if (YFCCommon.isVoid(eOrder.getAttribute("BillToID"))
				&& !YFCCommon.isVoid(eOrder.getAttribute("EnterpriseCode"))) {
			if (!YFCCommon.isVoid(eOrder.getAttribute("BuyerUserId"))
					|| !YFCCommon.isVoid(eOrder.getAttribute("CustomerEMailID"))) {
				getCustomerID(env, eOrder, true);
			}
		}
		if (!YFCCommon.isVoid(eOrder.getAttribute("CustomerEMailID"))
				&& YFCCommon.equals(eOrder.getAttribute("CustomerEMailID"), "robertp@gmail.com")) {
			eOrder.setAttribute("PriorityCode", "VIG");
		}
		return input;
	}

	public static String getCustomerID(YFSEnvironment env, YFCElement eOrder, boolean updateOrder) {
		YFCDocument dGetCustomerListInput = YFCDocument.createDocument("CustomerContact");
		YFCElement eCustContactInput = dGetCustomerListInput.getDocumentElement();
		YFCElement eComplexQuery = eCustContactInput.createChild("ComplexQuery");
		YFCElement eOr = eComplexQuery.createChild("Or");
		YFCElement eExp = eOr.createChild("Exp");
		eExp.setAttribute("Name", "UserID");
		eExp.setAttribute("Value", eOrder.getAttribute("BuyerUserId"));
		eExp = eOr.createChild("Exp");
		eExp.setAttribute("Name", "EmailID");
		eExp.setAttribute("Value", eOrder.getAttribute("CustomerEMailID"));
		YFCElement eCustInput = eCustContactInput.getChildElement("Customer", true);
		eCustInput.setAttribute("CallingOrganizationCode", eOrder.getAttribute("EnterpriseCode"));

		try {
			YIFApi localApi = YIFClientFactory.getInstance().getLocalApi();
			env.setApiTemplate("getCustomerContactList", getCustomerContactListTemplate());
			Document l_OutputXml = localApi.invoke(env, "getCustomerContactList", dGetCustomerListInput.getDocument());
			YFCElement output = YFCDocument.getDocumentFor(l_OutputXml).getDocumentElement();
			for (YFCElement eContact : output.getChildren()) {
				YFCElement eCustomer = eContact.getChildElement("Customer");
				if (!YFCCommon.isVoid(eCustomer)) {
					if (updateOrder) {
						eOrder.setAttribute("BillToID", eCustomer.getAttribute("CustomerID"));
					}
					return eCustomer.getAttribute("CustomerID");
				}
			}
		} catch (Exception yex) {
			System.out.println("The error thrown was: ");
			System.out.println(yex.toString());
			yex.printStackTrace();
		}

		if (updateOrder) {
			if (!YFCCommon.isVoid(eOrder.getChildElement("PersonInfoBillTo"))) {
				YFCElement ePersonInfo = eOrder.getChildElement("PersonInfoBillTo");
				YFCDocument dCreateCustomer = YFCDocument.createDocument("Customer");
				YFCElement eCustomer = dCreateCustomer.getDocumentElement();
				if (DemoCreateCustomerForOrder.isBusinessCustomer(eOrder.getAttribute("EnterpriseCode"))) {
					eCustomer.setAttribute("CustomerType", "01");
					YFCElement eBuyerOrganization = eCustomer.createChild("BuyerOrganization");
					eBuyerOrganization.setAttribute("IsBuyer", "Y");
				} else {
					eCustomer.setAttribute("CustomerType", "02");
				}

				eCustomer.setAttribute("Status", "10");
				String sOrg = getCustomerMasterOrg(env, eOrder.getAttribute("EnterpriseCode"));
				if (YFCCommon.isVoid(sOrg)) {
					sOrg = "Aurora-Corp";
				}
				eCustomer.setAttribute("OrganizationCode", sOrg);
				YFCElement eContact = eCustomer.createChild("CustomerContactList").createChild("CustomerContact");
				eContact.setAttribute("Status", "10");
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("FirstName"))) {
					eContact.setAttribute("FirstName", ePersonInfo.getAttribute("FirstName"));
				}
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("LastName"))) {
					eContact.setAttribute("LastName", ePersonInfo.getAttribute("LastName"));
				}
				if (!YFCCommon.isVoid(eOrder.getAttribute("CustomerEMailID"))) {
					eContact.setAttribute("EmailID", eOrder.getAttribute("CustomerEMailID"));
				} else if (!YFCCommon.isVoid(ePersonInfo.getAttribute("EMailID"))) {
					eContact.setAttribute("EmailID", ePersonInfo.getAttribute("EMailID"));
				}
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("MobilePhone"))) {
					eContact.setAttribute("MobilePhone", ePersonInfo.getAttribute("MobilePhone"));
				}
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("EveningPhone"))) {
					eContact.setAttribute("EveningPhone", ePersonInfo.getAttribute("EveningPhone"));
				}
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("DayPhone"))) {
					eContact.setAttribute("DayPhone", ePersonInfo.getAttribute("DayPhone"));
				}
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("Company"))) {
					eContact.setAttribute("Company", ePersonInfo.getAttribute("Company"));
				}
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("DayFaxNo"))) {
					eContact.setAttribute("DayFaxNo", ePersonInfo.getAttribute("DayFaxNo"));
				}
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("EveningFaxNo"))) {
					eContact.setAttribute("EveningFaxNo", ePersonInfo.getAttribute("EveningFaxNo"));
				}
				if (!YFCCommon.isVoid(ePersonInfo.getAttribute("Title"))) {
					eContact.setAttribute("Title", ePersonInfo.getAttribute("Title"));
				}
				if (!YFCCommon.isVoid(eOrder.getAttribute("BuyerUserId"))) {
					eContact.setAttribute("UserID", eOrder.getAttribute("BuyerUserId"));
				}
				YFCElement eCustomerAdditionalAddress = eContact.getChildElement("CustomerAdditionalAddressList", true)
						.createChild("CustomerAdditionalAddress");
				eCustomerAdditionalAddress.setAttribute("IsBillTo", "Y");
				eCustomerAdditionalAddress.setAttribute("IsShipTo", "Y");
				eCustomerAdditionalAddress.setAttribute("IsSoldTo", "Y");
				eCustomerAdditionalAddress.setAttribute("IsDefaultBillTo", "Y");
				eCustomerAdditionalAddress.setAttribute("IsDefaultShipTo", "Y");
				eCustomerAdditionalAddress.setAttribute("IsDefaultSoldTo", "Y");
				YFCElement eCPersonInfo = eCustomerAdditionalAddress.createChild("PersonInfo");
				eCPersonInfo.setAttributes(ePersonInfo.getAttributes());
				YFCElement eShipPersonInfo = eOrder.getChildElement("PersonInfoShipTo");
				if (!YFCCommon.isVoid(eShipPersonInfo)) {
					if (!YFCCommon.equals(eShipPersonInfo.getAttribute("ZipCode"), ePersonInfo.getAttribute("ZipCode"))
							|| !YFCCommon.equals(eShipPersonInfo.getAttribute("State"),
									ePersonInfo.getAttribute("State"))
							|| !YFCCommon.equals(eShipPersonInfo.getAttribute("AddressLine1"),
									ePersonInfo.getAttribute("AddressLine1"))
							|| !YFCCommon.equals(eShipPersonInfo.getAttribute("City"), ePersonInfo.getAttribute("City"))
							|| !YFCCommon.equals(eShipPersonInfo.getAttribute("AddressLine2"),
									ePersonInfo.getAttribute("AddressLine2"))) {
						eCustomerAdditionalAddress.setAttribute("IsDefaultShipTo", "N");
						eCustomerAdditionalAddress = eContact.getChildElement("CustomerAdditionalAddressList", true)
								.createChild("CustomerAdditionalAddress");
						eCustomerAdditionalAddress.setAttribute("IsBillTo", "Y");
						eCustomerAdditionalAddress.setAttribute("IsShipTo", "Y");
						eCustomerAdditionalAddress.setAttribute("IsSoldTo", "Y");
						eCustomerAdditionalAddress.setAttribute("IsDefaultBillTo", "N");
						eCustomerAdditionalAddress.setAttribute("IsDefaultShipTo", "Y");
						eCustomerAdditionalAddress.setAttribute("IsDefaultSoldTo", "Y");
						YFCElement eSPersonInfo = eCustomerAdditionalAddress.createChild("PersonInfo");
						eSPersonInfo.setAttributes(eShipPersonInfo.getAttributes());
					}
				}
				if (DemoCreateCustomerForOrder.isBusinessCustomer(eOrder.getAttribute("EnterpriseCode"))) {
					eCustomerAdditionalAddress = eCustomer.getChildElement("CustomerAdditionalAddressList", true)
							.createChild("CustomerAdditionalAddress");
					eCustomerAdditionalAddress.setAttribute("IsBillTo", "Y");
					eCustomerAdditionalAddress.setAttribute("IsShipTo", "Y");
					eCustomerAdditionalAddress.setAttribute("IsSoldTo", "Y");
					eCustomerAdditionalAddress.setAttribute("IsDefaultBillTo", "Y");
					eCustomerAdditionalAddress.setAttribute("IsDefaultShipTo", "Y");
					eCustomerAdditionalAddress.setAttribute("IsDefaultSoldTo", "Y");
					eCPersonInfo = eCustomerAdditionalAddress.createChild("PersonInfo");
					eCPersonInfo.setAttributes(ePersonInfo.getAttributes());
					eShipPersonInfo = eOrder.getChildElement("PersonInfoShipTo");
					if (!YFCCommon.isVoid(eShipPersonInfo)) {
						if (!YFCCommon.equals(eShipPersonInfo.getAttribute("ZipCode"),
								ePersonInfo.getAttribute("ZipCode"))
								|| !YFCCommon.equals(eShipPersonInfo.getAttribute("State"),
										ePersonInfo.getAttribute("State"))
								|| !YFCCommon.equals(eShipPersonInfo.getAttribute("AddressLine1"),
										ePersonInfo.getAttribute("AddressLine1"))
								|| !YFCCommon.equals(eShipPersonInfo.getAttribute("City"),
										ePersonInfo.getAttribute("City"))
								|| !YFCCommon.equals(eShipPersonInfo.getAttribute("AddressLine2"),
										ePersonInfo.getAttribute("AddressLine2"))) {
							eCustomerAdditionalAddress.setAttribute("IsDefaultShipTo", "N");
							eCustomerAdditionalAddress = eContact.getChildElement("CustomerAdditionalAddressList", true)
									.createChild("CustomerAdditionalAddress");
							eCustomerAdditionalAddress.setAttribute("IsBillTo", "Y");
							eCustomerAdditionalAddress.setAttribute("IsShipTo", "Y");
							eCustomerAdditionalAddress.setAttribute("IsSoldTo", "Y");
							eCustomerAdditionalAddress.setAttribute("IsDefaultBillTo", "N");
							eCustomerAdditionalAddress.setAttribute("IsDefaultShipTo", "Y");
							eCustomerAdditionalAddress.setAttribute("IsDefaultSoldTo", "Y");
							YFCElement eSPersonInfo = eCustomerAdditionalAddress.createChild("PersonInfo");
							eSPersonInfo.setAttributes(eShipPersonInfo.getAttributes());
						}
					}
				}
				try {
					YIFApi localApi = YIFClientFactory.getInstance().getLocalApi();
					env.setApiTemplate("manageCustomer", getManageCustomerTemplate());
					Document l_OutputXml = localApi.invoke(env, "manageCustomer", dCreateCustomer.getDocument());
					YFCElement output = YFCDocument.getDocumentFor(l_OutputXml).getDocumentElement();

					eOrder.setAttribute("BillToID", output.getAttribute("CustomerID"));
					eOrder.setAttribute("CustomerContactID", output.getChildElement("CustomerContactList", true)
							.getChildElement("CustomerContact", true).getAttribute("CustomerContactID", " "));
					if (!YFCCommon.isVoid(ePersonInfo.getAttribute("FirstName"))) {
						eOrder.setAttribute("CustomerFirstName", ePersonInfo.getAttribute("FirstName"));
					}
					if (!YFCCommon.isVoid(ePersonInfo.getAttribute("LastName"))) {
						eOrder.setAttribute("CustomerLastName", ePersonInfo.getAttribute("LastName"));
					}
					if (!YFCCommon.isVoid(eContact.getAttribute("EmailID"))) {
						eOrder.setAttribute("CustomerEMailID", eContact.getAttribute("EmailID"));
					}

					return output.getAttribute("CustomerID");
				} catch (Exception yex) {
					System.out.println("The error thrown was: ");
					System.out.println(yex.toString());
					yex.printStackTrace();
				}
			}
		}
		return null;
	}

	private static String getCustomerMasterOrg(YFSEnvironment env, String sOrganizationCode) {
		try {
			YFCDocument dOrg = YFCDocument.createDocument("Organization");
			YFCElement eOrg = dOrg.getDocumentElement();
			eOrg.setAttribute("OrganizationCode", "");
			eOrg.setAttribute("CustomerMasterOrganizationCode", "");
			YIFApi localApi = YIFClientFactory.getInstance().getLocalApi();
			env.setApiTemplate("getOrganizationHierarchy", dOrg.getDocument());
			YFCDocument dInput = YFCDocument.createDocument("Organization");
			dInput.getDocumentElement().setAttribute("OrganizationCode", sOrganizationCode);
			Document l_OutputXml = localApi.invoke(env, "getOrganizationHierarchy", dInput.getDocument());
			YFCElement output = YFCDocument.getDocumentFor(l_OutputXml).getDocumentElement();
			return output.getAttribute("CustomerMasterOrganizationCode", sOrganizationCode);
		} catch (Exception yex) {
			System.out.println("The error thrown was: ");
			System.out.println(yex.toString());
			yex.printStackTrace();
		}
		return null;
	}

	private static Document getManageCustomerTemplate() {
		YFCDocument dOutput = YFCDocument.createDocument("Customer");
		YFCElement eCustomer = dOutput.getDocumentElement();
		eCustomer.setAttribute("CustomerKey", "");
		eCustomer.setAttribute("CustomerID", "");
		eCustomer.setAttribute("OrganizationCode", "");
		YFCElement eCustomerContact = eCustomer.getChildElement("CustomerContactList", true)
				.getChildElement("CustomerContact", true);
		eCustomerContact.setAttribute("CustomerContactID", "");
		return dOutput.getDocument();
	}

	public static Document getCustomerContactListTemplate() {
		YFCDocument dOutput = YFCDocument.createDocument("CustomerContactList");
		YFCElement eList = dOutput.getDocumentElement();
		YFCElement eContact = eList.createChild("CustomerContact");
		eContact.setAttribute("CustomerContactID", "");
		eContact.setAttribute("EmailID", "");
		eContact.setAttribute("CustomerKey", "");
		eContact.setAttribute("Status", "");
		YFCElement eCustomer = eContact.createChild("Customer");
		eCustomer.setAttribute("CustomerID", "");
		eCustomer.setAttribute("OrganizationCode", "");
		eCustomer.setAttribute("Status", "");
		eCustomer.setAttribute("CustomerType", "");
		return dOutput.getDocument();
	}

	public static boolean isBusinessCustomer(String sEnterpriseCode) {
		if (!YFCCommon.isVoid(sEnterpriseCode)) {
			try {
				YFCDocument dInput = YFCDocument.getDocumentFor("/opt/Sterling/Runtime/properties/ValueMaps.xml");
				if (!YFCCommon.isVoid(dInput)) {
					YFCElement eInput = dInput.getDocumentElement();
					for (YFCElement eMap : eInput.getChildren()) {
						if (YFCCommon.equals(eMap.getAttribute("name"), "OrgType")) {
							for (YFCElement eEntry : eMap.getChildren()) {
								if (YFCCommon.equals(eEntry.getAttribute("key"), sEnterpriseCode)) {
									return YFCCommon.equals(eEntry.getNodeValue(), "Business");
								}
							}
						}
					}
				}
			} catch (Exception e) {
				return false;
			}
		}
		return false;
	}
}
