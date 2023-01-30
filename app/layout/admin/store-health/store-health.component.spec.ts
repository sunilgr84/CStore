import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreHealthComponent } from './store-health.component';

describe('StoreHealthComponent', () => {
  let component: StoreHealthComponent;
  let fixture: ComponentFixture<StoreHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
