import { body, cursorBtn, removeBg } from "./HighlightSelectedTool"

export interface IPoint {
    posX : number,
    posY : number,
}

export interface IDimension{
    width: number,
    height: number
}


export enum SHAPES{
    RECTANGLE,
    CIRCLE,
    LINE,
    ARROW,
    TEXT,
    ERASER,
    NONE,
    CURSOR,
}

export function adjustToolSection(){
    removeBg();
    cursorBtn.style.backgroundColor = "#E0DFFF";
    body.style.cursor = "default";
}