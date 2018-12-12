package com.services;

import java.util.Properties;

import org.w3c.dom.Document;

import com.yantra.yfc.dom.YFCDocument;
import com.yantra.yfc.dom.YFCElement;
import com.yantra.yfc.util.YFCCommon;
import com.yantra.yfs.japi.YFSEnvironment;

public class Utilities {

	private Properties props;
	public void setProperties(Properties p) {
		this.props = p;
	}
	
	public String getTag() {
		return this.props.getProperty("TAG");
	}
	
	public Document writeToLog(YFSEnvironment env, Document dInput) {
		if(!YFCCommon.isVoid(getTag())) {
			System.out.println(getTag());
		}
		System.out.println(YFCDocument.getDocumentFor(dInput));
		return dInput;
	}
	
	public Document addTotalItems(YFSEnvironment env, Document dInput) {
		YFCDocument input = YFCDocument.getDocumentFor(dInput);
		YFCElement eInput = input.getDocumentElement();
		
		if(!YFCCommon.isVoid(eInput.getChildElement("Item"))) {
			eInput.setAttribute("TotalItemList", eInput.getChildNodes().getLength());
		} else {
			eInput.setAttribute("TotalItemList", 0);
		}

		
		return input.getDocument();
	}
}
