package com.adv.sailadv;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // מדליק את תמיכת השרת בפעולות מתוזמנות ברקע
public class SailadvApplication {
	
	public static void main(String[] args) {
		SpringApplication.run(SailadvApplication.class, args);
	}

}
