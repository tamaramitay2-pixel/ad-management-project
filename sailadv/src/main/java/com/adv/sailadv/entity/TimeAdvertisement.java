package com.adv.sailadv.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "time_advertisement")
@Data
@EqualsAndHashCode(callSuper = true)
public class TimeAdvertisement extends Advertisement {

    private int limitMinutes; 
}