import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { TestService } from '@shared/services/test/test.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-dashboard-setting',
  templateUrl: './dashboard-setting.component.html',
  styleUrls: ['./dashboard-setting.component.scss']
})
export class DashboardSettingComponent implements OnInit {
  functionalGridOptions: any;
  functionalRowData = [];
  nonFunctionalGridOptions: any;
  nonFunctionalRowData: any[];
  nonFunctionalGridApi: any;
  functionalGridApi: any;
  rowIdSequence: any;
  filterText: any;
  userInfo: any;
  constructor(private gridService: GridService, private constantsService: ConstantService,
    private toastr: ToastrService, private setupService: SetupService, private spinner: NgxSpinnerService) {
    this.functionalGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.dashboardSettingGrid);
    this.nonFunctionalGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.dashboardSettingNonFunGrid);
    this.userInfo = this.constantsService.getUserInfo();
  }

  ngOnInit() {
    this.getWidgetByModuleId();
    this.GetWidgetByUserAndModule();
  }
  onGridReady(params) {
    this.functionalGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onNonFunGridReady(params) {
    this.nonFunctionalGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  addItem(params) {
    if (params.data) {
      const postData = {
        userWidgetID: 0,
        userId: this.userInfo.userId,
        widgetID: params.data.widgetId
      };
      this.spinner.show();
      this.setupService.postData('UserWidgets', postData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res.userWidgetID) {
            this.toastr.success(this.constantsService.infoMessages.addedRecord, 'Success');
            this.getWidgetByModuleId();
            this.GetWidgetByUserAndModule();
          } else {
            this.toastr.error(this.constantsService.infoMessages.addRecordFailed, 'error');

          }
        }, (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
    }
  }
  deleteRecord(params) {
    if (params && params.data) {
      this.spinner.show();
      this.setupService.deleteData(`UserWidgets/Delete/${this.userInfo.userId}/${params.data.widgetId}`).subscribe(
        (res) => {
          this.spinner.hide();
          console.log(res);
          if (res && Number(res) > 0) {
            this.toastr.success(this.constantsService.infoMessages.deletedRecord, 'success');
            this.getWidgetByModuleId();
            this.GetWidgetByUserAndModule();
          } else {
            this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, 'error');
          }

        }, (err) => {
          this.spinner.hide();
          console.log(err);
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, 'error');
        }
      );
    }
  }
  getRowData() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.nonFunctionalGridApi && this.nonFunctionalGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.nonFunctionalRowData = arr;
  }

  getWidgetByModuleId() {
    this.spinner.show();
    this.setupService.getData(`ModuleConfig/GetWidgetNotBelongToUserAndModule/${this.userInfo.userId}/1002`)
      .subscribe((response) => {
        this.spinner.hide();
        if (response) {
          this.functionalRowData = response;
          setTimeout(() => {
            this.functionalGridApi.forEachNode(function (rowNode) {
              if (rowNode.group) {
                rowNode.setExpanded(true);
              }
            });
          }, 500);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  GetWidgetByUserAndModule() {
    this.spinner.show();
    this.setupService.getData(`ModuleConfig/GetWidgetByUserAndModule/${this.userInfo.userId}/1002`)
      .subscribe((response) => {
        this.spinner.hide();
        if (response) {
          this.nonFunctionalRowData = response;
          setTimeout(() => {
            this.nonFunctionalGridApi.forEachNode(function (rowNode) {
              if (rowNode.group) {
                rowNode.setExpanded(true);
              }
            });
          }, 500);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

}
