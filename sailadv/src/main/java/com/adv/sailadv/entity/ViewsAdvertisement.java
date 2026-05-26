package com.adv.sailadv.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "views_advertisement")
@Data
@EqualsAndHashCode(callSuper = true)
public class ViewsAdvertisement extends Advertisement {

    private int targetViews; 
}
