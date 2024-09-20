package com.vtpl.forensic.controller;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;

import org.springframework.http.ResponseEntity;

import com.vtpl.forensic.vo.ResponseVO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface UserController {
	
	
	ResponseEntity<ResponseVO> loginUser(String jsessionId, HttpServletRequest request, HttpServletResponse response, HashMap<String, String> requestParams) throws IOException, NoSuchAlgorithmException;
	
	

}
