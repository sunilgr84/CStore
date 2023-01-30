import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';

import { ICellEditorAngularComp } from 'ag-grid-angular';
import { CommonService } from '@shared/services/commmon/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-four-digit',
    template: `<input type="text" [maxLength]="15" #input numberTwoDecimalOnly  class="form-control"
     [(ngModel)]="value" style="width: 100%" (focusout)="onFocusOut($event)">`,
    styles: [
        `.form-control {
            padding: 2px;
            border-radius: 0!important;
            height: 25px;
        }
        .form-control:disabled{
            background: #dddddd !important;
        }
        `]
})
// tslint:disable-next-line:component-class-suffix
export class DecimalEditor implements ICellEditorAngularComp, AfterViewInit {

    private params: any;
    public value: number;
    private cancelBeforeStart = false;

    @ViewChild('input') public input: any;

    constructor(private commonService: CommonService, private toastr: ToastrService) {
        this.commonService.getCellChange().subscribe(data => {
            if ((this.params.gridtype === 'storeComboDealDetailGrid' && ((data.column.colId === "ManufacturerFunded" && this.params.column.colId === "ManufacturerFunded") || (data.column.colId === "RetailerFunded" && this.params.column.colId === "RetailerFunded") || (data.column.colId === "ComboAmount" && this.params.column.colId === "ComboAmount")))
                || (this.params.gridtype === 'storeMixMatchDetailGrid' && ((data.column.colId === "ManufacturerFunded" && this.params.column.colId === "ManufacturerFunded") || (data.column.colId === "RetailerFunded" && this.params.column.colId === "RetailerFunded") || (data.column.colId === "MixMatchAmount" && this.params.column.colId === "MixMatchAmount")))) {
                this.value = data.newValue;
            } else if ((this.params.gridtype === 'storeComboDealDetailGrid' || this.params.gridtype === 'storeMixMatchDetailGrid') && data.column.colId === "Co_funded") {
                if (data.newValue && this.params.column.colId === "ManufacturerFunded") {
                    this.input.nativeElement.disabled = false;
                } else if (this.params.column.colId === "ManufacturerFunded") {
                    this.input.nativeElement.disabled = true;
                }
                if (data.newValue && this.params.column.colId === "RetailerFunded") {
                    this.input.nativeElement.disabled = false;
                } else if (this.params.column.colId === "RetailerFunded") {
                    this.input.nativeElement.disabled = true;
                }
            }
        });
    }

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        if (this.params.gridtype === 'storeComboDealDetailGrid' && this.params.column.colId === "ManufacturerFunded" && (this.params.data.Co_funded === null || !this.params.data.Co_funded)) {
            this.input.nativeElement.disabled = true;
        }
        if (this.params.gridtype === 'storeComboDealDetailGrid' && this.params.column.colId === "RetailerFunded" && (this.params.data.Co_funded === null || !this.params.data.Co_funded)) {
            this.input.nativeElement.disabled = true;
        }
        // only start edit if key pressed is a number, not a letter
        //   this.cancelBeforeStart = params.charPress && ('1234567890.'.indexOf(params.charPress) < 0);
    }
    getValue(): any {
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 10000000;
    }
    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        window.setTimeout(() => {
            this.input.nativeElement.focus();
        });
    }

    onFocusOut(event) {
        if (this.params.data) {
            this.params.oldValue = this.params.data[this.params.column.colId];
            this.params.newValue = event.currentTarget.value;
            if (this.params.oldValue != this.params.newValue) {
                this.params.data[this.params.column.colId] = parseInt(this.params.newValue);
                let comboAmount = 0.00;
                if (!isNaN(this.params.data.ManufacturerFunded) && !isNaN(this.params.data.RetailerFunded)) {
                    comboAmount = Number(this.params.data.ManufacturerFunded) + Number(this.params.data.RetailerFunded);
                } else if (!isNaN(this.params.data.ManufacturerFunded)) {
                    comboAmount = Number(this.params.data.ManufacturerFunded);
                } else if (!isNaN(this.params.data.RetailerFunded)) {
                    comboAmount = Number(this.params.data.RetailerFunded);
                }
                if (this.params.gridtype === 'storeComboDealDetailGrid' && (this.params.column.colId === "ManufacturerFunded" || this.params.column.colId === "RetailerFunded")) {
                    this.params.node.setDataValue('ComboAmount', comboAmount);
                } else if (this.params.gridtype === 'storeComboDealDetailGrid' && this.params.column.colId === "ComboAmount") {
                    if (comboAmount !== Number(this.params.newValue) && this.params.data.Co_funded) {
                        this.params.node.setDataValue('ComboAmount', comboAmount);
                        this.toastr.error('Invalid Combo Amount', 'Error');
                    }
                }
                if (this.params.gridtype === 'storeMixMatchDetailGrid' && (this.params.column.colId === "ManufacturerFunded" || this.params.column.colId === "RetailerFunded")) {
                    if (this.params.data.Co_funded)
                        this.params.node.setDataValue('MixMatchAmount', comboAmount.toFixed(2));
                } else if (this.params.gridtype === 'storeMixMatchDetailGrid' && this.params.column.colId === "MixMatchAmount") {
                    if (comboAmount !== Number(this.params.newValue) && this.params.data.Co_funded) {
                        this.params.node.setDataValue('MixMatchAmount', comboAmount.toFixed(2));
                        this.toastr.error('Invalid Mix Match Amount', 'Error');
                    }
                }
            }
        }
    }


    focusIn() {
        this.input.nativeElement.focus();
    }

    focusOut() {
        if (this.params.gridtype && this.params.gridtype === 'tankVolumeHistoryGrid') {
            this.params.node.setDataValue('currentTankVolume', this.value);
            this.params.api.refreshCells({ columns: ['tankUllage', 'tankUllage90'], force: true });
        }
    }
}


@Component({
    selector: 'app-four-digit',
    template: `<div class="field-wrapper field-wrapper-number input-icon">
                    <input type="text" [maxLength]="15" #input numberTwoDecimalOnly  class="field-input"
                    [(ngModel)]="value" style="width: 100%; padding-left: 18px;" (focusout)="onFocusOut($event)">
                    <i class="dollar-four-digit">$</i>
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
                </div>`,
    styles: [
        `.form-control {
            padding: 2px;
            border-radius: 0!important;
            height: 25px;
        }
        .form-control:disabled{
            background: #dddddd !important;
        }
        .dollar-four-digit{
            top: 40%;
        }
        `]
})
// tslint:disable-next-line:component-class-suffix
export class DecimalWithDollarEditor implements ICellEditorAngularComp, AfterViewInit {

    private params: any;
    public value: number;
    private cancelBeforeStart = false;

    @ViewChild('input') public input: any;

    constructor(private commonService: CommonService, private toastr: ToastrService) {
        this.commonService.getCellChange().subscribe(data => {
            if (this.params.gridtype === 'storeitemgrid' && (data.column.colId === "inventoryValuePrice" && this.params.column.colId === "inventoryValuePrice") || ((data.column.colId === "GrossProfit" && this.params.column.colId === "GrossProfit"))) {
                this.value = data.newValue;
            } else if ((this.params.gridtype === 'storeComboDealDetailGrid' && ((data.column.colId === "ManufacturerFunded" && this.params.column.colId === "ManufacturerFunded") || (data.column.colId === "RetailerFunded" && this.params.column.colId === "RetailerFunded") || (data.column.colId === "ComboAmount" && this.params.column.colId === "ComboAmount")))
                || (this.params.gridtype === 'storeMixMatchDetailGrid' && ((data.column.colId === "ManufacturerFunded" && this.params.column.colId === "ManufacturerFunded") || (data.column.colId === "RetailerFunded" && this.params.column.colId === "RetailerFunded") || (data.column.colId === "MixMatchAmount" && this.params.column.colId === "MixMatchAmount")))) {
                this.value = data.newValue;
            } else if ((this.params.gridtype === 'storeComboDealDetailGrid' || this.params.gridtype === 'storeMixMatchDetailGrid') && data.column.colId === "Co_funded") {
                if (data.newValue && this.params.column.colId === "ManufacturerFunded") {
                    this.input.nativeElement.disabled = false;
                } else if (this.params.column.colId === "ManufacturerFunded") {
                    this.input.nativeElement.disabled = true;
                }
                if (data.newValue && this.params.column.colId === "RetailerFunded") {
                    this.input.nativeElement.disabled = false;
                } else if (this.params.column.colId === "RetailerFunded") {
                    this.input.nativeElement.disabled = true;
                }
            }
        });
    }

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        if ((this.params.gridtype === 'storeComboDealDetailGrid' || this.params.gridtype === 'storeMixMatchDetailGrid') && this.params.column.colId === "ManufacturerFunded" && (this.params.data.Co_funded === null || !this.params.data.Co_funded)) {
            this.input.nativeElement.disabled = true;
        }
        if ((this.params.gridtype === 'storeComboDealDetailGrid' || this.params.gridtype === 'storeMixMatchDetailGrid') && this.params.column.colId === "RetailerFunded" && (this.params.data.Co_funded === null || !this.params.data.Co_funded)) {
            this.input.nativeElement.disabled = true;
        }
        // only start edit if key pressed is a number, not a letter
        //   this.cancelBeforeStart = params.charPress && ('1234567890.'.indexOf(params.charPress) < 0);
    }
    getValue(): any {
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 10000000;
    }
    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        window.setTimeout(() => {
            this.input.nativeElement.focus();
        });
    }

    focusIn() {
        this.input.nativeElement.focus();
    }

    onFocusOut(event) {
        if (this.params.data) {
            this.params.oldValue = this.params.data[this.params.column.colId];
            this.params.newValue = event.currentTarget.value;
            if (this.params.oldValue != this.params.newValue) {
                if (this.params.gridtype === 'storeitemgrid') {
                    this.params.node.data[this.params.column.colId] = parseInt(this.params.newValue);
                    if (this.params.column.colId === "BuyingCost") {
                        if (this.params.node.data.buyingCost && this.params.node.data.buyingCost && (Number(this.params.node.data.buyingDiscount) < Number(this.params.node.data.buyingCost))) {
                            this.params.node.data.inventoryValuePrice =
                                ((this.params.node.data.buyingCost - this.params.node.data.buyingDiscount) / 1).toFixed(2);
                            const profit = parseFloat(this.params.node.data.regularSellPrice) - parseFloat(this.params.node.data.inventoryValuePrice);
                            let grossMargin = ((profit) * 100) / parseFloat(this.params.node.data.regularSellPrice);
                            this.params.node.data.grossProfit = grossMargin.toFixed(2);
                            this.params.node.setDataValue('inventoryValuePrice', this.params.node.data.inventoryValuePrice);
                            this.params.node.setDataValue('grossProfit', this.params.node.data.grossProfit);
                        }
                    }
                    if (this.params.column.colId === "buyingDiscount") {
                        if (this.params.node.data.buyingCost && this.params.node.data.buyingDiscount && (Number(this.params.node.data.buyingDiscount) < Number(this.params.node.data.buyingCost))) {
                            this.params.node.data.inventoryValuePrice =
                                ((this.params.node.data.buyingCost - this.params.node.data.buyingDiscount) / 1).toFixed(2);
                            let profit = parseFloat(this.params.node.data.regularSellPrice) - parseFloat(this.params.node.data.inventoryValuePrice);
                            let grossMargin = ((profit) * 100) / parseFloat(this.params.node.data.regularSellPrice);
                            this.params.node.data.grossProfit = grossMargin.toFixed(2);
                            this.params.node.setDataValue('inventoryValuePrice', this.params.node.data.inventoryValuePrice);
                            this.params.node.setDataValue('grossProfit', this.params.node.data.grossProfit);
                        }
                    }
                } else if (this.params.gridtype === 'multipacksIGrid') {
                    this.params.node.data[this.params.column.colId] = parseInt(this.params.newValue);
                    if (this.params.column.colId === "unitCostPrice") {
                        let profit = parseFloat(this.params.node.data.regularPackageSellPrice) - parseFloat(this.params.node.data.unitCostPrice);
                        let grossProfit = ((profit) * 100) / parseFloat(this.params.node.data.unitCostPrice);
                        this.params.node.setDataValue('grossProfit', grossProfit);
                    }
                    else if (this.params.column.colId === "regularPackageSellPrice") {
                        let profit = parseFloat(this.params.node.data.regularPackageSellPrice) - parseFloat(this.params.node.data.unitCostPrice);
                        let grossProfit = ((profit) * 100) / parseFloat(this.params.node.data.unitCostPrice);
                        this.params.node.setDataValue('grossProfit', grossProfit);
                    }
                } else {
                    this.params.data[this.params.column.colId] = !isNaN(this.params.newValue) ? Number(this.params.newValue) : "";
                    let comboAmount = 0.00;
                    if (!isNaN(this.params.data.ManufacturerFunded) && !isNaN(this.params.data.RetailerFunded)) {
                        comboAmount = Number(this.params.data.ManufacturerFunded) + Number(this.params.data.RetailerFunded);
                    } else if (!isNaN(this.params.data.ManufacturerFunded)) {
                        comboAmount = Number(this.params.data.ManufacturerFunded);
                    } else if (!isNaN(this.params.data.RetailerFunded)) {
                        comboAmount = Number(this.params.data.RetailerFunded);
                    }
                    if (this.params.gridtype === 'storeComboDealDetailGrid' && (this.params.column.colId === "ManufacturerFunded" || this.params.column.colId === "RetailerFunded")) {
                        this.params.node.setDataValue('ComboAmount', comboAmount.toFixed(2));
                    } else if (this.params.gridtype === 'storeComboDealDetailGrid' && this.params.column.colId === "ComboAmount") {
                        if (comboAmount !== Number(this.params.newValue) && this.params.data.Co_funded) {
                            this.params.node.setDataValue('ComboAmount', comboAmount.toFixed(2));
                            this.toastr.error('Invalid Combo Amount', 'Error');
                        }
                    }
                    if (this.params.gridtype === 'storeMixMatchDetailGrid' && (this.params.column.colId === "ManufacturerFunded" || this.params.column.colId === "RetailerFunded")) {
                        if (this.params.data.Co_funded)
                            this.params.node.setDataValue('MixMatchAmount', comboAmount.toFixed(2));
                    } else if (this.params.gridtype === 'storeMixMatchDetailGrid' && this.params.column.colId === "MixMatchAmount") {
                        if (comboAmount !== Number(this.params.newValue) && this.params.data.Co_funded) {
                            this.params.node.setDataValue('MixMatchAmount', comboAmount.toFixed(2));
                            this.toastr.error('Invalid Mix Match Amount', 'Error');
                        }
                    }
                }
            }
        }
    }

    handleStep(direction: 'up' | 'down') {
        if (this.value && this.value > 0) {
            if (direction == 'up') {
                this.value = Number(Number(this.value + 0.01).toFixed(2));
            } else {
                this.value = Number(Number(this.value - 0.01).toFixed(2));
            }
        } else {
            this.value = 0.01;
        }
    }
}