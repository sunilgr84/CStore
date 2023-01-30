import { Component } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'child-cell-select',
    template: `<div *ngIf="this.params.data.isEdit; then editBlock else textBlock"></div> <ng-template #editBlock>
    <select style="width: 100%" *ngIf = "!this.params.data[this.params.disableProperty]" [value]="this.params.data[this.params.cellfieldId]" (change)="OnChange($event)" ><option  *ngFor="let item of listData" [value]="item.value">{{item.text}}</option></select>
    <span *ngIf = "this.params.data[this.params.disableProperty]">N/A</span>
    </ng-template>
    <ng-template #textBlock><span *ngIf = "this.params.data[this.params.textfield]">{{this.params.data[this.params.textfield]}}</span> <span *ngIf = "!this.params.data[this.params.textfield]">N/A</span></ng-template>`,
    //<select style="width: 100%" disabled *ngIf = "this.params.data[this.params.disableProperty]" [value]="this.params.data[this.params.cellfieldId]" ><option [ngValue]= "">Select</option> <option [ngValue]="this.params.data[this.params.cellfieldId]" *ngFor="let item of listData" [value]="item.value">{{item.text}}</option></select>
    styles: [
        `.btn {
            line-height: 0.5
        }`
    ]
})
export class ChildSelectRenderer implements ICellRendererAngularComp {
    public params: any;
    private listData = [];
    agInit(params: any): void {
        this.params = params;
        if (this.params.data[this.params.cellfieldId + "List"]) {
            this.listData = this.params.data[this.params.cellfieldId + "List"];
        }
        else
            this.listData = this.params.inputSource;
    }

    refresh(): boolean {
        return false;
    }
    OnChange(event) {
        this.params.context.componentParent.onChange(this.params.node.rowIndex, this.params.cellfieldId, event.target.value, this.params.textfield, event.target.options[event.target.options.selectedIndex].text, this.params);
    }
}