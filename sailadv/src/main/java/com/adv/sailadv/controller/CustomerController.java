package com.adv.sailadv.controller;

import com.adv.sailadv.dto.CustomerDto;
import com.adv.sailadv.entity.Customer;
import com.adv.sailadv.mapper.CustomerMapper;
import com.adv.sailadv.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
 import org.springframework.http.ResponseEntity; 

// ...

    /**
     * נתיב להתחברות לקוח
     */
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
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        
        // 1. נבדוק אם הסיסמה נכונה (מחזיר true או false)
        boolean isAuthenticated = customerService.login(email, password);
        
        if (isAuthenticated) {
            // אם הצליח, נשלוף את הלקוח המלא ונחזיר DTO
            Customer customer = customerService.findByEmail(email); // וודאי שיש לך פונקציה כזו ב-Service
            return ResponseEntity.ok(customerMapper.toDto(customer));
        } else {
            // אם נכשל, נחזיר שגיאה (סטטוס 401 Unauthorized)
            return ResponseEntity.status(401).body("שגיאה: אימייל או סיסמה לא נכונים.");
        }
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