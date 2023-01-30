import { Component, OnInit, ViewChild, Output, EventEmitter, Input, OnChanges, SimpleChanges, DoCheck, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { routerTransition } from 'src/app/router.animations';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as _ from 'lodash';

@Component({
  selector: 'app-add-company-group',
  templateUrl: './add-company-group.component.html',
  styleUrls: ['./add-company-group.component.scss'],
  animations: [routerTransition(),
  trigger('fadeInOut', [
    state('void', style({
      opacity: 0
    })),
    transition('void <=> *', animate('0.3s')),
  ])],
})
export class AddCompanyGroupComponent implements OnInit, OnChanges {
  @ViewChild('groupN') set ft(groupN: ElementRef | null) {
    if (!groupN) return;
    if (this.isShowHide || this.selectedCompanyPriceGroup)
      groupN.nativeElement.focus();
  };
  @ViewChild('groupN') groupN: ElementRef;
  @Input() selectedCompanyPriceGroup: any;
  @Output() _companyPriceGroup: EventEmitter<any> = new EventEmitter<any>();
  @Input() isDisplay: any;
  @Output() showAdd: EventEmitter<any> = new EventEmitter<any>();

  previousGroupName: any;
  priceGroupForm = this.fb.group({
    CompanyPriceGroupID: [0],
    CompanyID: [0],
    CompanyPriceGroupName: ['', Validators.required],
    MasterPriceGroupID: [0],
    GroupIDs: [null],
    IsSuperGroup: [false]
  });
  defaultForm: any;
  userInfo: any;
  masterPriceGroupList: any[];
  submited = false;
  isEditMode = false;
  isGroupsLoading = true;
  isDublicateGroupName: boolean;
  isShowHide = false;
  constructor(private fb: FormBuilder, private constantService: ConstantService, private setupService: SetupService,
    private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.defaultForm = this.priceGroupForm.value;
    this.userInfo = this.constantService.getUserInfo();
  }

  ngOnInit() {
    this.getMasterPriceGroup();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedCompanyPriceGroup) {
      this.selectedCompanyPriceGroup ?
        this.priceGroupForm.patchValue(this.selectedCompanyPriceGroup) : this.priceGroupForm.patchValue(this.defaultForm);
      this.selectedCompanyPriceGroup ? this.isEditMode = true : this.isEditMode = false;
      this.selectedCompanyPriceGroup ? this.isShowHide = true : this.isShowHide = false;
      (this.selectedCompanyPriceGroup && this.masterPriceGroupList && this.masterPriceGroupList.length > 0) ? this.priceGroupForm.get('GroupIDs').setValue(
        this.masterPriceGroupList.filter((x) => x.masterPriceGroupID === Number(this.selectedCompanyPriceGroup.groupIDs))) :
        this.priceGroupForm.get('GroupIDs').setValue(null);
      if (this.isEditMode) {
        this.previousGroupName = this.selectedCompanyPriceGroup.CompanyPriceGroupName;
        this.defaultForm = this.priceGroupForm.value;
      }
    }
    // tslint:disable-next-line:no-unused-expression
    if (changes.isDisplay) {
      this.isShowHide = changes.isDisplay.currentValue;
    }
  }

  // convenience getter for easy access to form fields
  get pg() { return this.priceGroupForm.controls; }
  get pgf() { return this.priceGroupForm.value; }

  getMasterPriceGroup() {
    this.setupService.getData('MasterPriceGroup/list').subscribe(
      (response) => {
        const myOrderedArray = _.sortBy(response, o => o.masterGroupName);
        this.masterPriceGroupList = myOrderedArray;
        this.isGroupsLoading = false;
      }, (error) => {
        console.log(error);
      }
    );
  }
  CheckPriceGroupNameByCompanyID() {
    //if (this.isEditMode) { return; }
    if (this.pgf.CompanyPriceGroupName) {
      this.spinner.show();
      this.setupService.getData('CompanyPriceGroup/CheckPriceGroupNameByCompanyID/' + this.pgf.CompanyPriceGroupName + '/' +
        this.userInfo.companyId).subscribe(
          (response) => {
            this.spinner.hide();
            if (response === '1' && ((this.isEditMode && this.pgf.CompanyPriceGroupName !== this.previousGroupName) || !this.isEditMode)) {
              this.isDublicateGroupName = true;
              this.toastr.warning('Group name already exists', 'warning');
              //this.groupN.nativeElement.focus();
              // this.priceGroupForm.get('companyPriceGroupName').setValue('');
            } else {
              this.isDublicateGroupName = false;
            }
          });
    }
  }
  onSubmit() {
    this.submited = true;
    if (this.priceGroupForm.valid) {
      let _groupIds = '';
      if (this.pgf.IsSuperGroup) {
        _groupIds = this.pgf.GroupIDs ? this.pgf.GroupIDs.map(x => x.masterPriceGroupID).join(',') : '';
        if (_groupIds === '') {
          this.toastr.warning('Please Select Groups', 'warning');
          return;
        }
      }
      if (this.isDublicateGroupName) {
        this.toastr.warning('Group name already exists', 'warning');
        this.groupN.nativeElement.focus();
        return;
      }
      const postData = {
        companyPriceGroupID: this.pgf.CompanyPriceGroupID,
        companyID: this.userInfo.companyId,
        companyPriceGroupName: this.pgf.CompanyPriceGroupName,
        masterPriceGroupID: this.pgf.MasterPriceGroupID,
        groupIDs: _groupIds,
        isSuperGroup: this.pgf.IsSuperGroup
      };
      if (this.pgf.CompanyPriceGroupID === 0) {
        this.spinner.show();
        this.setupService.postData('CompanyPriceGroup/addNew', postData).subscribe(
          (response) => {
            this.spinner.hide();
            if (response && response.companyPriceGroupID) {
              this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
              this._companyPriceGroup.emit(false);
              this.onReset();
              this.cancel();
            } else {
              this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
            console.log(error);
          });
      } else {
        this.spinner.show();
        this.setupService.updateData('CompanyPriceGroup/update', postData).subscribe(
          (response) => {
            this.spinner.hide();
            if (response === '1') {
              this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
              this._companyPriceGroup.emit(false);
              this.onReset();
              this.cancel();
            } else {
              this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
            console.log(error);
          });

      }
    }
  }
  onReset() {
    this.isEditMode = false;
    this.submited = false;
    this.priceGroupForm.patchValue(this.defaultForm);
  }
  cancel() {
    // this.priceGroupForm.patchValue(this.defaultForm);
    this.priceGroupForm.reset();
    this.isShowHide = false;
    this.showAdd.emit(false);
  }

}
