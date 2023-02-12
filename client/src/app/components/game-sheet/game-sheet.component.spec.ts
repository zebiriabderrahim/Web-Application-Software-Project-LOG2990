import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameCardService } from '@app/services/gamecard-service/gamecard.service';
import { of } from 'rxjs';
import { GameSheetComponent } from './game-sheet.component';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    let gameCardService: GameCardService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, BrowserAnimationsModule, MatDialogModule],
            declarations: [GameSheetComponent],
            providers: [
                CommunicationService,
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
                {
                    provide: MatDialog,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameCardService = TestBed.inject(GameCardService);
        component.game = {
            id: 1,
            name: 'test',
            difficultyLevel: true,
            soloTopTime: [],
            oneVsOneTopTime: [],
            thumbnail: '',
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('OpenDialog should open dialog box and call gameCardService with game id', () => {
        const gameServiceSpy = spyOn(gameCardService, 'redirection');
        const popUpSpy = spyOn(component.dialog, 'open').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent>);
        component.openDialog();
        expect(popUpSpy).toHaveBeenCalled();
        expect(gameServiceSpy).toHaveBeenCalledWith(component.game.id);
    });
});
