package com.adv.sailadv.mapper;

import com.adv.sailadv.dto.AdvertisementDto;
import com.adv.sailadv.entity.Advertisement;
import com.adv.sailadv.entity.TimeAdvertisement;
import com.adv.sailadv.entity.ViewsAdvertisement;
import org.springframework.stereotype.Component;

@Component
public class AdvertisementMapper {

    /**
     * פונקציה שממירה Entity אמיתי ממסד הנתונים ל-DTO כדי לשלוח ללקוח
     */
    public AdvertisementDto toDto(Advertisement entity) {
        if (entity == null) {
            return null;
        }

        AdvertisementDto dto = new AdvertisementDto();
        dto.setCode(entity.getCode());
        dto.setCustomerId(entity.getCustomer().getId()); // לוקחים רק את ה-ID
        dto.setAreaId(entity.getArea().getId());         // לוקחים רק את ה-ID
        dto.setStatus(entity.getStatus());
        dto.setFixed(entity.isFixed());
        dto.setViewsCount(entity.getViewsCount());
        dto.setPrice(entity.getPrice());
        dto.setPaid(entity.isPaid());
        dto.setCreationDate(entity.getCreationDate());

        // בדיקה איזה סוג פרסומת זה כדי לשלוף את הנתון הייחודי
        if (entity instanceof TimeAdvertisement) {
            dto.setType("TIME");
            dto.setLimitMinutes(((TimeAdvertisement) entity).getLimitMinutes());
        } else if (entity instanceof ViewsAdvertisement) {
            dto.setType("VIEWS");
            dto.setTargetViews(((ViewsAdvertisement) entity).getTargetViews());
        }

        return dto;
    }

    /**
     * כאן נוכל להוסיף בעתיד גם את הפונקציה ההפוכה:
     * public Advertisement toEntity(AdvertisementDto dto) { ... }
     */
}