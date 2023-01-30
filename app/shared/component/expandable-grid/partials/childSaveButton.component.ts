import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular/main";
@Component({
    selector: 'edit-button',
    template: `
    <i *ngIf= "this.params.data.isEdit" class="fa fa-save float-left pt-2 pr-2" title="Save" (click)="Save()"></i>&nbsp;
    <i *ngIf= "this.params.data.isEdit && !this.params.data.isNewRow" title="Cancel" class="fa fa-window-close float-left pt-2 pr-2" (click)="Cancel()"></i>&nbsp;
    <i *ngIf= "!this.params.data.isEdit" class="fa fa-edit float-left pt-2 pr-2" title="Edit" (click)="Edit()"></i>&nbsp;
    <i *ngIf= "this.params.context.componentParent.isCancel || this.params.data.isCancel" title="Delete" class="fa fa-trash float-left pt-2 pr-2" (click)="Delete()"></i>`

})
export class ChildSaveButtonComponent implements ICellRendererAngularComp {
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
        this.params.context.componentParent.Edit(parseInt(this.params.node.id));
    }
    public Cancel() {
       this.params.context.componentParent.Cancel(parseInt(this.params.node.id));
    }
    public Delete()
    {
        this.params.context.componentParent.Delete(parseInt(this.params.node.id));
    }

}