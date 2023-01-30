import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridService } from '@shared/services/grid/grid.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-sales-total-mgmt',
  templateUrl: './sales-total-mgmt.component.html',
  styleUrls: ['./sales-total-mgmt.component.scss']
})
export class SalesTotalMgmtComponent implements OnInit {
  @ViewChild('modalInvUpdtCft') modalInvUpdtCft: TemplateRef<any>;
  @ViewChild('modalEdit') modalEdit: TemplateRef<any>;

  inputDate = moment().format('MM-DD-YYYY');
  salesTotalMgmtForm = this.fb.group({
    date: [this.inputDate, Validators.required],
    storeLocationId: ['', Validators.required]
  });
  isLoading: boolean | false;
  storeLocationList: any[];
  storeLocationId;
  userInfo = this.constantService.getUserInfo();
  rowData: any;
  filterText: any;
  gridOptions: any;
  subscription: any;
  closeResult: string;
  private gridApi;
  selectedPeriodList = [];
  list = { "Day Close": 0, "Shift1": 1, "Shift2": 2, "Shift3": 3 };
  periodList = [];
  filteredPeriods = [];
  mergeRow = null;
  mergeList: any[];
  oldRow = null; editedRow: any;
  editList: any[];
  editPeriodChange: boolean | false;
  constructor(private fb: FormBuilder, private storeService: StoreService, private modalService: NgbModal,
    private constantService: ConstantService, private spinner: NgxSpinnerService, private toastr: ToastrService,
    private constant: ConstantService, private dataService: SetupService, private gridService: GridService, private router: Router) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.salesTotalMgmtGrid);
  }

  ngOnInit() {
    this.getStoreLocation();
    // this.storeLocationId = this.constantService.getStoreLocationId();
    // this.subscription = this.storeMessageService.getMessage().subscribe(userInf => {
    //   this.storeLocationId = this.constantService.getStoreLocationId();
    // });
    Object.keys(this.list).forEach((key, index) => {
      this.periodList.push({ text: key, value: this.list[key] });
    })
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  getStoreLocation() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
      if (this.storeService.storeLocation && this.storeService.storeLocation.length === 1) {
        this.salesTotalMgmtForm.get('storeLocationId').setValue(this.storeService.storeLocation[0].storeLocationID);
        this.storeLocationId = this.storeService.storeLocation[0].storeLocationID;
      }
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
        if (this.storeService.storeLocation && this.storeService.storeLocation.length === 1) {
          this.salesTotalMgmtForm.get('storeLocationId').setValue(this.storeService.storeLocation[0].storeLocationID);
          this.storeLocationId = this.storeService.storeLocation[0].storeLocationID;
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  editAction($event) {
    //  this.EditRow(this, $event.rowIndex, this.filteredPeriods)
    this.editedRow = $event.data;
    this.editList = this.periodList.filter((x) => {
      return x.text != this.editedRow.period;
    })
    this.modalService.open(this.modalEdit, { windowClass: 'my-class' });
  }
  changeEditPeriod($event) {
    this.editPeriodChange = true;
    this.editedRow["period"] = $event.target.value;
  }
  editConfirm() {
    /*   if (this.mergeRow == null|| this.oldRow==null||this.rowData.length===1) {
        this.toastr.error("No Rows to Merge");
        return;
      } */
    this.spinner.show();
    this.dataService.postData(`Admin/UpdateSalesTotalManagement?MovementHeaderID=` +
      this.editedRow.movementHeaderID + '&Period=' + this.editedRow.period, {}).subscribe(result => {
        this.spinner.hide();
        if (result && result.statusCode === 400) {
          if (result && result.result) {
            // this.toastr.error(result.result.validationErrors[0].errorMessage);
          }
          return 0;
        }
        if (result) {
          this.cancelUpdtInv();
          this.editedRow = null;
          // this.oldRow = null;
          this.searchSalesReport()
          this.toastr.success("Edited Successfully");
        } else {
          this.toastr.error("Edit failed");
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constant.infoMessages.contactAdmin);
      });
  }
  EditRow(current, _rowIndex, filteredPeriods) {
    let rowNode = this.gridApi.getRowNode(_rowIndex);
    rowNode.data.isEdit = true;
    current.gridApi.redrawRows();
  }

  cloneAction($event) {
    console.log("sbdh");
    if (this.rowData.length === 1) {
      this.toastr.error("No Rows to Merge");
      return;
    }
    this.mergeRow = null;
    this.mergeRow = $event["data"];
    let row = this.mergeRow;
    this.mergeList = this.rowData.filter(function (el) {
      return el.movementHeaderID != row["movementHeaderID"];
    });
    this.mergeList = _.sortBy(this.mergeList, o => {
      if(o.display==="")return null;
      else return o.display;
    });
    this.modalService.open(this.modalInvUpdtCft, { windowClass: 'my-class' });

  }
  changePeriod($event) {
    this.oldRow = null;
    this.oldRow = this.rowData.filter(function (el) {
      return el.movementHeaderID == $event.target.value;
    });
    this.oldRow = this.oldRow[0]
  }

  mergeConfirm() {
    if (this.mergeRow == null || this.oldRow == null || this.rowData.length === 1) {
      this.toastr.error("No Rows to Merge");
      return;
    }
    this.spinner.show();
    this.dataService.postData(`Admin/MergeSalesTotalManagement?oldMovementHeaderID=` +
      this.oldRow.movementHeaderID + '&finalMovementHeaderID=' + this.mergeRow.movementHeaderID, {}).subscribe(result => {
        this.spinner.hide();
        if (result && result.statusCode === 400) {
          if (result && result.result) {
            // this.toastr.error(result.result.validationErrors[0].errorMessage);
          }
          return 0;
        }
        if (result) {
          this.cancelUpdtInv();
          this.mergeRow = null;
          this.oldRow = null;
          this.editPeriodChange = false;
          this.searchSalesReport()
          this.toastr.success("Merged Successfully");
        } else {
          this.toastr.error("Merging failed");
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constant.infoMessages.contactAdmin);
      });
  }
  cancelUpdtInv() {
    this.modalService.dismissAll()
    this.editPeriodChange = false;
  }
  dateChange(event, control) {
    if (control === 'date') {
      this.salesTotalMgmtForm.get('date').setValue(event.formatedDate);
      this.inputDate = event.formatedDate;
    }
  }
  onStoreSelection(event) {
    this.storeLocationId = event.storeLocationID;
  }
  searchSalesReport() {
    if (this.salesTotalMgmtForm.valid) {
      this.spinner.show();
      this.dataService.getData('Admin/GetSalestotalManagement?businessDate=' + this.inputDate + '&locationID=' + this.storeLocationId
      ).subscribe((response) => {
        this.spinner.hide();
        this.rowData = response;
        this.selectedPeriodList = [];
        this.rowData.forEach(element => {
          if (element.period !== null) {
            element["display"] = (element.period).length === 6 ? element.period + "  " : element.period;
            element["display"] += " (" + element.beginDate + ") (" + element.endDate + ")";
          } else element["display"] = "";
          this.selectedPeriodList.push({ text: element.period, value: this.list[element.period] });
        });
        this.rowData.forEach((item, index) => {
          this.filteredPeriods = [];
          let x = this.periodList.filter(k => k.text == item.period);
          if (x.length === 0)
            item.periodValue = "";
          else
            item.periodValue = x[0].value;
          this.filteredPeriods = this.periodList.filter(({ value: id1 }) => (id1 == item.periodValue) || !this.selectedPeriodList.some(({ value: id2 }) => id2 === id1));
          const periods = this.filteredPeriods.filter(k => k.value === item.period);
          if (periods && periods.length > 0)
            item.periodName = periods[0].text;
          item.periodValueList = this.filteredPeriods;
        })
      }, (error) => {
        this.spinner.hide();
      });
    } else {
      this.toastr.error('Please Select Store');
    }
  }
  onChange($event) {//i, valuefield, value, textfield, text
    if ($event.a) {
      let i = $event.a;
      let valuefield = $event.b;
      let value = $event.c;
      let textfield = $event.d;
      let text = $event.e;
      if (valuefield === 'periodValue') {
        // this.filterPeriodsData(value, i, valuefield);
        this.gridApi.getRowNode(i).data[valuefield] = value;
        this.gridApi.getRowNode(i).data[textfield] = text;
      }
      this.gridApi.getRowNode(i).data[valuefield] = value;
      this.gridApi.getRowNode(i).data[textfield] = text;
      if (valuefield === 'periodValue') {
        this.gridApi.redrawRows();
      }

    }

  }
  onBtnStopEditing($event) {
    this.onRowValueChanged($event)
  }
  onRowValueChanged($event) {
    //this.spinner.hide();
    this.gridApi.stopEditing();
    let rowNode = this.gridApi.getRowNode($event.rowIndex);
    rowNode.data.isEdit = false;
  }

  // ngOnDestroy() {
  //   // this.subscription.unsubscribe();
  // }
  filterPeriodsData(value, i, valuefield) {
    const periodsData = this.periodList;
    this.selectedPeriodList = this.selectedPeriodList.filter(k => k != this.gridApi.getRowNode(i).data[valuefield]);
    this.selectedPeriodList.push(parseInt(value));
    const filteredList = this.selectedPeriodList;
    this.gridApi.forEachNode(function (rowNode, index) {
      if (index !== i) {
        rowNode.data.storelocationIDList = periodsData.filter(k => (parseInt(rowNode.data.periodValue) === k.value || !filteredList.includes(k.value)));
      }
    });
  }

  openDayRecon() {
    this.router.navigate(['admin-accounting/day-recon']);
  }
}
