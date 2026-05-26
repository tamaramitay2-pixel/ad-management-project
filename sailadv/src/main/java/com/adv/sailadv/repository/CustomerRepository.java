package com.adv.sailadv.repository;

import com.adv.sailadv.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // Spring יתרגם את השורה הזו לשאילתת SQL המחפשת לקוח לפי אימייל וסיסמה
    Customer findByEmailAndPassword(String email, String password);
}