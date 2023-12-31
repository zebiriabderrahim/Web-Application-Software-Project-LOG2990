import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { GameDetails } from '@app/interfaces/game-interfaces';
import { ImageSources } from '@app/interfaces/image-sources';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { ImageService } from '@app/services/image-service/image.service';
import { Coordinate } from '@common/coordinate';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'app-creation-game-dialog',
    templateUrl: './creation-game-dialog.component.html',
    styleUrls: ['./creation-game-dialog.component.scss'],
})
export class CreationGameDialogComponent implements OnInit {
    @ViewChild('differenceCanvas', { static: true }) differenceCanvas: ElementRef;
    gameName: string;
    gameNameForm: FormGroup;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        private readonly communicationService: CommunicationService,
        private readonly imageService: ImageService,
        private readonly differenceService: DifferenceService,
        private readonly dialogRef: MatDialogRef<CreationPageComponent>,
        @Inject(MAT_DIALOG_DATA) public radius: number,
    ) {
        this.gameName = '';
        this.gameNameForm = new FormGroup({
            name: new FormControl('', [Validators.required, Validators.pattern(/^\S*$/)], [this.validateGameName.bind(this)]),
        });
    }

    get displayDifferences(): number {
        return this.differenceService.getNumberOfDifferences();
    }

    ngOnInit(): void {
        this.differenceCanvas.nativeElement.width = IMG_WIDTH;
        this.differenceCanvas.nativeElement.height = IMG_HEIGHT;
        const differences = this.differenceService.generateDifferences(this.imageService.generateGamePixels(), this.radius);
        const differenceContext = this.differenceCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.imageService.drawDifferences(differenceContext, differences);
    }

    isNumberOfDifferencesValid(): boolean {
        return this.differenceService.isNumberOfDifferencesValid();
    }

    submitForm() {
        if (this.gameNameForm.valid && this.gameNameForm.value.name) {
            const differences: Coordinate[][] = this.differenceService.generateDifferencesPackages();
            const imageSources: ImageSources = this.imageService.getImageSources();
            const gameDetails: GameDetails = {
                name: this.gameNameForm.value.name,
                originalImage: imageSources.left,
                modifiedImage: imageSources.right,
                nDifference: differences.length,
                differences,
                isHard: this.differenceService.isGameHard(),
            };
            this.dialogRef.close(gameDetails);
            this.imageService.resetBackground(CanvasPosition.Both);
        }
    }

    private validateGameName(control: AbstractControl): Observable<{ [key: string]: unknown } | null> {
        const name = control.value;
        return this.communicationService.verifyIfGameExists(name).pipe(map((gameExists) => (gameExists ? { gameExists: true } : null)));
    }
}
