package com.ue;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

import com.yantra.yfc.date.YDate;
import com.yantra.yfc.util.YFCCommon;
import com.yantra.yfs.japi.YFSEnvironment;
import com.yantra.yfs.japi.YFSExtnPaymentCollectionInputStruct;
import com.yantra.yfs.japi.YFSExtnPaymentCollectionOutputStruct;
import com.yantra.yfs.japi.YFSUserExitException;
import com.yantra.yfs.japi.ue.YFSCollectionCreditCardUE;


public class SampleCreditCardCollectionImpl implements YFSCollectionCreditCardUE {


		public YFSExtnPaymentCollectionOutputStruct collectionCreditCard(
				YFSEnvironment arg0, YFSExtnPaymentCollectionInputStruct arg1)
				throws YFSUserExitException {
			YFSExtnPaymentCollectionOutputStruct output = new YFSExtnPaymentCollectionOutputStruct();
			
			if(arg1.chargeType.equals("AUTHORIZATION")){
				if(isSystemDown(arg1)){
					YFSUserExitException ue = new YFSUserExitException();
					ue.setErrorCode("YFS023");
					ue.setErrorDescription("Payment_System_Down");
					throw ue;
				}
				if(!missingName(arg1)){
					if(!expired(arg1)){
						if (invalidCVV(arg1)){
							output.holdOrderAndRaiseEvent = true;
							output.internalReturnCode="10005";
							output.internalReturnMessage="Invalid_CVV_Used";
							output.suspendPayment = "Y";
						} else if (!hasAddress(arg1)){
							output.holdOrderAndRaiseEvent = false;
							output.authAVS="FAILED";
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
							output.authReturnMessage="Invalid_Address";
							output.internalReturnCode="10005";
							output.internalReturnFlag = "Y";
							output.internalReturnMessage="Invalid_Address";
							output.bPreviousInvocationSuccessful = false;
							output.requestID = "R" + System.currentTimeMillis();
							output.sCVVAuthCode = "10000";
						} else {
							output.holdOrderAndRaiseEvent = false;
							output.authAVS="PASSED";
							output.authCode= "T"+System.currentTimeMillis();
							output.authorizationAmount = arg1.requestAmount;
							SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
							GregorianCalendar now = new GregorianCalendar();
							now.setTime(new Date());
							if(!arg1.creditCardNo.startsWith("198")){
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
						}
					} else {
						output.holdOrderAndRaiseEvent = true;
						output.internalReturnCode="10002";
						output.internalReturnMessage="Credit_Card_Expired";
						output.suspendPayment = "Y";
					}
				} else {
					output.holdOrderAndRaiseEvent = true;
					output.internalReturnCode="10003";
					output.internalReturnMessage="Credit_Card_Name_Not_Passed_On_Card";
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
			if(!isEncrypted(input)){
				if(input.creditCardNo.startsWith("12")){
					return true;
				}
			}
			return false;
		}

		private boolean missingCVV(YFSExtnPaymentCollectionInputStruct input){
			if(YFCCommon.isVoid(input.paymentReference1)){
				return true;
			} else {
				return false;
			}		
		}
		
		private boolean invalidCVV(YFSExtnPaymentCollectionInputStruct input){
			if(!YFCCommon.isVoid(input.paymentReference1) && YFCCommon.equals(input.paymentReference1, "123")){
				return true;
			}
			return false;
		}
		
		private boolean hasAddress(YFSExtnPaymentCollectionInputStruct input){
			return !(YFCCommon.isVoid(input.billToAddressLine1) || YFCCommon.isVoid(input.billToCity) || YFCCommon.isVoid(input.billToCountry) || YFCCommon.isVoid(input.billToState) || YFCCommon.isVoid(input.billToZipCode));
		}
		
		private boolean expired(YFSExtnPaymentCollectionInputStruct input){
			if(YFCCommon.isVoid(input.creditCardExpirationDate)){
				return true;
			} else {
				String[] dmy =  input.creditCardExpirationDate.split("/");
				int sMonth = 0;
				int sYear = 0;
				if(dmy.length == 2){
					sMonth = Integer.parseInt(dmy[0]);
					sYear = Integer.parseInt(dmy[1]);
				} else if(dmy.length == 3){
					sMonth = Integer.parseInt(dmy[0]);
					sYear = Integer.parseInt(dmy[2]);
				}
				if(sMonth != 0 && sYear != 0){
					if(sYear >= YDate.newDate().getYear() || (sMonth >= YDate.newDate().getMonth() && sYear == YDate.newDate().getYear())){
						return false;
					}
				}
				return true;
			}
		}
		

		private boolean isEncrypted(YFSExtnPaymentCollectionInputStruct input){
			if(input.creditCardNo.startsWith("IDES")){
				return true;
			} else if(input.creditCardNo.startsWith("E")){
				return true;
			}
			return false;
		}
		
		private boolean missingName(YFSExtnPaymentCollectionInputStruct input){
			if(!YFCCommon.isVoid(input.creditCardName) || (!YFCCommon.isVoid(input.firstName) && !YFCCommon.isVoid(input.lastName))){
				return false;
			}
			return true;
		}
		/**
		 * @param args
		 */
		public static void main(String[] args) {
			// TODO Auto-generated method stub

		}

	}

