import { Injectable } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameCardEvents, HistoryEvents, PlayerEvents, RoomEvents } from '@common/enums';
import { PlayerData, PlayerNameAvailability, RoomAvailability } from '@common/game-interfaces';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RoomManagerService {
    private joinedPlayerNames: Subject<string[]>;
    private playerNameAvailability: Subject<PlayerNameAvailability>;
    private rooms1V1AvailabilityByGameId: Subject<RoomAvailability>;
    private isPlayerAccepted: Subject<boolean>;
    private refusedPlayerId: Subject<string>;
    private roomOneVsOneId: Subject<string>;
    private roomSoloId: Subject<string>;
    private roomLimitedId: Subject<string>;
    private deletedGameId: Subject<string>;
    private isGameCardsReloadNeeded: Subject<boolean>;
    private isLimitedCoopRoomAvailable: Subject<boolean>;
    private hasNoGameAvailable: Subject<boolean>;
    private isGameHistoryReloadNeeded: Subject<boolean>;

    constructor(private readonly clientSocket: ClientSocketService) {
        this.playerNameAvailability = new Subject<PlayerNameAvailability>();
        this.roomOneVsOneId = new Subject<string>();
        this.isPlayerAccepted = new Subject<boolean>();
        this.joinedPlayerNames = new Subject<string[]>();
        this.rooms1V1AvailabilityByGameId = new Subject<RoomAvailability>();
        this.deletedGameId = new Subject<string>();
        this.refusedPlayerId = new Subject<string>();
        this.isGameCardsReloadNeeded = new Subject<boolean>();
        this.isLimitedCoopRoomAvailable = new Subject<boolean>();
        this.hasNoGameAvailable = new Subject<boolean>();
        this.roomSoloId = new Subject<string>();
        this.roomLimitedId = new Subject<string>();
        this.isGameHistoryReloadNeeded = new Subject<boolean>();
    }

    get joinedPlayerNamesByGameId$() {
        return this.joinedPlayerNames.asObservable();
    }

    get playerNameAvailability$() {
        return this.playerNameAvailability.asObservable();
    }

    get roomOneVsOneId$() {
        return this.roomOneVsOneId.asObservable();
    }

    get roomSoloId$() {
        return this.roomSoloId.asObservable();
    }

    get roomLimitedId$() {
        return this.roomLimitedId.asObservable();
    }

    get oneVsOneRoomsAvailabilityByRoomId$() {
        return this.rooms1V1AvailabilityByGameId.asObservable();
    }

    get isPlayerAccepted$() {
        return this.isPlayerAccepted.asObservable();
    }

    get deletedGameId$() {
        return this.deletedGameId.asObservable();
    }

    get refusedPlayerId$() {
        return this.refusedPlayerId.asObservable();
    }

    get isReloadNeeded$() {
        return this.isGameCardsReloadNeeded.asObservable();
    }

    get isLimitedCoopRoomAvailable$() {
        return this.isLimitedCoopRoomAvailable.asObservable();
    }

    get hasNoGameAvailable$() {
        return this.hasNoGameAvailable.asObservable();
    }

    get isGameHistoryReloadNeeded$() {
        return this.isGameHistoryReloadNeeded.asObservable();
    }

    createSoloRoom(playerPayLoad: PlayerData) {
        this.clientSocket.send(RoomEvents.CreateClassicSoloRoom, playerPayLoad);
    }

    createOneVsOneRoom(playerPayLoad: PlayerData): void {
        this.clientSocket.send(RoomEvents.CreateOneVsOneRoom, playerPayLoad);
    }

    createLimitedRoom(playerPayLoad: PlayerData): void {
        this.clientSocket.send(RoomEvents.CreateLimitedRoom, playerPayLoad);
    }

    updateRoomOneVsOneAvailability(gameId: string): void {
        this.clientSocket.send(RoomEvents.UpdateRoomOneVsOneAvailability, gameId);
    }

    checkRoomOneVsOneAvailability(gameId: string): void {
        this.clientSocket.send(RoomEvents.CheckRoomOneVsOneAvailability, gameId);
    }

    deleteCreatedOneVsOneRoom(roomId: string) {
        this.clientSocket.send(RoomEvents.DeleteCreatedOneVsOneRoom, roomId);
    }

    deleteCreatedCoopRoom(roomId: string) {
        this.clientSocket.send(RoomEvents.DeleteCreatedCoopRoom, roomId);
    }

    getJoinedPlayerNames(gameId: string): void {
        this.clientSocket.send(PlayerEvents.GetJoinedPlayerNames, gameId);
    }

    updateWaitingPlayerNameList(playerPayLoad: PlayerData): void {
        this.clientSocket.send(PlayerEvents.UpdateWaitingPlayerNameList, playerPayLoad);
    }

    isPlayerNameIsAlreadyTaken(playerPayLoad: PlayerData): void {
        this.clientSocket.send(PlayerEvents.CheckIfPlayerNameIsAvailable, playerPayLoad);
    }

    refusePlayer(playerPayLoad: PlayerData): void {
        this.clientSocket.send(PlayerEvents.RefusePlayer, playerPayLoad);
    }

    acceptPlayer(gameId: string, roomId: string, playerName: string) {
        this.clientSocket.send(PlayerEvents.AcceptPlayer, { gameId, roomId, playerName });
    }

    cancelJoining(gameId: string): void {
        this.clientSocket.send(PlayerEvents.CancelJoining, gameId);
    }

    checkIfAnyCoopRoomExists(playerPayLoad: PlayerData) {
        this.clientSocket.send(RoomEvents.CheckIfAnyCoopRoomExists, playerPayLoad);
    }

    notifyGameCardCreated() {
        this.clientSocket.send(GameCardEvents.GameCardCreated);
    }

    notifyGameCardDeleted(gameId: string) {
        this.clientSocket.send(GameCardEvents.GameCardDeleted, gameId);
    }

    notifyAllGamesDeleted() {
        this.clientSocket.send(GameCardEvents.AllGamesDeleted);
    }

    notifyResetTopTime(gameId: string) {
        this.clientSocket.send(GameCardEvents.ResetTopTime, gameId);
    }

    notifyResetAllTopTimes() {
        this.clientSocket.send(GameCardEvents.ResetAllTopTimes);
    }

    notifyGameConstantsUpdated() {
        this.clientSocket.send(GameCardEvents.GameConstantsUpdated);
    }

    notifyGamesHistoryDeleted() {
        this.clientSocket.send(GameCardEvents.GamesHistoryDeleted);
    }

    getSocketId(): string {
        return this.clientSocket.socket.id;
    }

    removeAllListeners() {
        this.clientSocket.socket.off();
    }

    handleRoomEvents(): void {
        this.clientSocket.on(RoomEvents.RoomSoloCreated, (roomId: string) => {
            this.roomSoloId.next(roomId);
        });

        this.clientSocket.on(RoomEvents.RoomOneVsOneCreated, (roomId: string) => {
            this.roomOneVsOneId.next(roomId);
        });

        this.clientSocket.on(RoomEvents.RoomLimitedCreated, (roomId: string) => {
            this.roomLimitedId.next(roomId);
        });

        this.clientSocket.on(RoomEvents.RoomOneVsOneAvailable, (availabilityData: RoomAvailability) => {
            this.rooms1V1AvailabilityByGameId.next(availabilityData);
        });

        this.clientSocket.on(RoomEvents.OneVsOneRoomDeleted, (availabilityData: RoomAvailability) => {
            this.rooms1V1AvailabilityByGameId.next(availabilityData);
        });

        this.clientSocket.on(RoomEvents.LimitedCoopRoomJoined, () => {
            this.isLimitedCoopRoomAvailable.next(true);
        });

        this.clientSocket.on(RoomEvents.NoGameAvailable, () => {
            this.hasNoGameAvailable.next(true);
        });

        this.clientSocket.on(PlayerEvents.WaitingPlayerNameListUpdated, (waitingPlayerNameList: string[]) => {
            this.joinedPlayerNames.next(waitingPlayerNameList);
        });

        this.clientSocket.on(PlayerEvents.PlayerNameTaken, (playerNameAvailability: PlayerNameAvailability) => {
            this.playerNameAvailability.next(playerNameAvailability);
        });

        this.clientSocket.on(PlayerEvents.PlayerAccepted, (isAccepted: boolean) => {
            this.isPlayerAccepted.next(isAccepted);
        });

        this.clientSocket.on(PlayerEvents.PlayerRefused, (playerId: string) => {
            this.refusedPlayerId.next(playerId);
        });

        this.clientSocket.on(GameCardEvents.GameDeleted, (gameId: string) => {
            this.deletedGameId.next(gameId);
        });

        this.clientSocket.on(GameCardEvents.RequestReload, () => {
            this.isGameCardsReloadNeeded.next(true);
        });

        this.clientSocket.on(HistoryEvents.RequestReload, () => {
            this.isGameHistoryReloadNeeded.next(true);
        });
    }
}
