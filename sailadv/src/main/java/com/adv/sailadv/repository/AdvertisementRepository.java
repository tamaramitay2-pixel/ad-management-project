package com.adv.sailadv.repository;

import com.adv.sailadv.entity.Advertisement;
import com.adv.sailadv.entity.AdvertisementStatus;
import com.adv.sailadv.entity.Area;
import com.adv.sailadv.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {

    // 1. שליפת כל הפרסומות של לקוח ספציפי (כדי להציג לו באזור האישי)
    List<Advertisement> findByCustomer(Customer customer);

    // 2. שליפת כל הפרסומות באזור מסוים (למשל TOP) שנמצאות בסטטוס מסוים (למשל ACTIVE)
    List<Advertisement> findByAreaAndStatus(Area area, AdvertisementStatus status);

    // 3. שליפת הפרסומת הראשונה בתור שממתינה באזור מסוים, מסודרת לפי תאריך הזמנה
    Optional<Advertisement> findFirstByAreaAndStatusOrderByCreationDateAsc(Area area, AdvertisementStatus status);
    // 4. (התוספת החדשה) שליפת כל הרשימה של פרסומות לאזור וסטטוס מסוים, מסודרות לפי זמן (עבור לוח המנהל המחולק)
    List<Advertisement> findByAreaAndStatusOrderByCreationDateAsc(Area area, AdvertisementStatus status);
}