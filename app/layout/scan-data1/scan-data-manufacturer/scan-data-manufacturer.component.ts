import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ScanDataService } from '@shared/services/scanDataService/scan-data.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-scan-data-manufacturer',
  templateUrl: './scan-data-manufacturer.component.html',
  styleUrls: ['./scan-data-manufacturer.component.scss']
})
export class ScanDataManufacturerComponent implements OnInit {

  fileFormatName = [
    {name: 'companyname'},
    {name: 'storename'},
    {name: 'date'},
    {name: 'accountnumber'}
  ];
  fileFormatNameControl = new FormControl()
  selectedFileFormatName = [];
  rowData: any;
  viewData: any[] = [];
  dataHandlers: any[] = [];
  view: boolean;
  manufacturers: any;
  // companies: any;
  manuFactForm: FormGroup;
  sideContainer = 'side-container-close'
  userInfo = this.constantService.getUserInfo();
  constructor(private fb: FormBuilder,
              private spinner: NgxSpinnerService,
              private _setupService: SetupService,
              private constantService: ConstantService,
              private scandataService: ScanDataService,
              private toaster: ToastrService,
              private _modalService: NgbModal) { }

  ngOnInit() {
    this.getManufacturerSetup();
    this.createForm();
    this.getManufacturers();
    this.getDataHandlers();
  }

  createForm() {
    this.manuFactForm = this.fb.group({
      id: [],
      manufacturerId: [''],
      manufacturerName: [],
      datahandlerId: [''],
      datahandlerName: [],
      fileNameFormat: [],
      fileGenerationPeriod: [''],
      fileFormat: [''],
      fileGenerationDay: [''],
      gracePeriod: [],
      hostName: [],
    });
  }

  getManufacturers() {
    this.scandataService.getManufacturers().subscribe( res => {
      this.manufacturers = res.result;
    });
  }

  getDataHandlers() {
    this.scandataService.getDataHandlers().subscribe( res => {
      this.dataHandlers = res.result;
    });
  }

  // getCompaniesByManufacturer(manufId) {
  //   this.scandataService.getCompaniesByManufacturer(manufId).subscribe( res => {
  //     this.companies = res.result;
  //   });
  // }

  getManufacturerSetup() {
    this.spinner.show();
    this.scandataService.getManufacturerSetup().subscribe( res => {
      this.spinner.hide();
      this.rowData = res.result;
    });
  }

  addManufacturerSetup() {
    this.spinner.show();
    this.scandataService.addManufacturerSetup(this.manuFactForm.value).subscribe( res => {
      this.spinner.hide();
      this.toastMessage(res);
      this.selectedFileFormatName = [];
    });
  }

  updateManufacturerSetup() {
    this.spinner.show();
    this.scandataService.updateManufacturerSetup(this.manuFactForm.value).subscribe( res => {
      this.selectedFileFormatName = [];
      this.spinner.hide();
      this.toastMessage(res);
    });
  }
  deleteManufacturerSetup(id) {
    this.spinner.show();
    this.scandataService.deleteManufacturerSetup(id).subscribe( res => {
      this.spinner.hide();
      this.toastMessage(res);
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

  onDataHandlerIdChange(e) {
    this.manuFactForm.controls.datahandlerId.setValue(+e);
  }


  openSideContainer(row, view) {
    this.selectedFileFormatName = [];
    this.fileFormatNameControl.setValue([]);
    if (row && !view) {
      let selc = row.fileNameFormat.split('-');
      let selcData = [];
      selc.forEach(element => {
        this.selectedFileFormatName.push(element);
        selcData.push({name: element});
      });
      this.fileFormatNameControl.setValue(selcData);
      this.manuFactForm.setValue(row);
      // this.getDataHandlers();
      // this.getCompaniesByManufacturer(row.manufacturerId);
    } else if (view) {
      this.viewData = [];
      for (let element in row) {
        let data = {key: element, value: row[element]}
        this.viewData.push(data);
      }
      this.view = true;
    }
    document.getElementById("overlay").style.display = "block";
    this.sideContainer = 'side-container-open';
  }
  closeSideContainer() {
    // this.manuFactForm.reset();
    this.createForm();
    this.view = false;
    document.getElementById("overlay").style.display = "none";
    this.sideContainer = 'side-container-close';
  }

  onManufacturerSelect(e) {
    // this.getCompaniesByManufacturer(id);
    this.manuFactForm.controls.manufacturerId.setValue(+e);
  }

  addFileFormatName(value) {
    this.selectedFileFormatName.push(value.name)
    let name = this.selectedFileFormatName.toString();
    name = name.replace(/,/g,'-');
    this.manuFactForm.controls.fileNameFormat.setValue(name);
  }

  removeFileFormatName(value) {
    this.selectedFileFormatName.splice( this.selectedFileFormatName.indexOf(value.label),1);
    let name = this.selectedFileFormatName.toString();
    name = name.replace(/,/g,'-');
    this.manuFactForm.controls.fileNameFormat.setValue(name);
  }
  clearFileFormatName() {
    this.selectedFileFormatName = [];
    this.manuFactForm.controls.fileNameFormat.setValue('');
  }

  onManuFactFormSubmit() {
    if (this.manuFactForm.invalid) {
      this.manuFactForm.get('manufacturerId').markAsTouched();
      this.manuFactForm.get('manufacturerId').markAsDirty();
      return;
    }
    if (this.manuFactForm.value.id) {
      this.updateManufacturerSetup();
    } else {
      this.addManufacturerSetup();
    }
  }

  openConfirmationModal(id) {
    let modalRef = this._modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.name = 'Manufacturer';
    modalRef.result.then(res => {
          this.deleteManufacturerSetup(id);
      }).catch(err => {
    });
  }

}
