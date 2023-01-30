import { Component, OnInit, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { BaseChartDirective, Color } from 'ng2-charts';
import { ChartOptions, ChartDataSets } from 'chart.js';

@Component({
  selector: 'app-chart-range-selector',
  templateUrl: './chart-range-selector.component.html',
  styleUrls: ['./chart-range-selector.component.scss']
})
export class ChartRangeSelectorComponent implements OnChanges {

  @Input() lineChartItemLabels: any[] = [];
  // ['2020-02-27', '2020-02-28', '2020-02-29', '02-27', 'May', 'June', 'July']
  @Input() lineChartItemData: ChartDataSets[] = [];
  @Output() chartRangeSelected = new EventEmitter<{ startRange: string, endRange: string }>();
  lineChartItemColors: Color[] = [
    { // orange
      backgroundColor: '#f3a563',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  canvas: any;
  chartContainer: any;
  startIndex: any;
  overlay: any;
  selectionContext: any;
  selectionRect: any;
  drag: any;

  constructor() { }

  @ViewChild(BaseChartDirective, {}) chart: BaseChartDirective;
  public lineChartLegend = true;
  public lineChartType = 'bar';
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: false,
    // legend.display = false;
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [{}]
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.lineChartItemLabels.firstChange && !changes.lineChartItemData.firstChange) {
      if (changes.lineChartItemLabels.previousValue.length > 0 && changes.lineChartItemData.previousValue.length > 0) {
        this.reloadChart();
      }
      setTimeout(() => {
        this.loadOverlayCanvas();
      }, 20);
    }
  }

  loadOverlayCanvas() {
    if (!this.chart)
      return;
    this.canvas = this.chart.chart.canvas;
    this.chartContainer = this.chart.chart;
    this.overlay = document.getElementById('overlay');
    this.startIndex = 0;
    this.overlay.width = this.chartContainer.width;
    this.overlay.height = this.chartContainer.height;
    this.selectionContext = this.overlay.getContext('2d');
    this.selectionRect = {
      w: 0,
      startX: 0,
      startY: 0,
      area: 0
    };
    this.drag = false;
    this.canvas.addEventListener('pointerdown', evt => {
      // this.selectionContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const points = this.chartContainer.getElementsAtEventForMode(evt, 'index', {
        intersect: false
      });
      this.startIndex = points[0]._index;
      const rect = this.canvas.getBoundingClientRect();
      this.selectionRect.startX = evt.clientX - rect.left;
      this.selectionRect.startY = this.chartContainer.chartArea.top;
      this.drag = true;
      // save points[0]._index for filtering
    });
    this.canvas.addEventListener('pointermove', evt => {
      const rect = this.canvas.getBoundingClientRect();
      if (this.drag) {
        const rect = this.canvas.getBoundingClientRect();
        this.selectionRect.w = (evt.clientX - rect.left) - this.selectionRect.startX;
        this.selectionContext.globalAlpha = 0.5;
        this.selectionContext.clearRect(0, 0, this.chartContainer.width, this.chartContainer.height);
        this.selectionContext.fillRect(this.selectionRect.startX,
          this.selectionRect.startY,
          this.selectionRect.w,
          this.chartContainer.chartArea.bottom - this.chartContainer.chartArea.top);
        this.selectionRect.area = this.chartContainer.chartArea.bottom - this.chartContainer.chartArea.top;
      } else {
        this.selectionContext.clearRect(0, 0, this.chartContainer.width, this.chartContainer.height);
        var x = evt.clientX - rect.left;
        if (x > this.chartContainer.chartArea.left) {
          this.selectionContext.fillRect(x,
            this.chartContainer.chartArea.top,
            1,
            this.chartContainer.chartArea.bottom - this.chartContainer.chartArea.top);
        }
        if (this.selectionRect.area > 0) {
          this.selectionContext.fillRect(this.selectionRect.startX,
            this.selectionRect.startY,
            this.selectionRect.w,
            this.selectionRect.area);
        }
      }
    });
    this.canvas.addEventListener('pointerup', evt => {
      const rect = this.canvas.getBoundingClientRect();
      const points = this.chartContainer.getElementsAtEventForMode(evt, 'index', {
        intersect: false
      });
      this.drag = false;
      this.chartRangeSelected.emit({
        startRange: this.lineChartItemLabels[this.startIndex],
        endRange: this.lineChartItemLabels[points[0]._index]
      });
    });
  }

  reloadChart() {
    if (this.chart !== undefined) {
      this.chart.chart.destroy();
      this.chart.chart = 0;
      this.chart.datasets = this.lineChartItemData;
      this.chart.labels = this.lineChartItemLabels;
      this.chart.ngOnInit();
    }
  }
}
