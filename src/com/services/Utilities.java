package com.services;

import org.w3c.dom.Document;

import com.yantra.yfc.dom.YFCDocument;
import com.yantra.yfs.japi.YFSEnvironment;

public class Utilities {

	public Document writeToLog(YFSEnvironment env, Document dInput) {
		System.out.println(YFCDocument.getDocumentFor(dInput));
		return dInput;
	}
	
	
}
