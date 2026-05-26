package com.adv.sailadv.repository;

import com.adv.sailadv.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AreaRepository extends JpaRepository<Area, Integer> {
    
    // אין צורך לכתוב כאן כלום כרגע!
    // אנחנו מקבלים בחינם פונקציות כמו findById או findAll מ-Spring
}