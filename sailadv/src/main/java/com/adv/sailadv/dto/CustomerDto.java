package com.adv.sailadv.dto;

import lombok.Data;

@Data
public class CustomerDto {
    private Long id;
    private String email;
}
    // שימי לב: אנחנו בדרך כלל לא שולחים את הסיסמה חזרה לצד הלקוח מטעמי אבטחה!
    // ה-DTO מאפשר לנו להעביר רק את המזהה והאימייל של הלקוח.
