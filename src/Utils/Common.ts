import { body, cursorBtn, removeBg } from "./HighlightSelectedTool";

export interface IPoint {
  posX: number;
  posY: number;
}

export interface IDimension {
  width: number;
  height: number;
}

export enum SHAPES {
  RECTANGLE,
  CIRCLE,
  LINE,
  ARROW,
  TEXT,
  ERASER,
  NONE,
  CURSOR,
  DRAW,
}

function adjustToolSection() {
  removeBg();
  cursorBtn.style.backgroundColor = "#E0DFFF";
  body.style.cursor = "default";
}

export function selectionIndicateCircle(
  ctx: CanvasRenderingContext2D,
  center: IPoint,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(center.posX, center.posY, radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#B3B1EC";
  ctx.stroke();
  ctx.restore();
}

export function getLeftTopCircleCenter(position: IPoint): IPoint {
  const posX = position.posX ;
  const posY = position.posY;
  return { posX, posY };
}

export function getLeftBottomCircleCenter(
  position: IPoint,
  dimension: IDimension
): IPoint {
  const posX = position.posX;
  const posY = position.posY + dimension.height;
  return { posX, posY };
}

export function getRightTopCircleCenter(
  position: IPoint,
  dimension: IDimension
): IPoint {
  const posX = position.posX + dimension.width;
  const posY = position.posY;
  return { posX, posY };
}

export function getRightBottomCircleCenter(
  position: IPoint,
  dimension: IDimension
): IPoint {
  const posX = position.posX + dimension.width;
  const posY = position.posY + dimension.height;
  return { posX, posY };
}

export function selectionIndicateRectangle(
  ctx: CanvasRenderingContext2D,
  position: IPoint,
  dimension: IDimension,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(position.posX, position.posY, dimension.width, dimension.height); 
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 0.1;
  ctx.fillStyle = "transparent";
  ctx.fill(); 
  ctx.stroke(); 
  ctx.restore();
}

