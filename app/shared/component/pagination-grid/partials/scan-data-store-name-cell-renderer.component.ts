import { Component, TemplateRef, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'scan-data-store-name-cell-renderer',
    template:
        `<div (click)="handleStoreNameClick()" [ngClass]="{'text-danger cursor-pointer': params?.data?.errorCount > 0}">{{params?.value}}</div>
        <ng-template #modalContent let-close="close">
            <div class="modal-header">
                <h5 class="modal-title">Errors</h5>
                <button type="button" class="close" (click)="close()">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div *ngIf="params?.data?.errorCount > 0">
                    
                    <div *ngIf="params?.data?.errors?.DateErrors" class="col-sm-12">
                        <label>Date Errors</label>
                        <ul>
                            <li *ngFor="let error of params?.data?.errors?.DateErrors; let i = index;">
                                {{error}}
                            </li>
                        </ul>
                    </div>
                    <div *ngIf="params?.data?.errors?.TransactionIdErrors" class="col-sm-12">
                        <label>Transaction Errors</label>
                        <ul>
                            <li *ngFor="let error of params?.data?.errors?.TransactionIdErrors; let i = index;">
                                {{error}}
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-sm-12 text-center mt-4">
                    <button type="button" class="btn btn-primary" (click)="close()"> OK </button>
                </div>
            </div>
        </ng-template>`,
    styles: []
})
export class ScanDataStoreNameCellRenderer implements ICellRendererAngularComp {

    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    public params: any;
    public placeHolder: any;
    constructor(private modalService: NgbModal) {

    }

    agInit(params: any): void {
        this.params = params;
    }
    refresh(): boolean {
        return false;
    }

    handleStoreNameClick() {
        if(this.params && this.params.data && this.params.data.errorCount > 0)
        {
            this.modalService.open(this.modalContent);
            if(this.params.data.errorCount > 0) {
                try {
                    this.params.data.errors = JSON.parse(this.params.data.errors);
                } catch(e) {
                    // this.params.data.errors = null;
                }
            }
            console.log(this.params.data);
        }
    }
}