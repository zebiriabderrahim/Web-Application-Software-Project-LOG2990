import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ONE_SECOND, TEN_SECONDS } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { filter, interval, Subscription, takeWhile } from 'rxjs';

@Component({
    selector: 'app-joined-player-dialog',
    templateUrl: './joined-player-dialog.component.html',
    styleUrls: ['./joined-player-dialog.component.scss'],
})
export class JoinedPlayerDialogComponent implements OnInit, OnDestroy {
    countdown: number;
    refusedMessage: string;
    private playerNamesSubscription: Subscription;
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
    }

    cancelJoining() {
        this.roomManagerService.cancelJoining(this.data.gameId);
    }

    handleRefusedPlayer() {
        this.roomManagerService.refusedPlayerId$.pipe(filter((playerId) => playerId === this.roomManagerService.getSocketId())).subscribe(() => {
            this.countDownBeforeClosing('Vous avez été refusé');
        });
    }

    handleAcceptedPlayer() {
        this.acceptedPlayerSubscription = this.roomManagerService.roomId$.subscribe((roomId) => {
            if (roomId) {
                this.dialogRef.close();
                this.router.navigate(['/game']);
            }
        });
    }

    countDownBeforeClosing(message: string) {
        this.countdown = TEN_SECONDS;
        const countdown$ = interval(ONE_SECOND).pipe(takeWhile(() => this.countdown > 0));
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

    handleGameCardDelete() {
        this.deletedGameIdSubscription = this.roomManagerService.deletedGameId$.subscribe(() => {
            this.countDownBeforeClosing('La fiche de jeu a été supprimée');
        });
    }

    ngOnDestroy(): void {
        this.playerNamesSubscription?.unsubscribe();
        this.countdownSubscription?.unsubscribe();
        this.acceptedPlayerSubscription?.unsubscribe();
        this.deletedGameIdSubscription?.unsubscribe();
        this.roomAvailabilitySubscription?.unsubscribe();
    }
}
