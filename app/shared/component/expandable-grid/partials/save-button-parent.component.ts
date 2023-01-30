import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular/main";
import { ConfirmationDialogService } from "@shared/component/confirmation-dialog/confirmation-dialog.service";
import { ConstantService } from "@shared/services/constant/constant.service";
@Component({
    selector: 'edit-button',
    template: `
    <i *ngIf= "this.params.data.isEdit" class="fa fa-save float-left pt-2 pr-2" title="Save" (click)="Save()"></i>&nbsp;
    <i *ngIf= "this.params.data.isEdit && !this.params.data.isNewRow" title="Cancel" class="fa fa-window-close float-left pt-2 pr-2" (click)="Cancel()"></i>&nbsp;
    <i *ngIf= "!this.params.data.isEdit" class="fa fa-edit float-left pt-2 pr-2" title="Edit" (click)="Edit()"></i>&nbsp;
    <i *ngIf= "this.params.context.componentParent.isCancel || this.params.data.isCancel" title="Delete" class="fa fa-trash float-left pt-2 pr-2" (click)="Delete()"></i> `,
    styles:[`.styles{cursor:pointer}`]
 /* <i class="fa fa-clone mr-2 styles" (click)="Clone()"></i>&nbsp; */
})
export class SaveButtonParentComponent implements ICellRendererAngularComp {
    constructor(private confirmationDialogService: ConfirmationDialogService, private constantsService: ConstantService){
    }
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
        this.params.context.componentParent.onBtStopEditing(parseInt(this.params.node.id));
    }
    public Edit() {
        this.params.context.componentParent.Edit(parseInt(this.params.node.rowIndex));
    }
    public Cancel() {
        this.params.context.componentParent.Cancel(parseInt(this.params.node.id));
    }
    public Delete() {
        this.confirmationDialogService.confirm(this.constantsService.infoMessages.confirmTitle,
            this.constantsService.infoMessages.confirmMessage)
            .then(() => {
                this.params.context.componentParent.Delete(parseInt(this.params.node.id));
            }).catch(() => console.log('User dismissed the dialog'));
    }
    public Clone() {
        this.params.context.componentParent.cloneAction(this.params.node.rowIndex);
    }
}