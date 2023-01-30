import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-accouting',
  templateUrl: './accouting.component.html',
  styleUrls: ['./accouting.component.scss'],
})
export class AccoutingComponent implements OnInit {
  currentOrientation = 'horizontal';
  @Input() storeLocationID: number;
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  chartAccountViewData: any;
  closeResult: any;
  accountTypeList: any;
  initialFormValue: any;
  isEditMode = false;
  title: any;
  title1 = 'Add an Account Name';
  isAccTypeLoading = true;
  _currentDate = moment().format('MM-DD-YYYY');
  userInfo = this.constantService.getUserInfo();
  addAccoutingForm = this._fb.group({
    VendorID: [null, [Validators.required]],
    CategoryID: [null]
  });
  selectedchartOfAccountTypeID: any;
  isChartOfAccountEditMode = false;
  chartOfAccountForm = this._fb.group({
    chartOfAccountCategoryName: [null, [Validators.required]],
  });
  constructor(private modalService: NgbModal, private _fb: FormBuilder, private setupService: SetupService,
    private constantService: ConstantService, private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.initialFormValue = this.addAccoutingForm.value;
  }

  ngOnInit() {
    this.getChartAccountViewData();
  }

  getAccountTypesList() {
    this.setupService.getData(`Vendor/GetUnCategorizedAccounts/${this.userInfo.companyId}`)
      .subscribe((response) => {
        this.accountTypeList = response;
        this.isAccTypeLoading = false;
      });
  }
  getChartAccountViewData() {
    this.spinner.show();
    this.setupService.getData(`ChartOfAccountCategories/GetChartAccountViewData?StoreLocationID=${this.storeLocationID}`)
      .subscribe((response) => {
        this.chartAccountViewData = response;
        this.spinner.hide();
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  get accFormValue() { return this.addAccoutingForm.value; }
  get chartOfAccountFormValue() { return this.chartOfAccountForm.value; }
  reset() {
    this.isEditMode = false;
    // this.addAccoutingForm.controls['chartOfAccountCategoryID'].enable();
    this.addAccoutingForm.patchValue(this.initialFormValue);
    this.chartOfAccountForm.get("chartOfAccountCategoryName").setValue(null);
  }

  open(content: any, accountType?: any) {
    if (accountType && this.isEditMode === false) {
      this.getAccountTypesList();
      this.addAccoutingForm.get('VendorID').setValue(null);
      this.addAccoutingForm.get('CategoryID').setValue(accountType);
    }
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    this.isEditMode = false;
    this.addAccoutingForm.controls['chartOfAccountCategoryID'].enable();
    this.addAccoutingForm.patchValue(this.initialFormValue);
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  save() {
    if (this.addAccoutingForm.valid) {
      this.addAccoutingForm.controls['VendorID'].enable();
      this.spinner.show();
      this.setupService.updateData('Vendor/UpdateAccountCategory?VendorID=' + this.accFormValue.VendorID + '&CategoryID=' + this.accFormValue.CategoryID + '&username=' + this.userInfo.userName, {}).subscribe((response) => {
        this.spinner.hide();
        if (response) {
          this.getChartAccountViewData();
          this.modalService.dismissAll();
          this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        console.log(error);
      });
    }
  }

  delete(vendorID) {
    this.spinner.show();
    this.setupService.updateData('Vendor/UpdateAccountCategory?VendorID=' + vendorID + '&username=' + this.userInfo.userName, {}).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        this.getChartAccountViewData();
        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.delete);
      } else {
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
      console.log(error);
    });
  }

  public toggleAccordian(props: NgbPanelChangeEvent): void {

  }

  openChartOfAccount(modalContent, chartOfAccountTypeID) {
    this.selectedchartOfAccountTypeID = chartOfAccountTypeID;
    this.modalService.open(modalContent).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  saveChartOfAccount() {
    if (this.chartOfAccountForm.valid) {
      this.spinner.show();
      let postData = {
        "chartOfAccountCategoryID": 0,
        "chartOfAccountCategoryName": this.chartOfAccountForm.value.chartOfAccountCategoryName,
        "chartOfAccountTypeID": this.selectedchartOfAccountTypeID,
        "isDefault": true,
        "isActive": true,
        "companyID": this.userInfo.companyId,
        "chartOfAccountTypeName": ""
      };
      this.setupService.postData('ChartOfAccountCategories', postData).subscribe((response) => {
        this.spinner.hide();
        if (response && response.result && response.result.validationErrors[0]) {
          this.modalService.dismissAll();
          this.toastr.error(response.result.validationErrors[0].errorMessage, this.constantService.infoMessages.error);
        } else if (response) {
          this.getChartAccountViewData();
          this.modalService.dismissAll();
          this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        }
        this.reset();
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        console.log(error);
      });
    }
  }

  backToMainList() {
    this.backToStoreList.emit(false);
  }
}
