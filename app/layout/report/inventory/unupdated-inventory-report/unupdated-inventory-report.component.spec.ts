import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnupdatedInventoryReportComponent } from './unupdated-inventory-report.component';

describe('UnupdatedInventoryReportComponent', () => {
  let component: UnupdatedInventoryReportComponent;
  let fixture: ComponentFixture<UnupdatedInventoryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnupdatedInventoryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnupdatedInventoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
