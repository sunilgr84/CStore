import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';

@Component({
  selector: 'app-department-history',
  templateUrl: './department-history.component.html',
  styleUrls: ['./department-history.component.scss']
})
export class DepartmentHistoryComponent implements OnInit {

  gridApi: any;
  columnApi: any;

  gridOptions: any;

  rowData: any;

  showLocation = false;

  // chart
  public chartData: Array<any> = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
    { data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C' }
  ];

  public chartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public chartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public chartOptions: any = {
    responsive: true
  };
  public chartLegend = true;
  public chartType = 'bar';

  constructor(private _fb: FormBuilder, private gridService: GridService, private constants: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.departmentHistoryGrid);
  }

  ngOnInit() {

    this.rowData = [
      { storeName: 'Alibaba' },
      { storeName: 'Alibaba' },
      { storeName: 'Alibaba' },
      { storeName: 'Alibaba' },
      { storeName: 'Alibaba' },
    ];
  }


  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  changeChartType(chartType: string) {
    this.chartType = chartType;
  }
}
