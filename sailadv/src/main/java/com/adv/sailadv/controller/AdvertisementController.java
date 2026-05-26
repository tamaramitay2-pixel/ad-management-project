package com.adv.sailadv.controller;

import com.adv.sailadv.dto.AdvertisementDto;
import com.adv.sailadv.entity.Advertisement;
import com.adv.sailadv.entity.AdvertisementStatus;
import com.adv.sailadv.entity.TimeAdvertisement;
import com.adv.sailadv.entity.ViewsAdvertisement;
import com.adv.sailadv.mapper.AdvertisementMapper;
import com.adv.sailadv.service.AdvertisementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
     * 1. נתיב לקבלת כל הפרסומות הפעילות לאתר (ומניעת ספירת צפיות כפולה)
     * הכתובת: GET http://localhost:8080/api/advertisements/active
     */
    @GetMapping("/active")
    public List<AdvertisementDto> getActiveAds(
            @RequestHeader(value = "X-User-IP", defaultValue = "127.0.0.1") String userIp) {
        
        // א. שליפת הישויות הפעילות מה-Service והעברת ה-IP שנוצר ב-Postman או בדפדפן
        List<Advertisement> activeAds = advertisementService.getActiveAdvertisementsAndUpdateViews(userIp);
        
        // ב. מיפוי והמרת רשימת הישויות לרשימה של DTOs מאובטחים ונקיים לטובת צד הלקוח   ``
        return activeAds.stream()
                .map(advertisementMapper::toDto)
                .collect(Collectors.toList());
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