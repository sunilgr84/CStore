import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceGroupDetailsComponent } from './price-group-details.component';

describe('PriceGroupDetailsComponent', () => {
  let component: PriceGroupDetailsComponent;
  let fixture: ComponentFixture<PriceGroupDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceGroupDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceGroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
