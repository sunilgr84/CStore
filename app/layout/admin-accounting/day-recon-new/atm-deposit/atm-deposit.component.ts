import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'day-recon-atm-deposit',
  templateUrl: 'atm-deposit.component.html',
})
export class AtmDepositComponent implements OnInit {

  @Input() dayReconData: any;
  @Input() storeLocationID: any;
  @Input() isOpen: boolean = true;
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  constructor(private constantsService: ConstantService, private commonService: CommonService,
    private setupService: SetupService, private fb: FormBuilder, private toastr: ToastrService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.userInfo = this.constantsService.getUserInfo();
    this.getATMTransactions();
  }

  atmSubmitted = false;
  atmInitialData = [];
  userInfo: any;

  transactionForm = this.fb.group({
    ATMTransactionID: [0],
    BeginAmount: [null, Validators.required],
    NoOfTransactions: [null, Validators.required],
    InputAmount: [null, Validators.required],
    DispensedAmount: [0.0, Validators.required],
    EndAmount: [null, Validators.required],
  });

  get transactionF() {
    return this.transactionForm.controls;
  }

  onDialogClose(e: any) {
    console.log({ e });
    this.onClose.emit('atm-deposit');
  }


  atmCancel() {
    if (this.atmInitialData && this.atmInitialData.length > 0)
      this.setData(this.atmInitialData);
  }

  getATMTransactions() {
    this.atmSubmitted = false;
    this.setupService
      .getData("ATMTransaction/getAtmTransactions?storeID=" + this.storeLocationID + "&TransactionDate=" + moment(this.dayReconData.selectedDate).format("MM-DD-YYYY")
      )
      .subscribe((response) => {
        this.atmInitialData = response;
        if (this.atmInitialData && this.atmInitialData.length > 0)
          this.setData(response);
      }
      );
  }


  setData(response) {
    this.transactionForm.controls.ATMTransactionID.setValue(response[0].ATMTransactionID);
    this.transactionForm.controls.BeginAmount.setValue(this.commonService.setMoneyFormat(response[0].BeginAmount));
    this.transactionForm.controls.NoOfTransactions.setValue(response[0].NoOfTransactions);
    this.transactionForm.controls.InputAmount.setValue(this.commonService.setMoneyFormat(response[0].InputAmount));
    this.transactionForm.controls.DispensedAmount.setValue(this.commonService.setMoneyFormat(response[0].DispensedAmount));
    this.transactionForm.controls.EndAmount.setValue(this.commonService.setMoneyFormat(response[0].EndAmount));
  }

  OnChange() {
    const beginAmount = this.transactionForm.controls.BeginAmount.value ? this.transactionForm.controls.BeginAmount.value : 0;
    const inputAmount = this.transactionForm.controls.InputAmount.value ? this.transactionForm.controls.InputAmount.value : 0;
    const dispensedAmount = this.transactionForm.controls.DispensedAmount.value ? this.transactionForm.controls.DispensedAmount.value : 0;
    this.transactionForm.controls.EndAmount.setValue(this.commonService.setMoneyFormat(parseFloat(beginAmount) + parseFloat(inputAmount) - parseFloat(dispensedAmount)));
  }

  editOrSaveATM() {
    this.atmSubmitted = true;
    if (!this.transactionForm.valid)
      return true;
    const postData = {
      "ATMTransactionID": this.transactionF.ATMTransactionID.value,
      "StoreLocationID": this.storeLocationID,
      "BeginAmount": this.transactionF.BeginAmount.value,
      "NoOfTransactions": this.transactionF.NoOfTransactions.value,
      "InputAmount": this.transactionF.InputAmount.value,
      "DispensedAmount": this.transactionF.DispensedAmount.value,
      "EndAmount": this.transactionF.EndAmount.value,
      "transactionDate": moment(this.dayReconData.selectedDate).format("MM-DD-YYYY"),
      "createdBy": this.userInfo.userName,
      "createdDateTime": new Date,
      "lastModifiedBy": this.userInfo.userName,
      "lastModifiedDateTime": new Date
    }
    if (!this.transactionF.ATMTransactionID.value) {
      this.spinner.show();
      this.setupService.postData("ATMTransaction", postData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.atmTransactionID > 0) {
            this.toastr.success(
              this.constantsService.infoMessages.addedRecord,
              this.constantsService.infoMessages.success
            );
            this.getATMTransactions();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.addRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.addRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    } else {
      this.spinner.show();
      this.setupService.updateData("ATMTransaction", postData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && Number(response) === 1) {
            this.toastr.success(
              this.constantsService.infoMessages.updatedRecord,
              this.constantsService.infoMessages.success
            );
            this.getATMTransactions();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.updateRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.updateRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    }
  }
}
