import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-check-uncheck-icon-cell',
  template: `<i class="fa fa-{{icon}}"></i>`
})

export class CheckUncheckIconCellRendererComponent implements ICellRendererAngularComp {
  icon: string;
  public params: any;
  constructor() { }

  agInit(params: any): void {
    this.params = params;
    if (params.value) {
      this.icon = 'check';
    } else {
      this.icon = 'ban';
    }
  }

  refresh(): boolean {
    return false;
  }
}
