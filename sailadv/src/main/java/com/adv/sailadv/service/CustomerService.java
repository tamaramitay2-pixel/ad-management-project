package com.adv.sailadv.service;

import com.adv.sailadv.entity.Customer;
import com.adv.sailadv.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    // פונקציה להתחברות מפרסם קיים
    public Customer login(String email, String password) {
        // ה-Service מבקש מה-Repository לחפש את הלקוח במסד הנתונים
        return customerRepository.findByEmailAndPassword(email, password);
    }
      // פונקציה להוספת לקוח חדש למערכת
    public Customer addCustomer(Customer customer) {
        return customerRepository.save(customer);
    }
}