import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingTimeOffComponent } from './setting-time-off.component';

describe('SettingTimeOffComponent', () => {
  let component: SettingTimeOffComponent;
  let fixture: ComponentFixture<SettingTimeOffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingTimeOffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingTimeOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
