import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartRangeSelectorComponent } from './line-chart-range-selector.component';

describe('LineChartRangeSelectorComponent', () => {
  let component: LineChartRangeSelectorComponent;
  let fixture: ComponentFixture<LineChartRangeSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartRangeSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartRangeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
