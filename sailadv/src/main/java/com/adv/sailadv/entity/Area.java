package com.adv.sailadv.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "area")
@Data
public class Area {

    @Id
    private Integer id; 

    @Column(name = "is_free")
    private boolean isFree; 

    @Column(nullable = false)
    private String name; 

    private double pricePerMinute; 

    private double pricePerView; 
}