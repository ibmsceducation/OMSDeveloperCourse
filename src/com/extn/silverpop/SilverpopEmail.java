package com.extn.silverpop;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Properties;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.yantra.util.YFCXSLTransformer;
import com.yantra.util.YFCXSLTransformerImpl;
import com.yantra.yfc.dom.YFCDocument;
import com.yantra.yfc.dom.YFCElement;
import com.yantra.yfc.log.YFCLogCategory;
import com.yantra.yfc.util.YFCCommon;
import com.yantra.yfs.japi.YFSEnvironment;

public class SilverpopEmail {

	private Properties props;
	private static YFCLogCategory logger = YFCLogCategory.instance(SilverpopEmail.class);

	public void setProperties(Properties props) throws Exception {
		this.props = props;
	}
	
	public String getProperty(String sProp) {
		return this.props.getProperty(sProp);
	}
	
	/** Retrieves the Campaign ID from a property if set otherwise uses a default value. */
	private String getCampaignID(boolean custom){
		if (!YFCCommon.isVoid(getProperty("CampaignID"))){
			return (String) getProperty("CampaignID");
		} else if(custom){
			return "23785879";
		}
		return "21157272";
	}
	/** Retrieves the Transact Server URL from a provided property or uses a default value if not set */

	private String getTransactURL() {
		if(!YFCCommon.isVoid(getProperty("TransactURL"))) {
			return getProperty("TransactURL");
		}
		return "http://transact3.silverpop.com/XTMail";
	}
	
	/** Retrieves the email address from the provided path. Otherwise use the value in the property or a default value if not set */
	private String getFromAddress(YFCElement eInput) {
		if(!YFCCommon.isVoid(getProperty("FromEmail"))) {
			try {
				String sXPath = getProperty("FromEmail");
				if(sXPath.startsWith("xml:")) {
					sXPath = sXPath.substring(4);
				}
				XPath xPath = XPathFactory.newInstance().newXPath();
				String sResponse = xPath.evaluate(sXPath, eInput.getDOMNode());
				if(!YFCCommon.isVoid(sResponse)) {
					return sResponse;
				}
			} catch (Exception e) {
				this.logger.debug("Failed to Retrieve Email");
			}
			return getProperty("FromEmail");
		}
		return "demo@demo.com";
	}
	
	private String getFromName(YFCElement eInput) {
		if(!YFCCommon.isVoid(getProperty("FromName"))) {
			try {
				String xPath = getProperty("FromName");
				String sResponse = getValueForProperty(eInput, xPath);
				if(!YFCCommon.isVoid(sResponse)) {
					return sResponse;
				}
			} catch (Exception e ) {
				logger.debug("No FromName found");
			}
			return getProperty("FromName");
		}
		return "Demo Enterprise";
	}
	
	private String getToAddress(YFCElement eInput) {
		if(!YFCCommon.isVoid(eInput) && !YFCCommon.isVoid(eInput.getAttribute("To"))) {
			return eInput.getAttribute("To");
		} else if (!YFCCommon.isVoid(getProperty("To"))) {
			try {
				String xPath = getProperty("To");
				String sResponse = getValueForProperty(eInput, xPath);
				if(!YFCCommon.isVoid(sResponse)) {
					return sResponse;
				}
			} catch (Exception e ) {
				logger.debug("No To found");
			}
			return getProperty("To");
		}
		return "error@gmail.com";
	}
	
	private boolean sendsEmail() {
		return !YFCCommon.equals(getProperty("SendEmail"), "N");		
	}
	
	private boolean writeEmailToFile() {
		return !YFCCommon.equals(getProperty("WriteEmail"), "N");		
	}
	
	private String getWriteFilePath() {
		if(!YFCCommon.isVoid(getProperty("FilePath"))) {
			return (String) getProperty("FilePath");
		}
		return "/opt/SSFS_9.5/emails";
	}
	
	private String getWriteFileName(YFCElement eInput){
		if (!YFCCommon.isVoid(getProperty("FileName"))){
			try{
				String sXPath = (String) getProperty("FileName");
				XPath xPath = XPathFactory.newInstance().newXPath();
				String sResponse = xPath.evaluate(sXPath, eInput.getDOMNode());
				if(!YFCCommon.isVoid(sResponse)){
					return sResponse;
				}
			} catch(Exception e){
				
			}
			return (String)getProperty("FileName");
		} 
		return "email";
	}
	
	private String getWriteFileExtn(){
		if (!YFCCommon.isVoid(getProperty("FileExtn"))){
			return (String)getProperty("FileExtn");
		} 
		return ".xml";
	}

	
	private String getSubject(YFCElement eInput){
		if(!YFCCommon.isVoid(eInput) && !YFCCommon.isVoid(eInput.getAttribute("Subject"))){
			return eInput.getAttribute("Subject");
		} else if (!YFCCommon.isVoid(getProperty("Subject"))){
			return getValueForProperty(eInput, (String) getProperty("Subject"));
		} 
		return "Test";
	}
	
	/** Retrieves the xPath value of a property from the input Element for a provided xpath */
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
	
	private String getTransformation(YFCElement eInput){
		if(!YFCCommon.isVoid(getProperty("XSL"))){
			YFCXSLTransformer trans = YFCXSLTransformerImpl.getInstance();
			InputStream xslStream = SilverpopEmail.class.getResourceAsStream((String)getProperty("XSL"));
			StringBuffer sb = new StringBuffer(eInput.toString());
			return trans.transformXML((String) getProperty("XSL"), xslStream, sb);
		} else if(!YFCCommon.isVoid(getProperty("XSLFile"))){
			YFCXSLTransformer trans = YFCXSLTransformerImpl.getInstance();
			try {
				InputStream xslStream = new FileInputStream((String)getProperty("XSLFile"));
				StringBuffer sb = new StringBuffer(eInput.toString());
				return trans.transformXML(null, xslStream, sb);
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return null;
	}
	
	
	private void getBody(Element node, YFCElement eInput){
		Document d = node.getOwnerDocument();
		if(!YFCCommon.isVoid(eInput)){
			String temp = getTransformation(eInput);
			if(!YFCCommon.isVoid(temp)){
				node.appendChild(d.createCDATASection(temp));
			} else {
				//node.appendChild(d.createCDATASection(getDummyEmailContent()));
				node.appendChild(d.createCDATASection(eInput.toString()));
			}
		} else if (!YFCCommon.isVoid(getProperty("Body"))){
			node.appendChild(d.createCDATASection((String) getProperty("Body")));
		} else {
			node.appendChild(d.createCDATASection("<html><head></head><body><h2>Sample Email</h2></body></html>"));
		}
		
	}
	
	
	public Document writeToFile(YFSEnvironment env, Document inputDoc){
		
		if(writeEmailToFile()){
			YFCDocument dInput = YFCDocument.getDocumentFor(inputDoc);
			YFCElement eInput = dInput.getDocumentElement();
			String sFileName = getWriteFilePath() + "/" + getWriteFileName(eInput) + getWriteFileExtn();
			String sContentName = getWriteFilePath() + "/" + getWriteFileName(eInput) + "_content.xml";
			
			File path = new File(getWriteFilePath());
			if(!path.exists()){
				path.mkdirs();
			}
			File f = new File(sFileName);
			int i = 0;
			while(f.exists()){
				i++;
				sFileName = getWriteFilePath() + "/" + getWriteFileName(eInput) + i + getWriteFileExtn();
				sContentName = getWriteFilePath() + "/" + getWriteFileName(eInput) + "_content" + i + ".xml";
				f = new File(sFileName);
			}
			
			YFCDocument dOutput = YFCDocument.createDocument("Output");
			YFCElement eOutput = dOutput.getDocumentElement();
			eOutput.createChild("To").setNodeValue(getToAddress(eInput));
			eOutput.createChild("From").setNodeValue(getFromAddress(eInput));
			eOutput.createChild("Subject").setNodeValue(getSubject(eInput));
			getBody((Element)eOutput.createChild("Body").getDOMNode(), eInput);
		
			String content = null;
			if(!YFCCommon.isVoid(eInput)){
				content = getTransformation(eInput);
			} else if (!YFCCommon.isVoid(getProperty("Body"))){
				content = (String) getProperty("Body");
			} else {
				content = "<html><head></head><body><h2>Sample Email</h2></body></html>";
			}
			
			// write the properties into the output file
			try {
				FileOutputStream sOut = new FileOutputStream  (sFileName);
				sOut.write (content.getBytes());
				sOut.flush();
				sOut.close();
				sOut = new FileOutputStream  (sContentName);
				sOut.write (dOutput.toString().getBytes());
				sOut.flush();
				sOut.close();
			} catch (Exception e){
				e.printStackTrace();
			}
			
			return dOutput.getDocument();
		}
		return inputDoc;
	}
	
	
	public Document sendCustomEmail(YFSEnvironment env, Document inputDoc){
		if(!YFCCommon.isVoid(inputDoc)){
			writeToFile(env, inputDoc);
			if(sendsEmail()){
				YFCDocument dInput = YFCDocument.getDocumentFor(inputDoc);
				YFCElement eInput = dInput.getDocumentElement();
				if(!YFCCommon.isVoid(getToAddress(eInput))){
					YFCDocument dMailing = YFCDocument.createDocument("XTMAILING");
					YFCElement eMailing = dMailing.getDocumentElement();
					YFCElement eCampaign = eMailing.createChild("CAMPAIGN_ID");
					eCampaign.setNodeValue(getCampaignID(true));
					YFCElement eRecipient = eMailing.createChild("RECIPIENT");
					YFCElement eMail = eRecipient.createChild("EMAIL");
					eMail.setNodeValue(getToAddress(eInput));
					YFCElement eBodyType = eRecipient.createChild("BODY_TYPE");
					eBodyType.setNodeValue("HTML");
					
					YFCElement ePersonalization = eRecipient.createChild("PERSONALIZATION");
					YFCElement eTagName = ePersonalization.createChild("TAG_NAME");
					eTagName.setNodeValue("Subject");
					YFCElement eValue = ePersonalization.createChild("VALUE");
					eValue.setNodeValue(getSubject(eInput));
					
					ePersonalization = eRecipient.createChild("PERSONALIZATION");
					eTagName = ePersonalization.createChild("TAG_NAME");
					eTagName.setNodeValue("From Name");
					eValue = ePersonalization.createChild("VALUE");
					eValue.setNodeValue(getFromName(eInput));
					
					ePersonalization = eRecipient.createChild("PERSONALIZATION");
					eTagName = ePersonalization.createChild("TAG_NAME");
					eTagName.setNodeValue("From Address");
					eValue = ePersonalization.createChild("VALUE");
					eValue.setNodeValue(getFromAddress(eInput));
					
					ePersonalization = eRecipient.createChild("PERSONALIZATION");
					eTagName = ePersonalization.createChild("TAG_NAME");
					eTagName.setNodeValue("HTMLBody");
					eValue = ePersonalization.createChild("VALUE");
					getBody((Element)eValue.getDOMNode(), eInput);
					System.out.println(dMailing);
					String sOutput = dMailing.toString();
					
					try {
						
						URL url = new URL(getTransactURL());
				        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
				        connection.setDoOutput(true);
				        connection.setRequestMethod("POST");
				        connection.setRequestProperty("Content-Type", "application/xml");
				        connection.setRequestProperty("Content-Length",  String.valueOf(sOutput.length()));
				        // Write data
				        OutputStream os = connection.getOutputStream();
				        connection.connect();
				        os.write(sOutput.getBytes());
						StringBuffer sb = new StringBuffer();
						BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
						String res;
						while ((res = in.readLine()) != null) {
							sb.append(res);
						}
						in.close();
						connection.disconnect();
						System.out.println(YFCDocument.getDocumentFor(sb.toString()));
						return YFCDocument.getDocumentFor(sb.toString()).getDocument();
					
					} catch (UnsupportedEncodingException e) {
						
						e.printStackTrace();
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					
				}
			}
		}
		return inputDoc;
	}
	
}
