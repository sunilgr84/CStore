import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { GridOptions } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ChildSaveButtonComponent } from './childSaveButton.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { SelectRenderer } from './select.component';
import { ChildCheckBoxRenderer } from './childcheckbox.component';
import { ChildInputRenderer } from './childinput.component';

import { StoreService } from '@shared/services/store/store.service';
import * as _ from 'lodash';
import { UtilityService } from '@shared/services/utility/utility.service';

@Component({
    selector: 'account-detail-cell-renderer',
    template: `
    <div class="col-sm-12">
    <small (click)="addRows()" class="subGroupAdd pt-2"><i class="fa fa-plus"></i> Add</small>
    <img [src]="imgURL" height="10" *ngIf="imgURL">
</div>
        <div class="master-details" *ngIf="showGrid">
             <ag-grid-angular
                 #agGrid
                 style="width: 95%; height:250px"
                 id="detailGrid"
                 class="full-width-grid"
                 [columnDefs]="colDefs"
                 [rowData]="detailsRowData"
                 [suppressContextMenu]="true"
                 (gridReady)="onGridReady($event)"
                 [frameworkComponents]="frameworkComponents"
                 [editType]="editType"
                 [gridOptions]="gridInfo" 
                 [enableColResize]="true"
             >
            </ag-grid-angular>
            </div>`

})
export class AccountDetailCellRenderer implements ICellRendererAngularComp, OnDestroy {
    // called on init 
    imgURL: any;
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    editType: any;
    gridInfo: any;
    gridApi: any;
    newRowAdded = false;
    public isCancel: true;
    @ViewChild('agGrid') agGrid: any;
    userInfo: any;
    public isEdit: Boolean | false;
    paymentTermsLoaded = false;
    frequencyLoaded = false;
    childGridLoaded = false;
    // paymentMethods = [];
    paymentFrequencyList = [];
    paymentTerms = [];
    storeList = [];
    selectedStores = [];
    private domLayout;
    private frameworkComponents;
    //[{"methodOfPaymentDescription":"Bank","methodOfPaymentID":1,"isCheck":true,"isCash":false},{"methodOfPaymentDescription":"Cash","methodOfPaymentID":2,"isCheck":false,"isCash":true},{"methodOfPaymentDescription":"PayPal","methodOfPaymentID":3,"isCheck":false,"isCash":false},{"methodOfPaymentDescription":"CreditCard","methodOfPaymentID":4,"isCheck":false,"isCash":false},{"methodOfPaymentDescription":"Store Cash","methodOfPaymentID":5,"isCheck":false,"isCash":true},{"methodOfPaymentDescription":"Cash From Register","methodOfPaymentID":6,"isCheck":false,"isCash":true},{"methodOfPaymentDescription":"House Charges","methodOfPaymentID":7,"isCheck":false,"isCash":false},{"methodOfPaymentDescription":"ACH Debit","methodOfPaymentID":9,"isCheck":false,"isCash":false},{"methodOfPaymentDescription":"ACH Credit","methodOfPaymentID":10,"isCheck":false,"isCash":false},{"methodOfPaymentDescription":"Bank EFT","methodOfPaymentID":12,"isCheck":true,"isCash":false},{"methodOfPaymentDescription":"Check","methodOfPaymentID":13,"isCheck":true,"isCash":false}];

    paymentMethodList = [{ "methodOfPaymentDescription": "ACH Debit", "methodOfPaymentID": 9, "isCheck": false, "isCash": false },
    { "methodOfPaymentDescription": "ACH Credit", "methodOfPaymentID": 10, "isCheck": false, "isCash": false },
    { "methodOfPaymentDescription": "Bank EFT", "methodOfPaymentID": 12, "isCheck": true, "isCash": false },
    { "methodOfPaymentDescription": "Check", "methodOfPaymentID": 13, "isCheck": true, "isCash": false }];
    constructor(private dataService: SetupService, private storeService: StoreService, private constants: ConstantService,
        private toastr: ToastrService, private spinner: NgxSpinnerService, private utilityService: UtilityService) {
        this.userInfo = this.constants.getUserInfo();
        this.getStoresList();
        //this.getPaymentMethodsList();
        this.getPaymentFrequencyList();
        this.getPaymentTerms();
        this.domLayout = "autoHeight";
    }

    agInit(params: any): void {
        this.params = params;
        this.masterGridApi = params.api;
        this.masterRowIndex = params.rowIndex;
        this.colDefs = this.getColDefs();
        this.getChildGridData(params.data.vendorID);
        this.editType = "fullRow";
        this.gridInfo = <GridOptions>{
            context: {
                componentParent: this
            }, stopEditingWhenGridLosesFocus: false
        };
        this.gridInfo.api = params.api;
        this.gridInfo.columnApi = this.getColDefs();
        this.frameworkComponents = {
            SelectRenderer: SelectRenderer,
            childCheckBoxRenderer: ChildCheckBoxRenderer,
            childInputRenderer: ChildInputRenderer
        };

    }
    onGridReady(params) {
        const detailGridId = 'detail_' + this.masterRowIndex;
        this.gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.getColDefs(),
            context: {
                componentParent: this
            },
        };
        this.gridApi = this.gridInfo.api;
        this.masterGridApi.addDetailGridInfo(detailGridId, this.gridInfo);
        params.api.sizeColumnsToFit();
    }
    getChildGridData(vendorId) {
        this.showGrid = false;
        this.isCancel = true;
        this.spinner.show();
        this.dataService.getData('StoreVendor/GetStoreVendorByVendorID?vendorID=' + vendorId)
            .subscribe((response) => {
                this.spinner.hide();
                if (response) {
                    this.selectedStores = _.filter(response.map((ele) => {
                        return ele["storelocationID"]
                    })
                    );
                    response.forEach((item, index) => {
                        item.paymentSourceNameLabel = item.storeBankID == null ? item.paymentSourceName : item.bankNickName;
                        const filteredStores = this.storeList//.filter(k => (k.value === item.storelocationID || !this.selectedStores.includes(k.value)));
                        const stores = filteredStores//.filter(k => k.value === item.storelocationID);
                        if (stores && stores.length > 0)
                            item.storeName = stores[0].text;
                        item.storelocationIDList = filteredStores;
                        if (item.maxAmount !== null) item.maxAmount = item.maxAmount.toFixed(2);
                        else item.maxAmount = 0.00;
                        if (item.dayOfWeek)
                            item.dayOfWeekText = (this.getDayOfWeek()).filter(k => k.value === item.dayOfWeek)[0].text;
                    })
                    this.detailsRowData = response;
                    this.childGridLoaded = true;
                    if (this.frequencyLoaded && this.paymentTermsLoaded)
                        this.showGrid = true;
                }
            });
    }
    getStoresList() {
        let list: any;
        if (this.storeService.storeLocation) {
            list = this.storeService.storeLocation;
            list.forEach(element => {
                this.storeList.push({ text: element.storeName, value: element.storeLocationID });
            });
        } else {
            this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
                list = this.storeService.storeLocation;
                list.forEach(element => {
                    this.storeList.push({ text: element.storeName, value: element.storeLocationID });
                });
            }, (error) => {
                console.log(error);
            });
        }

    }
    getPaymentSourceList(current, rowId, filteredStores, storeLocationId, callback) {
        this.spinner.show();
        this.dataService.getData('PaymentSource/GetpaymentSourceByStore/' + this.userInfo.companyId + '/' + storeLocationId).subscribe(response => {
            this.spinner.hide();
            let paymentSource: any = [];
            if (response && response.length > 0) {
                response.forEach((element, index) => {
                    paymentSource.push({ text: element.storeBankID == null ? element.sourceName : element.bankNickName, value: index, methodOfPaymentID: element.methodOfPaymentID, psIndex: element.paymentSourceID, psStoreBankID: element.storeBankID });
                });
            }
            callback(current, rowId, filteredStores, paymentSource);
        }, err => {
            console.log(err);
        });
    }
    getDayOfWeek() {
        return [
            { text: "Sunday", value: "SUNDAY" },
            { text: "Monday", value: "MONDAY" },
            { text: "Tuesday", value: "TUESDAY" },
            { text: "Wednesday", value: "WEDNESDAY" },
            { text: "Thursday", value: "THURSDAY" },
            { text: "Friday", value: "FRIDAY" },
            { text: "Saturday", value: "SATURDAY" },
        ]
    }
    getPaymentFrequencyList() {
        this.dataService.GetPaymentFrequencyList().subscribe((response) => {
            if (response && response.length > 0) {
                response.forEach(element => {
                    this.paymentFrequencyList.push({ text: element.frequencyDescription, value: element.purchaseFrequencyID });
                });
            }
            this.frequencyLoaded = true;
            if (this.paymentTermsLoaded && this.childGridLoaded)
                this.showGrid = true;
        });
    }

    getPaymentTerms() {
        this.paymentMethodList.forEach((x, i) => {
            x["index"] = i;
        })
        this.paymentMethodList.forEach(element => {
            this.paymentTerms.push({ text: element.methodOfPaymentDescription, value: element.methodOfPaymentID });
        });

        /*  this.dataService.getData('MethodOfPayment/GetAllMOP').subscribe(res => {
             if (res && (res['statusCode'])) {
             } else {
                 res.forEach((x, i) => {
                     x.index = i;
                 })
                 if (res && res.length > 0) {
                     res.forEach(element => {
                         this.paymentTerms.push({ text: element.methodOfPaymentDescription, value: element.methodOfPaymentID });
                     });
                 }
             }
         }, err => {
             console.log(err);
         }); */
        this.paymentTermsLoaded = true;
        if (this.frequencyLoaded && this.childGridLoaded)
            this.showGrid = true;
    }
    onBtStopEditing($event) {
        this.onRowValueChanged($event)
    }
    onRowValueChanged($event) {
        this.spinner.hide();
        this.gridApi.stopEditing();
        if ($event.data.storelocationID === null || $event.data.storelocationID === "") {
            this.toastr.error('Please Select Store...', 'Error');
            this.getStartEditingCell('storelocationID', $event.rowIndex);
            return;
        }
        if ($event.data.paymentSourceID === 0 || $event.data.paymentSourceID === null || $event.data.paymentSourceID === "") {
            this.toastr.error('Please Select valid Payment Source...', 'Error');
            this.getStartEditingCell('paymentSourceIndex', $event.rowIndex);
            return;
        } else {
            let selectedRowData = $event.data;
            let validationStatus = false;
            if (this.detailsRowData.length === 0) {
                validationStatus = true;
            } else {
                _.each(this.detailsRowData, (data, index) => {
                    if (data.storelocationID == selectedRowData.storelocationID && data.paymentSourceID == selectedRowData.paymentSourceID && data.methodOfPaymentID === selectedRowData.methodOfPaymentID && index !== $event.rowIndex) {
                        //  this.toastr.error('Please Select Valid Payment Source...', 'Error');
                        //this.getStartEditingCell('paymentSourceIndex', $event.rowIndex);
                        validationStatus = true;
                        return true;
                    } else {
                        validationStatus = true;
                    }
                });
            }
            if (!validationStatus) {
                return;
            }
        }
        if ($event.data.purchaseFrequencyID === 0 || $event.data.purchaseFrequencyID === null || $event.data.purchaseFrequencyID === "") {
            this.toastr.error('Please Select Purchase Frequency...', 'Error');
            this.getStartEditingCell('purchaseFrequencyID', $event.rowIndex);
            return;
        }
        if ((!$event.data.disableDayOfWeek) && ($event.data.dayOfWeek === '' || $event.data.dayOfWeek === null)) {
            this.toastr.error('Please Select valid Day Of Week...', 'Error');
            this.getStartEditingCell('dayOfWeek', $event.rowIndex);
            return;
        }
        this.spinner.show();
        if ($event.data.storeVendorID === 0) {
            // this.spinner.show();
            this.newRowAdded = false;
            $event.data["storeVendorID"] = parseInt($event.data.storeVendorID);
            $event.data["vendorID"] = parseInt(this.params.data.vendorID);
            $event.data.dayOfWeek = $event.data.dayOfWeekText = $event.data.disableDayOfWeek ? null : $event.data["dayOfWeek"];
            $event.data.methodOfPaymentID = $event.data.disablePaymentTerm ? null : parseInt($event.data["methodOfPaymentID"]);
            $event.data.methodOfPaymentDescription = $event.data.disablePaymentTerm ? null : $event.data["methodOfPaymentDescription"];
            const postData = {
                storeVendorID: $event.data["storeVendorID"],
                vendorID: $event.data["vendorID"],
                storelocationID: parseInt($event.data["storelocationID"]),
                purchaseFrequencyID: parseInt($event.data["purchaseFrequencyID"]),
                methodOfPaymentID: parseInt($event.data["methodOfPaymentID"]),
                dayOfWeek: $event.data["dayOfWeek"],
                printCheck: $event.data["printCheck"],
                generatePO: $event.data["generatePO"],
                paymentSourceID: parseInt($event.data["paymentSourceID"]),
                maxAmount: parseFloat($event.data["maxAmount"]),
                storeBankID: $event.data["storeBankID"] == null ? null : parseInt($event.data["storeBankID"]),
                isBank: ($event.data["storeBankID"] == null) ? false : true,
                AccountNo: $event.data["accountNo"]
            }
            this.dataService.postData('StoreVendor/AddNew', postData)
                .subscribe((response) => {
                    this.spinner.hide();

                    if (response && response.statusCode == 500) {
                        this.toastr.error(response.message, this.constants.infoMessages.addRecordFailed);
                    }
                    else if (response) {
                        $event.data["storeVendorID"] = response.storeVendorID;
                        $event.data.isNewRow = false;
                        $event.data.isEdit = false;
                        this.spinner.hide();
                        this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
                    }
                    /*  else {
                         this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
                     } */
                },
                    (error) => {
                        //  this.isEdit=true;
                        this.spinner.hide();
                        this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
                    });
        } else {
            this.newRowAdded = false;
            $event.data["storeVendorID"] = parseInt($event.data.storeVendorID);
            $event.data["vendorID"] = parseInt(this.params.data.vendorID);
            $event.data.dayOfWeek = $event.data.dayOfWeekText = $event.data.disableDayOfWeek ? null : $event.data["dayOfWeek"];
            $event.data.methodOfPaymentID = $event.data.disablePaymentTerm ? null : parseInt($event.data["methodOfPaymentID"]);
            $event.data.methodOfPaymentDescription = $event.data.disablePaymentTerm ? null : $event.data["methodOfPaymentDescription"];
            const postData = {
                storeVendorID: $event.data["storeVendorID"],
                vendorID: $event.data["vendorID"],
                storelocationID: parseInt($event.data["storelocationID"]),
                purchaseFrequencyID: parseInt($event.data["purchaseFrequencyID"]),
                methodOfPaymentID: parseInt($event.data["methodOfPaymentID"]),
                dayOfWeek: $event.data["dayOfWeek"],
                printCheck: $event.data["printCheck"],
                generatePO: $event.data["generatePO"],
                paymentSourceID: parseInt($event.data["paymentSourceID"]),
                maxAmount: parseFloat($event.data["maxAmount"]),
                storeBankID: $event.data["storeBankID"] == null ? null : parseInt($event.data["storeBankID"]),
                isBank: ($event.data["storeBankID"] == null) ? false : true,
                AccountNo: $event.data["accountNo"],
            }
            this.dataService.updateData('StoreVendor/Update', postData)
                .subscribe((response) => {
                    this.spinner.hide();
                    if (response && response.statusCode == 500) {
                        this.toastr.error(response.message, this.constants.infoMessages.updateRecordFailed);
                    }
                    else if (response && Number(response) == 1) {
                        $event.data.isNewRow = false;
                        $event.data.isEdit = false;
                        this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
                    }/*  else {
                        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
                    } */
                },
                    (error) => {
                        // this.isEdit=true;
                        this.spinner.hide();
                        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
                    });
        }
    }

    getColDefs() {
        return [
            {
                headerName: 'Store Name', field: 'storelocationID', cellRenderer: 'SelectRenderer',
                cellRendererParams: {
                    //inputSource: this.storeList,
                    cellfieldId: 'storelocationID',
                    textfield: 'storeFullName'
                }
            },
            {
                headerName: 'Payment Source', field: 'paymentSourceIndex', cellRenderer: 'SelectRenderer',
                cellRendererParams: {
                    cellfieldId: 'paymentSourceIndex',
                    textfield: 'paymentSourceNameLabel'
                }
            },
            {
                headerName: 'Payment Method', field: 'methodOfPaymentID',
                cellRenderer: 'SelectRenderer',
                cellRendererParams: {
                    inputSource: this.paymentTerms,
                    cellfieldId: 'methodOfPaymentID',
                    textfield: 'methodOfPaymentDescription',
                    disableProperty: "disablePaymentTerm",
                }
            },
            {
                headerName: 'Payment Frequency', field: 'purchaseFrequencyID', cellRenderer: 'SelectRenderer',
                cellRendererParams: {
                    inputSource: this.paymentFrequencyList,
                    textfield: 'frequencyDescription',
                    cellfieldId: 'purchaseFrequencyID',
                }
            },
            {
                headerName: 'Day Of Week', field: 'dayOfWeek', cellRenderer: 'SelectRenderer',
                cellRendererParams: {
                    inputSource: this.getDayOfWeek(),
                    cellfieldId: 'dayOfWeek',
                    textfield: 'dayOfWeekText',
                    disableProperty: "disableDayOfWeek",
                }
            },
            {
                headerName: 'Max Amt', field: 'maxAmount', cellRenderer: 'childInputRenderer',
                cellRendererParams: {
                    //inputSource:,
                    cellfieldId: 'maxAmount',
                    textfield: 'maxAmount',
                    maxLength: '5',
                }
            },
            {
                headerName: 'Account No.', field: 'accountNo', editable: function (params) {
                    return params.data.isEdit;
                }
            },
            {
                headerName: 'Print Check', field: 'printCheck', width: 80, cellRenderer: 'childCheckBoxRenderer',
                cellRendererParams: {
                    cellfieldId: 'printCheck',
                    disableProperty: 'disablePrintCheck'
                }
            },
            {
                headerName: 'Generate PO', field: 'generatePO', width: 100,
                cellRenderer: 'childCheckBoxRenderer',
                cellRendererParams: {
                    cellfieldId: 'generatePO',
                }
            },
            {
                headerName: 'Action', field: 'value', filter: false, width: 120, suppressSorting: false,
                cellRendererFramework: ChildSaveButtonComponent,
            }
        ];
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    addRows() {
        this.spinner.show();
        const filteredStores = this.storeList//.filter(k => !this.selectedStores.includes(k.value));
        if (this.newRowAdded || filteredStores.length === 0) {
            this.spinner.hide();
            if (this.newRowAdded)
                this.toastr.error('Please save existing data first before adding another!');
            else
                this.toastr.error('No stores available to add');
            return;
        }
        this.newRowAdded = true;
        this.selectedStores.push(filteredStores[0].value);
        this.insertRow(this, this.gridInfo.api.getDisplayedRowCount(), filteredStores, []);
        // this.getPaymentSourceList(this, this.gridInfo.api.getDisplayedRowCount(), filteredStores, filteredStores[0].value, this.insertRow);
    }
    insertRow(current, rowIndex, filteredStores, paymentSources) {
        current.gridInfo.api.updateRowData({
            add: [{
                "storeVendorID": 0,
                "vendorID": current.params.vendorID,
                "storelocationID": "",
                "storelocationIDList": filteredStores,
                "storeFullName": "",
                "methodOfPaymentID": "",
                "methodOfPaymentDescription": "",
                "paymentSourceIndex": null,
                "paymentSourceIndexList": paymentSources,
                "paymentSourceID": "",
                "paymentSourceName": "",
                "storeBankID": "",
                "purchaseFrequencyID": "",
                "frequencyDescription": "",
                "dayOfWeek": "",
                "dayOfWeekText": "",
                "printCheck": false,
                "generatePO": false,
                "disableFrequency": false,
                "disablePrintCheck": false,
                "disableDayOfWeek": false,
                "hidePrint": true,
                "isEdit": true,
                "isNewRow": true,
                "maxAmount": 0.00
            },], addIndex: 0
        });
        // current.EditRow(current, rowIndex, filteredStores, paymentSources);
        let rowNode = current.gridApi.getRowNode(rowIndex);
        rowNode.data.isEdit = true;
        current.filterstoreData(filteredStores[0].value, rowIndex, 'storelocationID');
        current.gridApi.redrawRows();
        current.spinner.hide();
    }
    getStartEditingCell(_colKey, _rowIndex) {
        this.gridApi.startEditingCell({
            rowIndex: _rowIndex,
            colKey: _colKey
        });
    }
    getRowData() {
        const storeBankRowData = [];
        this.gridInfo.api.forEachNode(function (node) {
            storeBankRowData.push(node.data);
        });
        this.detailsRowData = storeBankRowData;
        this.gridInfo.api.sizeColumnsToFit();
    }
    ngOnDestroy(): void {
        const detailGridId = 'detail_' + this.masterRowIndex;
        this.masterGridApi.removeDetailGridInfo(detailGridId);
    }
    onChange(i, valuefield, value, textfield, text, params?) {
        const paymentTermsList = this.paymentTerms;
        if (valuefield === 'maxAmount') {
            this.gridApi.getRowNode(i).data[valuefield] = value;
            this.gridApi.getRowNode(i).data[textfield] = text;
            this.gridApi.forEachNode(function (rowNode, index) {
                if (Number(rowNode.id) === i) {
                    rowNode.data.maxAmount = value;
                }
            });
            this.gridApi.refreshCells();
        }
        else if (valuefield === 'storelocationID') {
            this.filterstoreData(value, i, valuefield);
            this.gridApi.getRowNode(i).data[valuefield] = value;
            this.gridApi.getRowNode(i).data[textfield] = text;
            this.getPaymentSourceList(this, i, this.gridApi.getRowNode(i).data[valuefield + "List"], this.gridApi.getRowNode(i).data[valuefield], this.Redraw)
        }
        else if (valuefield === 'paymentSourceIndex') {
            this.gridApi.getRowNode(i).data[valuefield] = value;
            this.gridApi.getRowNode(i).data[textfield] = text;
            this.gridApi.getRowNode(i).data["paymentSourceName"] = text;
            let filteredpaymentSource = this.gridApi.getRowNode(i).data[valuefield + "List"].filter(x => { return x.value == parseInt(value) })[0];
            this.gridApi.getRowNode(i).data["paymentSourceID"] = filteredpaymentSource.psIndex;
            this.gridApi.getRowNode(i).data["storeBankID"] = filteredpaymentSource.psStoreBankID;
            const methodOfPaymentID = this.gridApi.getRowNode(i).data[valuefield + "List"].filter(k => k.value === parseInt(value))[0].methodOfPaymentID;
            this.gridApi.forEachNode(function (rowNode, index) {
                if (Number(rowNode.id) === i) {
                    if (methodOfPaymentID === 6 || rowNode.data.paymentSourceName.toLowerCase() === "cash from register") {
                        rowNode.data.disablePaymentTerm = true;
                        rowNode.data.methodOfPaymentID = null;
                        rowNode.data.methodOfPaymentDescription = null;
                    }
                    else {
                        rowNode.data.methodOfPaymentID = paymentTermsList[0].value;
                        rowNode.data.methodOfPaymentDescription = paymentTermsList[0].text;
                        rowNode.data.disablePaymentTerm = false;
                    }

                    rowNode.data.disablePrintCheck = rowNode.data.methodOfPaymentID == 13 ? false : true;
                    rowNode.data.printCheck = false; //rowNode.data.methodOfPaymentID == 13 ? false : true;
                }
            });
        } else if (valuefield === 'methodOfPaymentID') {
            this.gridApi.getRowNode(i).data[valuefield] = value;
            this.gridApi.getRowNode(i).data[textfield] = text;
            this.gridApi.forEachNode(function (rowNode, index) {
                if (Number(rowNode.id) === i) {
                    rowNode.data.disablePaymentTerm = false;
                    rowNode.data.printCheck = false;
                    if (value == 13) {
                        rowNode.data.disablePrintCheck = false;
                    }
                    else {
                        rowNode.data.disablePrintCheck = true;
                    }
                }
            });
        }
        else if (valuefield == "purchaseFrequencyID") {
            const dayOfWeekList = this.getDayOfWeek();
            this.gridApi.getRowNode(i).data[valuefield] = value;
            this.gridApi.getRowNode(i).data[textfield] = text;
            this.gridApi.forEachNode(function (rowNode, index) {
                if (Number(rowNode.id) === i) {
                    if (text !== 'Weekly') {
                        rowNode.data.dayOfWeek = null;
                        rowNode.data.disableDayOfWeek = true;
                    }
                    else {
                        rowNode.data.dayOfWeek = dayOfWeekList[0].value;
                        rowNode.data.disableDayOfWeek = false;
                    }
                }
            });
        } else if (valuefield == "dayOfWeek") {
            this.gridApi.getRowNode(i).data[valuefield] = value;
            this.gridApi.getRowNode(i).data[textfield] = text;
            this.gridApi.forEachNode(function (rowNode, index) {
                if (Number(rowNode.id) === i) {
                    rowNode.data.dayOfWeek = value;
                    rowNode.data.disableDayOfWeek = false;
                }
            });
        }
        else if (valuefield === 'printCheck') {
            this.gridApi.getRowNode(i).data[valuefield] = value;
        }
        /*  if (valuefield !== "storelocationID") {
             this.gridApi.getRowNode(i).data[valuefield] = value;
             this.gridApi.getRowNode(i).data[textfield] = text;
             this.gridApi.refreshCells();
         } */
    }
    Redraw(current, i, filteredStore, paymentSource) {
        current.gridApi.getRowNode(i).data.paymentSourceIndexList = paymentSource;
        // if (paymentSource && paymentSource.length > 0) {
        //     current.gridApi.getRowNode(i).data.paymentSourceID = paymentSource[0].psIndex;
        //     current.gridApi.getRowNode(i).data.paymentSourceName = paymentSource[0].text;
        //     if (paymentSource[0].methodOfPaymentID === null || paymentSource[0].methodOfPaymentID === 6 || current.gridApi.getRowNode(i).data.paymentSourceName === "Cash from Register") {
        //         current.gridApi.getRowNode(i).data.disablePaymentTerm = true;
        //         current.gridApi.getRowNode(i).data.methodOfPaymentID = null;
        //         current.gridApi.getRowNode(i).data.methodOfPaymentDescription = null;
        //     } else {
        //         current.gridApi.getRowNode(i).data.methodOfPaymentID = current.paymentTerms[0].value;
        //         current.gridApi.getRowNode(i).data.methodOfPaymentDescription = current.paymentTerms[0].text;
        //         current.gridApi.getRowNode(i).data.disablePaymentTerm = false;
        //     }
        //     current.gridApi.getRowNode(i).data.disablePrintCheck = current.gridApi.getRowNode(i).data.methodOfPaymentID !== 13 ? true : false;
        //     //   current.gridApi.getRowNode(i).data.printCheck = current.gridApi.getRowNode(i).data.methodOfPaymentID !== 13 ? false : true;
        // } else {
        current.gridApi.getRowNode(i).data.paymentSourceIndex = null;
        current.gridApi.getRowNode(i).data.paymentSourceID = null;
        current.gridApi.getRowNode(i).data.paymentSourceName = null;
        current.gridApi.getRowNode(i).data.disablePaymentTerm = true;
        current.gridApi.getRowNode(i).data.methodOfPaymentID = null;
        current.gridApi.getRowNode(i).data.methodOfPaymentDescription = null;
        current.gridApi.getRowNode(i).data.disablePrintCheck = true;
        // }
        current.gridApi.redrawRows();
    }

    Edit(_rowIndex) {
        this.gridApi.redrawRows();
        let rowNode = this.gridApi.getRowNode(_rowIndex);
        rowNode.data.copy = null;
        rowNode.data.copy = JSON.parse(JSON.stringify(rowNode.data));
        this.getPaymentSourceList(this, _rowIndex, rowNode.data.storelocationIDList, rowNode.data.storelocationID, this.EditRow)
        this.gridApi.redrawRows();
    }
    EditRow(current, _rowIndex, filteredStore, paymentSource) {
        let rowNode = current.gridApi.getRowNode(_rowIndex);
        rowNode.data.paymentSourceIndexList = paymentSource;
        let data: any;
        if (rowNode.data.paymentSourceID == 0 || rowNode.data.paymentSourceID == null) {
            data = paymentSource[0];
        } else {
            if (rowNode.data.storeBankID) {
                data = paymentSource.filter(k => { return (k.psIndex == rowNode.data.paymentSourceID) && (k.psStoreBankID == rowNode.data.storeBankID) })[0];
            }
            else {
                data = paymentSource.filter(k => { return (k.psIndex == rowNode.data.paymentSourceID) })[0];
            }
        }
        rowNode.data.paymentSourceName = data.text;
        rowNode.data.paymentSourceNameLabel = data.text;
        rowNode.data.paymentSourceIndex = parseInt(data.value);
        rowNode.data.paymentSourceID = parseInt(data.psIndex);
        rowNode.data.disablePaymentTerm = (data.methodOfPaymentID.toString() === '6' || rowNode.data.paymentSourceName === "Cash From Register") ? true : false;
        if (rowNode.data.disablePaymentTerm) {
            rowNode.data.methodOfPaymentID = null;
            rowNode.data.methodOfPaymentDescription = null;
            rowNode.data.printCheck = false;
        }
        rowNode.data.disableDayOfWeek = rowNode.data.frequencyDescription !== 'Weekly' ? true : false;
        rowNode.data.disablePrintCheck = rowNode.data.methodOfPaymentID == 13 ? false : true;
        //  rowNode.data.printCheck = rowNode.data.methodOfPaymentID == 13 ? true : false;
        rowNode.data.isEdit = true;
        current.gridApi.redrawRows();
    }

    Cancel(_rowIndex) {
        this.gridApi.getRowNode(_rowIndex).data = this.gridApi.getRowNode(_rowIndex).data.copy;
        this.gridApi.getRowNode(_rowIndex).data.isEdit = false;
        this.gridApi.stopEditing(true);
        this.gridApi.refreshCells();
        this.gridApi.redrawRows();
    }
    Delete(_rowIndex) {
        this.spinner.show();
        const storeVendorID = this.gridApi.getRowNode(_rowIndex).data.storeVendorID;
        if (parseInt(storeVendorID) > 0) {
            this.dataService.deleteData('StoreVendor?id=' + storeVendorID)
                .subscribe(response => {
                    this.deleteRow(_rowIndex);
                });
        }
        else {
            this.deleteRow(_rowIndex);
            this.newRowAdded = false;
        }
    }

    deleteRow(_rowIndex) {
        const allNodesData = Array<any>()
        const storeListData = this.storeList;
        this.selectedStores = this.selectedStores;//.filter(k => k != this.gridApi.getRowNode(_rowIndex).data['storelocationID']);
        const filteredList = this.selectedStores;
        this.gridApi.forEachNode((node, i) => {
            if (_rowIndex !== parseInt(node.id)) {
                node.data.storelocationIDList = storeListData;//.filter(k => (node.data.storelocationID === k.value || !filteredList.includes(k.value)));
                allNodesData.push(node.data);
            }
        });
        this.gridApi.setRowData(allNodesData);
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
        this.spinner.hide();
    }

    filterstoreData(value, i, valuefield) {
        const storeListData = this.storeList;
        this.selectedStores = this.selectedStores//.filter(k => k != this.gridApi.getRowNode(i).data[valuefield]);
        this.selectedStores.push(parseInt(value));
        const filteredList = this.selectedStores;
        this.gridApi.forEachNode(function (rowNode, index) {
            if (index !== i) {
                rowNode.data.storelocationIDList = storeListData//.filter(k => (parseInt(rowNode.data.storelocationID) === k.value || !filteredList.includes(k.value)));
            }
        });
    }
}
