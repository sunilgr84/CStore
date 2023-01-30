import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultiPacksComponent } from './add-multi-packs.component';

describe('AddMultiPacksComponent', () => {
  let component: AddMultiPacksComponent;
  let fixture: ComponentFixture<AddMultiPacksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMultiPacksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMultiPacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
