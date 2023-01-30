import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { routerTransition } from 'src/app/router.animations';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-store-group',
  templateUrl: './store-group.component.html',
  styleUrls: ['./store-group.component.scss'],
  animations: [routerTransition(),
  trigger('fadeInOut', [
    state('void', style({
      opacity: 0
    })),
    transition('void <=> *', animate('0.3s')),
  ])],
})
export class StoreGroupComponent implements OnInit {
  rowData: any;
  gridOptions: any;
  userInfo = this.constants.getUserInfo();
  gridApi: any;
  isShowHide = false;
  initialFormValues: any;

  submitted = false;
  isEdit = false;
  companyID: any;

  unAssigned: any = [];
  assigned: any;

  constructor(private fb: FormBuilder, private setupService: SetupService, private constants: ConstantService,
    private gridService: GridService, private toastr: ToastrService, private spinner: NgxSpinnerService,
    private storeService: StoreService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.storeGrpGrid);
    this.initialFormValues = this.storeGroupForm.value;
    this.companyID = this.userInfo.companyID;
  }
  storeGroupForm = this.fb.group({
    notes: [''],
    companyID: this.userInfo.companyID,
    companyStoreGroupID: [''],
    companyStoreGroupName: ['', Validators.required],
    companyName: [''],
  }
  );

  ngOnInit() {
    // this.getStoreGroupData();
    this.getPriceGroupData();
  }
  get ps() { return this.storeGroupForm.controls; }
  reset() {
    this.storeGroupForm.reset();
    this.submitted = false;
    this.storeGroupForm.patchValue(this.initialFormValues);
  }
  addStoreGrp() {
    this.reset();
    this.isShowHide = !this.isShowHide;
    this.isEdit = false;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  edit(params) {
    this.gotoTop();
    this.submitted = false;
    this.storeGroupForm.patchValue(params.data);
    this.isEdit = true;
    this.isShowHide = true;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  getPriceGroupData() {
    this.spinner.show();
    this.setupService.getData(`StoreGroup/GetByCompanyID/${this.userInfo.companyId}`).subscribe((response) => {
      this.unAssigned = [];
      this.assigned = [];
      if (response && response['statusCode']) {
        return;
      }
      response.forEach(element => {
        if (element.companyStoreGroupID === 0) {
          element.stores.forEach(store => {
            this.unAssigned.push(store);
          });
        } else {
          this.assigned.push(element);
        }
      });
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
    });
  }

  updateStoreGrp() {
    this.spinner.show();
    let postData = []
    //Assigned
    this.assigned.forEach(element => {
      let stores = element.stores.map(x => {
        return x.storeLocationID;
      });
      postData.push({
        companyStoreGroupID: element.companyStoreGroupID,
        storeLocationIDs: stores
      });
    });
    //Unassigned
    // let stores = this.unAssigned.map(x => {
    //   return x.storeLocationID;
    // });
    // postData.push({
    //   companyStoreGroupID: 0,
    //   storeLocationIDs: stores.join(',')
    // });
    this.setupService.postData('StoreGroup/AddUpdateStoreGroups', postData).
      subscribe((response: any) => {
        this.spinner.hide();
        if (response && Number(response.status) == 1) {
          this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
          this.getPriceGroupData();
        } else {
          this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
      });
  }

  // getStoreGroupData() {
  //   this.spinner.show();
  //   this._setupService.getData(`CompanyStoreGroup/GetByCompanyID/${this.userInfo.companyId}`).subscribe((response) => {
  //     this.spinner.hide();
  //     if (response && response['statusCode']) {
  //       this.rowData = [];
  //       return;
  //     }
  //     this.rowData = response;
  //   }, (error) => {
  //     this.spinner.hide();
  //   });
  // }

  editOrSave(_event, callBack = () => { }) {
    this.submitted = true;
    if (this.storeGroupForm.invalid) {
      this.toastr.error("Enter all required fields");
      return;
    }
    if (this.storeGroupForm.valid) {
      this.spinner.show();
      if (this.isEdit) {
        const postData = {
          ...this.storeGroupForm.getRawValue(),
        };

        this.setupService.updateData('CompanyStoreGroup/Update', postData).
          subscribe((response: any) => {
            this.spinner.hide();
            if (response && Number(response) == 1) {
              this.reset();
              this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
              this.isShowHide = false;
              // this.getStoreGroupData();
              this.getPriceGroupData();
              callBack();
            } else {
              this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          });
      } else {
        this.spinner.show();
        const postData = {
          ...this.storeGroupForm.getRawValue(),
          companyStoreGroupID: 0,
          companyName: this.userInfo.companyName,
          companyID: this.userInfo.companyId,
        };
        this.setupService.postData('CompanyStoreGroup/AddNew', postData).
          subscribe((response) => {
            this.spinner.hide();

            if (response) {
              this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
              this.isEdit = true;
              this.isShowHide = false;
              // this.getStoreGroupData();
              this.getPriceGroupData();
              callBack();
            }
          },
            (error) => {
              this.spinner.hide();
              if (error.status && error.status === 400) {
                if (error.error.validationErrors) {
                  this.toastr.error(error.error.validationErrors[0].errorMessage, this.constants.infoMessages.error);
                } else {
                  this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
                }
              }
            });
      }
    }
  }

  // deleteRow(_rowIndex) {
  //   const allNodesData = Array<any>()
  //   this.gridApi.forEachNode((node, i) => {
  //     if (_rowIndex !== i) {
  //       allNodesData.push(node.data);
  //     }
  //   });
  //   this.gridApi.setRowData(allNodesData);
  //   this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
  //   this.spinner.hide();
  // }

  // delete($event) {
  //   this._setupService.deleteData(`CompanyStoreGroup/${$event.data.companyStoreGroupID}`).subscribe(result => {
  //     this.spinner.hide();
  //     if (result === '0') {
  //       this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
  //     } else if (result === '1') {
  //       this.deleteRow($event.rowIndex);
  //     }
  //   }, error => {
  //     this.spinner.hide();
  //     this.toastr.error(this.constants.infoMessages.contactAdmin);
  //   });
  // }
}
