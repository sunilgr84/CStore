import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreGroupComponent } from './store-group.component';

describe('StoreGroupComponent', () => {
  let component: StoreGroupComponent;
  let fixture: ComponentFixture<StoreGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
