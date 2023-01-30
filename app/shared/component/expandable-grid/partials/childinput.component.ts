import { Component } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'child-cell-checkbox',
  template:
    `<div *ngIf="this.params.data.isEdit; then editBlock else textBlock"></div> 
    <ng-template #editBlock>
    <div class="input-icon">
      <input numberTwoDecimalOnly [length]= 'maxLength' type="text" class=" decimalInput has-float-label currency" type="text"
      [(ngModel)]="this.params.data[this.params.textfield]" (change)="OnChange($event)">
      <i *ngIf="this.params.data[this.params.textfield]">$</i>
    </div>
    </ng-template>
    <ng-template #textBlock>
    <span *ngIf ="this.params.data[this.params.textfield]">
    <span *ngIf ="this.params.textfield=='maxAmount'">$</span>
     <span>{{this.params.data[this.params.textfield]}}</span></span>
     <span *ngIf = "!this.params.data[this.params.textfield]">N/A</span>
    </ng-template> `,
  styles: [`.decimalInput {
      display: inherit;
      line-height: 16px;
      margin: 2px 0px;
      width: 100%;
   }`]
})
export class ChildInputRenderer implements ICellRendererAngularComp {
  public params: any;
  maxLength : number = 4;
  agInit(params: any): void {
    this.params = params;
    if(this.params.maxLength)
      this.maxLength = this.params.maxLength;
  }
  refresh(): boolean {
    return false;
  }/* (keypress)="return isNumberKey(this, event);" */
  isNumberKey(txt, evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 46) {
      //Check if the text already contains the . character
      if (txt.value.indexOf('.') === -1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (charCode > 31 &&
        (charCode < 48 || charCode > 57))
        return false;
    }
    return true;
  }
  OnChange(event) {
    this.params.context.componentParent.onChange(parseInt(this.params.node.id), this.params.cellfieldId, event.target.value, this.params.textfield)
  }
}