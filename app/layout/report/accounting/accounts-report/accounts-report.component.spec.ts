import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsReportComponent } from './accounts-report.component';

describe('AccountsReportComponent', () => {
  let component: AccountsReportComponent;
  let fixture: ComponentFixture<AccountsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
