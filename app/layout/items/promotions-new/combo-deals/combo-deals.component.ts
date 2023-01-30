import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoreService } from '@shared/services/store/store.service';
import { MessageService } from '@shared/services/commmon/message-Service';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import * as moment from 'moment';

@Component({
  selector: 'app-combo-deals',
  templateUrl: './combo-deals.component.html',
  styleUrls: ['./combo-deals.component.scss']
})
export class ComboDealsComponent implements OnInit {

  constructor(private setupService: SetupService, private gridService: PaginationGridService, private constants: ConstantService,
    private modalService: NgbModal, private spinner: NgxSpinnerService, private toastr: ToastrService, private storeService: StoreService,
    private messageService: MessageService, private commonService: CommonService,
    private confirmationDialogService: ConfirmationDialogService) {
    this.childGridOptions = this.gridService.getGridOption(this.constants.gridTypes.storeComboDealDetailGrid);
    this.userInfo = this.constants.getUserInfo();
  }

  userInfo: any;
  storeLocationList: any = [];
  allStoreLocationList: any = [];
  storeLocationId: any;
  storeLocationName: any;
  childRowData: any = [];
  childGridOptions: any;
  childGridApi: any;
  comboDeals: any;
  comboDealsForFilter: any;
  activePanelIds: any = [];//All panels closed

  promotionItemList: any;
  comboDealStatusList: any = [];
  comboPriorityTypes: any = [];
  selectedComboDealID: any;

  //widget
  expiredCount: any = 0;
  goingToExpireCount: any = 0;

  comboDealForm = new FormGroup({
    comboDealName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    itemListId: new FormControl('', Validators.required),
    comboDealID: new FormControl(0)
  });
  comboDealInitialForm: any;
  get comboDealName() { return this.comboDealForm.get('comboDealName'); }
  get itemListId() { return this.comboDealForm.get('itemListId'); }
  get comboDealID() { return this.comboDealForm.get('comboDealID'); }

  @ViewChild('comboSearch') restaurantSearchInput: ElementRef;

  ngOnInit() {
    this.storeLocationId = 0;//by default selecting all stores
    this.getStoreLocationList();
    this.getAllStoreLocationList();
    this.getComboDealByCompany();
    this.getWidgetDetails();
    setTimeout(() => {
      this.messageService.sendMessage('expanded_collaps');
    });
    //event for search
    fromEvent(this.restaurantSearchInput.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      })
      // if character length greater then 2
      // , filter(res => res.length > 2)
      // Time in milliseconds between key events
      , debounceTime(1000)
      // If previous query is diffent from current   
      , distinctUntilChanged()
      // subscription for response
    ).subscribe((text: string) => {
      if (text.length > 2) {
        this.comboDeals = this.comboDealsForFilter.filter(data => data.ComboDealName.toLowerCase().includes(text.toLowerCase()));
        this.activePanelIds = [];
      } else {
        this.comboDeals = this.comboDealsForFilter;
      }
    });

  }

  onChildGridReady(params) {
    this.childGridApi = params.api;
    this.childGridApi.sizeColumnsToFit();
  }

  onComboDealKeyPress(e) {
    var startPos = e.currentTarget.selectionStart;
    if (e.which === 32 && startPos == 0)
      e.preventDefault();
  }
  getWidgetDetails() {
    this.setupService.getData('Promotion/ItemList/GetExpiredComboCount?companyID=' + this.userInfo.companyId + '&NoofDaysleft=10').subscribe(
      (res) => {
        this.expiredCount = res[0].ExpiredCount;
        this.goingToExpireCount = res[0].GoingToExpireCount;
      }, (error) => {
        console.log(error);
      }
    );
  }

  getAllStoreLocationList() {
    let allStoreSelection = {
      storeName: "All Stores",
      companyID: this.userInfo.companyId,
      storeLocationID: 0
    }
    if (this.storeService.storeLocation) {
      this.allStoreLocationList = [...this.storeService.storeLocation];
      if (this.allStoreLocationList.length === 1)
        this.storeLocationId = this.allStoreLocationList[0].storeLocationID;
      else
        this.allStoreLocationList.unshift(allStoreSelection);
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.allStoreLocationList = [...this.storeService.storeLocation];
        if (this.allStoreLocationList.length === 1)
          this.storeLocationId = this.allStoreLocationList[0].storeLocationID;
        else
          this.allStoreLocationList.unshift(allStoreSelection);
      }, (error) => {
        console.log(error);
      });
    }
  }

  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = [...this.storeService.storeLocation];
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = [...this.storeService.storeLocation];
      }, (error) => {
        console.log(error);
      });
    }
  }

  getComboDealByCompany() {
    this.spinner.show();
    this.setupService.getData('Promotion/ComboDeal/getByCompanyId/' + this.userInfo.companyId).subscribe(
      (res) => {
        this.spinner.hide();
        this.comboDeals = [...res];
        this.comboDealsForFilter = [...res];
        if (res.length > 0) {
          this.activePanelIds.push(res[0].ComboDealID);
          this.selectedComboDealID = res[0].ComboDealID;
          this.getComboDealStoreLocationDetails(res[0].ComboDealID);
        }
      }, (error) => {
        console.log(error);
      }
    );
  }

  storeLocationChange() {
    this.getComboDealStoreLocationDetails(this.selectedComboDealID);
  }

  onNewComboDeal(comboDealModel) {
    this.comboDealForm.reset();
    this.comboDealForm.get("comboDealID").setValue(0);
    this.comboDealInitialForm = this.comboDealForm.value;
    this.modalService.open(comboDealModel, { centered: true });
    this.getPromotionItemList();
  }

  onEditComboDeal(comboDealModel, comboDeal) {
    this.comboDealForm.get("comboDealID").setValue(comboDeal.ComboDealID);
    this.comboDealForm.get("itemListId").setValue(comboDeal.ItemListID);
    this.comboDealForm.get("comboDealName").setValue(comboDeal.ComboDealName);
    this.comboDealInitialForm = this.comboDealForm.value;
    this.modalService.open(comboDealModel, { centered: true });
    this.getPromotionItemList();
  }

  deleteComboDeal(comboDealId) {
    this.confirmationDialogService.confirm(this.constants.infoMessages.confirmTitle,
      this.constants.infoMessages.confirmMessage)
      .then(() => {
        this.onDeleteComboDeal(comboDealId);
      }).catch(() => console.log('User dismissed the dialog'));
  }

  onDeleteComboDeal(comboDealId) {
    this.spinner.show();
    this.setupService.deleteData('Promotion/ComboDeal/delete/' + comboDealId).subscribe(result => {
      this.spinner.hide();
      if (result === '1') {
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
      } else if (result === '0') {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      } else {
        this.toastr.error(result.result.validationErrors ? result.result.validationErrors[0].errorMessage : "", this.constants.infoMessages.error);
      }
      this.getComboDealByCompany();
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.contactAdmin);
    });
  }

  getPromotionItemList() {
    this.spinner.show();
    this.setupService.getData('Promotion/ItemList/GetitemListItemscount?companyID=' + this.userInfo.companyId).subscribe(
      (res) => {
        this.spinner.hide();
        this.promotionItemList = res;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  saveComboDeal(form) {
    if (form.valid) {
      if (this.comboDealForm.value.comboDealName.trim().length <= 4) {
        this.toastr.error("Name must be at least 4 characters long without leading and lagging spaces", this.constants.infoMessages.error)
        return false;
      }
      this.spinner.show();
      let postData = {
        comboDealID: this.comboDealForm.value.comboDealID,
        companyID: this.userInfo.companyId,
        description: this.comboDealForm.value.comboDealName.trim(),
        itemListID: this.comboDealForm.value.itemListId
      }
      if (this.comboDealForm.value.comboDealID === 0) {
        this.setupService.postData("Promotion/ComboDeal/addNew", postData).subscribe((res) => {
          this.spinner.hide();
          if (res.comboDealID && res.comboDealID > 0) {
            this.modalService.dismissAll('');
            this.comboDealForm.reset();
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            this.getComboDealByCompany();
          } else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
      } else {
        this.setupService.updateData("Promotion/ComboDeal/update", postData).subscribe((res) => {
          this.spinner.hide();
          if (res === "1") {
            this.modalService.dismissAll('');
            this.comboDealForm.reset();
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            this.getComboDealByCompany();
          } else {
            this.toastr.error(this.constants.infoMessages.updatedRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
      }
    }
  }

  public toggleAccordian(props: NgbPanelChangeEvent): void {
    if (props.nextState) {
      this.spinner.show();
      this.selectedComboDealID = props.panelId;
      this.getComboDealStoreLocationDetails(props.panelId);
    } else {
      this.selectedComboDealID = null;
    }
  }

  getComboDealStoreLocationDetails(comboDealID: any) {
    if (this.allStoreLocationList && this.allStoreLocationList.filter(k => k.storeLocationID == this.storeLocationId).length > 0)
      this.storeLocationName = (this.allStoreLocationList.filter(k => k.storeLocationID == this.storeLocationId))[0].storeName;
    this.spinner.show();
    this.setupService.getData('Promotion/ComboDealStorelocation/GetComboStorelocationDetails?companyID=' + this.userInfo.companyId + '&ComboDealID=' + comboDealID + '&Username=' + this.userInfo.userName).subscribe(
      (res) => {
        this.spinner.hide();
        let filteredData = [];
        if (this.storeLocationId != 0)
          filteredData = res.filter((data) => data.StoreLocationID === this.storeLocationId);
        else
          filteredData = [...res];
        if (this.childGridApi) {
          this.childGridApi.setRowData(filteredData);
          this.childGridApi.sizeColumnsToFit();
        }
        this.getComboPriorityTypes();
        this.getPOSSyncStatus();
      }, (error) => {
        console.log(error);
      }
    );
  }

  onBtStopEditing(event) {
    this.spinner.show();
    this.childGridApi.stopEditing();
    let rowNode = this.childGridApi.getRowNode(event.rowIndex);
    if (moment(rowNode.data["BeginDate"]).diff(moment(rowNode.data["EndDate"])) > 0) {
      this.toastr.error("End date should not be less than start date", this.constants.infoMessages.error);
      setTimeout(() => {
        this.editAction(event.rowIndex);
      }, 200);
      event.node.data.isEdit = true;
      this.spinner.hide();
      return;
    }
    rowNode.data.isEdit = false;
    let postData: any = {
      comboDealStoreLocationID: rowNode.data["ComboDealStoreLocationID"],
      storeLocationID: rowNode.data["StoreLocationID"],
      comboDealID: this.selectedComboDealID,
      posid: rowNode.data["POSID"],
      beginDate: rowNode.data["BeginDate"],
      endDate: rowNode.data["EndDate"],
      comboAmount: rowNode.data["ComboAmount"],
      comboUnits: rowNode.data["ComboUnits"],
      comboPriorityTypeID: rowNode.data["ComboPriorityTypeID"],
      comboTypeID: rowNode.data["ComboTypeID"],
      posSyncStatusID: rowNode.data["POSSyncStatusID"],
      manufacturerFunded: rowNode.data["ManufacturerFunded"],
      retailerFunded: rowNode.data["RetailerFunded"],
      co_funded: rowNode.data["Co_funded"]
    };
    if (postData.comboDealStoreLocationID) {
      postData.lastModifiedBy = this.userInfo.userName;
      postData.lastModifiedDateTime = new Date();
      this.setupService.updateData('Promotion/ComboDealStorelocation/update', postData).subscribe(
        (result) => {
          this.spinner.hide();
          if (result === '1') {
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            this.getComboDealStoreLocationDetails(this.selectedComboDealID);
            this.getWidgetDetails();
          } else if (result === '0') {
            this.toastr.error(this.constants.infoMessages.updatedRecordFailed, this.constants.infoMessages.error);
          } else {
            this.toastr.error(result.result.validationErrors ? result.result.validationErrors[0].errorMessage : "", this.constants.infoMessages.error);
          }
        }, (error) => {
          this.toastr.error(this.constants.infoMessages.updatedRecordFailed, this.constants.infoMessages.error);
          console.log(error);
        }
      );
    } else {
      postData.posid = 0;
      postData.comboDealStoreLocationID = 0;
      postData.createdBy = this.userInfo.userName;
      postData.createdDateTime = new Date();
      postData.lastModifiedBy = this.userInfo.userName;
      postData.lastModifiedDateTime = new Date();
      this.setupService.postData('Promotion/ComboDealStorelocation/addNew', postData).subscribe(
        (result) => {
          this.spinner.hide();
          if (result) {
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            this.getComboDealStoreLocationDetails(this.selectedComboDealID);
            this.getWidgetDetails();
          } else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.toastr.error(this.constants.infoMessages.updatedRecordFailed, this.constants.infoMessages.error);
          console.log(error);
        }
      );
    }
  }

  deleteAction(index) {
    let rowNode = this.childGridApi.getRowNode(index);
    if (rowNode.data.ComboDealStoreLocationID) {
      this.confirmationDialogService.confirm(this.constants.infoMessages.confirmTitle,
        this.constants.infoMessages.confirmMessage)
        .then(() => {
          this.spinner.show();
          this.setupService.deleteData('Promotion/ComboDealStorelocation/delete/' + rowNode.data.ComboDealStoreLocationID).subscribe(result => {
            this.spinner.hide();
            if (result === '1') {
              this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
              this.getComboDealStoreLocationDetails(rowNode.data.ComboDealID);
              this.getWidgetDetails();
            } else if (result === '0') {
              this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
            } else {
              this.toastr.error(result.result.validationErrors ? result.result.validationErrors[0].errorMessage : "", this.constants.infoMessages.error);
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.contactAdmin);
          });
        }).catch(() => console.log('User dismissed the dialog'));
    } else {
      this.toastr.error("Please Save Record Before Deleting", this.constants.infoMessages.error);
    }
  }

  cancelAction(event) {
    this.childGridApi.stopEditing();
    let rowNode = this.childGridApi.getRowNode(event);
    rowNode.data.isEdit = false;
  }

  editAction(rowIndex) {
    let rowNode = this.childGridApi.getRowNode(rowIndex);
    rowNode.data.isEdit = true;
    rowNode.data.comboDealStatusList = this.comboDealStatusList;
    rowNode.data.comboPriorityTypes = this.comboPriorityTypes;
    this.childGridApi.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'StoreName',
    });
  }

  getPOSSyncStatus() {
    if (this.comboDealStatusList.length > 0) return;
    this.setupService.getData('POSSyncStatus/getPOSSyncStatusToptwo').subscribe(
      (res) => {
        this.comboDealStatusList = res;
      }, (error) => {
        console.log(error);
      }
    );
  }

  getComboPriorityTypes() {
    this.setupService.getData('ComboDealMaintanence/GetComboPriorityTypes').subscribe(
      (res) => {
        this.comboPriorityTypes = res;
      }, (error) => {
        console.log(error);
      }
    );
  }

  onCellValueChanged(event) {
    if (event.colDef.field === "ManufacturerFunded" || event.colDef.field === "RetailerFunded" || event.colDef.field === "ComboAmount" || event.colDef.field === "Co_funded") {
      this.commonService.setCellChange(event);
    }
  }
  onRowEditingStopped(event) {
    event.node.data.isEdit = false;
  }
  clear() {
    this.comboDealForm.reset();
    this.comboDealForm.patchValue(this.comboDealInitialForm);
  }
}