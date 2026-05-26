package com.adv.sailadv.dto;

import com.adv.sailadv.entity.AdvertisementStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdvertisementDto {
    private Long code;
    
    // במקום לשמור את כל אובייקט הלקוח והאזור (מה שייצור עומס), 
    // אנחנו מעבירים ב-DTO רק את תעודות הזהות (ID) שלהם!
    private Long customerId; 
    private Integer areaId;  
    
    private AdvertisementStatus status;
    private boolean isFixed;
    private int viewsCount;
    private double price;
    private boolean isPaid;
    private LocalDateTime creationDate;
    
    // שדות ספציפיים לסוגי הפרסומות:
    private String type; // נשמור כאן "TIME" או "VIEWS" כדי שהשרת ידע איזה סוג ליצור
    private Integer limitMinutes; // רלוונטי רק אם סוג הפרסומת הוא TIME
    private Integer targetViews;  // רלוונטי רק אם סוג הפרסומת היא VIEWS
}