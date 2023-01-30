import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceGroup1Component } from './price-group1.component';

describe('PriceGroup1Component', () => {
  let component: PriceGroup1Component;
  let fixture: ComponentFixture<PriceGroup1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceGroup1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceGroup1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
