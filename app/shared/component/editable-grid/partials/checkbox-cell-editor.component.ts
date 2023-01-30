import { Component, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-checkbox-cell-editor',
  template: `<div style="text-align: center;"><input #input type="checkbox" [checked]="params.value" (change)="onCheckBoxClick()" /></div>`
})

// tslint:disable-next-line:component-class-suffix
export class CheckboxCellEditor implements ICellRendererAngularComp {
  public params: any;
  constructor() { }

  @ViewChild('input') public input: any;

  agInit(params: any): void {
    this.params = params;
  }

  getValue(): any {
    return this.params.value;
  }

  onCheckBoxClick(): void {
    const currentCell = this.params.api.getFocusedCell();
    this.params.value = !this.params.value;
    const rowNode = this.params.api.getRowNode(this.params ? this.params.node.id : 0);
    rowNode.setDataValue(currentCell.column ? currentCell.column.colId : this.params.column.colId, this.params.value);
  }

  refresh(): boolean {
    return false;
  }

  focusIn() {
    this.input.nativeElement.focus();
  }

}
