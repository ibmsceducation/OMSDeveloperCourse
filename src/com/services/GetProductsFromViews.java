package com.services;

import org.w3c.dom.Document;

import com.yantra.yfc.dom.YFCDocument;
import com.yantra.yfc.dom.YFCElement;
import com.yantra.yfs.japi.YFSEnvironment;

public class GetProductsFromViews {

	public Document getProducts(YFSEnvironment env, Document docInput) {
		YFCDocument dInput = YFCDocument.getDocumentFor(docInput);
		YFCElement eInput = dInput.getDocumentElement();
		
		return docInput;
	}
}
