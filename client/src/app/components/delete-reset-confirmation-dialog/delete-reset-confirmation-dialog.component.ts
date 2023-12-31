import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actions } from '@app/enum/delete-reset-actions';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';

@Component({
    selector: 'app-delete-reset-confirmation-dialog',
    templateUrl: './delete-reset-confirmation-dialog.component.html',
    styleUrls: ['./delete-reset-confirmation-dialog.component.scss'],
})
export class DeleteResetConfirmationDialogComponent {
    actions: typeof Actions;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { actions: Actions; gameId: string },
        private readonly roomManagerService: RoomManagerService,
        private readonly communicationService: CommunicationService,
    ) {
        this.actions = Actions;
    }

    resetAllTopTimes() {
        this.roomManagerService.notifyResetAllTopTimes();
    }

    deleteAllGames() {
        this.communicationService.deleteAllGames().subscribe(() => {
            this.roomManagerService.notifyAllGamesDeleted();
        });
    }

    deleteAllGamesHistory(): void {
        this.communicationService.deleteAllGamesHistory().subscribe(() => {
            this.roomManagerService.notifyGamesHistoryDeleted();
        });
    }

    deleteGameCard() {
        this.communicationService.deleteGameById(this.data.gameId).subscribe(() => {
            this.roomManagerService.notifyGameCardDeleted(this.data.gameId);
        });
    }

    resetTopTime() {
        this.roomManagerService.notifyResetTopTime(this.data.gameId);
    }
}
