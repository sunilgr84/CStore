import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';

import { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-four-digit',
    template: `<input type="text" [maxLength]="4" #input numbersOnly class="form-control" (focusout) = "onFocusOut($event)"
     [(ngModel)]="value" style="width: 100%">`,
    styles: [
        `.form-control {
            padding: 2px;
            border-radius: 0!important;
            height: 25px;
        }
        `]
})
// tslint:disable-next-line:component-class-suffix
export class FourDigitEditor implements ICellEditorAngularComp, AfterViewInit {

    private params: any;
    public value: number;
    private cancelBeforeStart = false;

    @ViewChild('input') public input: any;


    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;

        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
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
        this.params.oldValue = this.params.node.data[this.params.column.colId];
        this.params.newValue = event.currentTarget.value;
        if (this.params.oldValue != this.params.newValue) {

            if (this.params.gridtype === 'multipacksIGrid') {
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
            }
            else
                this.params.node.data[this.params.column.colId] = this.value;

        }

    }
}
