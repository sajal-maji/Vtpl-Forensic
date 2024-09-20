package com.vtpl.forensic.controller.impl;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.vtpl.forensic.controller.UserController;
import com.vtpl.forensic.vo.ResponseVO;
import com.vtpl.forensic.vo.VReturnValues;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping(value = { "/REST/forensic/user" }, produces = { MediaType.APPLICATION_JSON_VALUE + "; charset=utf-8" })
public class UserControllerImpl implements UserController {

	private static final Logger LOGGER = LoggerFactory.getLogger(UserControllerImpl.class);

	
	
	@Value("${vtpl.web.server.context:/}")
	private String webApplicationContext;
	
	@Value("${redis.session.timeoutinminute:30}")
	private Integer defaultSessionTimeoutMinutes;
	
	@Value("${vtpl.live.streamer:tranzsilica}")
	private String streamer;

	@Override
	@RequestMapping(value = { "/login" }, method = { RequestMethod.POST },
	consumes = { MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<ResponseVO> loginUser(@CookieValue(value="JSESSIONID", required=false) String jsessionId,
			HttpServletRequest request, HttpServletResponse response,
			@RequestBody HashMap<String, String> requestParams)
			throws IOException, NoSuchAlgorithmException {
		
		LOGGER.debug("Loging in to Central! parameters: {}", requestParams);
		
		String username = requestParams.get("username");
		String password = requestParams.get("password");
		
		ResponseVO restResponse = new ResponseVO(VReturnValues.SUCCESSFULLY_RETRIVED, HttpStatus.OK,
				request.getRequestURI(), null);
		
		return new ResponseEntity<ResponseVO>(restResponse, HttpStatus.OK);
	}

	
}
