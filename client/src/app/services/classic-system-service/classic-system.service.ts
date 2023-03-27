import { Injectable, OnDestroy } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { ChatMessage, ClientSideGame, Differences, GameEvents, MessageEvents, MessageTag, Players } from '@common/game-interfaces';
import { filter, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ClassicSystemService implements OnDestroy {
    differences: Coordinate[][];
    private timer: Subject<number>;
    private differencesFound: Subject<number>;
    private opponentDifferencesFound: Subject<number>;
    private currentGame: Subject<ClientSideGame>;
    private message: Subject<ChatMessage>;
    private isLeftCanvas: boolean;
    private endMessage: Subject<string>;
    private players: Subject<Players>;
    // private cheatDifferences: Subject<Coordinate[]>;

    constructor(
        private readonly clientSocket: ClientSocketService,
        private readonly gameAreaService: GameAreaService,
        private readonly soundService: SoundService,
    ) {
        this.currentGame = new Subject<ClientSideGame>();
        this.differencesFound = new Subject<number>();
        this.timer = new Subject<number>();
        this.players = new Subject<Players>();
        this.message = new Subject<ChatMessage>();
        this.endMessage = new Subject<string>();
        this.opponentDifferencesFound = new Subject<number>();
        // this.cheatDifferences = new Subject<Coordinate[]>();
    }

    get currentGame$() {
        return this.currentGame.asObservable().pipe(filter((game) => !!game));
    }

    get timer$() {
        return this.timer.asObservable();
    }
    get differencesFound$() {
        return this.differencesFound.asObservable();
    }
    get message$() {
        return this.message.asObservable();
    }

    get endMessage$() {
        return this.endMessage.asObservable();
    }

    get opponentDifferencesFound$() {
        return this.opponentDifferencesFound.asObservable();
    }

    get players$() {
        return this.players.asObservable();
    }

    // get cheatDifferences() {
    //     return this.cheatDifferences;
    // }

    // get cheatDifferences$() {
    //     return this.cheatDifferences.asObservable();
    // }

    // getDifferences() {
    //     return this.differences;
    // }

    getSocketId(): string {
        return this.clientSocket.socket.id;
    }

    createSoloGame(gameId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.CreateSoloGame, { gameId, playerName });
    }
    startGameByRoomId(roomId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.StartGameByRoomId, { roomId, playerName });
    }

    checkStatus(): void {
        this.clientSocket.send(GameEvents.CheckStatus);
    }

    requestVerification(coords: Coordinate): void {
        this.clientSocket.send(GameEvents.RemoveDiff, coords);
    }

    replaceDifference(differences: Coordinate[]): void {
        if (differences.length === 0) {
            this.soundService.playErrorSound();
            this.gameAreaService.showError(this.isLeftCanvas);
        } else {
            this.soundService.playCorrectSound();
            this.gameAreaService.setAllData();
            this.gameAreaService.replaceDifference(differences);
        }
    }

    abandonGame(): void {
        this.clientSocket.send(GameEvents.AbandonGame);
    }

    setIsLeftCanvas(isLeft: boolean): void {
        this.isLeftCanvas = isLeft;
    }

    disconnect(): void {
        this.clientSocket.send(GameEvents.Disconnect);
        this.clientSocket.disconnect();
    }

    sendMessage(textMessage: string): void {
        const newMessage = { tag: MessageTag.received, message: textMessage };
        this.clientSocket.send(MessageEvents.LocalMessage, newMessage);
    }

    joinOneVsOneGame(gameId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.JoinOneVsOneGame, { gameId, playerName });
    }

    manageSocket(): void {
        this.clientSocket.connect();
        this.clientSocket.on(GameEvents.CreateSoloGame, (clientGame: ClientSideGame) => {
            this.currentGame.next(clientGame);
        });

        this.clientSocket.on(GameEvents.GameStarted, (data: { clientGame: ClientSideGame; players: Players; cheatDifferences: Coordinate[][] }) => {
            console.log('Game started');
            console.log(data.cheatDifferences);
            this.currentGame.next(data.clientGame);
            // this.cheatDifferences.next(data.cheatDifferences);
            this.differences = data.cheatDifferences;
            if (data.players) {
                this.players.next(data.players);
            }
        });
        this.clientSocket.on(GameEvents.RemoveDiff, (data: { differencesData: Differences; playerId: string; cheatDifferences: Coordinate[][] }) => {
            if (data.playerId === this.getSocketId()) {
                this.replaceDifference(data.differencesData.currentDifference);
                this.differencesFound.next(data.differencesData.differencesFound);
                this.checkStatus();
            } else if (data.differencesData.currentDifference.length !== 0) {
                this.replaceDifference(data.differencesData.currentDifference);
                this.opponentDifferencesFound.next(data.differencesData.differencesFound);
            }
            console.log('remove diff');
            console.log(data.cheatDifferences);
            // this.cheatDifferences.next(data.cheatDifferences);
            this.differences = data.cheatDifferences;
        });

        this.clientSocket.on(GameEvents.TimerStarted, (timer: number) => {
            this.timer.next(timer);
        });

        this.clientSocket.on(GameEvents.EndGame, (endGameMessage: string) => {
            this.endMessage.next(endGameMessage);
        });

        this.clientSocket.on(MessageEvents.LocalMessage, (receivedMessage: ChatMessage) => {
            this.message.next(receivedMessage);
        });
    }

    ngOnDestroy(): void {
        this.clientSocket.disconnect();
    }
}
