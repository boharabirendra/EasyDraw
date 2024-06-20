// src/shapes/Shape.ts
import { IPoint, SHAPES } from '../Utils/Common';

export abstract class Shape {
    protected position: IPoint;
    public shapeType: SHAPES;
    constructor(position: IPoint, shapeType: SHAPES) {
        this.position = position;
        this.shapeType = shapeType;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract isMouseWithinShape(currentMousePosition: IPoint): boolean;
    abstract move(dx: number, dy: number): void
    abstract isMouseNearEdge(currentMousePosition: IPoint): string | null | boolean;
    abstract reSize(...args:any): void;
}
