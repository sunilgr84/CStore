import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboDealsComponent } from './combo-deals.component';

describe('ComboDealsComponent', () => {
  let component: ComboDealsComponent;
  let fixture: ComponentFixture<ComboDealsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboDealsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboDealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
