import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { DetailCellRenderer } from '@shared/component/expandable-grid/partials/detail-cell-renderer.component';


@Component({
  selector: 'app-from-pos',
  templateUrl: './from-pos.component.html',
  styleUrls: ['./from-pos.component.scss']
})
export class FromPosComponent implements OnInit {
  hederTitle: any;
  isAddCompany: any;
  rowData: any;
  gridOptions: any;
  gridApi: any;
  gridColumnApi: any;
  filterText: string;
  detailCellRenderer: any;
  columnDefs: any;
  @ViewChild('dataFromPOSGrid') dataFromPOSGrid: any;
  constructor(private spinner: NgxSpinnerService, private gridService: GridService,
    private dataService: SetupService, private logger: LoggerService, private constants: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.dataFromPOSGrid);
    this.gridOptions.isSuppressMenu = true;
    this.detailCellRenderer = DetailCellRenderer;
  }
  ngOnInit() {
    this.getDataFromPOS();
    this.columnDefs = this.gridOptions.columnDefs;
  }

  getDataFromPOS() {
    this.spinner.show();
    this.dataService.getData('StoreLocationSyncStaus/GetvwDownloadStatus')
      .subscribe((response) => {
        this.rowData = response;
        if (this.rowData.length > 0) {
          setTimeout(() => {
            this.gridApi.forEachNode(function (rowNode) {
              if (rowNode.group) {
                rowNode.setExpanded(true);
              }
            });

          }, 0);
        }
        this.gridApi.sizeColumnsToFit();
        this.spinner.hide();
      });
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.expandAll();
    params.api.sizeColumnsToFit();
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
    if (this.gridApi.getDisplayedRowCount() === 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
    // this.totalPageCount = this.gridApi.rowModel.getRowCount();
  }

}
