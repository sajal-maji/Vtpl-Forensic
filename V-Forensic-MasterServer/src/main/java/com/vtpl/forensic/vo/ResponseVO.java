package com.vtpl.forensic.vo;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;

import com.vtpl.forensic.utils.VGsonUtils;

public class ResponseVO {
	
	private int status;
	
	private int code;
	
	private String description;

	private String message;

	private String uri;

	private List<Object> result;
	
	public ResponseVO() {
		super();
	}
	
	public ResponseVO(int status, HttpStatus httpStatus) {
		super();
		this.status = status;
		this.code = httpStatus.value();
		this.description = httpStatus.getReasonPhrase();
		this.message = VReturnMessage.returnMessage.get(status);
	}
	
	public ResponseVO(int status, HttpStatus httpStatus, String uri) {
		super();
		this.status = status;
		this.code = httpStatus.value();
		this.description = httpStatus.getReasonPhrase();
		this.message = VReturnMessage.returnMessage.get(status);
		this.uri = uri;
		this.result = new ArrayList<Object>();
	}
	
	public ResponseVO(int status, HttpStatus httpStatus, String uri, String message) {
		super();
		this.status = status;
		this.code = httpStatus.value();
		this.description = httpStatus.getReasonPhrase();
		this.message = message;
		this.uri = uri;
		this.result = new ArrayList<Object>();
	}
	
	public ResponseVO(int status, String message, HttpStatus httpStatus, String uri) {
		super();
		this.status = status;
		this.code = httpStatus.value();
		this.description = httpStatus.getReasonPhrase();
		this.message = message;
		this.uri = uri;
		this.result = new ArrayList<Object>();
	}
	
	public ResponseVO(int status, HttpStatus httpStatus, Exception ex, String uri) {
		super();
		this.status = status;
		this.code = httpStatus.value();
		this.description = httpStatus.getReasonPhrase();
		this.message = ex.getMessage();
		this.uri = uri;
		this.result = new ArrayList<Object>();
	}
	
	public ResponseVO(VReturn vReturn, HttpStatus httpStatus, String uri) {
		super();
		this.status = vReturn.getReturnValue();
		this.code = httpStatus.value();
		this.description = httpStatus.getReasonPhrase();
		this.message = VReturnMessage.returnMessage.get(vReturn.getReturnValue());
		this.uri = uri;
		this.result = new ArrayList<Object>();
	}
	
	public ResponseVO(int code, HttpStatus httpStatus, Object object) {
		super();
		this.status = httpStatus.value();
		this.code = code;
		this.description = httpStatus.getReasonPhrase();
		this.message = VReturnMessage.returnMessage.get(code);
		this.result = new ArrayList<Object>();
		this.result.add(object);
	}
	
	@SuppressWarnings("unchecked")
	public ResponseVO(int status, HttpStatus httpStatus, String uri, Object object) {
		super();
		this.status = status;
		this.code = httpStatus.value();
		this.description = httpStatus.getReasonPhrase();
		this.message = VReturnMessage.returnMessage.get(status);
		this.uri = uri;
		if(object != null) {
			if(object instanceof List) {
				this.result = (List<Object>) object;
			} else {
				this.result = new ArrayList<Object>();
				this.result.add(object);
			}
		}
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getUri() {
		return uri;
	}

	public void setUri(String uri) {
		this.uri = uri;
	}

	public List<Object> getResult() {
		return result;
	}

	public void setResult(List<Object> result) {
		this.result = result;
	}
	
	@Override
	public String toString() {
		return VGsonUtils.getJsonHtmlEscaped(this);
	}
}
