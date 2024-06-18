import { IPoint } from "../Utils/Common";
import { Shape } from "./Shape";

export class ArrowLine extends Shape {
  private end: IPoint;

  constructor(start: IPoint, end: IPoint) {
    super(start);
    this.end = end;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const headLength = 10;
    const dx = this.end.posX - this.position.posX;
    const dy = this.end.posY - this.position.posY;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(this.position.posX, this.position.posY);
    ctx.lineTo(this.end.posX, this.end.posY);
    ctx.lineTo(
      this.end.posX - headLength * Math.cos(angle - Math.PI / 6),
      this.end.posY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(this.end.posX, this.end.posY);
    ctx.lineTo(
      this.end.posX - headLength * Math.cos(angle + Math.PI / 6),
      this.end.posY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }

  isMouseWithinShape(point: IPoint): boolean {
    const distanceToPoint = this.distanceFromPointToLineSegment(point, this.position, this.end);
    const lineThickness = 5; 
    const headLength = 10;

    if (distanceToPoint <= lineThickness) {
      return true;
    }

    const dx = this.end.posX - this.position.posX;
    const dy = this.end.posY - this.position.posY;
    const angle = Math.atan2(dy, dx);

    const arrowTip1 = {
      posX: this.end.posX - headLength * Math.cos(angle - Math.PI / 6),
      posY: this.end.posY - headLength * Math.sin(angle - Math.PI / 6)
    };
    const arrowTip2 = {
      posX: this.end.posX - headLength * Math.cos(angle + Math.PI / 6),
      posY: this.end.posY - headLength * Math.sin(angle + Math.PI / 6)
    };

    const distanceToArrowTip1 = this.distanceFromPointToLineSegment(point, this.end, arrowTip1);
    const distanceToArrowTip2 = this.distanceFromPointToLineSegment(point, this.end, arrowTip2);

    return distanceToArrowTip1 <= lineThickness || distanceToArrowTip2 <= lineThickness;
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
