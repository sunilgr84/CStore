import { Component, OnInit, Input } from "@angular/core";
import { ConstantService } from "@shared/services/constant/constant.service";
import { GridService } from "@shared/services/grid/grid.service";
import { SetupService } from "@shared/services/setupService/setup-service";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from "@angular/forms";
import { EditableGridService } from "@shared/services/editableGrid/editable-grid.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { StoreService } from "@shared/services/store/store.service";
import * as moment from "moment";

@Component({
  selector: "app-fuel-inventory",
  templateUrl: "./fuel-inventory.component.html",
  styleUrls: ["./fuel-inventory.component.scss"],
})
export class FuelInventoryComponent implements OnInit {
  fueldata = {};
  fuelInventoryData = [];
  fuelInventoryActivityData = [];
  gridApi: any;
  gridOptions: any;
  gridActivityOptions: any;
  rowData: any;
  fuelActivityRowData: any;
  editRowData: any;
  isAddStores: boolean;
  columnDefs: any;
  isHideGrid = false;
  isEdit = true;
  userInfo: any;
  storeLocationId: any;
  storeLocationList: any;
  selectedDateRange: any;
  startDate = moment().format("MM-DD-YYYY");
  endDate = moment().format("MM-DD-YYYY");
  showActivityTable: boolean = false;
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private _setupService: SetupService,
    private editableGrid: EditableGridService,
    private gridService: GridService,
    private constantsService: ConstantService,
    private storeService: StoreService,
    private formBuilder: FormBuilder
  ) {
    this.fueldata = {};
    this.fuelInventoryData = [];
    this.fuelInventoryActivityData = [];
    this.gridActivityOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.fuelInventoryActivityGrid
    );
    this.gridOptions = this.editableGrid.getGridOption(
      this.constantsService.editableGridConfig.gridTypes.fuelInventoryGrid
    );
  }

  ngOnInit() {
    this.userInfo = this.constantsService.getUserInfo();
    this.getStoreLocationDetails();
  }

  getStoreLocationDetails() {
    this.spinner.show();
    this.storeService.getStoresByCompanyId(this.userInfo.companyId).subscribe(
      (response) => {
        this.spinner.hide();
        this.storeLocationList = response;
        if (this.storeLocationList && this.storeLocationList.length === 1) {
          this.storeLocationId = this.storeLocationList[0].storeLocationID;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getDayReconData() {
    this.getFuelInventory();
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.getFuelInventory();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey,
    });
  }

  editOrSave(params: any, isEdit: boolean) {
    if (
      params.data.updatedInventory === "" ||
      params.data.updatedInventory === null ||
      Number(params.data.updatedInventory) === 0
    ) {
      this.toastr.warning("Update Inventory is required");
      this.getStartEditingCell("updatedInventory", params.rowIndex);
      return;
    }

    if (isEdit) {
      console.log("Edit Or Save", params.data);
      const fuelData = params.data;

      const user = window.sessionStorage.getItem("userInfo");
      const userName = JSON.parse(user).userName;
      
      const postData = {
        username: userName,
        adjustmentFuelDetails: [
          {
            adjustableInventory: parseInt(fuelData.updatedInventory),
            fuelInventoryID: fuelData.fuelInventoryID,
          },
        ],
      };

      this.spinner.show();
      console.log("post data", postData);
      this._setupService
        .postData(`FuelInventory/UpdateFuelInventory`, postData)
        .subscribe(
          (response: any) => {
            this.spinner.hide();
            // console.log("Response post data", response);
            if (response && response["statusCode"]) {
              this.toastr.error(
                this.constantsService.infoMessages.updateRecordFailed,
                this.constantsService.infoMessages.error
              );
              return;
            }
            if (response === "1") {
              this.toastr.success(
                this.constantsService.infoMessages.updatedRecord,
                this.constantsService.infoMessages.success
              );
              //this.getFuelInventory();
            } else {
              this.toastr.error(
                this.constantsService.infoMessages.updateRecordFailed,
                this.constantsService.infoMessages.error
              );
            }
          },
          (error) => {
            this.spinner.hide();
            this.getFuelInventory();
            this.toastr.error(
              this.constantsService.infoMessages.updateRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        );
    }

    this.getFuelInventory();
    console.log('get fuel inventory function called')
  }

  getFuelInventory() {
    this.spinner.show();
    this._setupService
      .getData(`FuelInventory/getFuelInventory/${this.storeLocationId}`)
      .subscribe((response) => {
        this.spinner.hide();
          this.rowData = response;
        },
        (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
  }

  getRowValues(event) {
    if (event.colDef.headerName === 'Fuel Grade') {
      this.spinner.show();
      const currFuelGradeId = event.data.fuelGradeID;
      this.showActivityTable = true;

      if ( !this.endDate ) { this.endDate = this.startDate }
      this._setupService
        .getData(`FuelInventory/getFuelGradeStatement/${this.storeLocationId}/${currFuelGradeId}/${this.startDate}/${this.endDate}`)
        .subscribe(response => {
          this.fuelActivityRowData = response;
          this.spinner.hide()
        })
    }
  }

  onSelectionChanged(event) {
    console.log('CHECKBOX EVENT FIRED => ', event)
  }
}
