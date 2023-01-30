import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayReconDetailsComponent } from './day-recon-details.component';

describe('DayReconDetailsComponent', () => {
  let component: DayReconDetailsComponent;
  let fixture: ComponentFixture<DayReconDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayReconDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayReconDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
