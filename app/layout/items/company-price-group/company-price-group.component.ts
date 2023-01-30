import { Component, OnInit, ViewChild } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-company-price-group',
  templateUrl: './company-price-group.component.html',
  styleUrls: ['./company-price-group.component.scss'],

})
export class CompanyPriceGroupComponent implements OnInit {
  rowData: any;
  gridOptions: GridOptions;
  gridApi: any;
  selectedCompanyPriceGroup: any;
  userInfo = this.constantService.getUserInfo();
  filterText: any;
  isDisplay = false;
  childParams: any;
  constructor(private gridService: GridService, private constantService: ConstantService, private spinner: NgxSpinnerService,
    private setupService: SetupService, private toastr: ToastrService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.companyPriceGroupGrid);

  }

  ngOnInit() {
    this.getCompanyPriceGroup();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onModelUpdated($event) {
    if (this.gridApi && this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    }
    if (this.gridApi && this.gridApi.rowModel.rowsToDisplay.length > 0) {
      this.gridApi.hideOverlay();
    }
  }

  addPriceGroup() {
    this.selectedCompanyPriceGroup = null;
    this.isDisplay = !this.isDisplay;
  }
  getCompanyPriceGroup() {
    this.spinner.show()
    this.setupService.getData('CompanyPriceGroup/getByCompanyID/' + this.userInfo.companyId).subscribe(
      (res) => {
        this.rowData = res;
        this.rowData.forEach(element => {
          if (element.FromAPI) {
            element.CompanyPriceGroupName += " (Altria)"
          }
        });
        this.spinner.hide()
      }, (error) => {
        this.spinner.hide()
        console.log(error);
      }
    );
  }
  edit(params) {
    this.selectedCompanyPriceGroup = {};
    setTimeout(() => {
      this.isDisplay = true;
      this.selectedCompanyPriceGroup = params.data;
    }, 100);
  }
  showAdd(params) {
    this.selectedCompanyPriceGroup = null;
    this.isDisplay = false;
  }
  delete(params) {
    this.spinner.show();
    this.setupService.deleteData('CompanyPriceGroup?id=' + params.data.CompanyPriceGroupID).subscribe((res) => {
      this.spinner.hide();
      if (res === '1') {
        this.getCompanyPriceGroup();
        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
      } else {
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
    }
    );
  }
  childAction(params) {
    this.childParams = null;
    setTimeout(() => {
      this.childParams = params;
    }, 10);
    //params.data.demoFlag = true;
    /*   this.gridOptions.getRowStyle = function (params) {
        if (params.data.demoFlag) {
          return { background: 'red' };
        }
      };
       this.gridOptions.rowStyle = {background: 'coral'};
      */

  }
  onColumnResized(params) {
    if (params.source === 'uiColumnDragged' && params.finished) {
      this.gridApi.sizeColumnsToFit();
    }
  }
  refreshParent(event) {
    let selectedRowNode = this.gridApi.getRowNode(event.currentValue.node.id);
    let updatedCount = event.updatedItemsCount ? event.updatedItemsCount: 0;
    selectedRowNode.data.NOOfItems = Number(selectedRowNode.data.NOOfItems) + updatedCount;
    selectedRowNode.setData(selectedRowNode.data);
    // this.getCompanyPriceGroup();
  }
}
