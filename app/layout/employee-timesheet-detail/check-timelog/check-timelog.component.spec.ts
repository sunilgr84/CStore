import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckTimelogComponent } from './check-timelog.component';

describe('CheckTimelogComponent', () => {
  let component: CheckTimelogComponent;
  let fixture: ComponentFixture<CheckTimelogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckTimelogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckTimelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
