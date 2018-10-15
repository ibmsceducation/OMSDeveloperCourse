package com.ue;

import com.yantra.yfs.japi.YFSEnvironment;
import com.yantra.yfs.japi.YFSExtnPaymentCollectionInputStruct;
import com.yantra.yfs.japi.YFSExtnPaymentCollectionOutputStruct;
import com.yantra.yfs.japi.YFSUserExitException;
import com.yantra.yfs.japi.ue.YFSCollectionOthersUE;

public class SampleCollectionOthersImpl implements YFSCollectionOthersUE {

	public YFSExtnPaymentCollectionOutputStruct collectionOthers(
			YFSEnvironment arg0, YFSExtnPaymentCollectionInputStruct arg1)
			throws YFSUserExitException {
		System.out.println("input authorizationId:"+arg1.authorizationId);
		System.out.println("input billToAddressLine1:"+arg1.billToAddressLine1);
		System.out.println("input billToCity:"+arg1.billToCity);
		System.out.println("input billToCountry:"+arg1.billToCountry);
		System.out.println("input billToDayPhone:"+arg1.billToDayPhone);
		System.out.println("input billToEmailId:"+arg1.billToEmailId);
		System.out.println("input billToFirstName:"+arg1.billToFirstName);
		System.out.println("input billToId:"+arg1.billToId);
		System.out.println("input billTokey:"+arg1.billTokey);
		System.out.println("input billToLastName:"+arg1.billToLastName);
		System.out.println("input billToState:"+arg1.billToState);
		System.out.println("input billToZipCode:"+arg1.billToZipCode);
		System.out.println("input chargeTransactionKey:"+arg1.chargeTransactionKey);
		System.out.println("input chargeType:"+arg1.chargeType);
		System.out.println("input creditCardExpirationDate:"+arg1.creditCardExpirationDate);
		System.out.println("input creditCardName:"+arg1.creditCardName);
		System.out.println("input creditCardNo:"+arg1.creditCardNo);
		System.out.println("input creditCardType:"+arg1.creditCardType);
		System.out.println("input currency:"+arg1.currency);
		System.out.println("input customerAccountNo:"+arg1.customerAccountNo);
		System.out.println("input documentType:"+arg1.documentType);
		System.out.println("input customerPONo:"+arg1.customerPONo);
		System.out.println("input enterpriseCode:"+arg1.enterpriseCode);
		System.out.println("input merchantId:"+arg1.merchantId);
		System.out.println("input orderHeaderKey:"+arg1.orderHeaderKey);
		System.out.println("input orderNo:"+arg1.orderNo);
		System.out.println("input paymentReference1:"+arg1.paymentReference1);
		System.out.println("input paymentReference2:"+arg1.paymentReference2);
		System.out.println("input paymentReference3:"+arg1.paymentReference3);
		System.out.println("input paymentType:"+arg1.paymentType);
		System.out.println("input requestAmount:"+arg1.requestAmount);
		System.out.println("input shipToAddressLine1:"+arg1.shipToAddressLine1);
		System.out.println("input shipToCity:"+arg1.shipToCity);
		System.out.println("input shipToCountry:"+arg1.shipToCountry);
		System.out.println("input shipToDayPhone:"+arg1.shipToDayPhone);
		System.out.println("input shipToEmailId:"+arg1.shipToEmailId);
		System.out.println("input shipToFirstName:"+arg1.shipToFirstName);
		System.out.println("input shipToId:"+arg1.shipToId);
		System.out.println("input shipTokey:"+arg1.shipTokey);
		System.out.println("input shipToLastName:"+arg1.shipToLastName);
		System.out.println("input shipToState:"+arg1.shipToState);
		System.out.println("input shipToZipCode:"+arg1.shipToZipCode);
		System.out.println("input svcNo:"+arg1.svcNo);
		System.out.println("input bPreviouslyInvoked:"+arg1.bPreviouslyInvoked);

		return null;
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

}
