import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { StoreService } from '@shared/services/store/store.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { StoreMessageService } from '@shared/services/commmon/store-message.service';
import * as moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
@Component({
  selector: 'app-buy-down-manager',
  templateUrl: './buy-down-manager.component.html',
  styleUrls: ['./buy-down-manager.component.scss'],
  animations: [routerTransition()]
})
export class BuyDownManagerComponent implements OnInit {
  buyDownGridApi: any;
  buyDownGridOptions: any;
  buyDownRowData: any;
  storeLocationList: any;
  companyPriceGroupIDList: Array<any> = [];
  userInfo = this.constantService.getUserInfo();
  private _storeLocationId: any;
  buyDownRowAdded: boolean | false;
  promotionItemList: any;
  manufacturerIDList: any;
  scheduleIDList: any;
  manufacturerBuydownScheduleIDList: any;
  storeLocationId: any;
  subscription: any;
  isStoreLoading = true;
  selectedCompanyId: any;
  storeLocationDDList: any;

  manufacturersList: any;
  priceGroupList: any;
  buyDownForm = new FormGroup({
    buyDownName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    manufacturerID: new FormControl('', Validators.required),
    priceGroupIDs: new FormControl([], Validators.required),
    buydownId: new FormControl(0)
  });

  buyDownInitialForm: any;
  get buyDownName() { return this.buyDownForm.get('buyDownName'); }
  get manufacturerID() { return this.buyDownForm.get('manufacturerID'); }
  get buydownId() { return this.buyDownForm.get('buydownId'); }
  get priceGroupIDs() { return this.buyDownForm.get('priceGroupIDs'); }

  buyDownsList: any;
  selectedBuyDownID: any;
  childRowData: any = [];
  childGridOptions: any;
  childGridApi: any;

  sideContainer: any = "side-container-close";
  priceGroupGridOptions: any;
  priceGroupGridApi: any;
  manufacturerBuydownScheduleList: any;

  constructor(private gridService: PaginationGridService, private constantService: ConstantService,
    private storeService: StoreService, private setupService: SetupService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private storeMessageService: StoreMessageService, private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService) {
    this.buyDownGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.buyDownGrid);
    this.subscription = this.storeMessageService.getMessage().subscribe(userInf => {
      const id = userInf && userInf.text;
      this.storeLocationId = this.constantService.getStoreLocationId();
    });

    this.childGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.buyDownStoreDetailsGrid);
    this.priceGroupGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.priceGroupBuyDownGrid);
  }

  ngOnInit() {
    this.storeLocationList = [];
    this.manufacturerIDList = [];
    this.promotionItemList = [];
    this.manufacturerBuydownScheduleIDList = [];
    this.storeLocationDDList = [];
    this.scheduleIDList = [];
    this.getPromotionItemList();
    // this.getManufacturerList();
    this.getStoreLocationList();
    this.storeLocationId = this.constantService.getStoreLocationId();
    this.selectedCompanyId = this.constantService.getUserInfo().companyId;
    this.getBuyDownByCompany();
  }
  onGridReady(params) {
    this.buyDownGridApi = params.api;
    this.buyDownRowData = [];
    this.buyDownGridApi.sizeColumnsToFit();
  }
  pad(input, size) {
    while (input.length < (size || 2)) {
      input = "0" + input;
    }
    return input;
  }
  storeLocationChange(params) {
    if (params) {
      let selectedstore = this.storeLocationList.filter((store) => { return store.storeLocationID == params })[0]
      sessionStorage.setItem('selectedStoreLocationId', params);
      this.storeMessageService.changeStoreLocationId(params);
      // this.getBuyDownData();
    }
  }
  getStoreLocationList() {
    this.isStoreLoading = true;
    let id = this.constantService.getStoreLocationId();
    if (this.storeService.storeLocation) {
      this.isStoreLoading = false;

      this.storeLocationList = this.storeService.storeLocation;
      this.storeLocationList.map((store) => {
        let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
        store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
        return store;
      });
      if (this.storeLocationList && this.storeLocationList.length > 0) {
        if (id) {
          this.storeLocationId = id;
          this.storeLocationChange(this.storeLocationId);
        } else {
          this.storeLocationId = this.storeLocationList[0].storeLocationID;
          this.storeLocationChange(this.storeLocationId);
        }
      }
      this.storeLocationList.forEach(element => {
        this.storeLocationDDList.push({ text: element.storeName, value: element.storeLocationID });
      });
      // this.getBuyDownData();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isStoreLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        this.storeLocationList.map((store) => {
          let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
          store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
          return store;
        });
        if (this.storeLocationList && this.storeLocationList.length > 0) {
          if (id) {
            this.storeLocationId = id;
            this.storeLocationChange(this.storeLocationId);
          } else {
            this.storeLocationId = this.storeLocationList[0].storeLocationID;
            this.storeLocationChange(this.storeLocationId);
          }
        }
        this.storeLocationList.forEach(element => {
          this.storeLocationDDList.push({ text: element.storeName, value: element.storeLocationID });
        });
        // this.getBuyDownData();
      }, (error) => {
        console.log(error);
      });

    }
  }
  // getBuyDownData(): any {
  //   this.setupService.getData('StoreBuydown/getByStore?storelocationId=' + this.storeLocationId).subscribe((response) => {
  //     if (response) {
  //       response.forEach(element => {
  //         this.storeLocationDDList.filter(k => {
  //           if (k.value === element.storeLocationID) {
  //             element.storeName = k.text;
  //           }
  //         })
  //       });
  //       this.buyDownGridApi.setRowData(response);
  //       this.buyDownGridApi.sizeColumnsToFit();
  //     }
  //   }, (error) => {
  //     console.log(error);
  //   });
  // }
  setStoreLocation() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this._storeLocationId = this.storeLocationList[0].value.toString();
    }
  }
  editPriceGItem() {
    if (this.buyDownRowAdded == true) {
      this.toastr.error("Please Save existing data first", "Error");
      return;
    }
    this.buyDownRowAdded = true;
    const newItem = {
      isEdit: true,
      isSaveRequired: true,
      storeName: '',
      storeLocationID: null,
      storeLocationIDList: this.storeLocationDDList,
      itemListIdList: this.promotionItemList,
      manufacturerIDList: this.manufacturerIDList,
      manufacturerID: null,
      buydownAmount: null,
      manufacturerBuydownScheduleIDList: this.manufacturerBuydownScheduleIDList,
      manufacturerBuydownScheduleID: null,
      manufacturerBuydownScheduleName: '',
      itemListId: null,
      description: '',
      storeBuydownID: 0,
      isNewRow: true
    };
    this.buyDownGridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.buyDownGridApi.redrawRows();
    // this.startPriceGroupEditingCell(0, 'storeName');
  }
  startPriceGroupEditingCell(rowIndex?: any, colKey?: any) {
    this.buyDownGridApi.startEditingCell({
      rowIndex: rowIndex,
      colKey: colKey
    });
  }
  getPromotionItemList() {
    this.setupService.getData('Promotion/ItemList/GetitemListItemscount?companyID=' + this.userInfo.companyId).subscribe(
      (res) => {
        res.forEach(element => {
          this.promotionItemList.push({ text: element.description, value: element.itemListId });
        });
      }, (error) => {
        console.log(error);
      }
    );
  }

  getManufacturerList() {
    this.setupService.getData('Manufacturer/getAll').subscribe(
      (res) => {
        this.manufacturersList = res;
        res.forEach(element => {
          this.manufacturerIDList.push({ text: element.manufacturerName, value: element.manufacturerID });
        });
      }, (error) => {
        console.log(error);
      }
    );
  }

  getPriceGroupList() {
    this.setupService.getData('CompanyPriceGroup/getByCompanyID/' + this.userInfo.companyId).subscribe(
      (res) => {
        this.priceGroupList = res;
      }, (error) => {
        console.log(error);
      }
    );
  }

  getScheduleList(manufactureID, rowIndex?) {
    this.setupService.getData('ManufacturerBuydownSchedule/getByManufacturer?manufacturerId=' + manufactureID).subscribe(
      (res) => {
        this.manufacturerBuydownScheduleIDList = [];
        res.forEach(element => {
          element.manufacturerBuydownScheduleName = moment(element.startDate).format('MM/DD/YYYY') + " - " + moment(element.endDate).format('MM/DD/YYYY');
          this.manufacturerBuydownScheduleIDList.push({ value: element.manufacturerBuydownScheduleID, text: element.manufacturerBuydownScheduleName });
        });
        if (rowIndex != undefined)
          this.buyDownGridApi.getRowNode(rowIndex).data.manufacturerBuydownScheduleIDList = this.manufacturerBuydownScheduleIDList;
        if (this.buyDownRowAdded)
          this.buyDownGridApi.getRowNode(0).data.manufacturerBuydownScheduleIDList = this.manufacturerBuydownScheduleIDList;
        this.buyDownGridApi.redrawRows();
      }, (error) => {
        console.log(error);
      }
    );
  }
  onCellValueChanged(params) {
    if (params.column.colId === 'storeLocationID') {
      params.data[params.column.colId] = params.data.value;
      params.data[params.data.textfield] = params.data.text;
    } else if (params.column.colId === 'manufacturerID') {
      params.data[params.column.colId] = parseInt(params.data.value);
      params.data[params.data.textfield] = params.data.text;
      this.getScheduleList(parseInt(params.data.value));
    }
    else if (params.column.colId === 'manufacturerBuydownScheduleID') {
      params.data[params.column.colId] = parseInt(params.data.value);
      params.data[params.data.textfield] = params.data.text;
      params.data.manufacturerBuydownScheduleID = parseInt(params.data.value);
    }
    else if (params.column.colId === 'itemListId') {
      params.data[params.column.colId] = parseInt(params.data.value);
      params.data[params.data.textfield] = params.data.text;
    }
  }
  onBtStopEditing($event) {
    this.onRowValueChanged($event)
  }
  onRowValueChanged($event) {
    if (_.isNumber($event))
      $event = this.buyDownGridApi.getRowNode($event)
    //this.spinner.hide();
    this.buyDownGridApi.stopEditing();
    //this.spinner.show();
    if ($event.data.isNewRow == true) {
      this.buyDownRowAdded = false;
      const postData = {
        "storeBuydownID": 0,
        "manufacturerBuydownScheduleID": $event.data["manufacturerBuydownScheduleID"],
        "storeLocationID": parseInt($event.data["storeLocationID"]),
        "itemListID": $event.data["itemListId"],
        "buydownAmount": $event.data["buydownAmount"],
        "lastModifiedBy": this.userInfo.userName
      }
      this.setupService.postData('StoreBuydown/addNew', postData)
        .subscribe((response) => {
          this.spinner.hide();

          if (response && response.statusCode == 500) {
            this.toastr.error(response.message, this.constantService.infoMessages.addRecordFailed);
          }
          else if (response) {
            $event.data.isNewRow = false;
            $event.data.isEdit = false;
            this.spinner.hide();
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          }
        },
          (error) => {
            //  this.isEdit=true;
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          });
    } else {
      const postData = {
        "storeBuydownID": parseInt($event.data["storeBuydownID"]),
        "manufacturerBuydownScheduleID": parseInt($event.data["manufacturerBuydownScheduleID"]),
        "storeLocationID": parseInt($event.data["storeLocationID"]),
        "itemListID": parseInt($event.data["itemListId"]),
        "buydownAmount": parseInt($event.data["buydownAmount"]),
        "isActive": true,
        "lastModifiedBy": this.userInfo.userName,
        "lastModifiedDateTime": new Date()
      }
      this.setupService.postData('StoreBuydown/update', postData).subscribe(
        (res) => {
          if (res == '1')
            this.spinner.hide();
          $event.data.isEdit = false;
          $event.data.isCancel = true;
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        }, (error) => {
          console.log(error);
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          this.spinner.hide();
        }
      );
    }
  }

  editAction(rowIndex) {
    this.buyDownGridApi.redrawRows();
    this.buyDownGridApi.forEachNode((rowNode, index) => {
      if (rowNode.rowIndex == parseInt(rowIndex)) {
        this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.storeLocationIDList = this.storeLocationDDList;
        this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.itemListIdList = this.promotionItemList;
        this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.manufacturerIDList = this.manufacturerIDList;
        this.getScheduleList(parseInt(this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.manufacturerID), rowIndex);
        this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.manufacturerBuydownScheduleIDList = this.manufacturerBuydownScheduleIDList;
        this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.copy = null;
        this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.copy = JSON.parse(JSON.stringify(rowNode.data));
        this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.isEdit = true;
        this.buyDownGridApi.redrawRows();
      }
      else
        this.buyDownGridApi.getRowNode(parseInt(rowIndex)).data.isEdit = false;
    });

    // this.getStartEditingCell('Description', rowIndex);
  }
  Cancel(_rowIndex) {
    this.buyDownGridApi.getRowNode(_rowIndex).data = this.buyDownGridApi.getRowNode(_rowIndex).data.copy;
    this.buyDownGridApi.getRowNode(_rowIndex).data.isEdit = false;
    this.buyDownGridApi.stopEditing(true);
    this.buyDownGridApi.refreshCells();
    this.buyDownGridApi.redrawRows();
  }
  deleteAction(_rowIndex) {
    this.spinner.show();
    const storeBuydownID = this.buyDownGridApi.getRowNode(_rowIndex).data.storeBuydownID;
    if (parseInt(storeBuydownID) > 0) {
      this.setupService.deleteData('StoreBuydown/delete?storeBuydownID=' + storeBuydownID + '&username=' + this.userInfo.userName)
        .subscribe(response => {
          this.deleteRow(_rowIndex);
        });
    }
    else {
      this.deleteRow(_rowIndex);
      this.buyDownRowAdded = false;
    }
  }

  deleteRow(_rowIndex) {
    const allNodesData = Array<any>()
    const storeListData = this.storeLocationList;
    this.buyDownGridApi.forEachNode((node, i) => {
      if (_rowIndex !== parseInt(node.id)) {
        node.data.storelocationIDList = storeListData;
        allNodesData.push(node.data);
      }
    });
    this.buyDownGridApi.setRowData(allNodesData);
    this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.delete);
    this.spinner.hide();
  }


  //New Impl

  getBuyDownByCompany() {
    this.spinner.show();
    this.setupService.getData('Buydown/getBuydownList?companyId=' + this.userInfo.companyId + "&Username=" + this.userInfo.userName).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        // response.forEach(element => {
        //   let priceGroup = element.priceGroups.map(data => data.description);
        //   element["priceGroup"] = priceGroup.toString();
        // });
        this.buyDownsList = response;

        this.buyDownsList.forEach(element => {
          var itemCountSum = 0; 
          element.groupList.forEach(element1 => {
            itemCountSum += element1.itemCount
          });
          element.itemCountSum = itemCountSum;
        });
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });

  }

  addBuyDown(buyDownModel) {
    this.buyDownForm.reset();
    this.buyDownForm.get("buydownId").setValue(0);
    this.buyDownInitialForm = this.buyDownForm.value;
    this.modalService.open(buyDownModel, { centered: true });
    this.getManufacturerList();
    this.getPriceGroupList();
  }

  clear() {
    this.buyDownForm.reset();
    this.buyDownForm.patchValue(this.buyDownInitialForm);
  }

  saveBuyDown(form) {
    if (form.valid) {
      // if (this.buyDownForm.value.buyDownName.trim().length <= 2) {
      //   this.toastr.error("Name must be at least 2 characters long without leading and lagging spaces", this.constantService.infoMessages.error)
      //   return false;
      // }
      this.spinner.show();
      let postData = {
        buydownID: this.buyDownForm.value.buydownId,
        companyID: this.userInfo.companyId,
        name: this.buyDownForm.value.buyDownName.trim(),
        manufacturerID: this.buyDownForm.value.manufacturerID,
        companyPriceGroupID: this.companyPriceGroupIDList,
        isActive: true
      }
      if (this.buyDownForm.value.buydownId === 0) {
        this.setupService.postData("Buydown/addNew", postData).subscribe((res) => {
          this.spinner.hide();
          if (res.status === 1) {
            this.modalService.dismissAll('');
            this.buyDownForm.reset();
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            this.getBuyDownByCompany();
            this.companyPriceGroupIDList = [];
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
      } else {
        this.setupService.postData("Buydown/update", postData).subscribe((res1: any) => {
          this.spinner.hide();
          console.log(res1)
          if (res1.status === 1) {
            this.modalService.dismissAll('');
            this.buyDownForm.reset();
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
            this.getBuyDownByCompany();
            this.companyPriceGroupIDList = [];
          } else {
            this.toastr.error(this.constantService.infoMessages.updatedRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
      }
    }
  }

  onEditBuyDown(buyDown, buyDownModel) {

    this.buyDownForm.get("buyDownName").setValue(buyDown.name);
    this.buyDownForm.get("manufacturerID").setValue(buyDown.manufacturerID);
    this.buyDownForm.get("priceGroupIDs").setValue(buyDown.groupList.map(data => data.companyPriceGroupID));
    this.companyPriceGroupIDList = buyDown.groupList.map(data => data.companyPriceGroupID)
    this.buyDownForm.get("buydownId").setValue(buyDown.buydownID);
    this.buyDownInitialForm = this.buyDownForm.value;
    this.getManufacturerList();
    this.getPriceGroupList();
    this.modalService.open(buyDownModel, { centered: true });
  }

  deleteBuyDown(buydownId) {
    this.confirmationDialogService.confirm(this.constantService.infoMessages.confirmTitle,
      this.constantService.infoMessages.confirmMessage)
      .then(() => {
        this.onDeleteBuyDown(buydownId);
      }).catch(() => console.log('User dismissed the dialog'));
  }

  onDeleteBuyDown(buydownId) {
    this.spinner.show();
    this.setupService.deleteData('Buydown/delete?BuydownID=' + buydownId).subscribe(result => {
      this.spinner.hide();
      if (result.status === 1) {
        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.delete);
      } else if (result.status === 0) {
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      } else {
        this.toastr.error(result.result.validationErrors ? result.result.validationErrors[0].errorMessage : "", this.constantService.infoMessages.error);
      }
      this.getBuyDownByCompany();
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
    });
  }

  public toggleAccordian(props: NgbPanelChangeEvent): void {
    if (props.nextState) {
      this.selectedBuyDownID = props.panelId;
      this.getBuyDownStoreLocationDetails(props.panelId);
      let selectedBuydown = this.buyDownsList.filter(v => v.buydownID == this.selectedBuyDownID);
      this.getManufacturerScheduleList(selectedBuydown[0].manufacturerID);
    } else {
      this.selectedBuyDownID = null;
    }
  }

  onChildGridReady(params) {
    this.childGridApi = params.api;
    this.childGridApi.sizeColumnsToFit();
  }

  getBuyDownStoreLocationDetails(buyDownID: any) {
    this.spinner.show();
    this.setupService.getData('BuydownStoreLocation/getByStore?BuydownID=' + buyDownID + '&CompanyID=' + this.userInfo.companyId + '&Username=' + this.userInfo.userName).subscribe(
      (res) => {
        this.spinner.hide();
        this.childGridApi.setRowData(res);
        this.childGridApi.sizeColumnsToFit();
        // this.getMixMatchStatus();
        // this.getMixMatchPromotionTypes();
      }, (error) => {
        console.log(error);
      }
    );
  }

  editBuyDownStoreLocationAction(rowIndex) {
    let rowNode = this.childGridApi.getRowNode(rowIndex);
    rowNode.data.isEdit = true;
    rowNode.data.manufacturerBuydownScheduleList = this.manufacturerBuydownScheduleList;
    rowNode.data.storeLocationList = this.storeLocationList;
    this.childGridApi.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'manufacturerBuydownScheduleID',
    });
  }

  saveBuyDownStoreLocationAction(rowIndex) {
    this.spinner.show();
    this.childGridApi.stopEditing();
    let rowNode = this.childGridApi.getRowNode(rowIndex);
    // if (rowNode.data["startDate"] > rowNode.data["endDate"]) {
    //   this.toastr.error("End date should not be less than start date", this.constantService.infoMessages.error);
    //   setTimeout(() => {
    //     this.editBuyDownStoreLocationAction(rowIndex);
    //   }, 200);
    //   rowNode.data.isEdit = true;
    //   this.spinner.hide();
    //   return;
    // }
    rowNode.data.isEdit = false;
    let startDate;
    let endDate;
    let selectedBuyDownSchedule = rowNode.data.manufacturerBuydownScheduleList.filter(v => v.manufacturerBuydownScheduleID === rowNode.data.manufacturerBuydownScheduleID);
    if (selectedBuyDownSchedule.length === 0) {
      if (rowNode.data.manufacturerBuydownScheduleID && rowNode.data.manufacturerBuydownScheduleID.length > 0) {
        let selectedDate = rowNode.data.manufacturerBuydownScheduleID.split(' - ');
        startDate = moment(selectedDate[0]).format('YYYY-MM-DD');
        endDate = moment(selectedDate[1]).format('YYYY-MM-DD');
      } else if (rowNode.data.startDate && rowNode.data.endDate) {
        startDate = moment(rowNode.data.startDate).format('YYYY-MM-DD');
        endDate = moment(rowNode.data.endDate).format('YYYY-MM-DD');
      } else {
        this.toastr.error("Date Range Selection Required", this.constantService.infoMessages.error);
        setTimeout(() => {
          this.editBuyDownStoreLocationAction(rowIndex);
        }, 200);
        rowNode.data.isEdit = true;
        this.spinner.hide();
        return;
      }
    } else {
      startDate = selectedBuyDownSchedule[0].startDate;
      endDate = selectedBuyDownSchedule[0].endDate;
    }
    console.log(rowNode.data)

    let postData: any = {
      buydownStoreLocationID: parseInt(rowNode.data["buydownStoreLocationID"]),
      storeLocationID: parseInt(rowNode.data["storeLocationID"]),
      buydownID: parseInt(rowNode.data["buydownID"]),
      startDate: startDate,
      endDate: endDate,
      buyDownAmt: parseFloat(rowNode.data["buyDownAmt"]).toFixed(2),
      maxSuggestedRetailSellingPrice: parseFloat(rowNode.data["maxSuggestedRetailSellingPrice"]),
      isActive: 1
    };
    if (postData.buydownStoreLocationID) {
      this.setupService.postData('BuydownStoreLocation/update', postData).subscribe(
        (result) => {
          this.spinner.hide();
          if (result.status === 1) {
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          } else if (result.status === 0) {
            this.toastr.error(this.constantService.infoMessages.updatedRecordFailed, this.constantService.infoMessages.error);
          } else {
            this.toastr.error(result.message, this.constantService.infoMessages.error);
          }
          this.getBuyDownStoreLocationDetails(this.selectedBuyDownID);
        }, (error) => {
          this.toastr.error(this.constantService.infoMessages.updatedRecordFailed, this.constantService.infoMessages.error);
          console.log(error);
        }
      );
    } else {
      postData.buydownID = parseInt(this.selectedBuyDownID);
      postData.buydownStoreLocationID = 0;
      this.setupService.postData('BuydownStoreLocation/addNew', postData).subscribe(
        (result) => {
          this.spinner.hide();
          if (result.status === 1) {
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
          this.getBuyDownStoreLocationDetails(this.selectedBuyDownID);
        }, (error) => {
          this.toastr.error(this.constantService.infoMessages.updatedRecordFailed, this.constantService.infoMessages.error);
          console.log(error);
        }
      );
    }
  }

  getManufacturerScheduleList(manufactureID) {
    this.setupService.getData('ManufacturerBuydownSchedule/getByManufacturer?manufacturerId=' + manufactureID).subscribe(
      (res) => {
        this.manufacturerBuydownScheduleList = res;
      }, (error) => {
        console.log(error);
      }
    );
  }

  deleteBuyDownStoreLocationAction(index) {
    let rowNode = this.childGridApi.getRowNode(index);
    console.log(rowNode.data);
    if (rowNode.data.buydownStoreLocationID) {
      this.spinner.show();
      this.setupService.deleteData('BuydownStoreLocation/delete?BuydownStoreLocationId=' + rowNode.data.buydownStoreLocationID + '&username=' + this.userInfo.companyId).subscribe(result => {
        this.spinner.hide();
        if (result.status === 1) {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.delete);
          this.getBuyDownStoreLocationDetails(this.selectedBuyDownID);
        } else if (result.status === 0) {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        } else {
          this.toastr.error(result.message, this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.contactAdmin);
      });
    } else {
      this.toastr.error("Please Save Record Before Deleting", this.constantService.infoMessages.error);
    }
  }

  cancelBuyDownStoreLocationAction(event) {
    this.childGridApi.stopEditing();
    let rowNode = this.childGridApi.getRowNode(event);
    rowNode.data.isEdit = false;
  }

  openSideContainer(params) {
    this.spinner.show();
    this.setupService.getData('Item/GetAllItemsByPriceGroupID/' + params.companyPriceGroupID).subscribe(
      (res) => {
        this.priceGroupGridApi.setRowData(res);
        this.priceGroupGridApi.sizeColumnsToFit();
        document.getElementById("overlay").style.display = "block";
        this.sideContainer = 'side-container-open';
        this.spinner.hide();
      }, (error) => {
        console.log(error);
      }
    );
  }

  closeSideContainer() {
    document.getElementById("overlay").style.display = "none";
    this.sideContainer = 'side-container-close';
  }

  priceGroupGridReady(params) {
    this.priceGroupGridApi = params.api;
    this.priceGroupGridApi.sizeColumnsToFit();
  }

  setIdToList(event) {
    this.companyPriceGroupIDList = [];
    event.forEach(element => {
      this.companyPriceGroupIDList.push(element.CompanyPriceGroupID);
    });
  }
}