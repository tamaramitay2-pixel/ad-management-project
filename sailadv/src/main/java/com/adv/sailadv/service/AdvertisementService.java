package com.adv.sailadv.service;

import com.adv.sailadv.entity.*;
import com.adv.sailadv.repository.AdvertisementRepository;
import com.adv.sailadv.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdvertisementService {

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Autowired
    private AreaRepository areaRepository;

    // הגדרת הנתיב לשמירת התמונות - בדיוק לפי הנחיות הפרויקט
    private final String FOLDER_PATH = "C:\\myFolder\\";

    /**
     * פונקציה 1: שמירת קובץ התמונה בתיקייה בשרת
     */
       public void saveAdvertisementImage(MultipartFile file, Long code) {
        try {
            File directory = new File(FOLDER_PATH);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            // חילוץ סיומת הקובץ המקורית כדי לתמוך בסרטונים ו-GIF
            String originalFileName = file.getOriginalFilename();
            String extension = ".png"; // ברירת מחדל
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            // שמירת הקובץ עם הסיומת האמיתית שלו
            File dest = new File(FOLDER_PATH + "media_" + code + extension);
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("שגיאה בשמירת קובץ המדיה");
        }
    }

    /**
     * פונקציה 2: הוספת פרסומת לפי זמן ובדיקת כניסה לתור
     */
    public AdvertisementStatus addTimeAdvertisement(TimeAdvertisement ta) {
        ta.setCreationDate(LocalDateTime.now());
        ta.setPaid(true); // קביעה אוטומטית ששולם לאחר תהליך הרכישה
        
        Area area = areaRepository.findById(ta.getArea().getId())
                .orElseThrow(() -> new RuntimeException("אזור לא נמצא"));
              // חישוב המחיר לפרסומת זמן
        double calculatedPrice = ta.getLimitMinutes() * area.getPricePerMinute();
        ta.setPrice(calculatedPrice);
        
        // אם האזור פנוי - הפרסומת פעילה, אחרת - ממתינה בתור
        if (area.isFree()) {
            ta.setStatus(AdvertisementStatus.ACTIVE);
            if (ta.isFixed()) {
                area.setFree(false);
                areaRepository.save(area);
            }
        } else {
            ta.setStatus(AdvertisementStatus.PENDING);
        }
        
        return advertisementRepository.save(ta).getStatus();
    }

    /**
     * פונקציה 3: הוספת פרסומת לפי צפיות ובדיקת כניסה לתור
     */
    public AdvertisementStatus addViewsAdvertisement(ViewsAdvertisement va) {
        va.setCreationDate(LocalDateTime.now());
        va.setPaid(true);
        
        Area area = areaRepository.findById(va.getArea().getId())
                .orElseThrow(() -> new RuntimeException("אזור לא נמצא"));
          // חישוב המחיר לפרסומת צפיות
        double calculatedPrice = va.getTargetViews() * area.getPricePerView();
        va.setPrice(calculatedPrice);

        if (area.isFree()) {
            va.setStatus(AdvertisementStatus.ACTIVE);
            if (va.isFixed()) {
                area.setFree(false);
                areaRepository.save(area);
            }
        } else {
            va.setStatus(AdvertisementStatus.PENDING);
        }
        
        return advertisementRepository.save(va).getStatus();
    }

    /**
     * פונקציה 4: שליפת כל הפרסומות הפעילות (יופעל בכל רענון של האתר)
     * מעלה את מונה הצפיות ומפנה את האזור אם פרסומת צפיות הגיעה ליעד.
     */
    @Transactional
    public List<Advertisement> getActiveAdvertisementsAndUpdateViews(String userIp) {
        List<Advertisement> activeAds = new ArrayList<>();
        List<Area> allAreas = areaRepository.findAll();

        for (Area area : allAreas) {
            List<Advertisement> adsInArea = advertisementRepository.findByAreaAndStatus(area, AdvertisementStatus.ACTIVE);
            
            for (Advertisement adv : adsInArea) {
                
                // בדיקה: האם ה-IP הזה חדש עבור הפרסומת הזו?
                if (!adv.getViewedIps().contains(userIp)) {
                    
                    adv.setViewsCount(adv.getViewsCount() + 1);
                    adv.getViewedIps().add(userIp); // שמירת ה-IP כדי שלא נספור אותו שוב
                    
                    if (adv instanceof ViewsAdvertisement) {
                        ViewsAdvertisement viewsAdv = (ViewsAdvertisement) adv;
                        if (viewsAdv.getViewsCount() >= viewsAdv.getTargetViews()) {
                            viewsAdv.setStatus(AdvertisementStatus.COMPLETED); 
                            if (viewsAdv.isFixed()) {
                                area.setFree(true);
                            }
                            areaRepository.save(area);
                            advertisementRepository.save(viewsAdv);
                            
                            activateNextInQueue(area);
                            continue; 
                        }
                    }
                }
                activeAds.add(adv);
            }
        }
        advertisementRepository.saveAll(activeAds);
        return activeAds;
    }

    /**
     * פונקציה 5: תזמון אוטומטי - רץ כל 60 שניות כדי לבדוק פרסומות זמן
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkTimeAdvertisements() {
        List<Area> allAreas = areaRepository.findAll();
        for (Area area : allAreas) {
            List<Advertisement> activeAds = advertisementRepository.findByAreaAndStatus(area, AdvertisementStatus.ACTIVE);
            for (Advertisement adv : activeAds) {
                // בדיקה אם הפרסומת היא מבוססת זמן
                if (adv instanceof TimeAdvertisement) {
                    TimeAdvertisement timeAdv = (TimeAdvertisement) adv;
                    
                    // חישוב זמן התפוגה: מתי היא נוצרה + כמות הדקות שנקנתה
                    LocalDateTime endTime = timeAdv.getCreationDate().plusMinutes(timeAdv.getLimitMinutes());
                    
                    // אם הזמן עכשיו מאוחר מזמן התפוגה - הפרסומת יורדת
                    if (LocalDateTime.now().isAfter(endTime)) {
                        timeAdv.setStatus(AdvertisementStatus.COMPLETED);
                        if (timeAdv.isFixed()) {
                            area.setFree(true);
                            areaRepository.save(area);
                        }
                        advertisementRepository.save(timeAdv);
                        
                        // קידום הפרסומת הבאה בתור לאזור זה
                        activateNextInQueue(area);
                    }
                }
            }
        }
    }

    /**
     * פונקציה 6 (עזר פנימית): שולפת את הפרסומת הראשונה מהתור ומעבירה אותה לפעילה
     */
    private void activateNextInQueue(Area area) {
        Optional<Advertisement> nextAdv = advertisementRepository.findFirstByAreaAndStatusOrderByCreationDateAsc(area, AdvertisementStatus.PENDING);
        
        if (nextAdv.isPresent()) {
            Advertisement adv = nextAdv.get();
            adv.setStatus(AdvertisementStatus.ACTIVE);
            // מאפסים את תאריך היצירה לרגע שבו היא עלתה לאוויר, כדי שספירת הזמן תהיה מדויקת
            adv.setCreationDate(LocalDateTime.now());
            
            if (adv.isFixed()) {
                area.setFree(false);
                areaRepository.save(area);
            }
            advertisementRepository.save(adv);
        }
    }
}