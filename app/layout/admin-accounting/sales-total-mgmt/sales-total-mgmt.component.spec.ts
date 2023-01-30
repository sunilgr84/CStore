import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTotalMgmtComponent } from './sales-total-mgmt.component';

describe('SalesTotalMgmtComponent', () => {
  let component: SalesTotalMgmtComponent;
  let fixture: ComponentFixture<SalesTotalMgmtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesTotalMgmtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesTotalMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
