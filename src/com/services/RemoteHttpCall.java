package com.services;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Properties;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.apache.commons.json.JSONObject;
import org.w3c.dom.Document;

import com.ibm.sterling.afc.jsonutil.PLTJSONUtils;
import com.yantra.yfc.dom.YFCDocument;
import com.yantra.yfc.dom.YFCElement;
import com.yantra.yfc.util.YFCCommon;
import com.yantra.yfs.japi.YFSEnvironment;

public class RemoteHttpCall {

	private Properties props;
	public void setProperties(Properties p) {
		this.props = p;
	}
	
	public String getUrl() {
		if(this.props.containsKey("URL")) {
			return this.props.getProperty("URL");
		} else  if(this.props.containsKey("URLDomain") && this.props.containsKey("URLService")) {
			return this.props.getProperty("URLDomain") + this.props.getProperty("URLService");
		}
		return "";
	}
	
	public String getMethod() {
		return this.props.getProperty("METHOD", "GET");
	}
	public String getQueryString(YFCElement eInput) {
		StringBuilder sb = new StringBuilder();
		for(Object key : this.props.keySet()) {
			if(key instanceof String && ((String) key).startsWith("QS")) {
				if(sb.length() > 0) {
					sb.append("&");
				}
				sb.append(((String) key).substring(2) + "=" + getValueForProperty(eInput, this.props.getProperty((String) key)));	
			}
		}
		return sb.toString();
	}
	
	
	public String getValueForProperty(YFCElement eInput, String sXPath) {
		String sOutput = "";
		if(!YFCCommon.isVoid(sXPath)){
			String[] words = sXPath.split(" ");
			int i = 0;
			for(String sWord : words){
				if(i > 0){
					sOutput += " ";
				}
				if(sWord.startsWith("xml:")){
					try {
						XPath xPath = XPathFactory.newInstance().newXPath();
						String sResponse = xPath.evaluate(sWord.replace("xml:", ""), eInput.getDOMNode());
						sOutput += sResponse;
					} catch (XPathExpressionException ex){
						sOutput += sWord;
					}
				} else {
					sOutput += sWord;
				}
				i++;
			}			
		}
		return sOutput;
	}

	public Document callRemote(YFSEnvironment env, Document dInput) {
		String sURL = this.getUrl();
		System.out.println("URL: " + sURL);
		if (!YFCCommon.isVoid(dInput) && !YFCCommon.isVoid(sURL)) {
			YFCDocument docInput = YFCDocument.getDocumentFor(dInput);
			YFCElement eInput = docInput.getDocumentElement();
			String sQueryString = this.getQueryString(eInput);
			
			try {				
				if(!YFCCommon.isVoid(sQueryString)) {
					sURL += "?" + sQueryString;
				}
				System.out.println("Full URL: " + sURL);
				URL url = new URL(sURL);
				HttpURLConnection connection = (HttpURLConnection) url.openConnection();
				connection.setDoOutput(true);
				connection.setRequestMethod(this.getMethod());
				connection.setRequestProperty("Content-Type", "application/json");
				
				JSONObject response = new JSONObject(new BufferedInputStream(connection.getInputStream()));
				Document output = PLTJSONUtils.getXmlFromJSON(response.toString(), null);
				return output;
			} catch (Exception e) {
				System.out.println(e);
			}
		}
		return dInput;
	}
}
