import { GameService } from '@app/services/game/game.service';
import { HistoryEvents, PlayerStatus } from '@common/enums';
import { GameHistory, GameRoom, PlayerInfo } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class HistoryService {
    private pendingGames: Map<string, GameHistory>;

    constructor(private readonly gameService: GameService) {
        this.pendingGames = new Map<string, GameHistory>();
    }

    createEntry(room: GameRoom) {
        const date = new Date();
        const gameHistory: GameHistory = {
            date: this.getFormattedDate(date),
            startingHour: this.getFormattedTime(date),
            duration: date.getTime(),
            gameMode: room.clientGame.mode,
            player1: {
                name: room.player1.name,
                isWinner: false,
                isQuitter: false,
            },
        };
        if (room.player2) {
            gameHistory.player2 = {
                name: room.player2.name,
                isWinner: false,
                isQuitter: false,
            };
        }
        this.pendingGames.set(room.roomId, gameHistory);
    }

    async closeEntry(roomId: string, server: io.Server) {
        const gameHistory = this.pendingGames.get(roomId);
        if (!gameHistory) return;
        gameHistory.duration = new Date().getTime() - gameHistory.duration;
        this.pendingGames.delete(roomId);
        await this.gameService.saveGameHistory(gameHistory);
        server.emit(HistoryEvents.RequestReload);
    }

    markPlayer(roomId: string, playerName: string, status: PlayerStatus) {
        const gameHistory = this.pendingGames.get(roomId);
        if (!gameHistory) return;
        let playerInfoToChange: PlayerInfo;
        if (gameHistory.player1.name === playerName) {
            playerInfoToChange = gameHistory.player1;
        } else if (gameHistory.player2 && gameHistory.player2.name === playerName) {
            playerInfoToChange = gameHistory.player2;
        }
        if (playerInfoToChange) {
            switch (status) {
                case PlayerStatus.Winner:
                    playerInfoToChange.isWinner = true;
                    break;
                case PlayerStatus.Quitter:
                    playerInfoToChange.isQuitter = true;
                    break;
            }
        }
        this.pendingGames.set(roomId, gameHistory);
    }

    private getFormattedDate(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
    }

    private getFormattedTime(date: Date): string {
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
}