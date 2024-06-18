import { IPoint } from "../Utils/Common";
import { Shape } from "./Shape";

export class Line extends Shape {
  private end: IPoint;

  constructor(start: IPoint, end: IPoint) {
    super(start);
    this.end = end;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.position.posX, this.position.posY);
    ctx.lineTo(this.end.posX, this.end.posY);
    ctx.stroke();
  }

  isMouseWithinShape(point: IPoint): boolean {
    const distanceToPoint = this.distanceFromPointToLineSegment(point, this.position, this.end);
    const lineThickness = 5;
    return distanceToPoint <= lineThickness;
  }

  move(dx: number, dy: number): void {
    this.position.posX += dx;
    this.position.posY += dy;
    this.end.posX += dx;
    this.end.posY += dy;
  }

  private distanceFromPointToLineSegment(point: IPoint, start: IPoint, end: IPoint): number {
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
}
