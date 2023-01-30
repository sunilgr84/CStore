import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotteryInventoryReportComponent } from './lottery-inventory-report.component';

describe('LotteryInventoryReportComponent', () => {
  let component: LotteryInventoryReportComponent;
  let fixture: ComponentFixture<LotteryInventoryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotteryInventoryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotteryInventoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});