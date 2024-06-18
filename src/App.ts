import { Canvas } from './Components/Canvas';

export class App {
    private canvas: Canvas;

    constructor() {
        this.canvas = new Canvas();
    }

    init() {
        this.canvas.init();
    }
}
