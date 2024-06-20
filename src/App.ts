import { Canvas } from './Components/Canvas';

export class App {
    //@ts-ignore
    private canvas: Canvas;
    constructor() {
        this.canvas = new Canvas();
    }
}
