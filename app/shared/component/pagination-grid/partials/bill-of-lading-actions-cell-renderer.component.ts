import { Component } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'bill-of-lading-actions-cell-renderer',
    template:
        `<i *ngIf="showDownload" class="fa fa-download fa-18 cursor-pointer mr-2" title="Download Bill Of Lading" (click)="download()"></i>
         <i class="fa fa-edit fa-18 cursor-pointer mr-2" title="Edit Bill Of Lading" (click)="edit()"></i>
         <i class="fa fa-trash fa-18 cursor-pointer mr-2" title="Delete Bill Of Lading" (click)="delete()"></i>
        `,
    styles: [`
    .fa-18{
        font-size:18px;
    }
    `]
})
export class BillOfLadingActionsCellRenderer implements ICellRendererAngularComp {

    public params: any;
    public placeHolder: any;
    public showDownload: boolean = false;

    agInit(params: any): void {
        this.params = params;
        if (params.data.BOLFileName === "" || params.data.BOLFileName === null) {
            this.showDownload = false;
        } else {
            this.showDownload = true;
        }
    }

    refresh(): boolean {
        return false;
    }

    public download() {
        this.params.context.componentParent.downloadAction(this.params);
    }

    public edit() {
        this.params.context.componentParent.editAction(this.params);
    }

    public delete() {
        this.params.context.componentParent.delAction(this.params);
    }

}