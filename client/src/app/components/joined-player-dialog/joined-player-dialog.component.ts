import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { COUNTDOWN_TIME, WAITING_TIME } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { Subscription, filter, interval, takeWhile } from 'rxjs';

@Component({
    selector: 'app-joined-player-dialog',
    templateUrl: './joined-player-dialog.component.html',
    styleUrls: ['./joined-player-dialog.component.scss'],
})
export class JoinedPlayerDialogComponent implements OnInit, OnDestroy {
    countdown: number;
    refusedMessage: string;
    private countdownSubscription: Subscription;
    private acceptedPlayerSubscription: Subscription;
    private deletedGameIdSubscription: Subscription;
    private roomAvailabilitySubscription: Subscription;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: { gameId: string; player: string },
        private readonly roomManagerService: RoomManagerService,
        private dialogRef: MatDialogRef<JoinedPlayerDialogComponent>,
        private readonly router: Router,
    ) {}

    ngOnInit(): void {
        this.handleRefusedPlayer();
        this.handleAcceptedPlayer();
        this.handleGameCardDelete();
        this.handleCreateUndoCreation();
    }

    cancelJoining() {
        this.roomManagerService.cancelJoining(this.data.gameId);
    }

    ngOnDestroy(): void {
        this.countdownSubscription?.unsubscribe();
        this.acceptedPlayerSubscription?.unsubscribe();
        this.deletedGameIdSubscription?.unsubscribe();
        this.roomAvailabilitySubscription?.unsubscribe();
    }

    private handleRefusedPlayer() {
        this.roomManagerService.refusedPlayerId$.pipe(filter((playerId) => playerId === this.roomManagerService.getSocketId())).subscribe(() => {
            this.countDownBeforeClosing('Vous avez été refusé');
        });
    }

    private handleAcceptedPlayer() {
        this.acceptedPlayerSubscription = this.roomManagerService.isPlayerAccepted$.subscribe((isPlayerAccepted) => {
            if (isPlayerAccepted) {
                this.dialogRef.close();
                this.router.navigate(['/game']);
            }
        });
    }

    private countDownBeforeClosing(message: string) {
        this.countdown = COUNTDOWN_TIME;
        const countdown$ = interval(WAITING_TIME).pipe(takeWhile(() => this.countdown > 0));
        const countdownObserver = {
            next: () => {
                this.countdown--;
                this.refusedMessage = `${message}. Vous serez redirigé dans ${this.countdown} secondes`;
            },
            complete: () => {
                this.dialogRef.close();
            },
        };
        this.countdownSubscription = countdown$.subscribe(countdownObserver);
    }

    private handleGameCardDelete() {
        this.deletedGameIdSubscription = this.roomManagerService.deletedGameId$.subscribe(() => {
            this.countDownBeforeClosing('La fiche de jeu a été supprimée');
        });
    }

    private handleCreateUndoCreation() {
        this.roomAvailabilitySubscription = this.roomManagerService.oneVsOneRoomsAvailabilityByRoomId$
            .pipe(filter((roomAvailability) => roomAvailability.gameId === this.data.gameId && !roomAvailability.isAvailableToJoin))
            .subscribe(() => {
                this.countDownBeforeClosing('Vous avez été refusé');
            });
    }
}
