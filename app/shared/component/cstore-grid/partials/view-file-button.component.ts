import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular/main";
@Component({
    selector: 'view-file-button',
    template: `
    <i class="fa fa-file p-2"  *ngIf="!showViewFile" style="color:transparent;"></i><!-- Added Dummy for display purpose -->
    <i class="fa fa-file cursor-pointer p-2" title="View File" (click)="viewFile()" *ngIf="showViewFile"></i>
    <i class="fa fa-trash cursor-pointer p-2" title="Delete" (click)="viewFileDelete()"></i>`
})
export class ViewFileButtonComponent implements ICellRendererAngularComp {
    refresh(params: any): boolean {
        throw new Error("Method not implemented.");
    }
    afterGuiAttached?(params?: import("ag-grid-community").IAfterGuiAttachedParams): void {
        throw new Error("Method not implemented.");
    }
    public params: any;
    public showViewFile: boolean;

    agInit(params: any): void {
        this.params = params;
        if (params.data.docuPath === null || params.data.docuPath === undefined) {
            this.showViewFile = false;
        } else this.showViewFile = true;
    }

    public viewFile() {
        this.params.context.componentParent.viewFileAction(this.params);
    }

    public viewFileDelete() {
        this.params.context.componentParent.viewFileDeleteAction(this.params);
    }

}