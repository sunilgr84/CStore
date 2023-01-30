import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldInventoryComponent } from './sold-inventory.component';

describe('SoldInventoryComponent', () => {
  let component: SoldInventoryComponent;
  let fixture: ComponentFixture<SoldInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoldInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoldInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
