/* eslint-disable @typescript-eslint/no-empty-function */
// Need to mock functions
import { TestBed } from '@angular/core/testing';
import { SPEED_X1, SPEED_X2, SPEED_X4 } from '@app/constants/replay';
import { ReplayActions } from '@app/enum/replay-actions';
import { ClickErrorData, ReplayEvent } from '@app/interfaces/replay-actions';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageService } from '@app/services/image-service/image.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { MessageTag } from '@common/enums';
import { ChatMessage, ClientSideGame, GameConfigConst, GameRoom, Player } from '@common/game-interfaces';
import { BehaviorSubject } from 'rxjs';
import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;
    let gameAreaServiceSpy: jasmine.SpyObj<GameAreaService>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;
    let hintServiceSpy: jasmine.SpyObj<HintService>;
    const replayEventGameAreaServiceSubTest = new BehaviorSubject<number>(0);
    const replayEventGameManagerServiceSubTest = new BehaviorSubject<number>(0);
    const replayEventHintServiceSubTest = new BehaviorSubject<number>(0);

    const gameRoomStub: GameRoom = {
        roomId: 'test',
        clientGame: {} as ClientSideGame,
        endMessage: '',
        timer: 0,
        originalDifferences: [[]],
        gameConstants: {} as GameConfigConst,
        player1: {} as Player,
    };

    const replayEventsStub: ReplayEvent[] = [
        { timestamp: 0, action: ReplayActions.StartGame, data: gameRoomStub },
        { timestamp: 0, action: ReplayActions.TimerUpdate },
        { timestamp: 0, action: ReplayActions.ClickFound },
        { timestamp: 0, action: ReplayActions.ClickError, data: { isMainCanvas: true, pos: { x: 0, y: 0 } } as ClickErrorData },
    ];

    const replayIntervalMock = {
        start: jasmine.createSpy('start'),
        pause: jasmine.createSpy('pause'),
        resume: jasmine.createSpy('resume'),
        cancel: jasmine.createSpy('cancel'),
    };

    beforeEach(async () => {
        gameAreaServiceSpy = jasmine.createSpyObj(
            'GameAreaService',
            ['getOriginalContext', 'getModifiedContext', 'setAllData', 'replaceDifference', 'showError', 'toggleCheatMode', 'flashCorrectPixels'],
            {
                replayEventsSubject: replayEventGameAreaServiceSubTest,
            },
        );
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['setMessage', 'requestHint'], {
            replayEventsSubject: replayEventGameManagerServiceSubTest,
        });
        soundServiceSpy = jasmine.createSpyObj('SoundService', ['playCorrectSound', 'playErrorSound']);
        imageServiceSpy = jasmine.createSpyObj('ImageService', ['loadImage']);
        hintServiceSpy = jasmine.createSpyObj('HintService', ['requestHint', 'resetHints'], {
            replayEventsSubject: replayEventHintServiceSubTest,
        });

        TestBed.configureTestingModule({
            providers: [
                ReplayService,
                { provide: GameAreaService, useValue: gameAreaServiceSpy },
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
                { provide: SoundService, useValue: soundServiceSpy },
                { provide: ImageService, useValue: imageServiceSpy },
                { provide: HintService, useValue: hintServiceSpy },
            ],
        });

        service = TestBed.inject(ReplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set isReplaying to true when startReplay is called', () => {
        service['replayEvents'] = replayEventsStub;
        service.startReplay();
        expect(service.isReplaying).toBeTruthy();
    });

    it('should call createReplayInterval and replaySwitcher when startReplay is called', () => {
        const createReplayIntervalSpy = spyOn(service, 'createReplayInterval').and.callThrough();
        const replaySwitcherSpy = spyOn(service, 'replaySwitcher');
        service['replayEvents'] = replayEventsStub;
        service.startReplay();
        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalledTimes(1);
    });

    it('should call createReplayInterval and replaySwitcher when interval is paused and resumed', () => {
        const createReplayIntervalSpy = spyOn(service, 'createReplayInterval').and.callThrough();
        const replaySwitcherSpy = spyOn(service, 'replaySwitcher');
        service['replayEvents'] = replayEventsStub;
        service.startReplay();
        service.pauseReplay();
        service.resumeReplay();
        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalled();
    });

    it('should stop the replay when there are no more events to process', () => {
        spyOn(service, 'createReplayInterval').and.callFake((callback: (i: ReplayEvent) => void) => {
            return {
                start: () => {
                    for (const i of service['replayEvents']) {
                        callback(i);
                    }
                },
                pause: () => {},
                resume: () => {},
                cancel: () => {
                    service.isReplaying = false;
                },
            };
        });
        const replaySwitcherSpy = spyOn(service, 'replaySwitcher').and.callThrough();
        service['replayEvents'] = replayEventsStub;
        service.startReplay();
        expect(service.isReplaying).toBe(true);
        expect(replaySwitcherSpy).toHaveBeenCalledTimes(replayEventsStub.length);
    });

    it('should handle StartGame action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.StartGame,
            timestamp: 0,
            data: gameRoomStub,
        };
        service.replaySwitcher(replayEvent);
        expect(imageServiceSpy.loadImage).toHaveBeenCalled();
        expect(gameAreaServiceSpy.setAllData).toHaveBeenCalled();
    });

    it('should handle ClickFound action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ClickFound,
            data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ] as Coordinate[],
            timestamp: 0,
        };
        service.replaySwitcher(replayEvent);
        expect(service['currentCoords']).toEqual(replayEvent.data as Coordinate[]);
        expect(service['isDifferenceFound']).toBe(true);
        expect(soundServiceSpy.playCorrectSound).toHaveBeenCalled();
        expect(gameAreaServiceSpy.setAllData).toHaveBeenCalled();
        expect(gameAreaServiceSpy.replaceDifference).toHaveBeenCalledWith(replayEvent.data as Coordinate[], service['replaySpeed']);
    });

    it('should handle ClickError action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ClickError,
            data: {
                isMainCanvas: true,
                pos: { x: 10, y: 20 },
            } as ClickErrorData,
            timestamp: 0,
        };
        service.replaySwitcher(replayEvent);
        expect(soundServiceSpy.playErrorSound).toHaveBeenCalled();
        expect(gameAreaServiceSpy.showError).toHaveBeenCalledWith(
            (replayEvent.data as ClickErrorData).isMainCanvas,
            (replayEvent.data as ClickErrorData).pos,
            1,
        );
    });

    it('should handle CaptureMessage action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.CaptureMessage,
            data: {
                tag: MessageTag.Common,
                message: 'test',
            } as ChatMessage,
            timestamp: 0,
        };
        service.replaySwitcher(replayEvent);
        expect(gameManagerServiceSpy.setMessage).toHaveBeenCalledWith(replayEvent.data as ChatMessage);
    });

    it('should handle ActivateCheat action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ActivateCheat,
            data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ] as Coordinate[],
            timestamp: 0,
        };
        service.replaySwitcher(replayEvent);
        expect(service['isCheatMode']).toBe(true);
        expect(service['currentCoords']).toEqual(replayEvent.data as Coordinate[]);
        expect(gameAreaServiceSpy.toggleCheatMode).toHaveBeenCalledWith(replayEvent.data as Coordinate[], service['replaySpeed']);
    });

    it('should handle DeactivateCheat action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.DeactivateCheat,
            data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ] as Coordinate[],
            timestamp: 0,
        };
        service.replaySwitcher(replayEvent);
        expect(service['isCheatMode']).toBe(false);
        expect(gameAreaServiceSpy.toggleCheatMode).toHaveBeenCalledWith(replayEvent.data as Coordinate[], service['replaySpeed']);
    });

    it('should handle TimerUpdate action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.TimerUpdate,
            timestamp: 0,
        };
        const timerValues: number[] = [];
        service['replayTimer$'].subscribe((value) => {
            timerValues.push(value);
        });
        expect(timerValues.length).toEqual(1);
        service.replaySwitcher(replayEvent);
        expect(timerValues.length).toEqual(2);
    });

    it('should handle DifferenceFoundUpdate action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.DifferenceFoundUpdate,
            data: 3,
            timestamp: 0,
        };
        const differenceFoundValues: number[] = [];
        service['replayDifferenceFound$'].subscribe((value) => {
            differenceFoundValues.push(value);
        });
        expect(differenceFoundValues).toEqual([0]);
        service.replaySwitcher(replayEvent);
        expect(differenceFoundValues).toEqual([0, replayEvent.data as number]);
    });

    it('should handle OpponentDifferencesFoundUpdate action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.OpponentDifferencesFoundUpdate,
            data: 2,
            timestamp: 0,
        };
        const opponentDifferenceFoundValues: number[] = [];
        service['replayOpponentDifferenceFound$'].subscribe((value) => {
            opponentDifferenceFoundValues.push(value);
        });
        expect(opponentDifferenceFoundValues).toEqual([0]);
        service.replaySwitcher(replayEvent);
        expect(opponentDifferenceFoundValues).toEqual([0, replayEvent.data as number]);
    });

    it('should handle UseHint action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.UseHint,
            data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ] as Coordinate[],
            timestamp: 0,
        };
        service.replaySwitcher(replayEvent);
        expect(hintServiceSpy.requestHint).toHaveBeenCalledWith(replayEvent.data as Coordinate[], service['replaySpeed']);
    });

    it('should call toggleCheatMode and flashCorrectPixels when isCheatMode and isDifferenceFound are true', () => {
        service['replayInterval'] = replayIntervalMock;
        service['isCheatMode'] = true;
        service['isDifferenceFound'] = true;
        service.pauseReplay();
        expect(gameAreaServiceSpy.toggleCheatMode).toHaveBeenCalledWith(service['currentCoords'], service['replaySpeed']);
        expect(gameAreaServiceSpy.flashCorrectPixels).toHaveBeenCalledWith(service['currentCoords'], service['replaySpeed'], true);
        expect(replayIntervalMock.pause).toHaveBeenCalled();
    });

    it('should call toggleCheatMode and flashCorrectPixels when isCheatMode and isDifferenceFound are true', () => {
        service['replayInterval'] = replayIntervalMock;
        service['isCheatMode'] = true;
        service['isDifferenceFound'] = true;
        service.resumeReplay();
        expect(gameAreaServiceSpy.toggleCheatMode).toHaveBeenCalledWith(service['currentCoords'], service['replaySpeed']);
        expect(gameAreaServiceSpy.flashCorrectPixels).toHaveBeenCalledWith(service['currentCoords'], service['replaySpeed'], false);
        expect(replayIntervalMock.resume).toHaveBeenCalled();
    });

    it('should set replaySpeed to SPEED_X1', () => {
        service.upSpeed(SPEED_X1);
        expect(service['replaySpeed']).toBe(SPEED_X1);
    });

    it('should set replaySpeed to SPEED_X2', () => {
        service.upSpeed(SPEED_X2);
        expect(service['replaySpeed']).toBe(SPEED_X2);
    });

    it('should set replaySpeed to SPEED_X4', () => {
        service.upSpeed(SPEED_X4);
        expect(service['replaySpeed']).toBe(SPEED_X4);
    });

    it('should reset replay timer and found differences', () => {
        service.restartTimer();
        expect(service['replayOpponentDifferenceFound'].value).toBe(0);
        expect(service['replayDifferenceFound'].value).toBe(0);
        expect(service['replayTimer'].value).toBe(0);
    });

    it('should reset replay properties', () => {
        service.resetReplay();
        expect(service['replayEvents']).toEqual([]);
        expect(service['currentReplayIndex']).toBe(0);
        expect(service['isReplaying']).toBe(false);
    });
});
