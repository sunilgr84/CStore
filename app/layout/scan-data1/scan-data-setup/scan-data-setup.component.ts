import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ScanDataService } from '@shared/services/scanDataService/scan-data.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-scan-data-setup',
  templateUrl: './scan-data-setup.component.html',
  styleUrls: ['./scan-data-setup.component.scss']
})
export class ScanDataSetupComponent implements OnInit {

  fileFormatName = [
    { name: 'companyname' },
    { name: 'storename' },
    { name: 'date' },
    { name: 'accountnumber' }
  ];
  submissionTypes: any;
  fileFormatNameControl = new FormControl()
  selectedFileFormatName = [];
  rowData: any;
  viewData: any[] = [];
  view: boolean;
  manufacturers: any;
  test: boolean = false;
  // companies: any;
  // dataHandlers: any;
  stores: any;
  tempSubmissionDayFlag:boolean=false;
  tempSubmissionTypeFlag:boolean=false;
  programStatus = new FormControl();
  companySetupForm: FormGroup;
  sideContainer = 'side-container-close'
  userInfo: any;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  emails = [];
  connectionTest: boolean = false;
  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private _setupService: SetupService,
    private constantService: ConstantService,
    private scandataService: ScanDataService,
    private toaster: ToastrService,
    private _modalService: NgbModal, private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit() {
    this.userInfo = this.constantService.getUserInfo();
    this.getCompanySetup(this.userInfo.companyId);
    this.createForm();
    this.getManufacturers();
    this.getSubmissionTypes();
    this.getStoresByCompany(this.userInfo.companyId);
  }

  createForm() {
    this.companySetupForm = this.fb.group({
      id: [],
      manufacturerId: [''],
      isChainOfStores: [false],
      manufacturerName: [],
      companyId: [this.userInfo.companyId],
      companyName: [],
      storeId: [''],
      storeName: [],
      accountNo: [],
      fileNameFormat: [],
      fileFormat: [''],
      submissionDay: [''],
      submissionType: [''],
      submissionTypeId: [0],
      hostName: [],
      userName: [],
      password: [],
      connectionType: [null],
      port: [],
      notes: [],
      email: []
    });
  }

  getManufacturers() {
    this.scandataService.getManufacturers().subscribe(res => {
      this.manufacturers = res.result;
    });
  }

  getSubmissionTypes() {
    this.scandataService.getSubmissionTypes().subscribe(res => {
      this.submissionTypes = res.result;
    });
  }

  onSubmissionTypeIdChange(e) {

    if(this.companySetupForm.value.manufacturerId==505){
      this.tempSubmissionTypeFlag=false;
    }else if(this.companySetupForm.value.manufacturerId!=505 && this.companySetupForm.value.submissionTypeId=="0"){
      this.tempSubmissionTypeFlag=true;
    }
    else{
      this.tempSubmissionTypeFlag=false;
    }
    
    this.companySetupForm.controls.submissionTypeId.setValue(+e);
    if (Number(e) === 1) {
      this.companySetupForm.get('hostName').setValidators([Validators.required]);
      this.companySetupForm.get('hostName').updateValueAndValidity();
      this.companySetupForm.get('userName').setValidators([Validators.required]);
      this.companySetupForm.get('userName').updateValueAndValidity();
      this.companySetupForm.get('password').setValidators([Validators.required]);
      this.companySetupForm.get('password').updateValueAndValidity();
      this.companySetupForm.get('connectionType').setValidators([Validators.required]);
      this.companySetupForm.get('connectionType').updateValueAndValidity();
      this.companySetupForm.get('port').setValidators([Validators.required]);
      this.companySetupForm.get('port').updateValueAndValidity();
    } else {
      this.companySetupForm.get('hostName').clearValidators();
      this.companySetupForm.get('hostName').updateValueAndValidity();
      this.companySetupForm.get('userName').clearValidators();
      this.companySetupForm.get('userName').updateValueAndValidity();
      this.companySetupForm.get('password').clearValidators();
      this.companySetupForm.get('password').updateValueAndValidity();
      this.companySetupForm.get('connectionType').clearValidators();
      this.companySetupForm.get('connectionType').updateValueAndValidity();
      this.companySetupForm.get('port').clearValidators();
      this.companySetupForm.get('port').updateValueAndValidity();
    }
  }

  onStoreIdChange(e) {
    this.companySetupForm.controls.storeId.setValue(+e);
  }

  checkSubmission(){
    if(this.companySetupForm.value.manufacturerId==505){
      this.tempSubmissionDayFlag=false;
    }else if(this.companySetupForm.value.manufacturerId!=505 && this.companySetupForm.value.submissionDay==""){
      this.tempSubmissionDayFlag=true;
    }
    else{
      this.tempSubmissionDayFlag=false;
    }
  }

  getManufacturerSetupDetail(id) {
    
    if(this.companySetupForm.value.manufacturerId==505){
      this.tempSubmissionDayFlag=false;
    }else if(this.companySetupForm.value.manufacturerId!=505 && this.companySetupForm.value.submissionDay==""){
      this.tempSubmissionDayFlag=true;
    }
    else{
      this.tempSubmissionDayFlag=false;
    }

    if(this.companySetupForm.value.manufacturerId==505){
      this.tempSubmissionTypeFlag=false;
    }else if(this.companySetupForm.value.manufacturerId!=505 && this.companySetupForm.value.submissionTypeId=="0"){
      this.tempSubmissionTypeFlag=true;
    }
    else{
      this.tempSubmissionTypeFlag=false;
    }



    this.companySetupForm.controls.manufacturerId.setValue(+id);
    if (id) {
      this.spinner.show();
      this.scandataService.getManufacturerSetupDetail(id).subscribe(res => {
        this.spinner.hide();
        // this.manufacturers = res.result;
        if (res.status === 0 || !res.result) {
          return;
        } else {
          this.companySetupForm.controls.fileNameFormat.setValue(res.result.fileNameFormat);
          this.companySetupForm.controls.fileFormat.setValue(res.result.fileFormat);
          this.companySetupForm.controls.hostName.setValue(res.result.hostName);
          this.companySetupForm.controls.submissionDay.setValue(res.result.fileGenerationDay);
          this.selectedFileFormatName = [];
          this.fileFormatNameControl.setValue([]);
          let selc = res.result.fileNameFormat.split('-');
          let selcData = [];
          selc.forEach(element => {
            this.selectedFileFormatName.push(element);
            selcData.push({ name: element });
          });
          this.fileFormatNameControl.setValue(selcData);
        }
      });
    }
    else{
      this.companySetupForm.controls.fileNameFormat.setValue(null);
          this.companySetupForm.controls.fileFormat.setValue(null);
          this.companySetupForm.controls.hostName.setValue(null);
          this.companySetupForm.controls.submissionDay.setValue(null);
          this.selectedFileFormatName = [];
          this.fileFormatNameControl.setValue([]);
    }
  }

  // getDataHandlers() {
  //   this.scandataService.getDataHandlers().subscribe( res => {
  //     this.dataHandlers = res.result;
  //   });
  // }

  // getCompaniesByManufacturer(manufId) {
  //   this.scandataService.getCompaniesByManufacturer(manufId).subscribe( res => {
  //     this.companies = res.result;
  //   });
  // }

  getStoresByCompany(companyId) {
    this.scandataService.getStoresByCompany(companyId).subscribe(res => {
      this.stores = res;
    });
  }

  getCompanySetup(companyId) {
    this.spinner.show();
    this.scandataService.getCompanySetup(companyId).subscribe(res => {
      this.spinner.hide();
      this.rowData = res.result;
    });
  }

  addCompanySetup() {
    this.spinner.show();
    this.scandataService.addCompanySetup(this.companySetupForm.value).subscribe(res => {
      this.spinner.hide();
      this.toastMessage(res);
    });
  }

  updateCompanySetup() {
    this.spinner.show();
    this.scandataService.updateCompanySetup(this.companySetupForm.value).subscribe(res => {
      this.spinner.hide();
      this.toastMessage(res);
    });
  }

  deleteCompanySetup(id) {
    this.spinner.show();
    this.scandataService.deleteCompanySetup(id).subscribe(res => {
      this.spinner.hide();
      this.toastMessage(res);
    });
  }

  testConnection() {
    if (this.companySetupForm.invalid) {
      return;
    }
    this.spinner.show();
    let body = {
      hostName: this.companySetupForm.value.hostName,
      userName: this.companySetupForm.value.userName,
      password: this.companySetupForm.value.password,
      connectionType: this.companySetupForm.value.connectionType,
      port: this.companySetupForm.value.port
    }
    this.scandataService.testConnection(body).subscribe(res => {
      this.spinner.hide();
      if (res.status === 0) {
        this.connectionTest = false;
        this.toaster.error(res.message);
      } else {
        this.connectionTest = true;
        this.toaster.success(res.message);
      }
    });
  }

  toastMessage(res) {
    if (res.status === 0) {
      this.toaster.error(res.message);
    } else {
      this.toaster.success(res.message);
      this.rowData = res.result;
      this.closeSideContainer();
    }
  }


  openSideContainer(row, view) {
    this.selectedFileFormatName = [];
    this.fileFormatNameControl.setValue([]);
    if (row && !view) {
      let selc = row.fileNameFormat.split('-');
      let selcData = [];
      selc.forEach(element => {
        this.selectedFileFormatName.push(element);
        selcData.push({ name: element });
      });
      this.fileFormatNameControl.setValue(selcData);
      if (row.storeId) {
        // if ( !row.dataHandlerId ) {
        //   row.dataHandlerId = 0;
        // }
        this.companySetupForm.setValue(row);
        // this.getCompaniesByManufacturer(row.manufacturerId);
        // this.getStoresByCompany(row.storeId);
      } else {
        this.companySetupForm.removeControl('storeLocation');
        this.companySetupForm.setValue(row);
        // this.getCompaniesByManufacturer(row.manufacturerId);
      }
    } else if (view) {
      this.viewData = [];
      for (let element in row) {
        let data = { key: element, value: row[element] }
        this.viewData.push(data);
      }
      this.view = true;
    }
    document.getElementById("overlay").style.display = "block";
    this.sideContainer = 'side-container-open';
  }
  closeSideContainer() {
    // this.companySetupForm.reset();
    this.createForm();
    this.companySetupForm.controls.isChainOfStores.setValue(false);
    // this.stores = null;
    // this.companies = null;
    this.view = false;
    this.connectionTest = false;
    document.getElementById("overlay").style.display = "none";
    this.sideContainer = 'side-container-close';
  }

  onManufacturerSelect(id) {
    // this.getCompaniesByManufacturer(id);
  }

  onCompanySelect(id) {
    // this.getStoresByCompany(id);
  }

  fileFormatChange(file) {
  }

  onCompanySetupFormSubmit() {
    if (this.companySetupForm.invalid) {
      this.companySetupForm.get('manufacturerId').markAsTouched();
      this.companySetupForm.get('manufacturerId').markAsDirty();
      this.companySetupForm.get('submissionDay').markAsTouched();
      this.companySetupForm.get('submissionDay').markAsDirty();
      return;
    }

    if (this.companySetupForm.get("isChainOfStores").value && this.emails.length === 0) {
      return this.toaster.error('Add Emails');
    }

    let s = '';
    this.emails.forEach(e => {
      s = e.name + ',' + s;
    });
    s = s.replace(/,\s*$/, "");
    this.companySetupForm.controls.email.setValue(s);

    if (Number(this.companySetupForm.get('submissionTypeId').value) === 1 && !this.connectionTest) {
      this.confirmationDialogService.confirm(this.constantService.infoMessages.confirmTitle,
        "Do you want to submit without FTP connection failure/setup")
        .then(() => {
          if (this.companySetupForm.value.id) {
            this.updateCompanySetup();
          } else {
            this.addCompanySetup();
          }
          this.test = false;
        }).catch(() => console.log('User dismissed the dialog'));
      // return this.toaster.error('You can not submit this setup, since ftp connection is not set or failed');
    } else if (this.companySetupForm.value.id) {
      this.updateCompanySetup();
    } else {
      this.addCompanySetup();
    }
    this.test = false;
  }

  addFileFormatName(value) {
    this.selectedFileFormatName.push(value.name)
    let name = this.selectedFileFormatName.toString();
    name = name.replace(/,/g, '-');
    this.companySetupForm.controls.fileNameFormat.setValue(name);
  }

  removeFileFormatName(value) {
    this.selectedFileFormatName.splice(this.selectedFileFormatName.indexOf(value.label), 1);
    let name = this.selectedFileFormatName.toString();
    name = name.replace(/,/g, '-');
    this.companySetupForm.controls.fileNameFormat.setValue(name);
  }
  clearFileFormatName() {
    this.selectedFileFormatName = [];
    this.companySetupForm.controls.fileNameFormat.setValue('');
  }

  openConfirmationModal(id) {
    let modalRef = this._modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.name = 'Company';
    modalRef.result.then(res => {
      this.deleteCompanySetup(id);
    }).catch(err => {
    });
  }

  addEmail(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.emails.push({ name: value.trim() });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeEmail(email): void {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

}
