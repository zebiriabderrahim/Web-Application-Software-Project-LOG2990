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
    // let foregroundServiceSpy: jasmine.SpyObj<ForegroundService>;

    beforeEach(async () => {
        // drawService = jasmine.createSpyObj('DrawService', ['redoCanvasOperation', 'undoCanvasOperation', 'swapForegrounds']);
        // foregroundServiceSpy = jasmine.createSpyObj('ForegroundService', [
        //     'redoCanvasOperation',
        //     'undoCanvasOperation',
        //     'swapForegrounds',
        //     'disableDragging',
        // ]);
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
            providers: [{ provide: MatDialog, useValue: matDialogSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationPageComponent);
        // imageService = TestBed.inject(ImageService);
        // timerCallback = jasmine.createSpy('timerCallback');
        jasmine.clock().install();
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('validateDifferences should open imageNotSetDialog with config if images are set', async () => {
    //     matDialogSpy.open.and.returnValue({
    //         afterClosed: () => of('test'),
    //     } as MatDialogRef<CreationGameDialogComponent>);
    //     spyOn(imageService, 'areImagesSet').and.callFake(() => {
    //         return true;
    //     });

    //     // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for the mock
    //     spyOn(component['router'], 'navigate').and.callFake(async () => {
    //         return {} as Promise<boolean>;
    //     });

    //     setTimeout(function () {
    //         timerCallback();
    //     }, SUBMIT_WAIT_TIME);

    //     component.validateDifferences();
    //     const dialogConfig = new MatDialogConfig();
    //     dialogConfig.data = component.radius;
    //     expect(matDialogSpy.open).toHaveBeenCalledWith(CreationGameDialogComponent, dialogConfig);
    //     expect(timerCallback).not.toHaveBeenCalled();
    //     jasmine.clock().tick(SUBMIT_WAIT_TIME + 1);
    //     expect(timerCallback).toHaveBeenCalled();
    // });

    // it('validateDifferences should open imageNotSetDialog if images are not set', () => {
    //     spyOn(imageService, 'areImagesSet').and.callFake(() => {
    //         return false;
    //     });
    //     component.validateDifferences();
    //     expect(matDialogSpy.open).toHaveBeenCalled();
    // });

    // it('should call redoCanvasOperation when ctrl+shift+z are pressed', () => {
    //     const event = new KeyboardEvent('keydown', {
    //         key: 'Z',
    //         ctrlKey: true,
    //         shiftKey: true,
    //     });
    //     window.dispatchEvent(event);

    //     expect(foregroundServiceSpy.redoCanvasOperation).toHaveBeenCalled();
    // });

    // it('should call undoCanvasOperation when ctrl+z are pressed', () => {
    //     const event = new KeyboardEvent('keydown', {
    //         key: 'z',
    //         ctrlKey: true,
    //     });
    //     window.dispatchEvent(event);

    //     expect(foregroundServiceSpy.undoCanvasOperation).toHaveBeenCalled();
    // });

    // it('should disable dragging when left button is released', () => {
    //     const mouseUpEvent = new MouseEvent('mouseup', { button: 0 });
    //     component.mouseUpEvent(mouseUpEvent);
    //     expect(foregroundServiceSpy.disableDragging).toHaveBeenCalled();
    // });

    // it('should not disable dragging when right button is released', () => {
    //     const mouseUpEvent = new MouseEvent('mouseup', { button: 1 });
    //     component.mouseUpEvent(mouseUpEvent);
    //     expect(foregroundServiceSpy.disableDragging).not.toHaveBeenCalled();
    // });

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

    // it('should call undoCanvasOperation() when ctrlKey is pressed', () => {
    //     const mockKeyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'Z' });
    //     component.keyboardEvent(mockKeyboardEvent);

    //     expect(drawService.undoCanvasOperation).toHaveBeenCalled();
    //     expect(drawService.redoCanvasOperation).not.toHaveBeenCalled();
    // });

    // it('should call redoCanvasOperation() when ctrlKey and shiftKey are pressed and key is "Z"', () => {
    //     const mockKeyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'Z' });

    //     component.keyboardEvent(mockKeyboardEvent);

    //     expect(drawService.redoCanvasOperation).toHaveBeenCalled();
    //     expect(drawService.undoCanvasOperation).not.toHaveBeenCalled();
    // });

    // it('should not call any method when ctrlKey and shiftKey are pressed but key is not "Z"', () => {
    //     const mockKeyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'X' });

    //     component.keyboardEvent(mockKeyboardEvent);

    //     expect(drawService.redoCanvasOperation).not.toHaveBeenCalled();
    //     expect(drawService.undoCanvasOperation).not.toHaveBeenCalled();
    // });

    // it('should not call any method when only shiftKey is pressed', () => {
    //     const mockKeyboardEvent = new KeyboardEvent('keydown', { shiftKey: true, key: 'z' });

    //     component.keyboardEvent(mockKeyboardEvent);

    //     expect(drawService.redoCanvasOperation).not.toHaveBeenCalled();
    //     expect(drawService.undoCanvasOperation).not.toHaveBeenCalled();
    // });

    // it('should not call any method when only ctrlKey is pressed and key is not "z"', () => {
    //     const mockKeyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'x' });

    //     component.keyboardEvent(mockKeyboardEvent);

    //     expect(drawService.redoCanvasOperation).not.toHaveBeenCalled();
    //     expect(drawService.undoCanvasOperation).not.toHaveBeenCalled();
    // });

    // it('should call drawService.swapForegrounds()', () => {
    //     component.swapForegrounds();
    //     fixture.detectChanges();
    //     expect(drawService.swapForegrounds).toHaveBeenCalled();
    // });

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
