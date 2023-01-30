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
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import { CommonService } from '@shared/services/commmon/common.service';

@Component({
  selector: 'app-manage-mix-match',
  templateUrl: './manage-mix-match.component.html',
  styleUrls: ['./manage-mix-match.component.scss']
})
export class ManageMixMatchComponent implements OnInit {

  constructor(private setupService: SetupService, private gridService: PaginationGridService, private constants: ConstantService,
    private modalService: NgbModal, private spinner: NgxSpinnerService, private toastr: ToastrService, private storeService: StoreService, private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService, private commonService: CommonService) {
    this.childGridOptions = this.gridService.getGridOption(this.constants.gridTypes.storeMixMatchDetailGrid);
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
  mixMatchDeals: any;
  mixMatchDealsForFilter: any;
  activePanelIds: any = [];//All panels closed

  promotionItemList: any;
  mixMatchStatusList: any = [];
  mixMatchPromotionTypes: any = [];
  selectedMixMatchID: any;

  //widget
  activeCount: any = 0;
  expiredCount: any = 0;
  goingToExpireCount: any = 0;

  mixMatchForm = new FormGroup({
    mixMatchName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    itemListId: new FormControl('', Validators.required),
    mixMatchId: new FormControl(0)
  });
  mixMatchInitialForm: any;
  get mixMatchName() { return this.mixMatchForm.get('mixMatchName'); }
  get itemListId() { return this.mixMatchForm.get('itemListId'); }
  get mixMatchId() { return this.mixMatchForm.get('mixMatchId'); }

  @ViewChild('mixMatchSearch') restaurantSearchInput: ElementRef;

  ngOnInit() {
    this.storeLocationId = 0;//by default selecting all stores
    this.getStoreLocationList();
    this.getAllStoreLocationList();
    this.getMixMatchByCompany();
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
        this.mixMatchDeals = this.mixMatchDealsForFilter.filter(data => data.MixMatchName.toLowerCase().includes(text.toLowerCase()));
        this.activePanelIds = [];
      } else {
        this.mixMatchDeals = this.mixMatchDealsForFilter;
        if (this.mixMatchDealsForFilter && this.mixMatchDealsForFilter.length > 0) {
          this.activePanelIds.push(this.mixMatchDealsForFilter[0].MixMatchID);
          this.selectedMixMatchID = this.mixMatchDealsForFilter[0].MixMatchID;
          this.getMixMatchStoreLocationDetails(this.mixMatchDealsForFilter[0].MixMatchID);
        }
      }
    });

  }

  onMixMatchKeyPress(e) {
    var startPos = e.currentTarget.selectionStart;
    if (e.which === 32 && startPos == 0)
      e.preventDefault();
  }

  onChildGridReady(params) {
    this.childGridApi = params.api;
    this.childGridApi.sizeColumnsToFit();
  }

  getWidgetDetails() {
    this.setupService.getData('Promotion/ItemList/GetExpiredMixMatchCount?companyID=' + this.userInfo.companyId + '&NoofDaysleft=10').subscribe(
      (res) => {
        this.expiredCount = res[0].ExpiredCount ? res[0].ExpiredCount : 0;
        this.goingToExpireCount = res[0].GoingToExpireCount ? res[0].GoingToExpireCount : 0;
        this.activeCount = res[0].Active ? res[0].Active : 0;
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

  storeLocationChange() {
    this.getMixMatchStoreLocationDetails(this.selectedMixMatchID);
  }

  onNewMixMatch(mixMatchModel) {
    this.mixMatchForm.reset();
    this.mixMatchForm.get("mixMatchId").setValue(0);
    this.mixMatchInitialForm = this.mixMatchForm.value;
    this.modalService.open(mixMatchModel, { centered: true });
    this.getPromotionItemList();
  }

  onEditMixMatchDeal(mixMatchModel, mixMatchDeal) {
    this.mixMatchForm.get("mixMatchId").setValue(mixMatchDeal.MixMatchID);
    this.mixMatchForm.get("itemListId").setValue(mixMatchDeal.ItemListID);
    this.mixMatchForm.get("mixMatchName").setValue(mixMatchDeal.MixMatchName);
    this.mixMatchInitialForm = this.mixMatchForm.value;
    this.modalService.open(mixMatchModel, { centered: true });
    this.getPromotionItemList();
  }

  deleteMixMatchDeal(mixMatchDealId) {
    this.confirmationDialogService.confirm(this.constants.infoMessages.confirmTitle,
      this.constants.infoMessages.confirmMessage)
      .then(() => {
        this.onDeleteMixMatchDeal(mixMatchDealId);
      }).catch(() => console.log('User dismissed the dialog'));
  }

  onDeleteMixMatchDeal(mixMatchDealId) {
    this.spinner.show();
    this.setupService.deleteData('Promotion/mixmatch/delete/' + mixMatchDealId).subscribe(result => {
      this.spinner.hide();
      if (result === '1') {
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
      } else if (result === '0') {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      } else {
        this.toastr.error(result.result.validationErrors ? result.result.validationErrors[0].errorMessage : "", this.constants.infoMessages.error);
      }
      this.getMixMatchByCompany();
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

  getMixMatchByCompany() {
    this.spinner.show();
    this.setupService.getData('Promotion/mixmatch/getByCompanyId/' + this.userInfo.companyId).subscribe(
      (res) => {
        this.spinner.hide();
        this.mixMatchDeals = [...res];
        this.mixMatchDealsForFilter = [...res];
        if (res.length > 0) {
          this.activePanelIds.push(res[0].MixMatchID);
          this.selectedMixMatchID = res[0].MixMatchID;
          this.getMixMatchStoreLocationDetails(res[0].MixMatchID);
        }
      }, (error) => {
        console.log(error);
      }
    );
  }

  saveMixMatch(form) {
    if (form.valid) {
      if (this.mixMatchForm.value.mixMatchName.trim().length <= 4) {
        this.toastr.error("Name must be at least 4 characters long without leading and lagging spaces", this.constants.infoMessages.error)
        return false;
      }
      this.spinner.show();
      let postData = {
        MixMatchID: this.mixMatchForm.value.mixMatchId,
        CompanyID: this.userInfo.companyId,
        Description: this.mixMatchForm.value.mixMatchName.trim(),
        ItemListID: this.mixMatchForm.value.itemListId
      }
      if (this.mixMatchForm.value.mixMatchId === 0) {
        this.setupService.postData("Promotion/mixmatch/addnew", postData).subscribe((res) => {
          this.spinner.hide();
          if (res.mixMatchID && res.mixMatchID > 0) {
            this.modalService.dismissAll('');
            this.mixMatchForm.reset();
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            this.getMixMatchByCompany();
          } else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
      } else {
        this.setupService.updateData("Promotion/mixmatch/update", postData).subscribe((res) => {
          this.spinner.hide();
          if (res === "1") {
            this.modalService.dismissAll('');
            this.mixMatchForm.reset();
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            this.getMixMatchByCompany();
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
      this.selectedMixMatchID = props.panelId;
      this.getMixMatchStoreLocationDetails(props.panelId);
    } else {
      this.selectedMixMatchID = null;
    }
  }

  getMixMatchStoreLocationDetails(mixMatchID: any) {
    this.spinner.show();
    if (this.allStoreLocationList && this.allStoreLocationList.filter(k => k.storeLocationID == this.storeLocationId).length > 0)
      this.storeLocationName = (this.allStoreLocationList.filter(k => k.storeLocationID == this.storeLocationId))[0].storeName;
    this.setupService.getData('Promotion/MixMatchStoreLocation/GetMixMatchStorelocationDetails?companyID=' + this.userInfo.companyId + '&mixMatchID=' + mixMatchID + '&Username=' + this.userInfo.userName).subscribe(
      (res) => {
        this.spinner.hide();
        let filteredData = [];
        if (this.storeLocationId != 0)
          filteredData = res.filter((data) => data.StoreLocationID === this.storeLocationId);
        else
          filteredData = [...res];
        this.childGridApi.setRowData(filteredData);
        this.childGridApi.sizeColumnsToFit();
        this.getMixMatchStatus();
        this.getMixMatchPromotionTypes();
      }, (error) => {
        console.log(error);
      }
    );
  }

  onBtStopEditing(event) {
    this.spinner.show();
    this.childGridApi.stopEditing();
    let rowNode = this.childGridApi.getRowNode(event.rowIndex);
    console.log(rowNode.data);
    if (rowNode.data["BeginDate"] > rowNode.data["EndDate"]) {
      this.toastr.error("End date should not be less than start date", this.constants.infoMessages.error);
      setTimeout(() => {
        this.editAction(event.rowIndex);
      }, 200);
      event.node.data.isEdit = true;
      this.spinner.hide();
      return;
    }
    if (rowNode.data["Co_funded"] === true) {
      if (rowNode.data["ManufacturerFunded"] === null && rowNode.data["RetailerFunded"] !== null) {
        //Continue if any one of the field is filled
      } else if (rowNode.data["RetailerFunded"] === null && rowNode.data["ManufacturerFunded"] !== null) {
        //Continue if any one of the field is filled
      } else {
        this.toastr.error("One of the Discount Amount is Required", this.constants.infoMessages.error);
        setTimeout(() => {
          this.editAction(event.rowIndex);
        }, 200);
        event.node.data.isEdit = true;
        this.spinner.hide();
        return;
      }
    }
    rowNode.data.isEdit = false;
    let postData: any = {
      mixMatchStoreLocationID: rowNode.data["MixMatchStoreLocationID"],
      storeLocationID: rowNode.data["StoreLocationID"],
      mixMatchID: this.selectedMixMatchID,
      posid: rowNode.data["POSID"],
      beginDate: rowNode.data["BeginDate"],
      endDate: rowNode.data["EndDate"],
      mixMatchAmount: rowNode.data["MixMatchAmount"],
      mixMatchUnits: rowNode.data["MixMatchUnits"],
      mixMatchPromotionUnitTypeID: rowNode.data["MixMatchPromotionUnitTypeID"],
      posSyncStatusID: rowNode.data["POSSyncStatusID"],
      manufacturerFunded: rowNode.data["ManufacturerFunded"],
      retailerFunded: rowNode.data["RetailerFunded"],
      co_funded: rowNode.data["Co_funded"]
    };
    if (postData.mixMatchStoreLocationID) {
      postData.lastModifiedBy = this.userInfo.userName;
      postData.lastModifiedDateTime = new Date();
      this.setupService.updateData('Promotion/MixMatchStoreLocation/update', postData).subscribe(
        (result) => {
          this.spinner.hide();
          if (result === '1') {
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            this.getMixMatchStoreLocationDetails(this.selectedMixMatchID);
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
      postData.mixMatchStoreLocationID = 0;
      postData.createdBy = this.userInfo.userName;
      postData.createdDateTime = new Date();
      postData.lastModifiedBy = this.userInfo.userName;
      postData.lastModifiedDateTime = new Date();
      this.setupService.postData('Promotion/MixMatchStoreLocation/addnew', postData).subscribe(
        (result) => {
          this.spinner.hide();
          if (result) {
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            this.getMixMatchStoreLocationDetails(this.selectedMixMatchID);
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
    if (rowNode.data.MixMatchStoreLocationID) {
      this.confirmationDialogService.confirm(this.constants.infoMessages.confirmTitle,
        this.constants.infoMessages.confirmMessage)
        .then(() => {
          this.spinner.show();
          this.setupService.deleteData('Promotion/MixMatchStoreLocation/delete/' + rowNode.data.MixMatchStoreLocationID).subscribe(result => {
            this.spinner.hide();
            if (result === '1') {
              this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
              this.getMixMatchStoreLocationDetails(rowNode.data.MixMatchID);
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
    rowNode.data.mixMatchStatusList = this.mixMatchStatusList;
    rowNode.data.mixMatchPromotionTypes = this.mixMatchPromotionTypes;
    rowNode.data.storeLocationList = this.storeLocationList;
    this.childGridApi.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'StoreName',
    });
  }

  getMixMatchStatus() {
    if (this.mixMatchStatusList.length > 0) return;
    this.setupService.getData('POSSyncStatus/getPOSSyncStatusToptwo').subscribe(
      (res) => {
        this.mixMatchStatusList = res;
      }, (error) => {
        console.log(error);
      }
    );
  }
  onCellValueChanged(event) {
    console.log(event.colDef.field);
    if (event.colDef.field === "ManufacturerFunded" || event.colDef.field === "RetailerFunded" || event.colDef.field === "MixMatchAmount" || event.colDef.field === "Co_funded") {
      this.commonService.setCellChange(event);
    }
  }
  getMixMatchPromotionTypes() {
    if (this.mixMatchPromotionTypes.length > 0) return;
    this.setupService.getData('MixMatchPromotionUnitType/getAll').subscribe(
      (res) => {
        this.mixMatchPromotionTypes = res;
      }, (error) => {
        console.log(error);
      }
    );
  }
  clear() {
    this.mixMatchForm.reset();
    this.mixMatchForm.patchValue(this.mixMatchInitialForm);
  }

}