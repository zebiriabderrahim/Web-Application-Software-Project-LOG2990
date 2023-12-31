import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GamePageDialogComponent } from '@app/components/game-page-dialog/game-page-dialog.component';
import { DEFAULT_PLAYERS, INPUT_TAG_NAME, SOLO_GAME_ID } from '@app/constants/constants';
import { ASSETS_HINTS } from '@app/constants/hint';
import { CANVAS_MEASUREMENTS } from '@app/constants/image';
import { HintProximity } from '@app/enum/hint-proximity';
import { CanvasMeasurements } from '@app/interfaces/game-interfaces';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageService } from '@app/services/image-service/image.service';
import { ReplayService } from '@app/services/replay-service/replay.service';
import { Coordinate } from '@common/coordinate';
import { GameModes, GamePageEvent, MessageTag } from '@common/enums';
import { ChatMessage, ClientSideGame, Players } from '@common/game-interfaces';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('originalCanvas', { static: false }) originalCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvas', { static: false }) modifiedCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('originalCanvasFG', { static: false }) private originalCanvasForeground!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvasFG', { static: false }) private modifiedCanvasForeground!: ElementRef<HTMLCanvasElement>;
    game: ClientSideGame;
    differencesFound: number;
    opponentDifferencesFound: number;
    timer: number;
    messages: ChatMessage[];
    player: string;
    players: Players;
    hintsAssets: string[];
    isReplayAvailable: boolean;
    gameMode: typeof GameModes;
    readonly canvasSize: CanvasMeasurements;
    private onDestroy$: Subject<void>;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameAreaService: GameAreaService,
        private readonly gameManager: GameManagerService,
        private readonly imageService: ImageService,
        private readonly hintService: HintService,
        private readonly matDialog: MatDialog,
        private readonly replayService: ReplayService,
        private readonly router: Router,
    ) {
        this.gameManager.manageSocket();
        this.differencesFound = 0;
        this.opponentDifferencesFound = 0;
        this.timer = 0;
        this.messages = [];
        this.hintsAssets = ASSETS_HINTS;
        this.player = '';
        this.players = DEFAULT_PLAYERS;
        this.canvasSize = CANVAS_MEASUREMENTS;
        this.isReplayAvailable = false;
        this.gameMode = GameModes;
        this.onDestroy$ = new Subject();
    }

    get proximity(): HintProximity {
        return this.hintService.thirdHintProximity;
    }

    get isThirdHintActive(): boolean {
        return this.hintService.isThirdHintActive;
    }

    private get differences(): Coordinate[][] {
        return this.gameManager.differences;
    }

    @HostListener('window:keydown', ['$event'])
    keyboardEvent(event: KeyboardEvent) {
        const eventHTMLElement = event.target as HTMLElement;
        if (eventHTMLElement.tagName !== INPUT_TAG_NAME) {
            if (event.key === 't') {
                const differencesCoordinates = ([] as Coordinate[]).concat(...this.differences);
                this.gameAreaService.toggleCheatMode(differencesCoordinates);
            } else if (event.key === 'i' && this.game.mode.includes(SOLO_GAME_ID)) {
                this.hintService.requestHint();
            }
        }
    }

    ngAfterViewInit(): void {
        this.gameManager.startGame();
        this.hintService.resetHints();
        this.getPlayers();
        this.setUpGame();
        this.setUpReplay();
        this.updateTimer();
        this.handleDifferences();
        this.handleMessages();
        this.showEndMessage();
        this.updateIfFirstDifferencesFound();
        this.updateGameMode();
        this.handlePageRefresh();
    }
    showAbandonDialog(): void {
        this.matDialog.open(GamePageDialogComponent, {
            data: { action: GamePageEvent.Abandon, message: 'Êtes-vous certain de vouloir abandonner la partie ? ' },
            disableClose: true,
            panelClass: 'dialog',
        });
    }

    mouseClickOnCanvas(event: MouseEvent, isLeft: boolean) {
        if (!this.gameAreaService.detectLeftClick(event)) return;
        if (this.isThirdHintActive) {
            this.hintService.deactivateThirdHint();
        }
        this.gameAreaService.setAllData();
        this.gameManager.setIsLeftCanvas(isLeft);
        this.gameManager.requestVerification(this.gameAreaService.getMousePosition());
    }

    checkThirdHint(event: MouseEvent) {
        if (this.hintService.nAvailableHints === 0 && !this.isReplayAvailable) {
            this.hintService.checkThirdHintProximity({ x: event.offsetX, y: event.offsetY });
        }
    }

    addRightSideMessage(text: string) {
        this.messages.push({ tag: MessageTag.Sent, message: text });
        this.gameManager.sendMessage(text);
    }

    isMultiplayerMode(): boolean {
        return this.game.mode === GameModes.LimitedCoop || this.game.mode === GameModes.ClassicOneVsOne;
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        this.gameAreaService.resetCheatMode();
        this.gameManager.removeAllListeners();
    }

    private isLimitedMode(): boolean {
        return this.game.mode === GameModes.LimitedCoop || this.game.mode === GameModes.LimitedSolo;
    }

    private showEndGameDialog(endingMessage: string): void {
        this.matDialog.open(GamePageDialogComponent, {
            data: { action: GamePageEvent.EndGame, message: endingMessage, isReplayMode: this.game?.mode.includes('Classic') },
            disableClose: true,
            panelClass: 'dialog',
        });
        if (this.game?.mode.includes('Classic')) this.isReplayAvailable = true;
    }

    private updateTimer(): void {
        this.gameManager.timer$.pipe(takeUntil(this.onDestroy$)).subscribe((timer) => {
            this.timer = timer;
        });
    }

    private handleMessages(): void {
        this.gameManager.message$.pipe(takeUntil(this.onDestroy$)).subscribe((message) => {
            this.messages.push(message);
        });
    }

    private showEndMessage(): void {
        this.gameManager.endMessage$.pipe(takeUntil(this.onDestroy$)).subscribe((endMessage) => {
            this.showEndGameDialog(endMessage);
        });
    }

    private handleDifferences(): void {
        this.gameManager.differencesFound$.pipe(takeUntil(this.onDestroy$)).subscribe((differencesFound) => {
            this.differencesFound = differencesFound;
        });

        this.gameManager.opponentDifferencesFound$.pipe(takeUntil(this.onDestroy$)).subscribe((opponentDifferencesFound) => {
            this.opponentDifferencesFound = opponentDifferencesFound;
        });
    }

    private updateIfFirstDifferencesFound(): void {
        this.gameManager.isFirstDifferencesFound$.pipe(takeUntil(this.onDestroy$)).subscribe((isFirstDifferencesFound) => {
            if (isFirstDifferencesFound && this.isLimitedMode()) this.gameManager.startNextGame();
        });
    }

    private updateGameMode(): void {
        this.gameManager.isGameModeChanged$.pipe(takeUntil(this.onDestroy$)).subscribe((isGameModeChanged) => {
            if (isGameModeChanged) this.game.mode = GameModes.LimitedSolo;
        });
    }

    private handlePageRefresh(): void {
        this.gameManager.isGamePageRefreshed$.pipe(takeUntil(this.onDestroy$)).subscribe((isGamePageRefreshed) => {
            if (isGamePageRefreshed) this.router.navigate(['/']);
        });
    }

    private getPlayers(): void {
        this.gameManager.players$.pipe(takeUntil(this.onDestroy$)).subscribe((players) => {
            this.players = players;
            if (players.player1.playerId === this.gameManager.getSocketId()) {
                this.player = players.player1.name;
            } else if (players.player2 && players.player2.playerId === this.gameManager.getSocketId()) {
                this.player = players.player2.name;
            }
        });
    }

    private setUpGame(): void {
        this.gameManager.currentGame$.pipe(takeUntil(this.onDestroy$)).subscribe((game) => {
            this.game = game;
            this.gameAreaService.setOriginalContext(
                this.originalCanvas.nativeElement.getContext('2d', {
                    willReadFrequently: true,
                }) as CanvasRenderingContext2D,
            );
            this.gameAreaService.setModifiedContext(
                this.modifiedCanvas.nativeElement.getContext('2d', {
                    willReadFrequently: true,
                }) as CanvasRenderingContext2D,
            );
            this.gameAreaService.setOriginalFrontContext(
                this.originalCanvasForeground.nativeElement.getContext('2d', {
                    willReadFrequently: true,
                }) as CanvasRenderingContext2D,
            );
            this.gameAreaService.setModifiedFrontContext(
                this.modifiedCanvasForeground.nativeElement.getContext('2d', {
                    willReadFrequently: true,
                }) as CanvasRenderingContext2D,
            );
            this.imageService.loadImage(this.gameAreaService.getOriginalContext(), this.game.original);
            this.imageService.loadImage(this.gameAreaService.getModifiedContext(), this.game.modified);
            this.gameAreaService.setAllData();
        });
    }

    private setUpReplay(): void {
        this.replayService.replayTimer$.pipe(takeUntil(this.onDestroy$)).subscribe((replayTimer: number) => {
            if (this.isReplayAvailable) {
                this.timer = replayTimer;
                if (replayTimer === 0) {
                    this.messages = [];
                    this.differencesFound = 0;
                }
            }
        });

        this.replayService.replayDifferenceFound$.pipe(takeUntil(this.onDestroy$)).subscribe((replayDiffFound) => {
            if (this.isReplayAvailable) this.differencesFound = replayDiffFound;
        });

        this.replayService.replayOpponentDifferenceFound$.pipe(takeUntil(this.onDestroy$)).subscribe((replayDiffFound) => {
            if (this.isReplayAvailable) this.opponentDifferencesFound = replayDiffFound;
        });
    }
}
