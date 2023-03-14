import { Coordinate } from '@common/coordinate';

export interface ClientSideGame {
    id: string;
    name: string;
    mode: string;
    original: string;
    modified: string;
    isHard: boolean;
    differencesCount: number;
}

export interface GameCard {
    _id: string;
    name: string;
    difficultyLevel: boolean;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    thumbnail: string;
}

export interface CarouselPaginator {
    hasNext: boolean;
    hasPrevious: boolean;
    gameCards: GameCard[];
}

export interface GameConfigConst {
    countdownTime: number;
    penaltyTime: number;
    bonusTime: number;
}

export interface PlayerTime {
    name: string;
    time: number;
}

export interface ClassicPlayRoom {
    roomId: string;
    clientGame: ClientSideGame;
    endMessage: string;
    timer: number;
    originalDifferences: Coordinate[][];
    player2?: Player;
    player1?: Player;
}

export interface Player {
    playerId?: string;
    name: string;
    diffData: Differences;
}

export interface Differences {
    currentDifference: Coordinate[];
    differencesFound: number;
}

export interface RoomAvailability {
    gameId: string;
    isAvailableToJoin: boolean;
}

export interface PlayerNameAvailability {
    gameId: string;
    isNameAvailable: boolean;
}

export interface AcceptedPlayer {
    gameId: string;
    roomId: string;
    playerName: string;
}

export interface WaitingPlayerNameList {
    gameId: string;
    playerNamesList: string[];
}


export enum GameEvents {
    ValidateCoords = 'validateCoords',
    Penalty = 'penalty',
    CheckStatus = 'checkStatus',
    CreateSoloGame = 'createSoloGame',
    RoomOneVsOneCreated = 'roomOneVsOneCreated',
    EndGame = 'endGame',
    TimerStarted = 'timerStarted',
    RemoveDiff = 'removeDiff',
    RoomOneVsOneAvailable = 'RoomOneVsOneAvailable',
    StartGameByRoomId = 'CreateOneVsOneGame',
    CheckRoomOneVsOneAvailability = 'CheckRoomOneVsOneAvailability',
    UpdateRoomOneVsOneAvailability = 'UpdateRoomOneVsOneAvailability',
    DeleteCreatedOneVsOneRoom = 'DeleteCreatedOneVsOneRoom',
    UpdateWaitingPlayerNameList = 'UpdateWaitingPlayerNameList',
    WaitingPlayerNameListByGameId = 'WaitingPlayerNameListByGameId',
    Disconnect = 'Disconnect',
    RefusePlayer = 'RefusePlayer',
    CheckIfPlayerNameIsAvailable = 'CheckIfPlayerNameIsAvailable',
    PlayerNameTaken = 'PlayerNameTaken',
    CancelJoining = 'CancelJoining',
    AcceptPlayer = 'AcceptPlayer',
    CreateOneVsOneRoom = 'CreateOneVsOneRoom',
    OneVsOneRoomDeleted = 'OneVsOneRoomDeleted',
    PlayerAccepted = 'PlayerAccepted',
    GameStarted = 'OneVsOneStarted',
    CreateSoloRoom = 'CreateSoloRoom',
    RoomSoloCreated = 'RoomSoloCreated',
    AbandonGame = "AbandonGame"
}

export enum GameModes {
    ClassicSolo = 'Classic->lSolo',
    ClassicOneVsOne = 'Classic->OneVsOne',
}

export enum GameCardActions {
    Create = 'create',
    Join = 'join',
}
