package com.vtpl.forensic.vo;

import java.io.Serializable;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class VReturn implements Serializable, VReturnValues {

	/**
	 * 
	 */
	private static final long serialVersionUID = -7688318041651645009L;
	/**
	 * 
	 */
	private int returnValue = CALL_NOT_IMPLEMENTED;
	private Serializable result;
	private String message;
	/**
	 * @return the returnValue
	 */	
	public int getReturnValue() {
		return returnValue;
	}

	/**
	 * @param returnValue the returnValue to set
	 */
	@XmlElement
	public void setReturnValue(int returnValue) {
		this.returnValue = returnValue;
	}

	/**
	 * @return the result
	 */
	public Serializable getResult() {
		return result;
	}

	/**
	 * @param result the result to set
	 */
	@XmlElement
	public void setResult(Serializable result) {
		this.result = result;
	}

	/**
	 * @return the message
	 */
	public String getMessage() {
		return message;
	}

	/**
	 * @param message the message to set
	 */
	@XmlElement
	public void setMessage(String message) {
		this.message = message;
	}
	

	@Override
	public String toString() {
		return "VReturn [returnValue=" + returnValue + ", result=" + result + ", message=" + message + "]";
	}
	
}
