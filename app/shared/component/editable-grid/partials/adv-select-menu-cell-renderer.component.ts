import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SetupService } from '../../../services/setupService/setup-service';
import { ConstantService } from '../../../services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '@shared/services/commmon/common.service';


@Component({
  selector: 'select-menu-cell-renderer',
  template: `<ng-select
    #input
    appendTo="body"
    class="select-menu-custom-renderer"
    [items]="selectionList"
    [hideSelected]="true"
    bindLabel="{{ bindLabel }}"
    bindValue="{{ bindValue }}"
    placeholder="{{ placeHolder }}"
    [(ngModel)]="selectedId"
    [clearable]="false"
    (change)="onChange($event)"
    [searchable]="searchable"
  >
  </ng-select>`,
  styles: [
    `
    .ng-select.select-menu-custom-renderer ::ng-deep .ng-select-container {
             border-radius: 4px !important;
             min-height: 36px;
             height: 36px;
      }
    `,
  ],
})
export class AdvSelectMenuCellRenderer implements ICellRendererAngularComp {
  public params: any;
  public gridApi: any;
  public rowIndex: any;
  public selectionList: any = [];
  public bindLabel: any;
  public bindValue: any;
  public selectedId: any;
  public placeHolder: any = '';
  public searchable: any = true;

  @ViewChild('input', { read: ViewContainerRef }) public input: any;

  agInit(params: any): void {
    this.params = params;
    this.gridApi = params.api;
    this.rowIndex = params.rowIndex;
    this.bindLabel = this.params.bindLabel;
    this.bindValue = this.params.bindValue;
    this.selectionList = this.params.selectionList;
    this.selectedId = this.params.selectedId;
    this.placeHolder = this.params.placeHolder;
    this.searchable = this.params.searchable !== undefined ? this.params.searchable : true;
  }
  constructor(private constantService: ConstantService, private setupService: SetupService,
    private spinner: NgxSpinnerService, private toastr: ToastrService, private commonService: CommonService) {
    this.commonService.getCellChange().subscribe(data => {
      if (this.params.gridtype === 'storeitemgrid' && (data.column.colId === "InventoryValuePrice" && this.params.column.colId === "InventoryValuePrice") || ((data.column.colId === "GrossProfit" && this.params.column.colId === "GrossProfit"))) {
        this.params.data[this.params.column.colId] = this.params.value = data.newValue;
      }
      if (this.params.gridtype === 'invoicePaymentGrid' && data.column.colId === "paymentMethodOfDescription" && this.params.column.colId === "paymentMethodOfDescription") {
        this.params.data[this.params.column.colId] = data.newValue.paymentMethodOfDescription;
        this.params.data["methodOfPaymentDescriptionList"] = data.newValue.methodOfPaymentDescriptionList;
      }

    });
  }
  refresh(): boolean {
    return false;
  }
  onChange(event) {
    this.params.value = event[this.bindValue];
    this.params.data[this.params.column.colId] = event[this.bindValue];
    if (this.params.column.colId == 'sourceName') {
      let selectedItem = this.commonService.invoicePaymentList.filter(x => { return x.sourceName == this.params.data[this.params.column.colId] })[0];
      this.params.data.disablemethodOfPaymentDescription = false;
      let paymentSourceObject = this.commonService.invoicePaymentList.filter(x => { return x.sourceName == this.params.data[this.params.column.colId] })[0];
      let filteredMOPList = [];
      if (selectedItem && selectedItem["methodOfPaymentID"] == 5 || selectedItem["methodOfPaymentID"] == 6 || paymentSourceObject["storeBankID"] === null) {
        this.params.data["paymentMethodOfDescription"] = selectedItem["methodOfPaymentDescription"];
        this.params.data["methodOfPaymentID"] = selectedItem["methodOfPaymentID"];
        filteredMOPList = [];
        this.params.data.disablemethodOfPaymentDescription = true;
        this.params.node.setDataValue('paymentMethodOfDescription', this.params.data);
      } else {
        this.params.data["paymentMethodOfDescription"] = null;
        this.params.data["methodOfPaymentID"] = null;
        this.spinner.show();
        this.setupService.getData(`PaymentSource/GetAvailableMops/${paymentSourceObject["storeBankID"]}/${this.params.data.vendorId}/${this.params.data.storeLocationID}`).subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            filteredMOPList = [];
          } else {
            filteredMOPList = res.map((x, index) => {
              return {
                ...x,
                value: index,
                methodOfPaymentDescriptionLabel: x.methodOfPaymentDescription,
                text: x.methodOfPaymentDescription
              };
            });
            this.params.data["methodOfPaymentDescriptionList"] = filteredMOPList;
            this.params.data["sourceNameList"] = this.getDDList();
          }
          this.params.node.setDataValue('paymentMethodOfDescription', this.params.data);
        }, err => {
          this.spinner.hide();
          // this.toastr.error(this.constants.infoMessages.contactAdmin);
          console.log(err);
        });
      }
    }
  }

  getValue(): any {
    return this.params.value;
  }
  getDDList() {
    const invoicePaymentList = this.commonService.invoicePaymentList;
    const finalArray = [];
    if (invoicePaymentList) {
      invoicePaymentList.forEach((x) => {
        const contct = (x.storeBankID == null ? x.sourceName : x.bankNickName);
        finalArray.push({ text: contct, value: x.index });
      });
    }
    return finalArray;
  }

  focusIn() {
    this.input.nativeElement.focus();
  }
}
