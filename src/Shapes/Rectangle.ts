import {
  EDGE_DETECTION_WIDTH,
  SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS,
} from "../Constants/Constants";
import {
  IPoint,
  IDimension,
  SHAPES,
  selectionIndicateCircle,
  getLeftTopCircleCenter,
  getLeftBottomCircleCenter,
  getRightTopCircleCenter,
  getRightBottomCircleCenter,
  selectionIndicateRectangle,
} from "../Utils/Common";
import { Shape } from "./Shape";

export class Rectangle extends Shape {
  dimension: IDimension;
  isSelected: boolean = false;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: number[];
 

  constructor(
    position: IPoint,
    dimension: IDimension,
    fillColor = "transparent",
    strokeColor = "black",
    strokeWidth = 2,
    strokeStyle: number[] = []
  ) {
    super(position, SHAPES.RECTANGLE);
    this.dimension = dimension;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.strokeStyle = strokeStyle;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      this.position.posX,
      this.position.posY,
      this.dimension.width,
      this.dimension.height
    );
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.lineWidth = this.strokeWidth;
    ctx.setLineDash(this.strokeStyle);
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();
    if (this.isSelected) {
      this.drawOutline(ctx);
    }
    ctx.restore();
  }

  drawOutline(ctx: CanvasRenderingContext2D): void {
    selectionIndicateRectangle(ctx, this.position, this.dimension);
    const leftTopCircleCenter: IPoint = getLeftTopCircleCenter(this.position);
    const leftBottomCircle: IPoint = getLeftBottomCircleCenter(
      this.position,
      this.dimension
    );
    const rightTopCircle: IPoint = getRightTopCircleCenter(
      this.position,
      this.dimension
    );
    const rightBottomCircle: IPoint = getRightBottomCircleCenter(
      this.position,
      this.dimension
    );
    selectionIndicateCircle(
      ctx,
      leftTopCircleCenter,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
    selectionIndicateCircle(
      ctx,
      leftBottomCircle,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
    selectionIndicateCircle(
      ctx,
      rightTopCircle,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
    selectionIndicateCircle(
      ctx,
      rightBottomCircle,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
  }

  setIsSelected(value: boolean): void {
    this.isSelected = value;
  }

  isMouseWithinShape(point: IPoint): boolean {
    return (
      point.posX >= this.position.posX &&
      point.posX <= this.position.posX + this.dimension.width &&
      point.posY >= this.position.posY &&
      point.posY <= this.position.posY + this.dimension.height
    );
  }

  isMouseNearEdge(currentMousePosition: IPoint): string | null {
    const xNearLeft =
      Math.abs(currentMousePosition.posX - this.position.posX) <=
      EDGE_DETECTION_WIDTH;
    const xNearRight =
      Math.abs(
        currentMousePosition.posX - (this.position.posX + this.dimension.width)
      ) <= EDGE_DETECTION_WIDTH;
    const yNearTop =
      Math.abs(currentMousePosition.posY - this.position.posY) <=
      EDGE_DETECTION_WIDTH;
    const yNearBottom =
      Math.abs(
        currentMousePosition.posY - (this.position.posY + this.dimension.height)
      ) <= EDGE_DETECTION_WIDTH;

    if (xNearLeft && yNearTop) return "top-left";
    if (xNearRight && yNearTop) return "top-right";
    if (xNearLeft && yNearBottom) return "bottom-left";
    if (xNearRight && yNearBottom) return "bottom-right";
    if (xNearLeft) return "left";
    if (xNearRight) return "right";
    if (yNearTop) return "top";
    if (yNearBottom) return "bottom";

    return null;
  }

  reSize(...args: any) {
    const [edge, dx, dy] = args;
    const minWidth = 10;
    const minHeight = 10;

    switch (edge) {
      case "left":
        if (this.dimension.width - dx >= minWidth) {
          this.position.posX += dx;
          this.dimension.width -= dx;
        } else {
          const adjustment = this.dimension.width - minWidth;
          this.position.posX += adjustment;
          this.dimension.width = minWidth;
        }
        break;

      case "right":
        if (this.dimension.width + dx >= minWidth) {
          this.dimension.width += dx;
        } else {
          this.dimension.width = minWidth;
        }
        break;

      case "top":
        if (this.dimension.height - dy >= minHeight) {
          this.position.posY += dy;
          this.dimension.height -= dy;
        } else {
          const adjustment = this.dimension.height - minHeight;
          this.position.posY += adjustment;
          this.dimension.height = minHeight;
        }
        break;

      case "bottom":
        if (this.dimension.height + dy >= minHeight) {
          this.dimension.height += dy;
        } else {
          this.dimension.height = minHeight;
        }
        break;

      case "top-left":
        if (this.dimension.width - dx >= minWidth) {
          this.position.posX += dx;
          this.dimension.width -= dx;
        } else {
          const adjustmentX = this.dimension.width - minWidth;
          this.position.posX += adjustmentX;
          this.dimension.width = minWidth;
        }
        if (this.dimension.height - dy >= minHeight) {
          this.position.posY += dy;
          this.dimension.height -= dy;
        } else {
          const adjustmentY = this.dimension.height - minHeight;
          this.position.posY += adjustmentY;
          this.dimension.height = minHeight;
        }
        break;

      case "top-right":
        if (this.dimension.width + dx >= minWidth) {
          this.dimension.width += dx;
        } else {
          this.dimension.width = minWidth;
        }
        if (this.dimension.height - dy >= minHeight) {
          this.position.posY += dy;
          this.dimension.height -= dy;
        } else {
          const adjustmentY = this.dimension.height - minHeight;
          this.position.posY += adjustmentY;
          this.dimension.height = minHeight;
        }
        break;

      case "bottom-left":
        if (this.dimension.width - dx >= minWidth) {
          this.position.posX += dx;
          this.dimension.width -= dx;
        } else {
          const adjustmentX = this.dimension.width - minWidth;
          this.position.posX += adjustmentX;
          this.dimension.width = minWidth;
        }
        if (this.dimension.height + dy >= minHeight) {
          this.dimension.height += dy;
        } else {
          this.dimension.height = minHeight;
        }
        break;

      case "bottom-right":
        if (this.dimension.width + dx >= minWidth) {
          this.dimension.width += dx;
        } else {
          this.dimension.width = minWidth;
        }
        if (this.dimension.height + dy >= minHeight) {
          this.dimension.height += dy;
        } else {
          this.dimension.height = minHeight;
        }
        break;
    }
  }

  static generateShape(
    start: IPoint,
    end: IPoint,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number,
    strokeStyle: number[]
  ): Rectangle {
    const width = end.posX - start.posX;
    const height = end.posY - start.posY;
    return new Rectangle(
      start,
      { width, height },
      fillColor,
      strokeColor,
      strokeWidth,
      strokeStyle
    );
  }

  move(dx: number, dy: number): void {
    this.position.posX += dx;
    this.position.posY += dy;
  }
}
