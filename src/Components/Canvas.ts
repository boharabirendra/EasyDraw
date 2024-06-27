import {
  BOLD_LINE_WIDTH,
  DASH_GAP,
  DASH_WIDTH,
  DIMENSION,
  DOT_GAP,
  DOT_WIDTH,
  DRAW_BOLD_LINE_WIDTH,
  DRAW_EXTRA_BOLD_LINE_WIDTH,
  DRAW_THIN_LINE_WIDTH,
  EXTRA_BOLD_LINE_WIDTH,
  THIN_LINE_WIDTH,
} from "../Constants/Constants";
import { ArrowLine } from "../Shapes/ArrowLine";
import { Circle } from "../Shapes/Circle";
import { Eraser } from "../Shapes/Eraser";
import { Line } from "../Shapes/Line";
import { Rectangle } from "../Shapes/Rectangle";
import { Shape } from "../Shapes/Shape";
import { Text } from "../Shapes/Text";
import { Draw } from "../Shapes/Draw";
import { IPoint, SHAPES, adjustToolSection } from "../Utils/Common";
import {
  body,
  highlightCurrentSelectedTool,
} from "../Utils/HighlightSelectedTool";
import {
  activateRedoUndoBtn,
  handleShortcut,
  toggleSidePanel,
} from "./UIHandler";
import { getDataFromLocalStorage } from "../Storage/Storage";
import { exportSelectedShape } from "./ExportHandler";
import {
  bringForward,
  bringToFront,
  sendBackward,
  sendToBack,
} from "./LayerHandler";
import { deleteSelectedShapes } from "./DeleteShapeHandler";
import {
  clearRedoStack,
  redo,
  saveCurrentState,
  undo,
} from "./UndoRedoHandler";
export class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[] = [];
  private isDrawing: boolean = false;
  private isDragging: boolean = false;
  private currentEraser?: Eraser;
  private isErasing: boolean = false;
  private dragStartPosition: IPoint = { posX: 0, posY: 0 };
  private startPosition: IPoint = { posX: 0, posY: 0 };
  private startResizingPosition: IPoint = { posX: 0, posY: 0 };
  private currentShape: SHAPES = SHAPES.CURSOR;
  private selectedShape: Shape | undefined = undefined;
  private resizeEdge: string | null | boolean = null;
  private isResizing: boolean = false;
  private redoStack: Shape[][] = [];
  private undoStack: Shape[][] = [];
  private currentDrawing?: Draw;
  private selectedShapeForAltering: { index: number; shape: Shape }[] = [];
  private selectedShapeIndex: number | null = null;
  private toBeChangeShape: Shape | undefined = undefined;
  private drawingColor: string = "black";
  private drawingWidth: number = THIN_LINE_WIDTH;
  private previouslySelectedShape: Shape | null = null;
  private isShowingSidePanel: boolean = false;
  private selectedStrokeColor: string = "";
  private selectedBackgroundColor: string = "transparent";
  private selectedWidthSize: number = THIN_LINE_WIDTH;
  private selectedWidthStyle: number[] = [];
  private startingShape: Shape | null = null;
  private endingShape: Shape | null = null;
  private isConnectionStart: boolean = false;
  private isConnectionEnd: boolean = false;
  private resizeConnectionShape: Shape | null = null;

  constructor() {
    this.canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    this.canvas.width = DIMENSION.CANVAS_WIDTH;
    this.canvas.height = DIMENSION.CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.font = '24px "Virgil", sans-serif';
    this.init();
  }

  init() {
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("dblclick", this.onDoubleClick.bind(this));
    document.addEventListener("click", () => {
      activateRedoUndoBtn(this.undoStack, this.redoStack);
    });

    this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));

    document.addEventListener("click", this.sidePanelHandler.bind(this));
    document.addEventListener("keydown", this.keyboardActions.bind(this));

    /* Function call */
    highlightCurrentSelectedTool();
    this.toolBarManager();
    this.changeShapeColor();
    this.changeWidthOfShape();
    this.changeWidthStyleOfShape();
    this.layerManager();
    this.undoRedoManager();
    this.handleActions();
    this.fetchSavedShapes();
    handleShortcut();
  }

  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.onMouseDown(event);
    if (this.currentShape !== SHAPES.DRAW) {
      this.isShowingSidePanel = false;
    }
  }
  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    this.onMouseMove(event);
  }
  onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.onMouseUp(event);
  }

  /**Edit text */
  onDoubleClick(event: any) {
    this.editText(event);
  }

  onMouseMove(event: any) {
    const position = this.getMousePosition(event);
    this.changeMouseShape(position, event);
    this.shapeConnectorIndicator(event);
    this.eraseShape(event);
    if (this.isDragging && this.selectedShape) {
      this.startDragging(position, this.selectedShape);
    } else if (this.isErasing) {
      if (this.currentEraser) {
        this.currentEraser.addPoint(position);
        this.currentEraser.draw(this.ctx);
      }
    } else if (this.isDrawing) {
      this.displayAllShapes();
      this.shapeConnectorIndicator(event);
      this.startDrawing(position);
    } else if (this.isResizing) {
      this.startResizing(position);
    }
  }

  onMouseUp(event: any) {
    const position = this.getMousePosition(event);
    if (this.isDragging) {
      this.isDragging = false;
      this.selectedShape = undefined;
    } else if (this.isDrawing) {
      this.endDrawing(position);
    } else if (this.isResizing) {
      this.endResizing();
    }
  }

  onMouseDown(event: any) {
    this.selectedShapeForAltering = [];
    this.selectedShape = undefined;
    if (this.currentShape !== SHAPES.DRAW) {
      this.isShowingSidePanel = false;
    }
    const currentMousePosition = this.getMousePosition(event);
    this.deselectPreviouslySelectedShape(this.previouslySelectedShape);
    this.displayAllShapes();

    /**Connection starting shape */
    if (this.currentShape === SHAPES.ARROW) {
      this.locateSelectedShape(currentMousePosition);
      if (this.selectedShape) {
        this.startingShape = this.selectedShape;
        this.isConnectionStart = true;
      }
    }

    if (this.currentShape === SHAPES.CURSOR) {
      for (let i = this.shapes.length - 1; i >= 0; i--) {
        if (this.shapes[i].isMouseWithinShape(currentMousePosition)) {
          this.selectedShape = this.shapes[i];
          this.selectedShapeIndex = i;
          break;
        }
      }

      this.toBeChangeShape = this.selectedShape;
      if (this.selectedShape) {
        this.previouslySelectedShape = this.selectedShape;
        this.selectedShape.isSelected = true;
        this.selectedShape.drawOutline(this.ctx);
        this.isShowingSidePanel = true;
        this.selectedShapeForAltering.push({
          index: this.selectedShapeIndex!,
          shape: this.selectedShape,
        });

        this.resizeEdge =
          this.selectedShape.isMouseNearEdge(currentMousePosition);
        if (this.resizeEdge) {
          this.isResizing = true;
          this.startResizingPosition = currentMousePosition;
        } else {
          this.isDragging = true;
          this.dragStartPosition = currentMousePosition;
        }
      }
    } else if (this.currentShape === SHAPES.DRAW) {
      this.isDrawing = true;
      this.currentDrawing = new Draw(
        currentMousePosition,
        this.drawingColor,
        this.drawingWidth
      );
    } else if (this.currentShape === SHAPES.ERASER) {
      this.isErasing = true;
      this.currentEraser = new Eraser(currentMousePosition);
    } else {
      this.isDrawing = true;
      this.startPosition = currentMousePosition;
    }
  }

  private endResizing() {
    /**Ending connection shape */
    if (
      this.selectedShape?.shapeType === SHAPES.ARROW &&
      this.resizeConnectionShape
    ) {
      this.shapeConnectorIndicator(event);
      if (this.resizeEdge === "start") {
        this.selectedShape.position = this.resizeConnectionShape.position;
      }

      if (this.resizeEdge === "end") {
        if (this.selectedShape instanceof ArrowLine) {
          this.selectedShape.end = this.resizeConnectionShape.position;
        }
      }
    }

    this.isResizing = false;
    this.resizeEdge = null;
  }

  private endDrawing(position: IPoint) {
    this.isDrawing = false;
    /**Ending connection shape */
    if (this.currentShape === SHAPES.ARROW) {
      this.locateSelectedShape(position);
      if (this.selectedShape) {
        this.endingShape = this.selectedShape;
        this.isConnectionEnd = true;
      }
    }

    switch (this.currentShape) {
      case SHAPES.RECTANGLE:
        this.drawRectangle(position, true);
        adjustToolSection();
        this.currentShape = SHAPES.CURSOR;
        break;
      case SHAPES.CIRCLE:
        this.drawCircle(position, true);
        adjustToolSection();
        this.currentShape = SHAPES.CURSOR;
        break;
      case SHAPES.LINE:
        this.drawLine(position, true);
        adjustToolSection();
        this.currentShape = SHAPES.CURSOR;
        break;
      case SHAPES.ARROW:
        this.drawArrowLine(position, true);
        adjustToolSection();
        this.currentShape = SHAPES.CURSOR;
        break;
      case SHAPES.DRAW:
        if (this.currentDrawing) {
          this.shapes.push(this.currentDrawing);
        }
        break;
      case SHAPES.TEXT:
        this.drawText(position);
        adjustToolSection();
        this.currentShape = SHAPES.CURSOR;
        break;
    }
  }

  private startResizing(position: IPoint) {
    const dx = position.posX - this.startResizingPosition.posX;
    const dy = position.posY - this.startResizingPosition.posY;
    this.displayAllShapes();
    this.shapeConnectorIndicator(event);
    switch (this.selectedShape?.shapeType) {
      case SHAPES.RECTANGLE:
        this.selectedShape?.reSize(this.resizeEdge, dx, dy);
        break;
      case SHAPES.CIRCLE:
        this.selectedShape?.reSize(position);
        break;
      case SHAPES.LINE:
        this.selectedShape?.reSize(this.resizeEdge, position);
        break;
      case SHAPES.ARROW:
        this.selectedShape?.reSize(this.resizeEdge, position);
        break;
    }
    this.startResizingPosition = position;
  }

  private startDrawing(position: IPoint) {
    switch (this.currentShape) {
      case SHAPES.RECTANGLE:
        this.drawRectangle(position);
        break;
      case SHAPES.CIRCLE:
        this.drawCircle(position);
        break;
      case SHAPES.LINE:
        this.drawLine(position);
        break;
      case SHAPES.ARROW:
        this.drawArrowLine(position);
        break;
      case SHAPES.DRAW:
        if (this.currentDrawing) {
          this.currentDrawing.strokeWidth = this.selectedWidthSize;
          this.currentDrawing.addPoint(position);
          this.currentDrawing.draw(this.ctx);
        }
        break;
      case SHAPES.TEXT:
        this.drawText(position);
        break;
    }
  }

  private startDragging(position: IPoint, selectedShape: Shape) {
    const dx = position.posX - this.dragStartPosition.posX;
    const dy = position.posY - this.dragStartPosition.posY;
    selectedShape.move(dx, dy);
    this.dragStartPosition = position;
    this.displayAllShapes();
  }
  /**Edit text */
  editText(event: any): void {
    const currentMousePosition = this.getMousePosition(event);
    this.locateSelectedShape(currentMousePosition);
    if (this.selectedShape instanceof Text) {
      const prevText = this.selectedShape.text;
      const rect: { x: number; y: number; width: number; height: number } =
        this.selectedShape.boundingBox;
      this.ctx.clearRect(
        rect.x - 5,
        rect.y + 18,
        rect.width + 10,
        rect.height + 14
      );
      this.shapes.splice(this.selectedShapeIndex!, 1);
      this.selectedShape.setIsSelected(false);
      this.displayAllShapes();
      this.drawText({ posX: rect.x, posY: rect.y + 16 }, prevText);
    } else {
      this.drawText(currentMousePosition);
    }
  }

  /**Locating selected shape */
  locateSelectedShape(currentMousePosition: IPoint) {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.shapes[i].isMouseWithinShape(currentMousePosition)) {
        this.selectedShape = this.shapes[i];
        this.resizeConnectionShape = this.shapes[i];
        this.selectedShapeIndex = i;
        break;
      }
    }
  }

  /*Change mouse shape */
  private changeMouseShape(position: IPoint, event: any) {
    if (this.currentShape === SHAPES.CURSOR) {
      const tempSelectedShape = this.shapes.find((shape) => {
        if (shape) {
          return shape.isMouseWithinShape(position);
        }
      });
      if (tempSelectedShape) {
        body.style.cursor = "move";
        const currentMousePosition = this.getMousePosition(event);
        const edge = tempSelectedShape.isMouseNearEdge(currentMousePosition);
        if (edge && this.toBeChangeShape) {
          let cursorStyle: string = "";
          if (edge === "left" || edge === "right") {
            cursorStyle = "ew-resize";
          } else if (edge === "top" || edge === "bottom") {
            cursorStyle = "ns-resize";
          } else if (edge === "top-left" || edge === "bottom-right") {
            cursorStyle = "nwse-resize";
          } else if (edge === "top-right" || edge === "bottom-left") {
            cursorStyle = "nesw-resize";
          } else if (edge === "start" || edge === "end") {
            cursorStyle = "pointer";
          }
          body.style.cursor = cursorStyle;
        }
      } else {
        body.style.cursor = "default";
      }
    }
  }

  /**Connector arrow line */
  private shapeConnectorIndicator(event: any) {
    const currentMousePosition = this.getMousePosition(event);
    if (
      this.currentShape === SHAPES.ARROW ||
      this.selectedShape?.shapeType === SHAPES.ARROW
    ) {
      const tempSelectedShape = this.shapes.find((shape) => {
        if (shape) {
          return shape.isMouseWithinShape(currentMousePosition);
        }
      });
      if (tempSelectedShape) {
        this.resizeConnectionShape = tempSelectedShape;
        tempSelectedShape.isSelected = true;
        tempSelectedShape.drawOutline(this.ctx);
      }
      // tempSelectedShape?.isSelected = false;
      if (!tempSelectedShape) {
        this.displayAllShapes();
      }
    }
  }

  private eraseShape(event: any) {
    const currentMousePosition = this.getMousePosition(event);
    let shapeIndex: number | null = null;
    if (this.currentShape === SHAPES.ERASER) {
      const tempSelectedShape = this.shapes.find((shape, index) => {
        if (shape) {
          shapeIndex = index;
          return shape.isMouseWithinShape(currentMousePosition);
        }
      });
      if (tempSelectedShape) {
        tempSelectedShape.isSelected = true;
        tempSelectedShape.drawOutline(this.ctx);
        if (shapeIndex !== null) {
          this.selectedShapeForAltering.push({
            index: shapeIndex,
            shape: tempSelectedShape,
          });
        }
        deleteSelectedShapes(
          this.shapes,
          this.selectedShapeForAltering[0].index
        );
      }
    }
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private getMousePosition(event: any): IPoint {
    let currentPosition: IPoint = {
      posX: 0,
      posY: 0,
    };
    if ("touches" in event) {
      currentPosition = {
        posX: event.changedTouches[0].clientX,
        posY: event.changedTouches[0].clientY,
      };
    } else {
      currentPosition = {
        posX: event.offsetX,
        posY: event.offsetY,
      };
    }
    return currentPosition;
  }

  /* Tool bar selection */
  private toolBarManager() {
    document
      .querySelector("#toolbar_container")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const shape = button.getAttribute("data-shape");
          if (shape) {
            this.currentShape = SHAPES[shape as keyof typeof SHAPES];
            if (this.currentShape === SHAPES.DRAW) {
              this.handleDrawThickness();
            } else {
              this.handleShapeThickness();
            }
            this.isErasing = shape === "ERASER";
            if (this.currentShape !== SHAPES.CURSOR) {
              this.isShowingSidePanel = true;
            } else {
              this.isShowingSidePanel = false;
            }
          }
          if (button.id === "clearBtn") {
            this.shapes = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.currentShape = SHAPES.CURSOR;
            this.isErasing = false;
            adjustToolSection();
            localStorage.removeItem("savedData");
          }
        });
      });
  }

  /* Draw rectangle */
  private drawRectangle(
    currentMousePosition: IPoint,
    finalize: boolean = false
  ) {
    const width = currentMousePosition.posX - this.startPosition.posX;
    const height = currentMousePosition.posY - this.startPosition.posY;
    const rectangle = finalize
      ? Rectangle.generateShape(
          this.startPosition,
          currentMousePosition,
          this.selectedBackgroundColor,
          this.selectedStrokeColor,
          this.selectedWidthSize,
          this.selectedWidthStyle
        )
      : new Rectangle(
          this.startPosition,
          { width, height },
          this.selectedBackgroundColor,
          this.selectedStrokeColor,
          this.selectedWidthSize,
          this.selectedWidthStyle
        );
    rectangle.draw(this.ctx);
    if (finalize) {
      saveCurrentState(this.shapes, this.undoStack);
      this.shapes.push(rectangle);
      clearRedoStack(this.redoStack);
    }
  }

  /*Draw circle*/
  private drawCircle(center: IPoint, finalize: boolean = false) {
    const radius = Math.sqrt(
      Math.pow(center.posX - this.startPosition.posX, 2) +
        Math.pow(center.posY - this.startPosition.posY, 2)
    );

    const adjustedCenter: IPoint = {
      posX: this.startPosition.posX,
      posY: this.startPosition.posY + radius / 2,
    };

    const circle = finalize
      ? Circle.generateCircle(
          adjustedCenter,
          radius,
          this.selectedBackgroundColor,
          this.selectedStrokeColor,
          this.selectedWidthSize,
          this.selectedWidthStyle
        )
      : new Circle(
          adjustedCenter,
          radius,
          this.selectedBackgroundColor,
          this.selectedStrokeColor,
          this.selectedWidthSize,
          this.selectedWidthStyle
        );

    if (finalize) {
      saveCurrentState(this.shapes, this.undoStack);
      this.shapes.push(circle);
      clearRedoStack(this.redoStack);
    }
  }

  /* Draw line */
  private drawLine(end: IPoint, finalize: boolean = false) {
    if (!finalize) {
      const line = new Line(
        this.startPosition,
        end,
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      line.draw(this.ctx);
    } else {
      const newLine = Line.generateLine(
        this.startPosition,
        {
          posX: end.posX,
          posY: end.posY,
        },
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      saveCurrentState(this.shapes, this.undoStack);
      this.shapes.push(newLine);
      newLine.draw(this.ctx);
      clearRedoStack(this.redoStack);
    }
  }

  /* Draw arrow line */
  private drawArrowLine(end: IPoint, finalize: boolean = false) {
    if (!finalize) {
      const arrowLine = new ArrowLine(
        this.startPosition,
        end,
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      arrowLine.draw(this.ctx);
    } else {
      if (
        this.isConnectionStart &&
        this.isConnectionEnd &&
        this.startingShape &&
        this.endingShape
      ) {
        const newArrowLine = ArrowLine.generateArrowLine(
          this.startingShape.position,
          this.endingShape.position,
          this.selectedBackgroundColor,
          this.selectedStrokeColor,
          this.selectedWidthSize,
          this.selectedWidthStyle
        );
        saveCurrentState(this.shapes, this.undoStack);
        this.shapes.push(newArrowLine);
        clearRedoStack(this.redoStack);
      } else {
        const newArrowLine = ArrowLine.generateArrowLine(
          { posX: this.startPosition.posX, posY: this.startPosition.posY },
          { posX: end.posX, posY: end.posY },
          this.selectedBackgroundColor,
          this.selectedStrokeColor,
          this.selectedWidthSize,
          this.selectedWidthStyle
        );
        saveCurrentState(this.shapes, this.undoStack);
        this.shapes.push(newArrowLine);
        newArrowLine.draw(this.ctx);
        clearRedoStack(this.redoStack);
      }
      this.isConnectionStart = false;
      this.isConnectionEnd = false;
    }
  }

  /* Draw text */
  private drawText(position: IPoint, prevText?: string) {
    const input = document.createElement("textArea") as HTMLTextAreaElement;
    input.style.position = "absolute";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.resize = "none";
    input.style.fontFamily = "Virgil, sans-serif";
    input.style.fontSize = "24px";
    input.style.color = this.selectedStrokeColor;
    input.style.left = `${position.posX}px`;
    input.style.top = `${position.posY}px`;
    if (prevText) {
      input.value = prevText;
    }
    document.body.appendChild(input);
    input.focus();

    const onInputBlur = () => {
      const text = input.value;
      if (text) {
        if (this.ctx) {
          this.ctx.font = '24px "Virgil", sans-serif';
          const textWidth = this.ctx.measureText(text).width;
          const textHeight = parseInt(this.ctx.font);
          const boundingBox = {
            x: position.posX,
            y: position.posY - textHeight,
            width: textWidth,
            height: textHeight,
          };

          const newText = new Text(
            position,
            text,
            boundingBox,
            this.selectedStrokeColor
          );
          saveCurrentState(this.shapes, this.undoStack);
          this.shapes.push(newText);
          clearRedoStack(this.redoStack);
          this.displayAllShapes();
        }
      }
      document.body.removeChild(input);
    };
    input.addEventListener("input", resizeInput);
    resizeInput();
    input.addEventListener("blur", onInputBlur);
    function resizeInput() {
      input.style.width = `${(input.value.length + 1) * 14}px`;
    }
  }

  /*Keyboard actions*/
  private keyboardActions(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "z") {
      event.preventDefault();
      undo(this.shapes, this.undoStack, this.redoStack);
      this.displayAllShapes();
    }
    if (event.ctrlKey && event.key === "y") {
      event.preventDefault();
      redo(this.shapes, this.undoStack, this.redoStack);
      this.displayAllShapes();
    }
    if (event.key === "Delete") {
      saveCurrentState(this.shapes, this.undoStack);
      deleteSelectedShapes(this.shapes, this.selectedShapeForAltering[0].index);
      this.displayAllShapes();
    }
  }

  /*Display all shapes*/
  private displayAllShapes() {
    this.clearCanvas();
    this.ctx.save();
    this.shapes.forEach((shape) => {
      if (shape) {
        shape.draw(this.ctx);
      }
    });
    this.ctx.restore();
  }

  /*Change shapes colors*/
  private updateSelectedShapeFillColor(color: string) {
    if (this.toBeChangeShape) {
      this.toBeChangeShape.fillColor = color;
      this.displayAllShapes();
    }
  }

  private updateSelectedShapeStrokeColor(color: string) {
    if (this.toBeChangeShape) {
      this.toBeChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
  }

  private changeShapeColor() {
    const backgroundColorContainer = document.querySelector(
      ".background__color__container"
    ) as HTMLDivElement;
    const colorsBtn: NodeListOf<HTMLButtonElement> =
      backgroundColorContainer.querySelectorAll("button");
    colorsBtn.forEach((colorBtn) => {
      colorBtn.addEventListener("click", () => {
        backgroundColorContainer
          .querySelectorAll("button")
          .forEach((button) => (button.style.border = "none"));
        colorBtn.style.border = "1px solid gray";
        const color = colorBtn.getAttribute("data-color")!;
        this.selectedBackgroundColor = color;
        this.updateSelectedShapeFillColor(color);
      });
    });

    const strokeColorContainer = document.querySelector(
      ".stroke__color__container"
    ) as HTMLDivElement;
    const strokeBtn: NodeListOf<HTMLButtonElement> =
      strokeColorContainer.querySelectorAll("button");
    strokeBtn.forEach((strokeBtn) => {
      strokeBtn.addEventListener("click", () => {
        strokeColorContainer
          .querySelectorAll("button")
          .forEach((button) => (button.style.border = "none"));
        strokeBtn.style.border = "1px solid black";
        const color = strokeBtn.getAttribute("data-color")!;
        this.selectedStrokeColor = color;
        if (this.currentShape === SHAPES.DRAW) {
          this.drawingColor = color;
        }
        this.updateSelectedShapeStrokeColor(color);
      });
    });
  }

  /**Shape width change */
  private changeWidthOfShape() {
    const strokeWidthContainer = document.querySelector(
      ".stroke__width"
    ) as HTMLDivElement;
    strokeWidthContainer.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const widthType = button.id;
        strokeWidthContainer
          .querySelectorAll("button")
          .forEach((button) => (button.style.border = "none"));
        button.style.border = "1px solid black";
        this.selectedWidthSize = this.widthSelector(widthType);
        if (this.currentShape === SHAPES.DRAW) {
          this.drawingWidth = this.widthSelector(widthType);
        }
        this.updateSelectedShapeWidth(widthType);
      });
    });
  }

  private updateSelectedShapeWidth(widthType: string) {
    if (this.toBeChangeShape) {
      this.toBeChangeShape.strokeWidth = this.widthSelector(widthType);
      this.displayAllShapes();
    }
  }

  private widthSelector(widthType: string): number {
    if (widthType === "thin") {
      return THIN_LINE_WIDTH;
    } else if (widthType === "bold") {
      if (this.currentShape === SHAPES.DRAW) return DRAW_BOLD_LINE_WIDTH;
      return BOLD_LINE_WIDTH;
    } else {
      if (this.currentShape === SHAPES.DRAW) return DRAW_EXTRA_BOLD_LINE_WIDTH;
      return EXTRA_BOLD_LINE_WIDTH;
    }
  }

  /**Width style change */
  private changeWidthStyleOfShape() {
    const strokeWidthStyleContainer = document.querySelector(
      ".stroke__style"
    ) as HTMLDivElement;
    strokeWidthStyleContainer.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        strokeWidthStyleContainer
          .querySelectorAll("button")
          .forEach((button) => (button.style.border = "none"));
        const widthStyle = button.id;
        button.style.border = "1px solid black";
        this.selectedWidthStyle = this.widthStyleSelector(widthStyle);
        this.updateSelectedShapeWidthStyle(widthStyle);
      });
    });
  }

  /**Handle draw thickness */
  private handleDrawThickness() {
    if (this.selectedWidthSize === 1) {
      this.selectedWidthSize = DRAW_THIN_LINE_WIDTH;
    } else if (this.selectedWidthSize === 3) {
      this.selectedWidthSize = DRAW_BOLD_LINE_WIDTH;
    } else if (this.selectedWidthSize === 5) {
      this.selectedWidthSize = DRAW_EXTRA_BOLD_LINE_WIDTH;
    }
  }

  /**Handle other shape thickness */
  private handleShapeThickness() {
    if (this.selectedWidthSize === DRAW_THIN_LINE_WIDTH) {
      this.selectedWidthSize = THIN_LINE_WIDTH;
    } else if (this.selectedWidthSize === BOLD_LINE_WIDTH) {
      this.selectedWidthSize = DRAW_BOLD_LINE_WIDTH;
    } else if (this.selectedWidthSize === DRAW_EXTRA_BOLD_LINE_WIDTH) {
      this.selectedWidthSize = EXTRA_BOLD_LINE_WIDTH;
    }
  }

  private updateSelectedShapeWidthStyle(widthStyle: string) {
    if (this.toBeChangeShape) {
      this.toBeChangeShape.strokeStyle = this.widthStyleSelector(widthStyle);
      this.displayAllShapes();
    }
  }

  private widthStyleSelector(widthStyle: string): number[] {
    if (widthStyle === "solid") {
      return [];
    } else if (widthStyle === "dashed") {
      return [DASH_WIDTH, DASH_GAP];
    } else {
      return [DOT_WIDTH, DOT_GAP];
    }
  }

  /** Layer manager */
  private layerManager() {
    document
      .querySelector(".layer__container")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          button.style.backgroundColor = "rgb(216, 216, 216)";
          button.style.transition = "0.3s";
          setTimeout(() => {
            button.style.backgroundColor = "#EFEFEF";
          }, 700);
          if (button.id === "toBack") {
            sendToBack(this.shapes, this.selectedShapeForAltering[0].index);
          } else if (button.id === "backward") {
            sendBackward(this.shapes, this.selectedShapeForAltering[0].index);
          } else if (button.id === "bringForward") {
            bringForward(this.shapes, this.selectedShapeForAltering[0].index);
          } else if (button.id === "toFront") {
            bringToFront(this.shapes, this.selectedShapeForAltering[0].index);
          }
          this.displayAllShapes();
        });
      });
  }

  private deselectPreviouslySelectedShape(
    previouslySelectedShape: Shape | null
  ) {
    if (previouslySelectedShape) {
      previouslySelectedShape.isSelected = false;
    }
  }

  private sidePanelHandler() {
    toggleSidePanel(this.isShowingSidePanel);
  }

  /**Export selected shape */
  private exportHandler() {
    if (this.toBeChangeShape) {
      exportSelectedShape(this.ctx, this.toBeChangeShape);
    }
  }

  /*Undo & Redo */
  private undoRedoManager() {
    document
      .querySelector("#redo_undo")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          button.style.border = "1px solid blue";
          button.style.transition = "0.3s";
          if (button.id === "undoBtn") {
            button.style.borderTopLeftRadius = "5px";
            button.style.borderBottomLeftRadius = "5px";
            undo(this.shapes, this.undoStack, this.redoStack);
            this.displayAllShapes();
          } else if (button.id === "redoBtn") {
            button.style.borderTopRightRadius = "5px";
            button.style.borderBottomRightRadius = "5px";
            redo(this.shapes, this.undoStack, this.redoStack);
            this.displayAllShapes();
          }
          setTimeout(() => {
            button.style.border = "none";
          }, 700);
        });
      });
  }

  /**Action section */
  private handleActions() {
    document
      .querySelector(".actions")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          button.style.backgroundColor = "rgb(216, 216, 216)";
          button.style.transition = "0.3s";
          setTimeout(() => {
            button.style.backgroundColor = "#EFEFEF";
          }, 700);
          const id = button.id;
          if (id === "deleteBtn") {
            deleteSelectedShapes(
              this.shapes,
              this.selectedShapeForAltering[0].index
            );
            this.displayAllShapes();
          } else if (id === "exportBtn") {
            this.exportHandler();
          } else if (id === "saveBtn") {
            this.saveToLocalStorage();
          }
        });
      });
  }

  /**Local storage */
  private saveToLocalStorage() {
    localStorage.setItem("savedData", JSON.stringify(this.shapes));
  }

  private fetchSavedShapes() {
    const savedShapes: Shape[] | null = getDataFromLocalStorage();
    if (savedShapes) {
      this.shapes = savedShapes;
      this.displayAllShapes();
    }
  }
}
