import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasMiddleButtonsComponent } from '@app/components/canvas-middle-buttons/canvas-middle-buttons.component';
import { CanvasTopButtonsComponent } from '@app/components/canvas-top-buttons/canvas-top-buttons.component';
import { CanvasUnderButtonsComponent } from '@app/components/canvas-under-buttons/canvas-under-buttons.component';
// import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { ImageCanvasComponent } from '@app/components/image-canvas/image-canvas.component';
import { LEFT_BUTTON, MIDDLE_BUTTON, RIGHT_BUTTON } from '@app/constants/constants';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';
import { of } from 'rxjs';
// import { DrawService } from '@app/services/draw-service/draw.service';
// import { SUBMIT_WAIT_TIME } from '@app/constants/constants';
// import { ImageService } from '@app/services/image-service/image.service';
// import { of } from 'rxjs';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;
    // let imageService: ImageService;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    // let routerSpy: jasmine.SpyObj<Router>;
    // let drawService: DrawService;
    // let timerCallback: jasmine.Spy<jasmine.Func>;
    let foregroundServiceSpy: jasmine.SpyObj<ForegroundService>;

    beforeEach(async () => {
        foregroundServiceSpy = jasmine.createSpyObj('ForegroundService', [
            'redoCanvasOperation',
            'undoCanvasOperation',
            'swapForegrounds',
            'disableDragging',
            'setForegroundContext',
        ]);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            declarations: [
                CreationPageComponent,
                ImageCanvasComponent,
                CanvasUnderButtonsComponent,
                MatIcon,
                CanvasUnderButtonsComponent,
                CanvasTopButtonsComponent,
                CanvasMiddleButtonsComponent,
            ],
            imports: [
                NoopAnimationsModule,
                MatDialogModule,
                RouterTestingModule,
                MatFormFieldModule,
                MatRadioModule,
                MatInputModule,
                FormsModule,
                HttpClientTestingModule,
                MatButtonToggleModule,
                MatSelectModule,
            ],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: ForegroundService, useValue: foregroundServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('keyboardEvent should call redoCanvasOperation when ctrl+shift+z are pressed', () => {
        const keyboardEvent: KeyboardEvent = new KeyboardEvent('keydown', {
            key: 'Z',
            ctrlKey: true,
            shiftKey: true,
        });
        component.keyboardEvent(keyboardEvent);
        expect(foregroundServiceSpy.redoCanvasOperation).toHaveBeenCalled();
    });

    it('keyboardEvent should call undoCanvasOperation when ctrl+z are pressed', () => {
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
        });
        component.keyboardEvent(keyboardEvent);
        expect(foregroundServiceSpy.undoCanvasOperation).toHaveBeenCalled();
    });

    it('mouseUpEvent should disable dragging when left button is released', () => {
        const mouseUpEvent = new MouseEvent('mouseup', { button: LEFT_BUTTON });
        component.mouseUpEvent(mouseUpEvent);
        expect(foregroundServiceSpy.disableDragging).toHaveBeenCalled();
    });

    it('mouseUpEvent should not disable dragging when right button is released', () => {
        const mouseUpEvent = new MouseEvent('mouseup', { button: MIDDLE_BUTTON });
        component.mouseUpEvent(mouseUpEvent);
        expect(foregroundServiceSpy.disableDragging).not.toHaveBeenCalled();
    });

    it('mouseDownEvent should prevent default and stop propagation when left mouse button is clicked', () => {
        const mouseDownEvent = new MouseEvent('mousedown', {
            button: LEFT_BUTTON,
        });
        spyOn(mouseDownEvent, 'preventDefault');
        spyOn(mouseDownEvent, 'stopPropagation');
        component.mouseDownEvent(mouseDownEvent);
        expect(mouseDownEvent.preventDefault).toHaveBeenCalled();
        expect(mouseDownEvent.stopPropagation).toHaveBeenCalled();
    });

    it('mouseDownEvent should not prevent default or stop propagation when right mouse button is clicked', () => {
        const mouseDownEvent = new MouseEvent('mousedown', {
            button: RIGHT_BUTTON,
        });
        spyOn(mouseDownEvent, 'preventDefault');
        spyOn(mouseDownEvent, 'stopPropagation');
        component.mouseDownEvent(mouseDownEvent);
        expect(mouseDownEvent.preventDefault).not.toHaveBeenCalled();
        expect(mouseDownEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('mouseDownEvent should not prevent default or stop propagation when middle mouse button is clicked', () => {
        const mouseDownEvent = new MouseEvent('mousedown', {
            button: MIDDLE_BUTTON,
        });
        spyOn(mouseDownEvent, 'preventDefault');
        spyOn(mouseDownEvent, 'stopPropagation');
        component.mouseDownEvent(mouseDownEvent);
        expect(mouseDownEvent.preventDefault).not.toHaveBeenCalled();
        expect(mouseDownEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('should select a radio button', () => {
        const radioButtons = fixture.debugElement.query(By.css('mat-radio-button')).nativeElement;
        radioButtons[1]?.click();
        fixture.detectChanges();
        expect(component.radius).toEqual(component.radiusSizes[1]);
    });

    it('should call validateDifferences method on click', () => {
        const validateButton = fixture.debugElement.query(By.css("button[name='validateButton']")).nativeElement;
        const validateDifferencesSpy = spyOn(component, 'validateDifferences');
        validateButton.click();
        fixture.detectChanges();
        expect(validateDifferencesSpy).toHaveBeenCalled();
    });

    it('validateDifferences should open dialog', () => {
        const data = 42;
        const game = { id: 1, name: 'Test Game' };
        matDialogSpy.open.and.returnValue({
            afterClosed: () => of(game),
        } as MatDialogRef<unknown, unknown>);

        component.radius = data;
        component.validateDifferences();

        expect(matDialogSpy.open).toHaveBeenCalled();
    });
});
