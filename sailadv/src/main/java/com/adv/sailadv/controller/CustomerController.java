package com.adv.sailadv.controller;

import com.adv.sailadv.dto.CustomerDto;
import com.adv.sailadv.entity.Customer;
import com.adv.sailadv.mapper.CustomerMapper;
import com.adv.sailadv.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin // שורה קריטית! מאפשרת לאתר ב-React/Angular לתקשר עם השרת שלנו
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerMapper customerMapper;

    /**
     * נתיב להתחברות לקוח
     * הכתובת תהיה: POST http://localhost:8080/api/customers/login
     */
    @PostMapping("/login")
    public CustomerDto login(@RequestParam String email, @RequestParam String password) {
        
        // 1. ה-Controller מעביר את הבקשה ל-Service (המוח) כדי שיבדוק אם הלקוח קיים
        Customer customer = customerService.login(email, password);
        
        // 2. משתמשים ב-Mapper כדי להמיר את הלקוח האמיתי ל-DTO נקי ובטוח (בלי הסיסמה!)
        return customerMapper.toDto(customer); 
    }
    /**
     * נתיב להרשמת/הוספת לקוח חדש
     * POST http://localhost:8080/api/customers/register
     */
    @PostMapping("/register")
    public CustomerDto registerCustomer(@RequestBody Customer customer) {
        Customer savedCustomer = customerService.addCustomer(customer);
        return customerMapper.toDto(savedCustomer);
    }
}