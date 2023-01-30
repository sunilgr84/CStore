import { Component } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'scan-data-actions-cell-renderer',
    template:
        `<i *ngIf="ackStatus !== 'success'" class="fa fa-refresh cursor-pointer mr-2" (click)="refreshData()"></i>
        <i *ngIf="!params.data.showDownloadLoader" class="fa fa-download cursor-pointer mr-2" (click)="download()"></i>
        <img *ngIf="params.data.showDownloadLoader" src="assets/images/small-spinner.gif">
        <button *ngIf="ackStatus !== 'success'" type="button" class="btn btn-info p-0 pr-2 pl-2 mr-2" (click)="review()">Review</button>
        <button *ngIf="ackStatus !== 'success'" type="button" class="btn btn-warning p-0 pr-2 pl-2" (click)="submit()">Submit</button>`,
    styles: []
})
export class ScanDataActionsCellRenderer implements ICellRendererAngularComp {

    public params: any;
    public placeHolder: any;
    public ackStatus: any


    agInit(params: any): void {
        this.params = params;
        this.ackStatus = params.data.ackStatus ? params.data.ackStatus.toLowerCase() : '';
    }
    refresh(): boolean {
        return false;
    }

    refreshData() {
        this.params.context.componentParent.refreshAction(this.params);
    }

    download() {
        this.params.context.componentParent.downloadAction(this.params);
    }

    review() {
        this.params.context.componentParent.reviewAction(this.params);
    }

    submit() {
        this.params.context.componentParent.submitScanDataAction(this.params);
    }
}