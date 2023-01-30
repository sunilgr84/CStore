import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelProfitComponent } from './fuel-profit.component';

describe('FuelProfitComponent', () => {
  let component: FuelProfitComponent;
  let fixture: ComponentFixture<FuelProfitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuelProfitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelProfitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
