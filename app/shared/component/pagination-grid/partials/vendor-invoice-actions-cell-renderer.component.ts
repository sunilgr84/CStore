import { Component } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'scan-data-actions-cell-renderer',
    template:
        `<input hidden type="file" multiple #uploader (change)="uploadFile($event)" />
         <i *ngIf="showUpload" class="fa fa-upload fa-18 cursor-pointer mr-2" title="Upload Invoice" (click)="uploader.click()"></i>
         <i *ngIf="showDownload" class="fa fa-download fa-18 cursor-pointer mr-2" title="Download Invoice" (click)="download()"></i>
         <i class="fa fa-edit fa-18 cursor-pointer mr-2" title="Edit Invoice" (click)="edit()"></i>
         <i class="fa fa-trash fa-18 cursor-pointer mr-2" title="Delete Invoice" (click)="delete()"></i>
        `,
    styles: [`
    .fa-18{
        font-size:18px;
    }
    `]
})
export class VendorInvoiceActionsCellRenderer implements ICellRendererAngularComp {

    public params: any;
    public placeHolder: any;
    public showDownload: boolean = false;
    public showUpload: boolean = false;

    agInit(params: any): void {
        this.params = params;
        if (params.data.invoiceFileName === "" || params.data.invoiceFileName === null) {
            this.showUpload = true;
            this.showDownload = false;
        } else {
            this.showDownload = true;
            this.showUpload = false;
        }
    }

    refresh(): boolean {
        return false;
    }

    public uploadFile(event) {
        event.data = this.params.data;
        this.params.context.componentParent.viewAction(event);
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