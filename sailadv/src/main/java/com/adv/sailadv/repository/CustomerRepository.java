package com.adv.sailadv.repository;

import com.adv.sailadv.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // Spring יזהה את השם הזה וייצר את השאילתה למסד הנתונים בעצמו!
    Optional<Customer> findByEmail(String email);
  
}
