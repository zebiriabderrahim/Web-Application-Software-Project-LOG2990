import { Injectable } from '@angular/core';
import { HARD_DIFFERENCES_PERCENTAGE, N_DIFFERENCES_HARD_GAME } from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH, MAX_N_DIFFERENCES, MIN_N_DIFFERENCES } from '@app/constants/creation-page';
import { Coordinate } from '@app/interfaces/coordinate';
import { GamePixels, Pixel } from '@app/interfaces/pixel';

@Injectable({
    providedIn: 'root',
})
export class DifferenceService {
    private differences: Coordinate[];
    private differencePackages: Coordinate[][];
    private visitedCoordinates: boolean[][];
    private differenceMatrix: boolean[][];

    constructor() {
        this.resetAttributes();
    }

    resetAttributes() {
        this.differences = [];
        this.differencePackages = [];
        this.visitedCoordinates = this.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        this.differenceMatrix = this.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
    }

    createFalseMatrix(width: number, height: number): boolean[][] {
        return new Array(width).fill(false).map(() => new Array(height).fill(false)) as boolean[][];
    }

    isCoordinateValid(coordinate: Coordinate): boolean {
        return coordinate.x >= 0 && coordinate.x < IMG_WIDTH && coordinate.y >= 0 && coordinate.y < IMG_HEIGHT;
    }

    findAdjacentCoords(coord: Coordinate): Coordinate[] {
        const adjacentCoordinates: Coordinate[] = [
            { x: coord.x - 1, y: coord.y - 1 },
            { x: coord.x - 1, y: coord.y },
            { x: coord.x - 1, y: coord.y + 1 },
            { x: coord.x, y: coord.y - 1 },
            { x: coord.x, y: coord.y + 1 },
            { x: coord.x + 1, y: coord.y - 1 },
            { x: coord.x + 1, y: coord.y },
            { x: coord.x + 1, y: coord.y + 1 },
        ];
        return adjacentCoordinates.filter((coordinate) => this.isCoordinateValid(coordinate));
    }

    generateDifferencesPackages(): Coordinate[][] {
        const differences: Coordinate[][] = [];
        this.visitedCoordinates = this.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        for (let i = 0; i < IMG_WIDTH; i++) {
            for (let j = 0; j < IMG_HEIGHT; j++) {
                if (!this.visitedCoordinates[i][j] && this.differenceMatrix[i][j]) {
                    differences.push(this.breadthFirstSearch({ x: i, y: j }));
                }
            }
        }
        this.differencePackages = differences;
        return differences;
    }

    breadthFirstSearch(difference: Coordinate): Coordinate[] {
        const queue: Coordinate[] = [];
        const currentDifference: Coordinate[] = [];
        let activeDifference: Coordinate;
        currentDifference.push(difference);
        this.visitedCoordinates[difference.x][difference.y] = true;
        queue.push(difference);
        while (queue.length !== 0) {
            activeDifference = queue.pop() as Coordinate;
            for (const coord of this.findAdjacentCoords(activeDifference as Coordinate)) {
                if (!this.visitedCoordinates[coord.x][coord.y] && this.differenceMatrix[coord.x][coord.y]) {
                    this.visitedCoordinates[coord.x][coord.y] = true;
                    currentDifference.push(coord);
                    queue.push(coord);
                }
            }
        }
        return currentDifference;
    }

    generateDifferences(gamePixels: GamePixels, radius: number): Coordinate[] {
        const leftImagePixels = gamePixels.leftImage;
        const rightImagePixels = gamePixels.rightImage;
        this.resetAttributes();
        this.differenceMatrix = this.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        for (let i = 0; i < leftImagePixels.length; i++) {
            if (this.arePixelsDifferent(leftImagePixels[i], rightImagePixels[i])) {
                const x = i % IMG_WIDTH;
                const y = Math.floor(i / IMG_WIDTH);
                this.differences.push({ x, y });
                this.differenceMatrix[x][y] = true;
            }
        }
        this.visitedCoordinates = this.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        this.differences = this.enlargeDifferences(this.differences, radius);
        this.generateDifferencesPackages();
        return this.differences;
    }

    arePixelsDifferent(pixel1: Pixel, pixel2: Pixel): boolean {
        return !(pixel1.red === pixel2.red && pixel1.green === pixel2.green && pixel1.blue === pixel2.blue);
    }

    enlargeDifferences(differenceCoordinates: Coordinate[], radius: number): Coordinate[] {
        const enlargedDifferenceCoordinates: Coordinate[] = [];
        for (const coordinate of differenceCoordinates) {
            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    const largerCoordinate: Coordinate = { x: coordinate.x + i, y: coordinate.y + j };
                    const distance = Math.sqrt(i * i + j * j);
                    if (
                        distance <= radius &&
                        this.isCoordinateValid(largerCoordinate) &&
                        !this.visitedCoordinates[largerCoordinate.x][largerCoordinate.y]
                    ) {
                        enlargedDifferenceCoordinates.push(largerCoordinate);
                        this.visitedCoordinates[largerCoordinate.x][largerCoordinate.y] = true;
                    }
                }
            }
        }
        return enlargedDifferenceCoordinates;
    }

    isNumberOfDifferencesValid(): boolean {
        const nDifferences: number = this.differencePackages.length;
        return nDifferences >= MIN_N_DIFFERENCES && nDifferences <= MAX_N_DIFFERENCES;
    }

    isGameHard(): boolean {
        const differencesPercentage = this.differences.length / (IMG_WIDTH * IMG_HEIGHT);
        return this.differencePackages.length >= N_DIFFERENCES_HARD_GAME && differencesPercentage <= HARD_DIFFERENCES_PERCENTAGE;
    }
}
