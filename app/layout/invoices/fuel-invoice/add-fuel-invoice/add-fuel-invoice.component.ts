import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder, Validators } from '@angular/forms';
import { GridService } from '@shared/services/grid/grid.service';
import { GridOptions } from 'ag-grid-community';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';

import { UtilityService } from '@shared/services/utility/utility.service';
import { FuelInvoiceCellRender } from '@shared/component/expandable-grid/partials/fuel-invoice-renderer.component';
import { CommonService } from '@shared/services/commmon/common.service';
import { TestService } from '@shared/services/test/test.service';
import { saveAs } from 'file-saver';
import { ChildSaveButtonComponent } from '@shared/component/expandable-grid/partials/childSaveButton.component';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-add-fuel-invoice',
  templateUrl: './add-fuel-invoice.component.html',
  styleUrls: ['./add-fuel-invoice.component.scss',
              '../../vendor-invoice/add-invoice/add-invoice.component.scss']
})
export class AddFuelInvoiceComponent implements OnInit {
  title = 'Add New Fuel Invoice';
  @Input() locationList: any[];
  @Input() vendorList: any[];
  @Input() editData: any[];
  userInfo = this.constantService.getUserInfo();
  @ViewChild('companyInfoGrid') companyInfoGrid: any;
  @ViewChild('billOfLandings') billOfLandings: any;
  isLoading = false;
  isEdit = false;
  isfuelEdit = false;
  fuelGridOptions: GridOptions;
  fuelGridApi: any;
  fuelInvoiceRowData: any[];
  // Other Charges Fuel Invocie Grid
  fuelOtherGridOptions: GridOptions;
  fuelOtherGridApi: any;
  fuelInvoiceOtherRowData: any;
  // Other Charges Fuel Invocie Grid
  fuelTotalGridOptions: GridOptions;
  fuelTotalGridApi: any;
  fuelInvoiceTotalRowData = [];
  @Output() backToList: EventEmitter<any> = new EventEmitter();
  submited = false;
  inputDate = moment().format('MM-DD-YYYY');
  BOLDate = moment().format('MM-DD-YYYY');
  fuelInvoiveForm = this._fb.group({
    fuelInvoiceID: 0,
    storeLocationID: [null, Validators.required],
    vendorID: [null, Validators.required],
    invoiceNo: ['', Validators.required],
    invoiceDate: this.inputDate,
    invocieAmount: [0.00],
    invoiceAmountPaid: [0],
    createdDateTime: new Date(),
    lastModifiedDateTime: new Date(),
    lastModifiedBy: [''],
    // fuelReconcilationID: [0],
    storeName: [''],
    companyID: [''],
    totalQuantityReceived: 0,
    totalAmount: [0],
    bolid: null,
    bolDate: this.BOLDate,
    fuelInvoiceFileName : ['']
  });
  defaultfuelFormValue: any;
  closeResult: string;
  fuelGradeList: any;
  fuelInvoiceDetailForm = this._fb.group({
    fuelInvoiceDetailID: 0,
    fuelInvoiceID: [0],
    fuelGradeID: [null],
    storeFuelGradeID: [null, Validators.required],
    quantityReceived: [null, Validators.required],
    averageFuelGradeCost: [0],
    unitCostPrice: [null, Validators.required],
    fuelGradeName: [null],
    storeFuelGradeName: [''],
    totalAmount: [0],
    perGallon: [0],
  });
  defaultfuelInvoiceDetailForm: any;
  modalReference: any;
  isAddRow = false;
  fuelInvoiceCellRenderer: any;
  allFuelGradeList: any;
  boLNumberList: any = [];
  boLNumberListMap : Map<number, string> = new Map<number, string>();
  isBolNumberList = false;
  fuelTotalChargesAmount = 0;
  totalOtherChargesAmount = 0;
  newInvoiceFiles: any[] = [];
  showDownloadInvoice: boolean = false;
  billOfLadings = [];
  colDefsBols:any;
  bolsGridApis : any;
  isBOLIDdisabled : boolean;
  
  constructor(private spinner: NgxSpinnerService, private toastr: ToastrService, private constantService: ConstantService,
    private _fb: FormBuilder, private setupService: SetupService, private editGridService: EditableGridService,
    private gridService: GridService, private modalService: NgbModal, private commonService: CommonService,
    private utility: UtilityService,private editableGrid: EditableGridService, private constant: ConstantService) {
    this.defaultfuelFormValue = this.fuelInvoiveForm.value;
    this.defaultfuelInvoiceDetailForm = this.fuelInvoiceDetailForm.value;
    this.fuelGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.fuelInvoiceDetailGrid);
    this.fuelOtherGridOptions = this.editGridService.getGridOption(
      this.constantService.editableGridConfig.gridTypes.fuelInvoiceOtherChargesGrid);
    this.fuelTotalGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.fuelInvoiceTotalGrid);
    this.fuelInvoiceCellRenderer = FuelInvoiceCellRender;
    this.colDefsBols = this.editableGrid.getGridOption(this.constant.editableGridConfig.gridTypes.bolGrid);
  }

  ngOnInit() {
    if (this.editData) {
      this.title = 'Edit Fuel Invoice';
      this.isEdit = true;
      this.fuelInvoiveForm.patchValue(this.editData);
      this.fuelInvoiveForm.get('invoiceDate').setValue(moment(this.editData['invoiceDate']).format('MM-DD-YYYY'));
      this.fuelInvoiveForm.get('invocieAmount').setValue(Number(this.editData['invocieAmount']).toFixed(2));
      this.inputDate = moment(this.editData['invoiceDate']).format('MM-DD-YYYY');
      this.fetchFuleInvoiceById();
      this.findBOLNo();
      this.fillInvoiceUpdate(this.fuelInvoiveForm.get('fuelInvoiceID').value);
      // this.getfuelGrade();
    }
    this.setLoctionId();

  }
  // convenience getter for easy access to form fields
  get fuelInvoive() { return this.fuelInvoiveForm.controls; }
  // convenience getter for easy access to form fields
  get fuelInvoiceDetail() { return this.fuelInvoiceDetailForm.controls; }
  get fuelInvoiceDetailValue() { return this.fuelInvoiceDetailForm.value; }
  onfuelGridReady(param) {
    this.fuelGridApi = param.api;

  }
  onfuelOtherGridReady(param) {
    this.fuelOtherGridApi = param.api;
    param.api.sizeColumnsToFit();
  }
  onFuelTotalGridReady(param) {
    this.fuelTotalGridApi = param.api;
    param.api.sizeColumnsToFit();

  }
  getfuelGrade(data) {
    if (this.fuelInvoiveForm.value.storeLocationID) {
      this.setupService.getData(`StoreFuelGrade/list/${this.fuelInvoiveForm.value.storeLocationID}?isBlend=true`).subscribe(
        (res) => {
          this.allFuelGradeList = res;
          // remove duplicate array value pass two array & column name
          const arr = this.utility.remove_duplicates(res, data, 'storeFuelGradeName');
          this.fuelGradeList = arr;
        }, (error) => {

        }
      );
    }
  }
  getFuelInvoiceDetail() {
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.setupService.getData(`FuelInvoiceDetail/list/${this.fuelInvoiveForm.value.fuelInvoiceID}`).subscribe(
      (res) => {
        this.spinner.hide();
        this.fuelInvoiceRowData = res;
        this.getfuelGrade(res);
        this.getTotalAmount();
      }, (error) => {
        this.spinner.hide();
      }
    );
  }
  getTotalAmount() {
    // this.setupService.getData('FuelInvoiceDetail/getTotalAmount/' +
    //   this.fuelInvoiveForm.value.fuelInvoiceID + '/' + this.fuelInvoiveForm.value.storeLocationID).subscribe(
    //     (res) => {
    //       this.fuelInvoiceTotalRowData = res;
    //     }, (error) => {
    //     }
    //   );
    let tempOtherChargeArr = [];
    if (this.fuelInvoiceOtherRowData && this.fuelInvoiceOtherRowData.length > 0) {
      this.totalOtherChargesAmount = this.fuelInvoiceOtherRowData.reduce((acc, i) => acc + i.amount, 0);
      // this.totalOtherChargesAmount = Number(constOtherAmt.toFixed(4));
    }
    if(this.fuelInvoiceRowData && this.fuelInvoiceRowData.length){
      this.fuelInvoiceRowData.map((x) => {
        let count = 0;
        if (this.fuelInvoiceOtherRowData && this.fuelInvoiceOtherRowData.length > 0) {
          this.fuelInvoiceOtherRowData.map((invoiceData) => {
  
            if (x.storeFuelGradeID === invoiceData.storeFuelGradeID) {
              ++count;
              const perGallonCost = Number(invoiceData.amount / x.quantityReceived) + x.unitCostPrice;
              const totalAmount = x.totalAmount + invoiceData.amount;
  
              tempOtherChargeArr.push({
                storeFuelGradeName: x.storeFuelGradeName,
                perGallonCost: perGallonCost,
                totalAmount: totalAmount,
              });
              return;
            }
  
          });
        }
        if (count === 0) {
          // this.fuelInvoiceRowData.map((x) => {
          count = 0;
          const perGallonCost = (0 * x.quantityReceived) + x.unitCostPrice;
          const totalAmount = x.totalAmount + 0;
          tempOtherChargeArr.push({
            storeFuelGradeName: x.storeFuelGradeName,
            perGallonCost: perGallonCost,
            totalAmount: totalAmount,
          });
  
          // });
        }
      });
  
    }
  
    this.fuelInvoiceTotalRowData = tempOtherChargeArr;
    if (this.fuelInvoiceTotalRowData && this.fuelInvoiceTotalRowData.length > 0) {
      this.fuelTotalChargesAmount = this.fuelInvoiceTotalRowData.reduce((acc, i) => acc + i.totalAmount, 0);
      // this.fuelTotalChargesAmount = Number(constTotalAmt.toFixed(4));
    }
  }
  GetChargeByFuelInvocieID() {
    this.spinner.show();
    this.setupService.getData('FuelInvoiceOtherCharge/GetChargeByFuelInvocieID/' + this.fuelInvoiveForm.value.fuelInvoiceID)
      .subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.commonService._fuelInvoiceOtherRow = this.fuelInvoiceOtherRowData = [];
          return;
        }
        this.commonService._fuelInvoiceOtherRow = this.fuelInvoiceOtherRowData = res;
        this.getTotalAmount();
      }, (error) => {
        this.spinner.hide();
      });
  }
  GetFuelGradebyFuelInvocieID() {
    this.setupService.getData('FuelInvoiceOtherCharge/GetFuelGradebyFuelInvocieID/' +
      this.fuelInvoiveForm.value.fuelInvoiceID + '/' + this.fuelInvoiveForm.value.storeLocationID).subscribe(
        (res) => {
          if (res && res['statusCode']) {
            this.commonService.fuelOtherChargeList = [];
            return;
          }
          this.commonService.fuelOtherChargeList = res;
          this.getFuelInvoiceDetail();
        }, (error) => {
        }
      );
  }
  fetchFuleInvoiceById() {
    this.setupService.fetchFuleInvoiceById(this.fuelInvoiveForm.value.fuelInvoiceID,
      this.fuelInvoiveForm.value.storeLocationID).subscribe(
        (res) => {
          // this.fuelInvoiceTotalRowData = res[0]; // getTotalAmount
          this.commonService._fuelInvoiceOtherRow = this.fuelInvoiceOtherRowData = res[1]; // GetChargeByFuelInvocieID
          this.commonService.fuelOtherChargeList = res[2];
          this.fuelInvoiceRowData = res[3];
          if (this.fuelInvoiceRowData.length > 0) {
            let lastRow = this.fuelInvoiceRowData.length - 1;
            setTimeout(() => {
              this.fuelGridApi.forEachNode(function (rowNode, i) {
                rowNode.setExpanded(true);
              
              });
            }, 0);
          }
          this.getfuelGrade(res[3]);
          this.getTotalAmount();
          this.checkForBOLIDeditable();
        },
        (error) => {
        },
      );
  }

  checkForBOLIDeditable() {
    if (!isNullOrUndefined(this.fuelInvoiveForm.get('bolid').value) && this.fuelInvoiveForm.get('fuelInvoiceID').value && (this.fuelInvoiceRowData ? this.fuelInvoiceRowData.length : false)) {
      this.isBOLIDdisabled = true;
    }
    else {
      this.isBOLIDdisabled = false;
    }
  }
  setLoctionId() {
    if (this.locationList && this.locationList.length === 1) {
      this.fuelInvoiveForm.get('storeLocationID').setValue(this.locationList[0].storeLocationID);
    }
  }
  resetForm() {
    this.fuelInvoiveForm.patchValue(this.defaultfuelFormValue);
    this.submited = false;
    this.isEdit = false;
    this.inputDate = this.BOLDate = moment().format('MM-DD-YYYY');
  }
  dateChange(event) {
    this.fuelInvoiveForm.get('invoiceDate').setValue(event.formatedDate);
    this.inputDate = event.formatedDate;
    this.findBOLNo();
  }
  dateChangeBOL(event) {
    this.fuelInvoiveForm.get('bolDate').setValue(event.formatedDate);
    this.BOLDate = event.formatedDate;
  }
  editOrSaveClose(event) {
    this.editOrSave(event, () => { this.backToInvocieList(); });
  }

  editOrSave(_event, callBack = () => { }) {
    this.submited = true;
    const postData = {
      ...this.fuelInvoiveForm.value,
      companyID: this.userInfo.companyId,
      lastModifiedBy: this.userInfo.userName
    };
    if (this.newInvoiceFiles && this.newInvoiceFiles.length > 0) postData.files = this.newInvoiceFiles;
    if (this.fuelInvoiveForm.valid) {
      if (!this.isEdit) {
        this.spinner.show();
        this.setupService.postData('FuelInvoice/SaveFuelInvoice', postData).subscribe(
          (res) => {
            this.submited = false;
            this.spinner.hide();
            if (res && res.fuelInvoiceID) {
              this.toastr.success(this.constantService.infoMessages.addedRecord, 'Success');
              //if (!this.isEdit) {
                this.title = 'Edit Fuel Invoice';
                this.isEdit = true;
                this.fuelInvoiveForm.patchValue(res);
                this.getfuelGrade(res.storeLocationID);

              if (res.fuelInvoiceFileName === null || res.fuelInvoiceFileName === "") {
                this.showDownloadInvoice = false;
              } else this.showDownloadInvoice = true;

              this.checkForBolNonSelected();
              
              if (callBack) {
                callBack();
              }

              //}
            } else {
              this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'Error');
            }
          }, (error) => {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'Error');

          }
        );
      } else {
        this.spinner.show();
        this.setupService.postData('FuelInvoice/SaveFuelInvoice', postData).subscribe(
          (res) => {
            this.spinner.hide();
            if (res && res.fuelInvoiceID) {
              this.toastr.success(this.constantService.infoMessages.updatedRecord, 'Success');
              //if (!this.isEdit) {
                this.fuelInvoiveForm.patchValue(res);
                this.getfuelGrade(res.storeLocationID);
                this.isEdit = true;

                  if (res.fuelInvoiceFileName === null || res.fuelInvoiceFileName === "") {
                  this.showDownloadInvoice = false;
                } else this.showDownloadInvoice = true;
              
                this.checkForBolNonSelected();

                if (callBack) {
                  callBack();
                }
              // }
            } 
            else if (res && res['statusCode']) {
              this.toastr.warning(this.constantService.infoMessages.updateRecordFailed, 'warning');
              return;
            }
            else {
              this.toastr.warning(this.constantService.infoMessages.updateRecordFailed, 'warning');
            }
          }, (error) => {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'error');

          }
        );
      }
    }
  }

  checkForBolNonSelected(){
    if(this.fuelInvoiveForm.value.bolid) {
      this.onBolChange(this.fuelInvoiveForm.value.bolid);
    }
  }
  open(content: any, modalSize) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: modalSize ? modalSize : undefined
    };

    this.modalReference = this.modalService.open(content, ngbModalOptions); // content
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    this.isfuelEdit = false;
    this.fuelInvoiceDetailForm.patchValue(this.defaultfuelInvoiceDetailForm);
    this.fuelInvoiceDetailForm.controls['storeFuelGradeID'].enable();
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  calculateAmount() {
    // tslint:disable-next-line:no-unused-expression
    const total = (Number(this.fuelInvoiceDetailForm.value.quantityReceived) * Number(this.fuelInvoiceDetailForm.value.unitCostPrice));
    this.fuelInvoiceDetailForm.get('totalAmount').setValue(total.toFixed(2));
    this.fuelInvoiceDetailForm.get('unitCostPrice').setValue(Number(this.fuelInvoiceDetailForm.value.unitCostPrice).toFixed(7));
  }
  fuelInvEditOrSaveClose(event) {
    this.fuelInvEditOrSave(event, () => { this.modalReference.close(); });
  }
  fuelInvEditOrSave(_event, callBack = () => { }) {
    this.submited = true;
    const postData = [{
      ...this.fuelInvoiceDetailForm.value,
      fuelInvoiceID: this.fuelInvoiveForm.value.fuelInvoiceID,
      storeFuelGradeID: this.fuelInvoiceDetailForm.get('storeFuelGradeID').value,
      fuelGradeID: null,
      fuelGradeName: null
    }];
    if (this.fuelInvoiceDetailForm.valid) {
      this.spinner.show();
      this.setupService.updateData('FuelInvoiceDetail', postData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Error');
            return;
          }
          if (res && Number(res) > 0) {
            this.submited = false;
            this.isfuelEdit = false;
            // this.GetFuelGradebyFuelInvocieID();
            this.fetchFuleInvoiceById();
            // this.getFuelInvoiceDetail();
            // this.getTotalAmount();
            this.fuelInvoiceDetailForm.patchValue(this.defaultfuelInvoiceDetailForm);
            this.fuelInvoiceDetailForm.controls['storeFuelGradeID'].enable();
            this.toastr.success(this.constantService.infoMessages.updatedRecord, 'Success');
            callBack();
          }
        },
        (error) => {
          this.spinner.hide();
        },
      );
    }
  }
  editAction(param) {
    this.isfuelEdit = true;
    this.fuelInvoiceDetailForm.patchValue(param.data);
    this.fuelInvoiceDetailForm.controls['storeFuelGradeID'].disable();
    document.getElementById('open_model').click();
  }
  deleteAction(param) {
    this.spinner.show();
    this.setupService.deleteData('FuelInvoiceDetail/' + param.data.fuelInvoiceDetailID).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, 'Deleted');
          return;
        }
        if (res && Number(res) > 0) {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, 'Deleted');
          this.fuelGridApi.updateRowData({ remove: [param.data] });
          this.GetFuelGradebyFuelInvocieID();
          this.GetChargeByFuelInvocieID();
          this.getFuelInvoiceDetail();
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, 'Deleted');
          return;
        }

      },
      (error) => {
        this.spinner.hide();
      }
    );
  }
  addMoreRow() {
    if (this.isAddRow) {
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCell('storeFuelGradeName', 0);
      return;
    }
    const data = {
      fuelInvoiceOtherChargeID: 0,
      otherChargeDescription: '',
      amount: '',
      fuelInvoiceID: this.fuelInvoiveForm.value.fuelInvoiceID,
      fuelInvoiceDetailID: 0,
      quantityReceived: 0,
      companyID: this.userInfo.companyId,
      fuelGradeID: 0,
      storeFuelGradeID: 0,
      storeFuelGradeName: '',
      fuelGradeName: '',
      isSaveRequired: true,
    };
    this.fuelOtherGridApi.updateRowData({ add: [data], addIndex: 0 });
    this.isAddRow = true;
    this.getStartEditingCell('storeFuelGradeName', 0);
    this.getRowData(true);
  }
  getRowData(event) {
    const rowData = [];
    this.fuelOtherGridApi.forEachNode(function (node) {
      rowData.push(node.data);
    });
    this.fuelInvoiceOtherRowData = rowData;
    if (!event) {
      this.commonService._fuelInvoiceOtherRow = this.fuelInvoiceOtherRowData;
    }
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.fuelOtherGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  SaveChanges(params) {
    this.fuelOtherGridApi.stopEditing();
    if (params.data.fuelInvoiceOtherChargeID > 0) {
      const isNumber = isNaN(params.data.amount);
      if (params.data.amount === '' || isNumber) {
        this.toastr.error('Please Enter Amount..');
        this.getStartEditingCell('amount', params.rowIndex);
        return;
      }
      const postData = {
        ...params.data,
        fuelGradeID: 0,
        fuelGradeName: ''
      };
      this.spinner.show();
      this.setupService.updateData('FuelInvoiceOtherCharge', postData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.updatedRecord, 'error');
            return;
          } else {
            this.GetChargeByFuelInvocieID();
            this.toastr.success(this.constantService.infoMessages.updatedRecord, 'update');
            this.isAddRow = false;
          }

          // this.fuelGridApi.updateRowData({ remove: [param.data] });
        },
        (error) => {
          this.spinner.hide();
        }
      );
    } else {
      if (this.isAddRow) {
        //  const rowNode = this.fuelOtherGridApi.getRowNode(0);
        // const storesFuel = rowNode.data.storeFuelGradeName.split(',');
        if (!this.commonService.fuelOtherChargeList) {
          return;
        }
        const storesFuel = this.commonService.fuelOtherChargeList.filter(
          x => x.storeFuelGradeName === params.data.storeFuelGradeName);
        if (storesFuel && !storesFuel[0]) {
          this.toastr.error('Please Select Fuel Grade..');
          this.getStartEditingCell('storeFuelGradeName', params.rowIndex);
          return;
        }
        const isNumber = isNaN(params.data.amount);
        if (params.data.amount === '' || isNumber) {
          this.toastr.error('Please Enter Amount..');
          this.getStartEditingCell('amount', params.rowIndex);
          return;
        }
        const postData = {
          ...params.data,
          fuelGradeID: 0,
          fuelGradeName: '',
          fuelInvoiceDetailID: storesFuel[0].fuelInvoiceDetailID
        };
        this.spinner.show();
        this.setupService.postData('FuelInvoiceOtherCharge', postData).subscribe(
          (res) => {
            this.spinner.hide();
            if (res && (res.statusCode === 500 || res.statusCode === 404)) {
              this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'error');
              return;
            } else {
              this.GetChargeByFuelInvocieID();
              this.toastr.success(this.constantService.infoMessages.addedRecord, 'Added');
              this.isAddRow = false;
            }

            // this.fuelGridApi.updateRowData({ remove: [param.data] });
          },
          (error) => {
            this.spinner.hide();
          }
        );
      }
    }
  }
  deleteOtherAction(param) {
    if (param.data.fuelInvoiceOtherChargeID === 0) {
      this.fuelOtherGridApi.updateRowData({ remove: [param.data] });
      this.isAddRow = false;
    } else {
      this.spinner.show();
      this.setupService.deleteData('FuelInvoiceOtherCharge/' + param.data.fuelInvoiceOtherChargeID).subscribe(
        (res) => {
          this.spinner.hide();
          this.toastr.success(this.constantService.infoMessages.deletedRecord, 'Deleted');
          this.fuelOtherGridApi.updateRowData({ remove: [param.data] });
          this.getRowData(false);
          this.GetFuelGradebyFuelInvocieID();
          this.getTotalAmount();
        },
        (error) => {
          this.spinner.hide();
        }
      );
    }
  }
  backToInvocieList() {
    this.backToList.emit(false);
  }
  // Add New feture
  findBOLNo() {
    this.boLNumberList = [];
    this.fuelInvoiveForm.get('bolid').setValue(null);
    if (this.fuelInvoiveForm.get('invoiceDate').value && this.fuelInvoiveForm.get('storeLocationID').value) {
      this.isBolNumberList = true;
      // tslint:disable-next-line:max-line-length
      this.setupService.getData(`BillOfLading/GetBolNumber?BolDate=${this.fuelInvoiveForm.get('invoiceDate').value}&StoreLocationID=${this.fuelInvoiveForm.get('storeLocationID').value}&VenodrID=${this.fuelInvoiveForm.get('vendorID').value}`).subscribe(
        (res) => {
          this.isBolNumberList = false;
          if (res && res.length) {
            this.boLNumberList = res;

            this.boLNumberList.forEach(element => {
                this.boLNumberListMap.set(element.bolid, element.bolNumber)
            });
          }
        },
        (error) => {
          this.isBolNumberList = false;
        }
      );
    }
  }

  invoiceAmountChange() {
    this.fuelInvoiveForm.get('invocieAmount').setValue(Number(this.fuelInvoiveForm.get('invocieAmount').value).toFixed(2));
  }
  uploadNewInvoiceFiles(event) {
    for (var i = 0; i < event.target.files.length; i++) {
      let file = event.target.files[i];
      let newInvoiceFile = {
        ...this.fuelInvoiceDetailForm.value,
        file: "",
        fileName: file.name,
        fileType: file.type
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        newInvoiceFile.file = reader.result as string;
        this.newInvoiceFiles.push(newInvoiceFile);
      };
    }
    if (this.isEdit) {
      this.spinner.show();
      setTimeout(() => {
        let postData = {
          fuelInvoiceID: this.fuelInvoiveForm.get('fuelInvoiceID').value,
          companyID: this.fuelInvoiveForm.get('companyID').value,
          files: this.newInvoiceFiles
        }
        this.setupService.postData('FuelInvoice/UpdateFuelInvoiceFiles', postData).subscribe(result => {
          this.spinner.hide();
          if (result.status === 1) {
            this.toastr.success("Files Uploaded Successfully", this.constantService.infoMessages.success);
            this.fillInvoiceUpdate(this.fuelInvoiveForm.get('fuelInvoiceID').value);
          } else
            this.toastr.error("Files Upload Failed", this.constantService.infoMessages.success);
        }, error => {
          this.toastr.error("Files Upload Failed", this.constantService.infoMessages.success);
          this.spinner.hide();
          console.log(error);
        });
      }, 100);
    }
  }
  fillInvoiceUpdate(_invoiceID) {
    this.spinner.show();
    this.setupService.getData(`FuelInvoice/get/` + _invoiceID).subscribe(response => {
      this.spinner.hide();
      this.isEdit = true;
      //   this.editRowData = response;
      this.fuelInvoiveForm.patchValue(response);
     
      this.fuelInvoiveForm.get('invoiceDate').setValue(moment(response.invoiceDate).format('MM-DD-YYYY'));
      //this.fuelInvoiveForm.get('invocieAmount').setValue(response.invocieAmount.toFixed(2));
     
      if (response.fuelInvoiceFileName === null || response.fuelInvoiceFileName === "") {
        this.showDownloadInvoice = false;
      } else this.showDownloadInvoice = true;
    }, error => {
      this.spinner.hide();
      console.log(error);
    });
  }

  downloadInvoice() {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: this.fuelInvoiveForm.get('storeLocationID') ? this.fuelInvoiveForm.get('storeLocationID').value : null,
      storeName: '',
      bucketName: '',
      filePath: this.fuelInvoiveForm.get('fuelInvoiceFileName').value,
      fileName: this.fuelInvoiveForm.get('fuelInvoiceFileName').value,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.spinner.show();
    this.setupService.postData(`InvoiceBin/DownloadInvocie`, postData)
      .subscribe(response => {
        this.spinner.hide();
        if (response && response.length > 0) {
          for (let i = 0; i < response.length; i++) {
            let file = response[i];
            const byteString = window.atob(file.fileData);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const int8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
              int8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([int8Array], { type: file.fileContentType });
            // const blob = new Blob([file.fileData], { type: file.fileContentType });
            saveAs(blob, file.fileName);
          }
        } else {
          this.toastr.warning('Invoice Not Found', 'warning');
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error('Invoice Failed', this.constantService.infoMessages.error);
        console.log(error);
      });
  }

  onBolChange(bolid) {
    if (!isNullOrUndefined(bolid) && this.fuelInvoiveForm.get('fuelInvoiceID').value && (this.fuelInvoiceRowData ? !this.fuelInvoiceRowData.length : true )) {
   
        this.billOfLadings = [];
        //this.isBolNumberList = true;
        this.setupService.getData(`BillOfLading/GetBOLForFuelInvByID?BOLID=` + bolid).subscribe(
          (res) => {
            if(res && res.isGrossVolume && res.isNetVolume) {

            }
            if (res.details && res.details.length) {
              res.details.forEach(detail => {
                if(res.isGrossVolume == true) {
                  detail["quantityReceived"] = detail.grossFuelGradeVolume ? detail.grossFuelGradeVolume : 0;
                }
                else if(res.isNetVolume) {
                  detail["quantityReceived"] = detail.netFuelGradeVolume ? detail.netFuelGradeVolume : 0;
                }                
              });

              this.billOfLadings = res.details;
              this.open(this.billOfLandings, 'lg');
            }
            this.isBolNumberList = false;
          }, (error) => {
            this.isBolNumberList = false;

          }
        );
      }
    
  }
  onBolsGridReady(param) {
    this.bolsGridApis = param.api;
  }

  updateBols() {

    this.bolsGridApis.forEachNode((rowNode, index) => {
      console.log(rowNode.data);
      rowNode.data["fuelInvoiceID"] = this.fuelInvoiveForm.get('fuelInvoiceID').value ? this.fuelInvoiveForm.get('fuelInvoiceID').value : 0;
    });

    if (this.billOfLadings && this.billOfLadings.length) {
      console.log(this.billOfLadings);
      let postBols = [];
      this.billOfLadings.forEach(bol => {
        const bolData = {
          fuelInvoiceID: bol.fuelInvoiceID,
          quantityReceived: bol.quantityReceived,
          storeFuelGradeID: bol.storeFuelGradeID,
          storeFuelGradeName: bol.storeFuelGradeName,
          totalAmount: bol.totalAmount,
          unitCostPrice: bol.unitCostPrice
        }
        postBols.push(bolData);
      });
      this.setupService.updateData('FuelInvoiceDetail', postBols).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.updatedRecord, 'error');
            return;
          } else {
            this.toastr.success(this.constantService.infoMessages.updatedRecord, 'update');
            // console.log(this.modalReference);
            // console.log(this.billOfLandings);
            this.getFuelInvoiceDetail();
            this.fetchFuleInvoiceById();
            this.modalReference.close();
          }
        },
        (error) => {
          this.spinner.hide();
        }
      );
    }
  }



}
