import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { DetailCellRenderer } from '@shared/component/expandable-grid/partials/detail-cell-renderer.component';

@Component({
  selector: 'app-to-pos',
  templateUrl: './to-pos.component.html',
  styleUrls: ['./to-pos.component.scss']
})
export class ToPosComponent implements OnInit {
  isAddCompany: any;
  hederTitle: any;
  rowData: any;
  gridOptions: any;
  gridApi: any;
  gridColumnApi: any;
  filterText: string;
  detailCellRenderer: any;
  columnDefs: any;
  filterTypes = [
    { name: 'Items In Error', value: 0 },
  ];
  selectedFilterType: any;
  rowClassRules: any;

  @ViewChild('dataToPOSGrid') dataToPOSGrid: any;
  constructor(private spinner: NgxSpinnerService, private gridService: GridService,
    private dataService: SetupService, private logger: LoggerService, private constants: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.dataToPOSGrid);
    this.detailCellRenderer = DetailCellRenderer;
  }
  ngOnInit() {
    this.getDataToPOS();
    this.columnDefs = this.gridOptions.columnDefs;
    this.setRowColor();
  }

  setRowColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data.noOfItemInError === 0) {
        return { background: 'red' };
      }
    };
  }

  getDataToPOS() {
    this.spinner.show();
    this.dataService.getData('StoreLocationSyncStaus/getAllStoreByCompanyWithNoOfItems')
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
          this.gridApi.sizeColumnsToFit();
        }
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
    // this.totalPageCount = this.gridApi.rowModel.getRowCount();
  }

  filterDataToPOS() {
    if (this.selectedFilterType && this.selectedFilterType.value === 0) {
      var noOfItemInErrorFilterComponent = this.gridApi.getFilterInstance('noOfItemInError');
      noOfItemInErrorFilterComponent.setModel({
        type: 'greaterThan',
        filter: 0,
        filterTo: null
      });
      this.gridApi.onFilterChanged();
    } else {
      var noOfItemInErrorFilterComponent = this.gridApi.getFilterInstance('noOfItemInError');
      noOfItemInErrorFilterComponent.setModel(null);
      this.gridApi.onFilterChanged();
    }
  }

}
