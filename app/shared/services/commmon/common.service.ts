import { Injectable } from '@angular/core';
import { AgGridNg2 } from 'ag-grid-angular';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class CommonService {
  confirmGameData: any;
  departmentGridOptions: AgGridNg2;
  companyNames: any;
  vendorItemList: any;
  invoiceChargeList: any;
  invoicePaymentList: any;
  invoiceBankPayTypes: any;
  fuelOtherChargeList: any;
  accountTypes: any;
  _fuelInvoiceOtherRow: any;
  _companyPriceGroupRow: any;
  _multiplierInventoryType: any;
  fuelTaxList: any;
  isEditable = false;
  _departmenEDIList: any;
  invoiceDetailList: any;
  // item service cookes
  storageItem: any;
  itemStoreList: any;
  multipackModifierList: any;
  manufacturerList: any;
  stateList: any;

  // lottery service cookes
  confirmActivateObj: any;
  confirmGameList: any[];
  LinkedTypeList: any;

  // isdefault Item
  isItemDefault = false;
  invoiceid: any;
  masterPriceGroupDetails: any;

  fuelSalesTaxesList: any;
  
  isSubmmitedValue: any;
  mopDetailList: any;
  advItemSearch = {
    advaSearchOptions: {
    },
    gridValues: [],
    isBackTolist: false
  };

  isMarkup = false;
  constructor() { }

  //cell changes subject for ag grid
  private cellChangeSubject = new Subject<any>();

  setCellChange(message: string) {
    this.cellChangeSubject.next(message);
  }

  getCellChange(): Observable<any> {
    return this.cellChangeSubject.asObservable();
  }

  //Error Subject for global error handling
  private errors = new Subject<string[]>();

  public addErrors = (errors: string[]): void =>
    this.errors.next(errors);

  public getErrors = () =>
    this.errors.asObservable();

  setMoneyFormat(value) {
    let newValue = '';
    if (value != undefined && value != '' && value != null) {
      value = value.toString();
      newValue = value.replace(/(\.\d{2})\d*/, "$1").replace(/(\d)(?=(\d{3})+\b)/g, "$1,");
      // newValue = '$' + newValue;
      // if (newValue === '$') {
      //   newValue = '$0.00';
      // }
      const indexDecimals = newValue.indexOf('.');
      if (indexDecimals === -1) {
        newValue = newValue + '.00';
      } else {
        const decimals = newValue.slice(indexDecimals + 1);
        if (decimals.length === 1) {
          newValue = newValue + '0';
        }
      }
    }
    return newValue;
  }

}
