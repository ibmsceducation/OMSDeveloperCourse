package com.ue;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import com.yantra.yfc.util.YFCCommon;
import com.yantra.yfs.japi.YFSEnvironment;
import com.yantra.yfs.japi.YFSExtnPaymentCollectionInputStruct;
import com.yantra.yfs.japi.YFSExtnPaymentCollectionOutputStruct;
import com.yantra.yfs.japi.YFSUserExitException;
import com.yantra.yfs.japi.ue.YFSCollectionStoredValueCardUE;

public class SampleCollectionStoreValueCardImpl implements
		YFSCollectionStoredValueCardUE {

	public YFSExtnPaymentCollectionOutputStruct collectionStoredValueCard(
			YFSEnvironment arg0, YFSExtnPaymentCollectionInputStruct arg1)
			throws YFSUserExitException {
		YFSExtnPaymentCollectionOutputStruct output = new YFSExtnPaymentCollectionOutputStruct();
		
		if(arg1.chargeType.equals("AUTHORIZATION")){
			if(isValid(arg1)){
				if(isSystemDown(arg1)){
					YFSUserExitException ue = new YFSUserExitException();
					ue.setErrorCode("YFS023");
					ue.setErrorDescription("Payment_System_Down");
					throw ue;
				} else {
					output.holdOrderAndRaiseEvent = false;
					output.authAVS="PASSED";
					output.authCode= "T"+System.currentTimeMillis();
					output.authorizationAmount = arg1.requestAmount;
					SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
					GregorianCalendar now = new GregorianCalendar();
					now.setTime(new Date());
					now.add(Calendar.DAY_OF_MONTH, 5);
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
				}
			}
		} else {
			if(YFCCommon.isVoid(arg1.authorizationId)){
				output.holdOrderAndRaiseEvent = true;
				output.internalReturnCode="20001";
				output.internalReturnMessage="No_Authorization_ID_Passed";
			} else {
				output.tranAmount = arg1.requestAmount;
				output.holdOrderAndRaiseEvent = false;
				output.internalReturnCode="20000";
				output.internalReturnMessage="Successful_Charge";
			}
		}		
		return output;
	}
	
	private boolean isSystemDown(YFSExtnPaymentCollectionInputStruct input){
		if(!isEncrypted(input)){
			if(input.svcNo.startsWith("12")){
				return true;
			}
		}
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
		if(input.svcNo.startsWith("IDES")){
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
