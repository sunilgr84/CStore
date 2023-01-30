import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustTimelogComponent } from './adjust-timelog.component';

describe('AdjustTimelogComponent', () => {
  let component: AdjustTimelogComponent;
  let fixture: ComponentFixture<AdjustTimelogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustTimelogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustTimelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
