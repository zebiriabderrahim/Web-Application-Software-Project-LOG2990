import { Component } from '@angular/core';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
    readonly selectionRoute: string;
    readonly configRoute: string;
    readonly homeRoute: string;
    readonly limitedRoute: string;

    constructor() {
        this.selectionRoute = '/selection';
        this.configRoute = '/config';
        this.homeRoute = '/home';
        this.limitedRoute = '/limited';
    }
}
