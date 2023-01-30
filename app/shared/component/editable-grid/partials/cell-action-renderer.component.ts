import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-child-cell',
  template: `<span class="cpointer" *ngIf="params && params.data && params.data.isSaveRequired">
                <i class="fa fa-floppy-o" aria-hidden="true" (click)="save()"></i>
              </span>
              <span class="cursor-pointer">
              <i class="fa fa-trash" *ngIf="params.data && params.data.showDeleteAction" (click)="delete()"></i>
              </span>
            <span *ngIf="!params.hideEditAction && (params.data && !params.data.isSaveRequired)">
                <i class="fa fa-floppy-o" aria-hidden="true" (click)="edit()"></i>
            </span>
            <span class="cursor-pointer" >
            <i class="fa fa-floppy-o" *ngIf="params.showExtraSave" aria-hidden="true" (click)="save()"></i>
        </span>
            <span class="cursor-pointer">
              <i class="fa fa-trash" *ngIf="!params.hideDeleteAction" (click)="delete()"></i>
          </span>
          <span class="cursor-pointer">
              <i class="fa fa-print" *ngIf="isBoolean(params.hidePrintAction)&&!params.hidePrintAction" (click)="print()"></i>
          </span>`,
  styles: [
    `.btn {
          line-height: 1;
          padding: 1px 5px;
          margin-right: 2px;
        }
        .btn-primary-icon {
          color: #fff;
          background-color: #19B5FE;
          border-color: #19B5FE;
      }
      .fa{
        margin-left: 10px;
      }
      .cursor-pointer{
        cursor: pointer;
      }
        `
  ]
})
// tslint:disable-next-line:component-class-suffix fa fa-pencil
export class CellActionRenderer implements ICellRendererAngularComp {
  public params: any;
  isShowUpdateBtn = false;
  constructor() { }

  agInit(params: any): void {
    this.params = params;
    this.isCheckUserAdded(params);
  }
  public edit() {
    this.params.context.componentParent.editAction(this.params);
  }
  public delete() {
    this.params.context.componentParent.delAction(this.params);
  }
  public save() {
    this.params.context.componentParent.saveAction(this.params);
  }
  public print() {
    this.params.context.componentParent.printAction(this.params);
  }
  public isCheckUserAdded(params) {
    if (params.isDayReconMOPChecked) {
      if (params.data && params.data.isUserAdded) {
        params.hideDeleteAction = false;
      } else {
        params.hideDeleteAction = true;
      }
    }
    if (params.isAtmGrid) {
      if (params.data && Number(params.data.ATMTransactionID) > 0) {
        params.hideDeleteAction = false;
      } else {
        params.hideDeleteAction = true;
      }
    }
    if (params.isBankGrid) {
      if (params.data && Number(params.data.BankDepositID[0]) > 0) {
        params.hideDeleteAction = false;
      } else {
        params.hideDeleteAction = true;
      }
    }
  }
  refresh(): boolean {
    return false;
  }

  isBoolean(val) { return typeof val === 'boolean'; }

}
