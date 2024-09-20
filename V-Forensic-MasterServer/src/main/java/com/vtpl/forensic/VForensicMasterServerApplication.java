package com.vtpl.forensic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {GsonAutoConfiguration.class, SecurityAutoConfiguration.class})
@EnableScheduling
public class VForensicMasterServerApplication {

	public static void main(String[] args) {
		
		SpringApplication springApplication = new SpringApplication(VForensicMasterServerApplication.class);
		springApplication.run(args);
	}

}
