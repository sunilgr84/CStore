import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelInventoryComponent } from './fuel-inventory.component';

describe('FuelInventoryComponent', () => {
  let component: FuelInventoryComponent;
  let fixture: ComponentFixture<FuelInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuelInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
