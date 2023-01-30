import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanDataAcknowledgmentComponent } from './scan-data-acknowledgment.component';

describe('ScanDataAcknowledgmentComponent', () => {
  let component: ScanDataAcknowledgmentComponent;
  let fixture: ComponentFixture<ScanDataAcknowledgmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScanDataAcknowledgmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanDataAcknowledgmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
