package com.adv.sailadv.mapper;

import com.adv.sailadv.dto.CustomerDto;
import com.adv.sailadv.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    /**
     * הפיכת ישות (Entity) ממסד הנתונים ל-DTO (העלמת הסיסמה)
     */
    public CustomerDto toDto(Customer entity) {
        if (entity == null) {
            return null;
        }

        CustomerDto dto = new CustomerDto();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setName(entity.getName()); // <--- השורה החדשה שהוספנו!
        
        // שימי לב: אנחנו בכוונה לא מעתיקים לכאן את הסיסמה מטעמי אבטחת מידע!

        return dto;
    }

    /**
     * הפיכת DTO שמגיע מהלקוח לישות (Entity) כדי לשמור במסד הנתונים
     */
    public Customer toEntity(CustomerDto dto, String password) {
        if (dto == null) {
            return null;
        }

        Customer entity = new Customer();
        entity.setId(dto.getId());
        entity.setEmail(dto.getEmail());
        entity.setName(dto.getName()); // <--- השורה החדשה שהוספנו!
        
        // את הסיסמה אנחנו מקבלים בנפרד (או שולפים מהבקשה המקורית) ומכניסים לישות
        entity.setPassword(password); 

        return entity;
    }
}