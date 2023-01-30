import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { AccountDetailCellRenderer } from '@shared/component/expandable-grid/partials/account-detail-cell-renderer.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss'],
  animations: [routerTransition()]
})
export class VendorComponent implements OnInit {
  getRowNodeId;
  editRowData: any[];
  vendorID = 0;
  rowData: any[];
  itemRowData: any = [];
  gridOptions: GridOptions;
  editGridOptions: GridOptions;
  gridApi: any;
  gridItemApi: any;
  isShow = false;
  isEdit = false;
  title = '';
  filterText: '';
  detailCellRenderer: any;
  userInfo = this.constantService.getUserInfo();
  constructor(private gridService: GridService, private constantService: ConstantService,
    private itemsService: SetupService, private toastr: ToastrService,
    private spinner: NgxSpinnerService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.vendorGrid);
    this.detailCellRenderer = AccountDetailCellRenderer;
    this.getRowNodeId = function (data) {
      return data.vendorID;
    };
  }

  ngOnInit() {

  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
    // this.totalPageCount = this.gridApi.rowModel.getRowCount();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.getVendorList();
  }

  setRowData(updateddata) {
    if (updateddata.addNew) {
      this.gridApi.updateRowData({
        add: [updateddata]
      });
    } else {
      var rowNode = this.gridApi.getRowNode(updateddata.vendorID);
      rowNode.setData(updateddata);
    }
  }

  getVendorList() {
    this.spinner.show();
    this.itemsService.getData('Vendor/getAll/' + this.userInfo.companyId).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.rowData = [];
          return;
        }
        this.rowData = _.sortBy(response, [function (o) { return o.vendorName.toLowerCase(); }]);;
      }, (error) => {
        console.log(error);
      }
    );
  }

  backToList(updateddata) {
    this.editRowData = null;
    this.isShow = false;
    if (updateddata)
      this.setRowData(updateddata);
    else
      this.getVendorList();
  }
  editenableTabs(event) {
    if (event && event.data) {
      this.editRowData = event.data;
      this.vendorID = event.data.vendorID;
      this.isEdit = true;
    }
    this.isEdit = event.isDisabledTab;
  }
  reset() {
    this.editRowData = null;
  }
  addNew(isAdd) {
    this.reset();
    this.isEdit = false;
    this.isShow = isAdd;
  }
  cancelEvent(e) {
    this.isEdit = false;
    this.isShow = false;
  }
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  editAction(params) {
    this.gotoTop();
    this.editRowData = this.gridApi.getRowNode(params.data.vendorID).data
    this.vendorID = params.data.vendorID;
    this.isEdit = true;
    this.isShow = true;
  }

  deleteAction(params) {
    this.spinner.show();
    this.itemsService.deleteData(`Vendor?id=${params.data.vendorID}`).
      subscribe((response: any) => {
        if (response) {
          this.spinner.hide();
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.rowData = this.rowData.filter(r => r.vendorID !== params.data.vendorID);
        } else {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      });
  }

}
