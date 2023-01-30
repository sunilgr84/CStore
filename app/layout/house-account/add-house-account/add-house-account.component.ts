import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { HouseAccount } from '@models/house-account-model';
import { SetupService } from '@shared/services/setupService/setup-service';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as _ from 'lodash';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-add-house-account',
  templateUrl: './add-house-account.component.html',
  styleUrls: ['./add-house-account.component.scss']
})
export class AddHouseAccountComponent implements OnInit {
  title = 'Add House Accounts';
  @Input() houseAccountData?: any;
  @Output() backToHouseAccountList: EventEmitter<any> = new EventEmitter();
  isEdit = false;
  isLoading = true;
  countyList: any;
  stateList: any;
  submitted = false;
  houseAccountForm = this.fb.group({
    houseAccountID: [0], accountCode: [''], accountName: [''], companyID: [0], paymentTerms: [''],
    creditLimit: [0], fedID: [''], name: [''], phoneNo: [''], email: [''], address: [''], city: [''],
    countyCode: [''], stateCode: [''], zipCode: [''], fax: [''], webSite: [''], createdDateTime: new Date(),
    createdBy: [''], lastModifiedBy: [''], lastModifiedDateTime: new Date(), remainingCreditLimit: [''],
    companyName: [''], countyName: [''], stateName: [''],
  });
  initialFormValues: HouseAccount;
  isMisMatchStateCounty: boolean;
  constructor(private dataService: SetupService, private spinner: NgxSpinnerService, private toastr: ToastrService
    , private fb: FormBuilder, private setupService: SetupService, private utilityService: UtilityService,
    private constants: ConstantService) {
    this.initialFormValues = this.houseAccountForm.value;
  }

  ngOnInit() {
    this.getCompanyCounty();
    if (this.houseAccountData) {
      this.title = 'Edit House Accounts : ' + this.houseAccountData.accountCode;
      this.houseAccountForm.patchValue(this.houseAccountData);
      this.isEdit = true;
    } else {
      this.houseAccountForm.patchValue(this.initialFormValues);
    }
  }
  // convenience getter for easy access to form fields
  get house() { return this.houseAccountForm.controls; }
  // no consition found so i use forkJoin to send combine request
  getCompanyCounty() {
    this.setupService.getCountyState()
      .subscribe((response) => {
        this.isLoading = false;
        this.countyList = response[0];
        this.stateList = response[1];
      });
  }
  onCountyChange() {
    this.isMisMatchStateCounty = false;
    this.countyList.map(
      x => {
        if (x.countyCode === this.houseAccountForm.get('countyCode').value) {
          this.houseAccountForm.get('stateCode').setValue(x.stateCode);
        }
      });
  }
  onStaeChange() {
    this.isMisMatchStateCounty = false;
    const county = _.find(this.countyList, (item) => {
      if (item.countyCode === this.houseAccountForm.get('countyCode').value) {
        return item;
      }
    });
    if (county.stateCode !== this.houseAccountForm.get('stateCode').value) {
      this.isMisMatchStateCounty = true;
      this.toastr.warning('Please change the county');
    }

  }
  reset() {
    this.submitted = false;
    this.isMisMatchStateCounty = false;
    this.houseAccountForm.patchValue(this.initialFormValues);
  }
  backToList() {
    this.backToHouseAccountList.emit(false);
  }
  formatPhoneNumber(number) {
    this.houseAccountForm.get('phoneNo').setValue(this.utilityService.formatPhoneNumber(number.value));
  }
  editOrSaveClose(event) {
    this.editOrSave(event, () => { this.backToList(); });
  }

  editOrSave(_event, callBack = () => { }) {
    if (this.isMisMatchStateCounty) {
      this.toastr.error('Please change the county');
      return false;
    }
    this.submitted = true;
    if (this.houseAccountForm.valid) {
      this.spinner.show();
      if (this.isEdit) {
        const postData = {
          ...this.houseAccountForm.value
        };
        this.dataService.updateData('HouseAccount', postData).
          subscribe((response: any) => {
            this.spinner.hide();
            if (response) {
              this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
              callBack();
            } else {
              this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          });
      } else {
        this.spinner.show();
        const postData = {
          ...this.houseAccountForm.value
        };
        this.dataService.postData('HouseAccount', postData).
          subscribe((response) => {
            this.spinner.hide();
            if (response && response.houseAccountID) {
              this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
              this.houseAccountForm.get('houseAccountID').setValue(response.houseAccountID);
              this.isEdit = true;
              callBack();
            } else {
              this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
            }
          },
            (error) => {
              this.spinner.hide();
              console.log(error);
              this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
            });
      }
    }
  }
}
