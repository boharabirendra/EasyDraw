// src/shapes/Shape.ts
import { IPoint, SHAPES } from "../Utils/Common";

export abstract class Shape {
  private _position: IPoint;
  private _shapeType: SHAPES;
  private _isSelected: boolean = false;
  private _fillColor: string;
  private _strokeColor: string;
  private _strokeWidth: number;
  private _strokeStyle: number[]; // Add a semicolon here

  constructor(
    position: IPoint,
    shapeType: SHAPES,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number,
    strokeStyle: number[]
  ) {
    this._position = position;
    this._shapeType = shapeType;
    this._fillColor = fillColor;
    this._strokeColor = strokeColor;
    this._strokeWidth = strokeWidth;
    this._strokeStyle = strokeStyle;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract isMouseWithinShape(currentMousePosition: IPoint): boolean;
  abstract move(dx: number, dy: number): void;
  abstract isMouseNearEdge(
    currentMousePosition: IPoint
  ): string | null | boolean;
  abstract reSize(...args: any): void;
  abstract drawOutline(ctx: CanvasRenderingContext2D): void;


  public get strokeStyle(): number[] {
    return this._strokeStyle;
  }
  public set strokeStyle(value: number[]) {
    this._strokeStyle = value;
  }
  public get strokeWidth(): number {
    return this._strokeWidth;
  }
  public set strokeWidth(value: number) {
    this._strokeWidth = value;
  }
  public get strokeColor(): string {
    return this._strokeColor;
  }
  public set strokeColor(value: string) {
    this._strokeColor = value;
  }
  public get fillColor(): string {
    return this._fillColor;
  }
  public set fillColor(value: string) {
    this._fillColor = value;
  }
  public get shapeType(): SHAPES {
    return this._shapeType;
  }
  public set shapeType(value: SHAPES) {
    this._shapeType = value;
  }
  public get position(): IPoint {
    return this._position;
  }
  public set position(value: IPoint) {
    this._position = value;
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    this._isSelected = value;
  }
}
