package com.adv.sailadv.controller;

import com.adv.sailadv.entity.Area;
import com.adv.sailadv.service.AreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/areas")
@CrossOrigin
public class AreaController {

    @Autowired
    private AreaService areaService;

    private final String ADMIN_SECRET_KEY = "admin1234";

    // נתיב פתוח ללקוחות: קבלת רשימת כל האזורים (GET)
    @GetMapping
    public List<Area> getAllAreas() {
        return areaService.getAllAreas();
    }

    // נתיב מוגן למנהל בלבד: הוספת אזור חדש (POST)
    @PostMapping
    public ResponseEntity<?> addArea(
            @RequestBody Area area, 
            @RequestHeader(value = "Admin-Key", required = false) String providedKey) {
        
        if (ADMIN_SECRET_KEY.equals(providedKey)) {
            Area savedArea = areaService.addArea(area);
            return ResponseEntity.ok(savedArea);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("שגיאת הרשאות: פעולה זו מותרת למנהל המערכת בלבד!");
        }
    }

    /**
     * מוגן למנהל: לוח בקרה המחולק לכרטיסיית פעילים וכרטיסיית ממתינים
     * GET http://localhost:8080/api/areas/admin/dashboard
     */
    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard(
            @RequestHeader(value = "Admin-Key", required = false) String providedKey) {
        
        if (ADMIN_SECRET_KEY.equals(providedKey)) {
            com.adv.sailadv.dto.AdminTabsDto dashboardData = areaService.getAdminDashboardData();
            return ResponseEntity.ok(dashboardData);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("שגיאת הרשאות: פעולה זו מותרת למנהל בלבד!");
        }
    }
}