import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { get as _get } from 'lodash';

@Component({
  selector: 'app-button-cell-renderer',
  template: `
    <button [class]="btnClasses" *ngIf="!disabledBtn" (click)="handleClick($event)" [disabled]="disabledBtn" >
      {{ renderBtnText() }}
    </button>
    <button [class]="btnClasses" *ngIf="disabledBtn" style="color: black;" >
      {{ renderBtnText() }}
    </button>
  `,
  styles: ['button.v-btn { padding: 4px; }'],
})
export class ButtonCellRendererComponent implements ICellRendererAngularComp {
  public params: any;
  btnClasses = 'v-btn-text v-btn-small ';
  public disabledBtn = false;
  agInit(params: any): void {
    this.params = params;
    if (this.params.btnText == "Modifier" && (this.params.data.storeLocationItemID==0 || !this.params.data.isAddMultipacks)) {
      this.disabledBtn = true;
    }
    if (this.params.btnClasses) {
      this.btnClasses += this.params.btnClasses;
    }

    // console.log(this.btnClasses);
  }

  renderBtnText(): string {
    let btnText: string = 'Button';

    if (this.params.btnText) {
      btnText = this.params.btnText;
    }

    if (this.params.btnTextRenderer) {
      btnText = this.params.btnTextRenderer(this.params);
    }

    return btnText;
  }

  handleClick(e: Event) {
    if (this.params.onClick) {
      this.params.context.componentParent.cellButtonAction(e, this.params);
      // this.params.onClick(e, this.params);
    } else {
      console.warn('provide onClick method in cellRendererParams');
    }
  }

  refresh(): boolean {
    return false;
  }
}
