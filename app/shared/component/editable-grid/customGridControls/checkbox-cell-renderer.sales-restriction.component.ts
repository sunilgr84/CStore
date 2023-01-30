import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-child-checkbox-cell',
    template: `<div style="text-align: center;"><input type="checkbox" [checked]="params.value" (change)="onCheckBoxClick()" /></div>`
})

// tslint:disable-next-line:component-class-suffix
export class CheckboxCellRendererSalesRestriction implements ICellRendererAngularComp {
    public params: any;
    constructor() { }

    agInit(params: any): void {
        this.params = params;
    }

    onCheckBoxClick(): void {
        const currentCell = this.params.api.getFocusedCell();
        this.params.value = !this.params.value;
        const rowNode = this.params.api.getRowNode(this.params ? this.params.node.id : 0);
        rowNode.setDataValue('isExpense', this.params.value);
    }

    refresh(): boolean {
        return false;
    }
}
