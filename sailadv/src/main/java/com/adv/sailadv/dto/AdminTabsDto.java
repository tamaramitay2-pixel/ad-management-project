package com.adv.sailadv.dto;

import java.util.List;

public class AdminTabsDto {
    private List<AreaBoardDto> activeBoard;
    private List<AreaBoardDto> pendingBoard;

    public AdminTabsDto(List<AreaBoardDto> activeBoard, List<AreaBoardDto> pendingBoard) {
        this.activeBoard = activeBoard;
        this.pendingBoard = pendingBoard;
    }

    public List<AreaBoardDto> getActiveBoard() { return activeBoard; }
    public void setActiveBoard(List<AreaBoardDto> activeBoard) { this.activeBoard = activeBoard; }
    public List<AreaBoardDto> getPendingBoard() { return pendingBoard; }
    public void setPendingBoard(List<AreaBoardDto> pendingBoard) { this.pendingBoard = pendingBoard; }
}