import { Component } from '@angular/core';
import { COLORS, DEFAULT_COLOR, DEFAULT_WIDTH, DRAW_VALUES } from '@app/constants/drawing';
import { CanvasAction } from '@app/enum/canvas-action';
import { DrawService } from '@app/services/draw-service/draw.service';

@Component({
    selector: 'app-canvas-top-buttons',
    templateUrl: './canvas-top-buttons.component.html',
    styleUrls: ['./canvas-top-buttons.component.scss'],
})
export class CanvasTopButtonsComponent {
    selectedCanvasAction: CanvasAction;
    isColorSelected: boolean;
    canvasAction: typeof CanvasAction;
    pencilDiameter: number;
    eraserLength: number;
    drawValues: number[];
    drawColor: string;
    colors: string[];

    constructor(private readonly drawService: DrawService) {
        this.pencilDiameter = DEFAULT_WIDTH;
        this.eraserLength = DEFAULT_WIDTH;
        this.canvasAction = CanvasAction;
        this.selectedCanvasAction = CanvasAction.Pencil;
        this.drawValues = DRAW_VALUES;
        this.colors = COLORS;
        this.setCanvasAction(this.selectedCanvasAction);
        this.setDrawingColor(DEFAULT_COLOR);
        this.setPencilWidth(this.pencilDiameter);
        this.setEraserLength(this.eraserLength);
    }

    setDrawingColor(color: string): void {
        this.drawColor = color;
        this.isColorSelected = false;
        this.drawService.setDrawingColor(this.drawColor);
    }

    setCanvasAction(canvasAction: CanvasAction): void {
        this.drawService.setCanvasAction(canvasAction);
    }

    setPencilWidth(width: number): void {
        this.drawService.setPencilWidth(width);
    }

    setEraserLength(width: number): void {
        this.drawService.setEraserLength(width);
    }
}
