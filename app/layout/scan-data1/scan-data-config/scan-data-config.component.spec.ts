import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanDataConfigComponent } from './scan-data-config.component';

describe('ScanDataConfigComponent', () => {
  let component: ScanDataConfigComponent;
  let fixture: ComponentFixture<ScanDataConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScanDataConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanDataConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
