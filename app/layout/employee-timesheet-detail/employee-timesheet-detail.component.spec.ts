import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTimesheetDetailComponent } from './employee-timesheet-detail.component';

describe('EmployeeTimesheetDetailComponent', () => {
  let component: EmployeeTimesheetDetailComponent;
  let fixture: ComponentFixture<EmployeeTimesheetDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeTimesheetDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTimesheetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
