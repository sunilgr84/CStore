import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetTimeoffComponent } from './timesheet-timeoff.component';

describe('TimesheetTimeoffComponent', () => {
  let component: TimesheetTimeoffComponent;
  let fixture: ComponentFixture<TimesheetTimeoffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetTimeoffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetTimeoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
