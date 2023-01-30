import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
} from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { get as _get } from 'lodash';

// helper constants
const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;
const KEY_ENTER = 13;
const KEY_TAB = 9;
const KEY_COPY = 67;
const KEY_PASTE = 86;

// helper functions
const helper = {
  getCharCodeFromEvent: (event: any): any => {
    event = event || window.event;
    return typeof event.which == 'undefined' ? event.keyCode : event.which;
  },
  isCharNumeric: (charStr: string): boolean => {
    return !!/\d/.test(charStr);
  },
  isKeyPressedNumeric: (event: any): boolean => {
    const charCode = helper.getCharCodeFromEvent(event);
    const charStr = event.key ? event.key : String.fromCharCode(charCode);
    return helper.isCharNumeric(charStr);
  },
  deleteOrBackspace: (event: any) => {
    return (
      [KEY_DELETE, KEY_BACKSPACE].indexOf(helper.getCharCodeFromEvent(event)) > -1
    );
  },
  isLeftOrRight: (event: any) => {
    return [37, 39].indexOf(helper.getCharCodeFromEvent(event)) > -1;
  },
  finishedEditingPressed: (event: any) => {
    const charCode = helper.getCharCodeFromEvent(event);
    return charCode === KEY_ENTER || charCode === KEY_TAB;
  },
  pasteOperationPressed: (event: any) => {
    const charCode = helper.getCharCodeFromEvent(event);
    /*  if(charCode === KEY_PASTE){
     //  event.target.value= event.target.value.replace(/[^0-9]/g, "")
     } */
    return charCode === KEY_PASTE;
  },
  copyOperationPressed: (event: any) => {
    const charCode = helper.getCharCodeFromEvent(event);
    return charCode === KEY_COPY;
  }
};

@Component({
  selector: 'app-input-cell-editor',
  template: `
    <div class="field-wrapper">
      <input
        #input
        type="text"
        class="field-input"
        (keydown)="onKeyDown($event)"
        [(ngModel)]="value"
      />
    </div>
  `,
})
export class InputCellEditorComponent
  implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  public value: any;

  @ViewChild('input', { read: ViewContainerRef }) public input: any;

  agInit(params) {
    this.params = params;
    this.setInitialState(this.params);
  }

  setInitialState(params) {
    let startValue;
    if (params.keyPress == KEY_BACKSPACE || params.keyPress == KEY_DELETE) {
      startValue = '';
    } else if (params.keyPress) {
      startValue = params.keyPress;
    } else {
      startValue = params.value;
    }

    this.value = startValue;
  }

  onKeyDown(event: any): void {
    if (helper.isLeftOrRight(event) || helper.deleteOrBackspace(event)) {
      //   event.stopPropagation();
      //  return;
    }

    if (
      !helper.finishedEditingPressed(event) &&
      !helper.isKeyPressedNumeric(event)
    ) {
      if (event.preventDefault) event.preventDefault();
    }
  }

  getValue() {
    return this.value;
  }

  ngAfterViewInit() { }
}

@Component({
  selector: 'app-input-number-cell-editor',
  template: `
    <div class="field-wrapper field-wrapper-number">
      <!-- <div *ngIf="params && !params.showStartIcon" class="field-start-icon">
        <i class="flaticon-earth"></i>
      </div> -->
      <input
        #input
        type="number"
        class="field-input"
        (keydown)="onKeyDown($event)"
        [(ngModel)]="value"
        [min]="min"
        [max]="max"
        [step]="step"
      />
      <div class="field-end-addon">
        <i
          class="flaticon-arrow-chevron-up number-stepup"
          (click)="handleStep('up')"
        ></i>
        <i
          class="flaticon-arrow-chevron-down number-stepdown"
          (click)="handleStep('down')"
        ></i>
      </div>
    </div>
  `,
})
export class InputNumberCellEditorComponent
  implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  public value: number;
  public highlightAllOnFocus: boolean = false;
  private cancelBeforeStart: boolean = false;
  public min: number;
  public max: number;
  public step: number;

  @ViewChild('input', { read: ViewContainerRef }) public input: any;

  agInit(params) {
    this.params = params;
    this.min = this.params.min || 0;
    this.max = this.params.max || 1000000;
    this.step = this.params.step || 1;
    this.setInitialState(this.params);
  }

  focusIn() {
    this.input.nativeElement.focus();
  }

  setInitialState(params: any) {
    let startValue;
    let highlightAllOnFocus = true;

    if (params.keyPress == KEY_BACKSPACE || params.keyPress == KEY_DELETE) {
      startValue = '';
    } else if (params.charPress) {
      startValue = params.charPress;
      highlightAllOnFocus = false;
    } else {
      startValue = params.value;
      if (params.keyPress === KEY_F2) {
        highlightAllOnFocus = false;
      }
    }

    this.value = startValue;
    this.highlightAllOnFocus = highlightAllOnFocus;
  }

  getValue() {
    return this.value;
  }

  isCancelBeforeStart() {
    return this.cancelBeforeStart;
  }

  onKeyDown(event: any): void {
    if (helper.isLeftOrRight(event) || helper.deleteOrBackspace(event)) {
      event.stopPropagation();
      return;
    }

    if (
      !helper.finishedEditingPressed(event) &&
      !helper.isKeyPressedNumeric(event)
    ) {
      if (event.preventDefault) event.preventDefault();
    }
  }

  ngAfterViewInit() {
    window.setTimeout(() => {
      // this.input.element.nativeElement.focus();
      if (this.highlightAllOnFocus) {
        // this.input.element.nativeElement.select();

        this.highlightAllOnFocus = false;
      } else {
        // when we started editing, we want the carot at the end, not the start.
        // this comes into play in two scenarios: a) when user hits F2 and b)
        // when user hits a printable character, then on IE (and only IE) the carot
        // was placed after the first character, thus 'apply' would end up as 'pplea'
        const length = this.input.element.nativeElement.value
          ? this.input.element.nativeElement.value.length
          : 0;
        if (length > 0) {
          this.input.element.nativeElement.setSelectionRange(length, length);
        }
      }

      // this.input.element.nativeElement.focus();
    });
  }

  handleStep(direction: 'up' | 'down') {
    if (direction == 'up') {
      this.input.element.nativeElement.stepUp();
    } else {
      this.input.element.nativeElement.stepDown();
    }
  }

  refresh() {
    return false;
  }
}

@Component({
  selector: 'app-input-switch-cell-editor',
  template: `
    <label class="field-switch-wrapper">
      <input
        #input
        type="checkbox"
        class="field-switch-input"
        [(ngModel)]="value"
        (change)="onChange($event)"
      />
      <span
        class="field-switch-label"
        [attr.data-on]="onText"
        [attr.data-off]="offText"
      ></span>
      <span class="field-switch-handle"></span>
    </label>
  `,
})
export class InputSwitchCellEditorComponent
  implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  public value: number;
  onText: string;
  offText: string;

  @ViewChild('input', { read: ViewContainerRef }) public input: any;

  agInit(params) {
    this.params = params;
    this.onText = _get(params, 'onText', 'On');
    this.offText = _get(params, 'offText', 'Off');
    this.setInitialState(params);
  }

  setInitialState(params) {
    let startValue;

    if (params.keyPress == KEY_BACKSPACE || params.keyPress == KEY_DELETE) {
      startValue = '';
    } else if (params.charPress) {
      startValue = params.charPress;
    } else {
      startValue = params.value;
    }

    this.value = startValue;
  }

  getValue() {
    return this.value;
  }

  onChange(e) {
    // handle additional case on change
    // console.log('e', this.value, e);
  }

  ngAfterViewInit() { }
}

@Component({
  selector: 'app-input-select-cell-editor',
  template: `
    <div [ngClass]="{'field-wrapper': true, 'field-wrapper-success': isSuccess}">
      <ng-select
        appendTo="body"
        [items]="itemsList"
        [multiple]="multiple"
        [clearable]="false"
        [(ngModel)]="value"
        bindLabel="{{labelKey}}"
        bindValue="{{valueKey}}"
        (change)="onChange($event)"
      >
        <ng-template ng-label-tmp let-item="item" let-clear="clear">
          <span class="ng-value-label">{{ item.label }}</span>
          <span
            class="ng-value-icon flaticon-cancel right"
            (click)="clear(item)"
            aria-hidden="true"
          >
          </span>
        </ng-template>
      </ng-select>
    </div>
  `,
})
export class InputSelectCellEditorComponent
  implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  value: number;
  itemsList: any[];
  multiple: boolean;
  labelKey: string;
  valueKey: string;
  isSuccess: boolean;

  @ViewChild('select', { read: ViewContainerRef }) public select: any;

  agInit(params) {
    this.params = params;
    this.itemsList = _get(this.params, 'itemsList', []);
    this.multiple = _get(this.params, 'multiple', false);
    this.labelKey = _get(this.params, 'labelKey', 'label');
    this.valueKey = _get(this.params, 'valueKey', 'value');
    this.isSuccess = _get(this.params, 'isSuccess', false);
    this.setInitialState(params);
  }

  setInitialState(params) {
    let startValue;

    if (params.keyPress == KEY_BACKSPACE || params.keyPress == KEY_DELETE) {
      startValue = '';
    } else if (params.charPress) {
      startValue = params.charPress;
    } else {
      startValue = params.value;
    }

    this.value = startValue;
  }

  getValue() {
    return this.value;
  }

  onChange(e) {
    // handle additional case on change
    // console.log('e', this.value, e);
  }

  ngAfterViewInit() { }
}

import { SetupService } from '../../../services/setupService/setup-service';
import { ConstantService } from '../../../services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '@shared/services/commmon/common.service';

@Component({
  selector: 'app-input-cell',
  template: `
    <div class="field-wrapper">
      <input
        #input
        type="text"
        class="field-input"
        (keydown)="onKeyDown($event)"
        (paste)="onPasteEvent($event)"
        (focusout) = "onFocusOut($event)"
        [(ngModel)] = "value"
      />
    </div>
  `,
})
export class InputCellRendererComponent
  implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  public value: any;
  userInfo: any;
  @ViewChild('input', { read: ViewContainerRef }) public input: any;

  agInit(params) {
    this.params = params;
    this.setInitialState(this.params);
    this.userInfo = this.constantService.getUserInfo();
  }
  constructor(private constantService: ConstantService, private setupService: SetupService,
    private spinner: NgxSpinnerService, private toastr: ToastrService, private commonService: CommonService) {
    this.commonService.getCellChange().subscribe(data => {
      if (this.params.gridtype === 'storeitemgrid' && (data.column.colId === "InventoryValuePrice" && this.params.column.colId === "InventoryValuePrice") || ((data.column.colId === "GrossProfit" && this.params.column.colId === "GrossProfit"))) {
        this.value = data.newValue;
      } else if (this.params.gridtype === 'managegamesgrid' && (data.column.colId === "lotteryPackValue" && this.params.column.colId === "lotteryPackValue")) {
        this.value = data.newValue;
      }
    });
  }

  setInitialState(params) {
    let startValue;
    if (params.keyPress == KEY_BACKSPACE || params.keyPress == KEY_DELETE) {
      startValue = '';
    } else if (params.keyPress) {
      startValue = params.keyPress;
    } else {
      startValue = params.value;
    }

    this.params.oldValue = this.params.newValue = this.value = startValue;
  }

  onPasteEvent(event: any): void {
    let pastedData = event.clipboardData.getData('text');
    let numeric = /^\d*(\.\d+)?$/;
    if (!numeric.test(pastedData)) {
      event.preventDefault();
      return;
    }
  }

  onKeyDown(event: any): void {
    if (helper.isLeftOrRight(event) || helper.deleteOrBackspace(event)) {
      event.stopPropagation();
      return;
    }
    if (
      !helper.finishedEditingPressed(event) &&
      !helper.isKeyPressedNumeric(event)
      && !helper.pasteOperationPressed(event)
      && !helper.copyOperationPressed(event)
    ) {
      if (event.preventDefault) event.preventDefault();
    }
  }
  onFocusOut(event) {
    this.params.oldValue = this.params.node.data[this.params.column.colId];
    this.params.newValue = event.currentTarget.value;
    if (this.params.oldValue != this.params.newValue) {
      if (this.params.column.colId == "upcCode" || this.params.column.colId == "posCode") {
        if (this.params.newValue) {
          if (this.params.newValue && this.params.node.data.masterUPCCode && this.params.newValue === this.params.node.data.masterUPCCode) {
            this.toastr.error('You can not make relation with same item', this.constantService.infoMessages.warning);
            return;
          }
          this.spinner.show();
          this.setupService.getData('Item/checkPOSCode/' + this.params.newValue + '/' + this.userInfo.companyId).subscribe(
            (response) => {
              this.spinner.hide();
              if (response && response.itemID === this.params.node.data.itemID) {
                this.toastr.error('You can not make relation with same item', this.constantService.infoMessages.warning);
                return;
              }
              if (this.params.column.colId == "upcCode") {
                if (response) {
                  this.params.oldValue = this.params.node.data[this.params.column.colId] = this.params.newValue;
                  this.params.node.setDataValue('itemDescription', response.description);
                  this.params.node.setDataValue('containedItemID', response.itemID);
                } else {
                  this.value = this.params.oldValue;
                  this.toastr.warning('Item pos code not found', this.constantService.infoMessages.warning);
                }
              }
              else if (this.params.column.colId == "posCode") {
                if (response && response.itemID) {
                  this.params.oldValue = this.params.node.data[this.params.column.colId] = this.params.newValue;
                  this.params.node.setDataValue('description', response.description);
                  this.params.node.setDataValue('linkItemID', response.itemID);
                  // rowNode.setDataValue('itemID', response.itemID);
                } else {
                  this.params.node.setDataValue('posCode', this.params.oldValue);
                  this.toastr.warning('Item pos code not found', this.constantService.infoMessages.warning);
                }

              }
            }, (error) => {
              this.spinner.hide();
              console.log(error);
            }
          );
        }
      }
      if (this.params.gridtype === 'storeitemgrid') {
        this.params.node.data[this.params.column.colId] = parseInt(this.params.newValue);
        if (this.params.column.colId === "BuyingCost") {
          if (this.params.node.data.buyingCost && this.params.node.data.buyingCost && (Number(this.params.node.data.buyingDiscount) < Number(this.params.node.data.buyingCost))) {
            this.params.node.data.inventoryValuePrice =
              ((this.params.node.data.buyingCost - this.params.node.data.buyingDiscount) / 1).toFixed(2);
            const profit = parseFloat(this.params.node.data.regularSellPrice) - parseFloat(this.params.node.data.inventoryValuePrice);
            let grossMargin = ((profit) * 100) / parseFloat(this.params.node.data.regularSellPrice);
            this.params.node.data.grossProfit = grossMargin.toFixed(2);
            // this.params.node.setData(this.params.data);
            // const arr = [];
            // this.params.api && this.params.api.forEachNode(function (node) {
            //   arr.push(node.data);
            // });
            // this.params.api.setRowData(arr);

            this.params.node.setDataValue('inventoryValuePrice', this.params.node.data.inventoryValuePrice);
            this.params.node.setDataValue('grossProfit', this.params.node.data.grossProfit);
            // this.params.api.redrawRows();
            // this.params.api.stopEditing();
            // this.params.api.startEditingCell({
            //   rowIndex:  this.params.rowIndex,
            //   colKey: 'StoreName'
            // });
          }
        }
        if (this.params.column.colId === "buyingDiscount") {
          if (this.params.node.data.buyingCost && this.params.node.data.buyingDiscount && (Number(this.params.node.data.buyingDiscount) < Number(this.params.node.data.buyingCost))) {
            this.params.node.data.inventoryValuePrice =
              ((this.params.node.data.buyingCost - this.params.node.data.buyingDiscount) / 1).toFixed(2);
            let profit = parseFloat(this.params.node.data.regularSellPrice) - parseFloat(this.params.node.data.inventoryValuePrice);
            let grossMargin = ((profit) * 100) / parseFloat(this.params.node.data.regularSellPrice);
            this.params.node.data.grossProfit = grossMargin.toFixed(2);
            //this.params.node.setData(this.params.data);
            this.params.node.setDataValue('inventoryValuePrice', this.params.node.data.inventoryValuePrice);
            this.params.node.setDataValue('grossProfit', this.params.node.data.grossProfit);
            //this.params.api.redrawRows();
            //this.params.api.redrawRows();
            // this.params.api.stopEditing();
            // this.params.api.startEditingCell({
            //   rowIndex:  this.params.rowIndex,
            //   colKey: 'StoreName'
            // });
          }
        }
        if ((Number(this.params.node.data.buyingDiscount) > Number(this.params.node.data.buyingCost))) {
          this.toastr.warning('Cost Buy Should be greater than Cost Discount');
          this.params.node.data.buyingDiscount = null;
          //this.getStartEditingCell('BuyingDiscount', this.params.rowIndex);
          return;
        }
        if (Number(this.params.oldValue) !== Number(this.params.newValue)) {
          //this._pricingRowIndex = params.rowIndex;
        }
        // if (this.params.data && this.params.data.InventoryValuePrice && Number(this.params.data.InventoryValuePrice) > 999.99) {
        //   this.toastr.warning('Cost should be below in 999.99');
        //  // this.getStartEditingCell('InventoryValuePrice', this.params.rowIndex);
        //   return;
        // }

        // if (this.params.data.RegularSellPrice && Number(this.params.data.RegularSellPrice) > 999.99) {
        //   this.toastr.warning('Sell Price should be below in 999.99');
        //   //this.getStartEditingCell('RegularSellPrice', params.rowIndex);
        //   return;
        // }

      } else if (this.params.gridtype === 'managegamesgrid') {
        this.params.data[this.params.column.colId] = parseInt(this.params.newValue);
        if (this.params.column.colId === "ticketSellingPrice") {
          this.params.node.setDataValue('lotteryPackValue', parseInt(this.params.newValue) * parseInt(this.params.data.noOfTickets));
        }
        else if (this.params.column.colId === "noOfTickets") {
          this.params.node.setDataValue('lotteryPackValue', parseInt(this.params.data.ticketSellingPrice) * parseInt(this.params.newValue));
        }
      } else
        this.params.node.data[this.params.column.colId] = this.value;

    }

  }

  focusIn() {
    this.input.nativeElement.focus();
  }

  getValue() {
    return this.value;
  }

  ngAfterViewInit() { }
}