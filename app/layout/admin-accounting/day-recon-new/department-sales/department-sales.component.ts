import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';

@Component({
  selector: 'day-recon-department-sales',
  templateUrl: 'department-sales.component.html',
  styleUrls: ['./dapartment-sales.component.scss']
})
export class DepartmentSalesComponent implements OnInit {
  @Input() isOpen: boolean = true;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() deptDetailrowData: any = [];
  @Input() deprttotalAmount: any;
  gridDetailOptions: any;
  gridApi: any;
  deptDetailgridOptions: any;
  deptGridApi: any;

  showDetailsTable: any = false;
  detailTableData: any;

  constructor(
    private gridService: GridService,
    private constantsService: ConstantService) {
    this.deptDetailgridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.dayReconGrid);
    this.gridDetailOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.detailTableGrid
    );
  }

  ngOnInit() {
    this.checkValue();

  }
  
  checkValue() {
    setInterval(() => {
      if(sessionStorage.getItem('showDetailsTable')) {
        this.showDetailsTable = sessionStorage.getItem('showDetailsTable');
        if (sessionStorage.getItem('showDetailsTable') == 'true' && sessionStorage.getItem('detailTableData')) {
          this.detailTableData = JSON.parse(sessionStorage.getItem('detailTableData'));
        }
      }
    }, 1000)
  }

  onDialogClose(e: any) {
    this.onClose.emit('department-sales');
    sessionStorage.setItem('showDetailsTable', 'false');
    sessionStorage.removeItem('detailTableData');
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  deptOnGridReady(params) {
    this.deptGridApi = params.api;
    
    if (this.deptDetailrowData && this.deptDetailrowData.length > 0) {
      this.deptGridApi.forEachNode(function (rowNode) {
        if (rowNode.group) {
          rowNode.setExpanded(true);
        }
      });
      this.deptGridApi.expandAll();
    }
    this.deptGridApi.sizeColumnsToFit();
  }
}
