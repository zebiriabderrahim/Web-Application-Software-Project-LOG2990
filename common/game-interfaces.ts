import { Coordinate } from '@common/coordinate';

export interface ClientSideGame {
    id: string;
    name: string;
    player: string;
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
    differencesData: Differences;
    originalDifferences: Coordinate[][];
    isAvailableToJoin?: boolean;
    player2?: Player;
}

export interface Player {
    name: string;
    diffData: Differences;
}

export interface Differences {
    currentDifference: Coordinate[];
    differencesFound: number;
}

export enum GameEvents {
    ValidateCoords = 'validateCoords',
    Penalty = 'penalty',
    CheckStatus = 'checkStatus',
    CreateSoloGame = 'createSoloGame',
    EndGame = 'endGame',
    TimerStarted = 'timerStarted',
    RemoveDiff = 'removeDiff',
    RoomOneVsOneAvailable = 'RoomOneVsOneAvailable',
    CreateOneVsOneGame = 'CreateOneVsOneGame',
    CheckRoomOneVsOneAvailability = 'CheckRoomOneVsOneAvailability',
    UpdateRoomOneVsOneAvailability = 'UpdateRoomOneVsOneAvailability',
    DeleteCreatedOneVsOneRoom = 'DeleteCreatedOneVsOneRoom',
    UpdateWaitingPlayerNameList = 'UpdateWaitingPlayerNameList',
    WaitingPlayerNameListByGameId = 'WaitingPlayerNameListByGameId',
    Disconnect = "Disconnect",
    RefusePlayer = "RefusePlayer",
    AcceptPlayer= "AcceptPlayer",
    JoinOneVsOneGame = "JoinOneVsOneGame",
}

export enum GameModes {
    ClassicSolo = 'Classic->lSolo',
    ClassicOneVsOne = 'Classic->OneVsOne',
}

export enum MessageEvents {
    LocalMessage = 'LocalMessage',
    GlobalMessage = 'GlobalMessage'
}

export enum MessageTag {
    sent = 'sent',
    received = 'received',
    common = 'common'
}

export interface ChatMessage {
    tag: MessageTag,
    message: string
}
