import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTxnReportComponent } from './item-txn-report.component';

describe('ItemTxnReportComponent', () => {
  let component: ItemTxnReportComponent;
  let fixture: ComponentFixture<ItemTxnReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemTxnReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemTxnReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
