import {
  EDGE_DETECTION_WIDTH,
  SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS,
} from "../Constants/Constants";
import { IPoint, SHAPES, selectionIndicateCircle } from "../Utils/Common";
import { Shape } from "./Shape";

export class Line extends Shape {
  private end: IPoint;
  isSelected: boolean = false;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: number[];

  constructor(
    start: IPoint,
    end: IPoint,
    fillColor = "transparent",
    strokeColor = "black",
    strokeWidth = 2,
    strokeStyle: number[] = []
  ) {
    super(start, SHAPES.LINE);
    this.end = end;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.strokeStyle = strokeStyle;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.position.posX, this.position.posY);
    ctx.lineTo(this.end.posX, this.end.posY);
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.lineWidth = this.strokeWidth;
    ctx.setLineDash(this.strokeStyle);
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();
    ctx.restore();
    if (this.isSelected) {
      this.drawOutline(ctx);
    }
  }

  setIsSelected(value: boolean): void {
    this.isSelected = value;
  }

  drawOutline(ctx: CanvasRenderingContext2D): void {
    selectionIndicateCircle(
      ctx,
      this.position,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
    selectionIndicateCircle(
      ctx,
      this.end,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
  }

  isMouseWithinShape(point: IPoint): boolean {
    const distanceToPoint = this.distanceFromPointToLineSegment(
      point,
      this.position,
      this.end
    );
    const lineThickness = 5;
    return distanceToPoint <= lineThickness;
  }

  move(dx: number, dy: number): void {
    this.position.posX += dx;
    this.position.posY += dy;
    this.end.posX += dx;
    this.end.posY += dy;
  }

  private distanceFromPointToLineSegment(
    point: IPoint,
    start: IPoint,
    end: IPoint
  ): number {
    const A = point.posX - start.posX;
    const B = point.posY - start.posY;
    const C = end.posX - start.posX;
    const D = end.posY - start.posY;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = dot / len_sq;

    let xx, yy;

    if (param < 0 || (start.posX === end.posX && start.posY === end.posY)) {
      xx = start.posX;
      yy = start.posY;
    } else if (param > 1) {
      xx = end.posX;
      yy = end.posY;
    } else {
      xx = start.posX + param * C;
      yy = start.posY + param * D;
    }

    const dx = point.posX - xx;
    const dy = point.posY - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isMouseNearEdge(currentMousePosition: IPoint): string | boolean | null {
    if (
      Math.abs(currentMousePosition.posX - this.position.posX) <=
        EDGE_DETECTION_WIDTH ||
      Math.abs(currentMousePosition.posY - this.position.posY) <=
        EDGE_DETECTION_WIDTH
    )
      return "start";
    if (
      Math.abs(currentMousePosition.posX - this.end.posX) <=
        EDGE_DETECTION_WIDTH ||
      Math.abs(currentMousePosition.posY - this.end.posY) <=
        EDGE_DETECTION_WIDTH
    )
      return "end";
    return null;
  }

  reSize(...args: any[]): void {
    const [edge, currentMousePosition] = args;

    switch (edge) {
      case "start":
        const dx = currentMousePosition.posX - this.position.posX;
        const dy = currentMousePosition.posY - this.position.posY;
        this.position.posX += dx;
        this.position.posY += dy;
        break;
      case "end":
        const edx = currentMousePosition.posX - this.end.posX;
        const edy = currentMousePosition.posY - this.end.posY;
        this.end.posX += edx;
        this.end.posY += edy;
        break;
    }
  }

  static generateLine(
    start: IPoint,
    end: IPoint,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number,
    strokeStyle: number[]
  ) {
    return new Line(
      start,
      end,
      fillColor,
      strokeColor,
      strokeWidth,
      strokeStyle
    );
  }
}
