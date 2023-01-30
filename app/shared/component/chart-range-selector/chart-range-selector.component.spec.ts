import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartRangeSelectorComponent } from './chart-range-selector.component';

describe('ChartRangeSelectorComponent', () => {
  let component: ChartRangeSelectorComponent;
  let fixture: ComponentFixture<ChartRangeSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartRangeSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartRangeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
