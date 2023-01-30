import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotterySalesReportComponent } from './lottery-sales-report.component';

describe('LotterySalesReportComponent', () => {
  let component: LotterySalesReportComponent;
  let fixture: ComponentFixture<LotterySalesReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotterySalesReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotterySalesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
