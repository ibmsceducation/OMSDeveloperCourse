package com.ue;

import org.w3c.dom.Document;

import com.yantra.ycp.core.YCPContext;
import com.yantra.yfc.dom.YFCDocument;
import com.yantra.yfc.dom.YFCElement;
import com.yantra.yfc.util.YFCCommon;
import com.yantra.yfs.japi.YFSEnvironment;
import com.yantra.yfs.japi.YFSUserExitException;
import com.yantra.yfs.japi.ue.YFSGetFundsAvailableUE;

public class SampleGetFundsAvailable implements YFSGetFundsAvailableUE {

	public Document getFundsAvailable(YFSEnvironment arg0, Document arg1) throws YFSUserExitException {
	//	tableExists((YCPContext)arg0);
		YFCDocument dOutput = YFCDocument.createDocument("PaymentMethod");
		YFCElement eOutput = dOutput.getDocumentElement();
		eOutput.setAttribute("FundsAvailable", getFunds((YCPContext)arg0, arg1));
		return dOutput.getDocument();
	}

	
	private double getFunds(YCPContext ctx, Document input) throws YFSUserExitException {
		YFCElement eInput = YFCDocument.getDocumentFor(input).getDocumentElement();
		String sSvcNo = eInput.getAttribute("SvcNo");
		if(!YFCCommon.isVoid(sSvcNo)){
			return getDefaultAmount(sSvcNo);
		}
		return 0.0;		
	}
	
	private double getDefaultAmount(String sSvcNo) throws YFSUserExitException {
		if(sSvcNo.startsWith("109")){
			return 109450.87;
		} else	if(sSvcNo.startsWith("1")){
			return 1000.0;
		} else if (sSvcNo.startsWith("2")){
			return 25.00;
		} else if (sSvcNo.startsWith("3")){
			return 100.00;
		} else if(sSvcNo.startsWith("40")){
			return 40.00;
		} else if(sSvcNo.startsWith("4")){
			return 500.00;
		} else if(sSvcNo.startsWith("60")){
			return 60.00;
		} else if(sSvcNo.startsWith("75")){
			return 75.00;
		} else if(sSvcNo.startsWith("509")){
			YFSUserExitException eu = new YFSUserExitException();
			eu.setErrorCode("YCD_001");
			eu.setErrorDescription("Funds available exception");
			throw eu;
		} else {
			return 50.0;
		}
	}
	

}
