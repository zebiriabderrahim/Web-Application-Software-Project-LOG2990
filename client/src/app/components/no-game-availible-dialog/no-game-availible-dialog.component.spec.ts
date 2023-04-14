import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoGameAvailibleDialogComponent } from './no-game-availible-dialog.component';

describe('NoGameAvailibleDialogComponent', () => {
  let component: NoGameAvailibleDialogComponent;
  let fixture: ComponentFixture<NoGameAvailibleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoGameAvailibleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoGameAvailibleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
