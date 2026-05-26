package com.adv.sailadv.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "advertisement")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
public abstract class Advertisement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long code; 

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer; 

    @ManyToOne
    @JoinColumn(name = "area_id", nullable = false)
    private Area area; 

    @Enumerated(EnumType.STRING)
    private AdvertisementStatus status; 

    private boolean isFixed; 

    private int viewsCount; 

    private int clicksCount; 

    private double price; 

    private boolean isPaid; 

    private LocalDateTime creationDate; 

    @ElementCollection
    private Set<String> viewedIps = new HashSet<>();
}