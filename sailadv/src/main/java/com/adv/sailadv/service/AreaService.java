package com.adv.sailadv.service;

import com.adv.sailadv.entity.Area;
import com.adv.sailadv.repository.AreaRepository;
import com.adv.sailadv.repository.AdvertisementRepository; // תוספת: גישה לפרסומות
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList; // תוספת: יצירת רשימות

@Service
public class AreaService {

    @Autowired
    private AreaRepository areaRepository;
    // תוספת 1: משיכת הנתונים מטבלת הפרסומות
    @Autowired
    private AdvertisementRepository advertisementRepository;

    public Area addArea(Area area) {
        return areaRepository.save(area);
    }

    public List<Area> getAllAreas() {
        return areaRepository.findAll();
    }
    // תוספת 2: הפונקציה שבונה את לוח המנהל המחולק לכרטיסיות
    public com.adv.sailadv.dto.AdminTabsDto getAdminDashboardData() {
        List<com.adv.sailadv.dto.AreaBoardDto> activeBoard = new ArrayList<>();
        List<com.adv.sailadv.dto.AreaBoardDto> pendingBoard = new ArrayList<>();
        
        // מביאים את כל האזורים הקיימים
        List<Area> allAreas = areaRepository.findAll();
        
        // עוברים אזור-אזור ומחלצים ממנו את התורים
        for (Area area : allAreas) {
            // שולפים רק פרסומות פעילות לאזור הזה ומכניסים ל"לוח הפעילים"
            List<com.adv.sailadv.entity.Advertisement> activeAds = 
                advertisementRepository.findByAreaAndStatusOrderByCreationDateAsc(
                    area, com.adv.sailadv.entity.AdvertisementStatus.ACTIVE);
            activeBoard.add(new com.adv.sailadv.dto.AreaBoardDto(area, activeAds));
            
            // שולפים רק פרסומות ממתינות לאזור הזה ומכניסים ל"לוח הממתינים"
            List<com.adv.sailadv.entity.Advertisement> pendingAds = 
                advertisementRepository.findByAreaAndStatusOrderByCreationDateAsc(
                    area, com.adv.sailadv.entity.AdvertisementStatus.PENDING);
            pendingBoard.add(new com.adv.sailadv.dto.AreaBoardDto(area, pendingAds));
        }
        
        // מחזירים את האובייקט הגדול שמכיל בתוכו את שתי הרשימות
        return new com.adv.sailadv.dto.AdminTabsDto(activeBoard, pendingBoard);
    }
    
}
