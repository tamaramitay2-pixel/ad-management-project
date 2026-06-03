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
     * פונקציה 2: הוספת פרסומת לפי זמן
     */
    public AdvertisementStatus addTimeAdvertisement(TimeAdvertisement ta) {
        ta.setCreationDate(LocalDateTime.now());
        ta.setPaid(true); 
        
        Area area = areaRepository.findById(ta.getArea().getId())
                .orElseThrow(() -> new RuntimeException("אזור לא נמצא"));
        ta.setPrice(ta.getLimitMinutes() * area.getPricePerMinute());
        
        // בדיקה: האם יש מישהו שממתין בתור לאזור הזה?
        boolean isQueueEmpty = advertisementRepository.findFirstByAreaAndStatusOrderByCreationDateAsc(area, AdvertisementStatus.PENDING).isEmpty();
        
        // הפרסומת תיכנס לאקטיב *רק* אם התור ריק, וגם ה"מוח" מאשר
        if (isQueueEmpty && canBecomeActive(ta, area)) {
            ta.setStatus(AdvertisementStatus.ACTIVE);
            if (ta.isFixed()) {
                area.setFree(false);
                areaRepository.save(area);
            }
        } else {
            ta.setStatus(AdvertisementStatus.PENDING); // יש תור? לך לסוף התור!
        }
        
        return advertisementRepository.save(ta).getStatus();
    }

    /**
     * פונקציה 3: הוספת פרסומת לפי צפיות
     */
    public AdvertisementStatus addViewsAdvertisement(ViewsAdvertisement va) {
        va.setCreationDate(LocalDateTime.now());
        va.setPaid(true);
        
        Area area = areaRepository.findById(va.getArea().getId())
                .orElseThrow(() -> new RuntimeException("אזור לא נמצא"));
        va.setPrice(va.getTargetViews() * area.getPricePerView());

        // בדיקה: האם יש מישהו שממתין בתור לאזור הזה?
        boolean isQueueEmpty = advertisementRepository.findFirstByAreaAndStatusOrderByCreationDateAsc(area, AdvertisementStatus.PENDING).isEmpty();

        // הפרסומת תיכנס לאקטיב *רק* אם התור ריק, וגם ה"מוח" מאשר
        if (isQueueEmpty && canBecomeActive(va, area)) {
            va.setStatus(AdvertisementStatus.ACTIVE);
            if (va.isFixed()) {
                area.setFree(false);
                areaRepository.save(area);
            }
        } else {
            va.setStatus(AdvertisementStatus.PENDING); // יש תור? לך לסוף התור!
        }
        
        return advertisementRepository.save(va).getStatus();
    }
   /**
     * פונקציה 4א: העלאת מונה צפיות לפרסומת ספציפית ומעבר בתור במידת הצורך
     */
    @Transactional
    public void addViewToAdvertisement(Long code, String userIp) {

        Advertisement adv = advertisementRepository.findById(code)
                .orElseThrow(() -> new RuntimeException("פרסומת לא נמצאה"));

        // הגנה חכמה: זריקת שגיאה ברורה אם מנסים לצפות בפרסומת לא פעילה
         if (adv.getStatus() != AdvertisementStatus.ACTIVE) {
            throw new RuntimeException("שגיאה: לא ניתן לרשום צפייה - הפרסומת אינה פעילה כרגע.");
            }

        // בדיקה אם ה-IP הזה חדש
        if (!adv.getViewedIps().contains(userIp)) {
            adv.setViewsCount(adv.getViewsCount() + 1);
            adv.getViewedIps().add(userIp);
            advertisementRepository.save(adv);

            // אם זו פרסומת צפיות, בודקים אם הגיעה ליעד
            if (adv instanceof ViewsAdvertisement) {
                ViewsAdvertisement viewsAdv = (ViewsAdvertisement) adv;
                if (viewsAdv.getViewsCount() >= viewsAdv.getTargetViews()) {
                    viewsAdv.setStatus(AdvertisementStatus.COMPLETED);
                    Area area = viewsAdv.getArea();
                    
                    if (viewsAdv.isFixed()) {
                        area.setFree(true);
                        areaRepository.save(area);
                    }
                    advertisementRepository.save(viewsAdv);
                    activateNextInQueue(area); // הקפצת הבא בתור
                }
            }
        }
    }

    /**
     * פונקציה 4ב: שליפת כל הפרסומות הפעילות נטו להצגה באתר (ללא ספירת צפיות)
     */
    public List<Advertisement> getOnlyActiveAdvertisements() {
        List<Advertisement> activeAds = new ArrayList<>();
        List<Area> allAreas = areaRepository.findAll();
        for (Area area : allAreas) {
            activeAds.addAll(advertisementRepository.findByAreaAndStatus(area, AdvertisementStatus.ACTIVE));
        }
        return activeAds;
    }
    /**
     * פונקציה 5: תזמון אוטומטי - רץ כל 60 שניות כדי לבדוק פרסומות זמן
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkAdvertisements() {
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
     * פונקציית עזר: "המוח" של הקרוסלה. בודקת אם פרסומת יכולה להיכנס עכשיו לאקטיב.
     */
    private boolean canBecomeActive(Advertisement newAd, Area area) {
        List<Advertisement> activeAds = advertisementRepository.findByAreaAndStatus(area, AdvertisementStatus.ACTIVE);
        
        // חוק 1: אם יש כרגע פרסומת "נועלת" באוויר - חסום לכולם
        boolean hasFixed = activeAds.stream().anyMatch(Advertisement::isFixed);
        if (hasFixed) {
            return false;
        }

        // חוק 2: פרסומת "נועלת" דורשת שהאזור יהיה ריק לחלוטין (0 פרסומות אחרות)
        if (newAd.isFixed()) {
            return activeAds.isEmpty();
        }

        // חוק 3: פרסומת רגילה יכולה להיכנס אם יש פחות מ-3 פרסומות כרגע בקרוסלה
        return activeAds.size() < 3;
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
    /**
     * פונקציה 7: שליפת כל הפרסומות של לקוח ספציפי לאזור האישי
     */
    public List<Advertisement> getCustomerAdvertisements(Long customerId) {
        Customer customer = new Customer();
        customer.setId(customerId);
        return advertisementRepository.findByCustomer(customer);
    }
    
    @Transactional
    public void addClickToAdvertisement(Long code) {
        Advertisement adv = advertisementRepository.findById(code)
                .orElseThrow(() -> new RuntimeException("פרסומת לא נמצאה"));
        adv.setClicksCount(adv.getClicksCount() + 1);
        advertisementRepository.save(adv);
    }
    
}