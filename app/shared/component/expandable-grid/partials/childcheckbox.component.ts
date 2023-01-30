import {Component} from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'child-cell-checkbox',
    template:
    `<div *ngIf="this.params.data.isEdit; then editBlock else textBlock"></div> <ng-template #editBlock><input type="checkbox" *ngIf = '!this.params.data[this.params.disableProperty]' [checked]="this.params.data[this.params.cellfieldId]"  (change)="OnChange($event)"  />
    <input type="checkbox" disabled *ngIf = 'this.params.data[this.params.disableProperty]' (change)="OnChange($event)"  /></ng-template>
    <ng-template #textBlock><i *ngIf= "this.params.data[this.params.cellfieldId]" class="fa fa-check"></i>
    <i *ngIf= "!this.params.data[this.params.cellfieldId]" class="fa fa-close"></i></ng-template> `,
})
export class ChildCheckBoxRenderer implements ICellRendererAngularComp {
    public params: any;
    agInit(params: any): void {
        this.params = params;
    }
    refresh(): boolean {
        return false;
    }
    OnChange(event)
    {
        this.params.context.componentParent.onChange(parseInt(this.params.node.id), this.params.cellfieldId, event.target.checked);
    }
}