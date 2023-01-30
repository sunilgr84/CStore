import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular/main";
@Component({
    selector: 'edit-button',
    template: `
    <i *ngIf= "this.params.data.isEdit" class="fa fa-save float-left pt-2 pr-2 cursor-pointer" title="Save" (click)="Save()"></i>&nbsp;
    <i *ngIf= "this.params.data.isEdit && !this.params.data.isNewRow" title="Cancel" class="fa fa-window-close float-left pt-2 pr-2 cursor-pointer" (click)="Cancel()"></i>&nbsp;
    <i *ngIf= "!this.params.data.isEdit" class="fa fa-edit float-left pt-2 pr-2 cursor-pointer" title="Edit" (click)="Edit()"></i>&nbsp;
    <i *ngIf= "this.params.context.componentParent.isCancel || this.params.data.isCancel" title="Delete" class="fa fa-trash float-left pt-2 pr-2 cursor-pointer" (click)="Delete()"></i>`

})
export class SaveButtonComponent implements ICellRendererAngularComp {
    refresh(params: any): boolean {
        throw new Error("Method not implemented.");
    }
    afterGuiAttached?(params?: import("ag-grid-community").IAfterGuiAttachedParams): void {
        throw new Error("Method not implemented.");
    }
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }
    /* public invokeDeleteMethod() {
           var selectedData = this.params.api.getSelectedRows();
           this.params.api.updateRowsData({remove: selectedData});
    } */

    public Save() {
        this.params.context.componentParent.onBtStopEditing(this.params);
    }
    public Edit() {
        this.params.context.componentParent.Edit(this.params.node.rowIndex,this.params);
    }
    public Cancel() {
        this.params.context.componentParent.Cancel(this.params.node.rowIndex);
    }
    public Delete()
    {
        this.params.context.componentParent.Delete(this.params.node.rowIndex);
    }

}