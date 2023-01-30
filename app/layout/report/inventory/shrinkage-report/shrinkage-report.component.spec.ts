import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShrinkageReportComponent } from './shrinkage-report.component';

describe('ShrinkageReportComponent', () => {
  let component: ShrinkageReportComponent;
  let fixture: ComponentFixture<ShrinkageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShrinkageReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShrinkageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
