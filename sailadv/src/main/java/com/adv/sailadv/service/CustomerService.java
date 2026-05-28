package com.adv.sailadv.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.adv.sailadv.entity.Customer;
import com.adv.sailadv.repository.CustomerRepository;

import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private CustomerRepository customerRepository;

    private PasswordEncoder passwordEncoder;
    // בנאי אחד שמחבר את הכל
    
    public CustomerService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

   
    // הפונקציה הזו היא ה"גשר" שהיה חסר לך
    public Customer findByEmail(String email) {
        // כאן אנחנו משתמשים ב-Repository שהגדרת
        return customerRepository.findByEmail(email).orElse(null);
    }

    // פונקציה להתחברות מפרסם קיים
    public boolean login(String email, String rawPassword) {
    // 1. מחפשים את הלקוח לפי המייל בלבד
    Customer customer = customerRepository.findByEmail(email).orElse(null);
    
    // 2. אם הלקוח קיים, משווים את הסיסמה שהוקלדה (raw) לג'יבריש השמור (encoded)
    if (customer != null) {
        return passwordEncoder.matches(rawPassword, customer.getPassword());
    }
    return false;
}
    public Customer addCustomer(Customer customer) {
    // מצפינים את הסיסמה לפני השמירה
    String hashedPassword = passwordEncoder.encode(customer.getPassword());
    customer.setPassword(hashedPassword);
    return customerRepository.save(customer);
}
}