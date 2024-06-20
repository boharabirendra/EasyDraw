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

export function adjustToolSection() {
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
  ctx.strokeStyle = "#B3B1EC";
  ctx.stroke();
  ctx.restore();
}

export function getLeftTopCircleCenter(position: IPoint): IPoint {
  const posX = position.posX - 3;
  const posY = position.posY - 3;
  return { posX, posY };
}

export function getLeftBottomCircleCenter(
  position: IPoint,
  dimension: IDimension
): IPoint {
  const posX = position.posX - 3;
  const posY = position.posY + dimension.height + 3;
  return { posX, posY };
}

export function getRightTopCircleCenter(
  position: IPoint,
  dimension: IDimension
): IPoint {
  const posX = position.posX + dimension.width + 3;
  const posY = position.posY - 3;
  return { posX, posY };
}

export function getRightBottomCircleCenter(
  position: IPoint,
  dimension: IDimension
): IPoint {
  const posX = position.posX + dimension.width + 3;
  const posY = position.posY + dimension.height + 3;
  return { posX, posY };
}
