import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-child-checkbox-cell',
  template: `<div style="text-align: center;" *ngIf="params.data"><input [disabled]="params.data.isDefault" 
   type="checkbox" [checked]="params.value"
   (change)="onCheckBoxClick()" /></div>`
})

// tslint:disable-next-line:component-class-suffix
export class CheckboxPrivilegeRenderer implements ICellRendererAngularComp {
  public params: any;
  constructor() { }

  agInit(params: any): void {
    this.params = params;
  }

  onCheckBoxClick(): void {
    const currentCell = this.params.api.getFocusedCell();

    this.params.value = !this.params.value;
    if (this.params.data) {
      this.params.data.isChecked = this.params.value;
    }
    // const rowNode = this.params.api.getRowNode(this.params.data ? this.params.rowIndex - 1 : 0);
    // if (rowNode) { rowNode.setDataValue(currentCell.column ? currentCell.column.colId : this.params.column.colId, this.params.value); }
  }

  refresh(): boolean {
    return false;
  }
}
