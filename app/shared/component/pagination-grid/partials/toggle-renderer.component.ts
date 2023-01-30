import { Component } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ToastrService } from "ngx-toastr";
@Component({
    selector: 'toggle-cell-renderer',
    template:
        `<mat-slide-toggle
            [(ngModel)]="params.value" (change)="onFocusOut($event)" >
        </mat-slide-toggle>`,
})
export class ToggleRenderer implements ICellRendererAngularComp {
    public params: any;
    constructor( private toastr: ToastrService) {
    }
    agInit(params: any): void {
        params.value = params.value ? params.value : false;
        this.params = params;
    }
    refresh(): boolean {
        return false;
    }

    getValue(): any {
        return this.params.value;
    }

    onFocusOut(event) {
        this.params.oldValue = this.params.data[this.params.column.colId];
        this.params.newValue = event.checked;
        if (this.params.oldValue != this.params.newValue) {
            if (this.params.gridtype === 'storeComboDealDetailGrid' && this.params.column.colId === "Co_funded") {
                this.params.node.setDataValue(this.params.column.colId, this.params.newValue);
            }
            if (this.params.gridtype === 'storeMixMatchDetailGrid' && this.params.column.colId === "Co_funded") {
                this.params.node.setDataValue(this.params.column.colId, this.params.newValue);
            }

            let comboAmount = 0.00;
                if (!isNaN(this.params.data.ManufacturerFunded) && !isNaN(this.params.data.RetailerFunded)) {
                    comboAmount = Number(this.params.data.ManufacturerFunded) + Number(this.params.data.RetailerFunded);
                } else if (!isNaN(this.params.data.ManufacturerFunded)) {
                    comboAmount = Number(this.params.data.ManufacturerFunded);
                } else if (!isNaN(this.params.data.RetailerFunded)) {
                    comboAmount = Number(this.params.data.RetailerFunded);
                }
                if (this.params.gridtype === 'storeComboDealDetailGrid' && this.params.column.colId === "Co_funded") {
                    if (comboAmount !== Number(this.params.newValue) && this.params.data.Co_funded) {
                        this.params.node.setDataValue('ComboAmount', comboAmount);
                        this.toastr.error('Invalid Combo Amount', 'Error');
                    }
                }
                 if (this.params.gridtype === 'storeMixMatchDetailGrid' && this.params.column.colId === "Co_funded") {
                    if (comboAmount !== Number(this.params.newValue) && this.params.data.Co_funded) {
                        this.params.node.setDataValue('MixMatchAmount', comboAmount.toFixed(2));
                        this.toastr.error('Invalid Mix Match Amount', 'Error');
                    }
                }
        }
    }
}