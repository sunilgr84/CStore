import { Component, TemplateRef, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ScanDataService } from "@shared/services/scanDataService/scan-data.service";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'scan-data-ack-status-cell-rendere',
    template:
        `<div (click)="handleAckStatusClick()" [ngClass]="{'cursor-pointer': params?.data?.ackId > 0}">{{params?.value}}</div>
        <ng-template #modalContent let-close="close">
            <div class="modal-header">
                <h5 class="modal-title">Acknowlegment Status</h5>
                <button type="button" class="close" (click)="close()">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div *ngIf="!isLoading" class="col-sm-12">{{mailBody}}</div>
                <div *ngIf="isLoading" class="col-sm-12 text-center">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div class="col-sm-12 text-center mt-4">
                    <button type="button" class="btn btn-primary" (click)="close()"> OK </button>
                </div>
            </div>
        </ng-template>`,
    styles: []
})
export class ScanDataAckStatusCellRenderer implements ICellRendererAngularComp {

    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    public params: any;
    public placeHolder: any;
    public mailBody: any;
    public isLoading: boolean = false;
    constructor(private modalService: NgbModal, private scandataService: ScanDataService) {

    }

    agInit(params: any): void {
        this.params = params;
    }
    refresh(): boolean {
        return false;
    }

    handleAckStatusClick() {
        if(this.params && this.params.data && this.params.data.ackId > 0) {
            this.modalService.open(this.modalContent);
            this.isLoading = true;
            this.scandataService.getScanDataAcknowledgmentJsonFile(this.params.data.ackId).subscribe(res => {
                // console.log(res);
                this.isLoading = false;;
                this.mailBody = res.result.body;
            });   
        }
    }
}