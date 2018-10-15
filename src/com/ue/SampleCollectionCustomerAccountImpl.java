package com.ue;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

import com.yantra.yfs.japi.YFSEnvironment;
import com.yantra.yfs.japi.YFSExtnPaymentCollectionInputStruct;
import com.yantra.yfs.japi.YFSExtnPaymentCollectionOutputStruct;
import com.yantra.yfs.japi.YFSUserExitException;
import com.yantra.yfs.japi.ue.YFSCollectionCustomerAccountUE;

public class SampleCollectionCustomerAccountImpl implements
		YFSCollectionCustomerAccountUE {

	public YFSExtnPaymentCollectionOutputStruct collectionCustomerAccount(
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
		YFSExtnPaymentCollectionOutputStruct output = new YFSExtnPaymentCollectionOutputStruct();
		
		if(arg1.chargeType.equals("AUTHORIZATION")){
			if(isValid(arg1)){
				if(isSystemDown(arg1)){
					YFSUserExitException ue = new YFSUserExitException();
					ue.setErrorCode("YFS023");
					ue.setErrorDescription("Payment_System_Down");
					throw ue;
				}
				output.holdOrderAndRaiseEvent = false;
				output.authAVS="PASSED";
				output.authCode= "T"+System.currentTimeMillis();
				output.authorizationAmount = arg1.requestAmount;
				SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
				GregorianCalendar now = new GregorianCalendar();
				now.setTime(new Date());
				if(!arg1.customerAccountNo.startsWith("198")){
					now.add(Calendar.DAY_OF_MONTH, 5);
				} else {
					now.add(Calendar.DAY_OF_MONTH, -1);
				}
				output.authorizationExpirationDate = dateFormat.format(now.getTime());
				output.authorizationId = "A"+System.currentTimeMillis();
				output.authReturnCode = "10000";
				output.authReturnFlag = "Y";
				output.authReturnMessage="Payment_Succeeded";
				output.internalReturnCode="10000";
				output.internalReturnFlag = "Y";
				output.internalReturnMessage="Payment_Succeeded";
				output.bPreviousInvocationSuccessful = false;
				output.requestID = "R" + System.currentTimeMillis();
				output.sCVVAuthCode = "10000";
			} else {
				output.holdOrderAndRaiseEvent = true;
				output.internalReturnCode="10001";
				output.internalReturnMessage="Invalid_Customer_Account";
				output.suspendPayment = "Y";
			}
		} else {
			output.tranAmount = arg1.requestAmount;
			output.authorizationAmount = arg1.requestAmount;
			output.holdOrderAndRaiseEvent = false;
			output.internalReturnCode="20000";
			output.internalReturnMessage="Successful_Charge";
		}		
		return output;
	}

	private boolean isSystemDown(YFSExtnPaymentCollectionInputStruct input){
	/*	if(!isEncrypted(input)){
			if(input.customerAccountNo.startsWith("12")){
				return true;
			}
		}*/
		return false;
	}

	private boolean isValid(YFSExtnPaymentCollectionInputStruct input){
		if(isEncrypted(input)){
			return true;
		} else {
			return true;
		}
	}
	
	private boolean isEncrypted(YFSExtnPaymentCollectionInputStruct input){
		if(input.customerAccountNo.startsWith("IDES")){
			return true;
		} else if(input.customerAccountNo.startsWith("E")){
			return true;
		}
		return false;
	}
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

}
