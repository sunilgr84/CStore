import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceGroup2Component } from './price-group2.component';

describe('PriceGroup2Component', () => {
  let component: PriceGroup2Component;
  let fixture: ComponentFixture<PriceGroup2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceGroup2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceGroup2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
