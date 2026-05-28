package com.adv.sailadv.controller;

import com.adv.sailadv.dto.AdvertisementDto;
import com.adv.sailadv.entity.Advertisement;
import com.adv.sailadv.entity.AdvertisementStatus;
import com.adv.sailadv.entity.TimeAdvertisement;
import com.adv.sailadv.entity.ViewsAdvertisement;
import com.adv.sailadv.mapper.AdvertisementMapper;
import com.adv.sailadv.service.AdvertisementService;
import jakarta.servlet.http.HttpServletRequest; // ייבוא כלי הרשת
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/advertisements")
@CrossOrigin // מאפשר לצד הלקוח (React/Angular) לתקשר עם השרת ללא חסימות אבטחה
public class AdvertisementController {

    @Autowired
    private AdvertisementService advertisementService;

    @Autowired
    private AdvertisementMapper advertisementMapper;

   

/**
     * 1. נתיב לקבלת כל הפרסומות הפעילות לאתר (נטו להצגה)
     * הכתובת:GET http://localhost:8080/api/advertisements/active
     */
    @GetMapping("/active")
    public List<AdvertisementDto> getActiveAds() {
        List<Advertisement> activeAds = advertisementService.getOnlyActiveAdvertisements();
        return activeAds.stream()
                .map(advertisementMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 1.5. נתיב חדש: קליטת דיווח צפייה מהאתר והעלאת המונה לפרסומת ספציפית
      * הכתובת:GET http://localhost:8080/api/advertisements/view/{code}
     */
   /**
     * הכתובת: GET http://localhost:8080/api/advertisements/view/{code}
     */
    
    @GetMapping("/view/{code}")
    public ResponseEntity<String> addViewToAd(
        @PathVariable Long code, 
        HttpServletRequest request) { // הפרמטר עובר כאן בתוך הסוגריים
    
    // שימוש בפרמטר המקומי - זה תקין לגמרי
    String userIp = request.getHeader("X-Forwarded-For");
    
    if (userIp == null || userIp.isEmpty()) {
        userIp = request.getRemoteAddr();
    }

    advertisementService.addViewToAdvertisement(code, userIp);
    
    return ResponseEntity.ok("View registered for ad: " + code);
}
    /**
     * 2. נתיב להוספת פרסומת מבוססת זמן + העלאת קובץ הבאנר
     * הכתובת: POST http://localhost:8080/api/advertisements/time
     */
    @PostMapping("/time")
    public AdvertisementStatus addTimeAdvertisement(
            @RequestPart("ad") TimeAdvertisement ta, 
            @RequestPart("image") MultipartFile file) {
        
        // א. שמירת נתוני הפרסומת במסד הנתונים וקביעת הסטטוס (ACTIVE או PENDING לתור)
        AdvertisementStatus status = advertisementService.addTimeAdvertisement(ta);
        
        // ב. שמירה פיזית של קובץ התמונה בתיקיית השרת תחת הקוד שנוצר
        advertisementService.saveAdvertisementImage(file, ta.getCode());
        
        return status;
    }

    /**
     * 3. נתיב להוספת פרסומת מבוססת צפיות + העלאת קובץ הבאנר
     * הכתובת: POST http://localhost:8080/api/advertisements/views
     */
    @PostMapping("/views")
    public AdvertisementStatus addViewsAdvertisement(
            @RequestPart("ad") ViewsAdvertisement va, 
            @RequestPart("image") MultipartFile file) {
        
        // א. שמירת נתוני הפרסומת ובדיקת זמינות האזור
        AdvertisementStatus status = advertisementService.addViewsAdvertisement(va);
        
        // ב. שמירת קובץ התמונה בכונן השרת
        advertisementService.saveAdvertisementImage(file, va.getCode());
        
        return status;
    }
}