package com.adv.sailadv.dto;

import com.adv.sailadv.entity.Area;
import com.adv.sailadv.entity.Advertisement;
import java.util.List;

public class AreaBoardDto {
    private Area area;
    private List<Advertisement> ads;

    public AreaBoardDto(Area area, List<Advertisement> ads) {
        this.area = area;
        this.ads = ads;
    }

    public Area getArea() { return area; }
    public void setArea(Area area) { this.area = area; }
    public List<Advertisement> getAds() { return ads; }
    public void setAds(List<Advertisement> ads) { this.ads = ads; }
}