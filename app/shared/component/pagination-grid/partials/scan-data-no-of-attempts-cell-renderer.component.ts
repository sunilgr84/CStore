import { Component, TemplateRef, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ScanDataService } from "@shared/services/scanDataService/scan-data.service";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'scan-data-no-of-attempts-cell-renderer',
    template:
        `<div (click)="handleNoOfAttemptsClick()" [ngClass]="{'cursor-pointer': params?.data?.noOfAttempts > 0}">{{params?.value}}</div>
        <ng-template #modalContent let-close="close">
            <div class="modal-header">
                <h5 class="modal-title">Acknowlegment Logs</h5>
                <button type="button" class="close" (click)="close()">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="col-sm-12">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Created On</th>
                                <th scope="col">Received On</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody *ngIf="logs.length === 0">
                            <tr *ngIf="isLoading">
                                <td colspan="4" class="text-center">
                                    <div class="spinner-border" role="status">
                                        <span class="sr-only">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                            <tr *ngIf="!isLoading">
                                <td colspan="4" class="text-center">
                                    No rows to display
                                </td>
                            </tr>
                        </tbody>
                        <tbody *ngIf="logs.length > 0">
                            <tr *ngFor="let log of logs; index as i">
                                <th scope="row">{{ i + 1 }}</th>
                                <td>
                                    {{ log.createdOn | date }}
                                </td>
                                <td>{{ log.receivedOn | date }}</td>
                                <td>{{ log.status }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-sm-12 text-center mt-4">
                    <button type="button" class="btn btn-primary" (click)="close()"> OK </button>
                </div>
            </div>
        </ng-template>`,
    styles: []
})
export class ScanDataNoOfAtteptsCellRenderer implements ICellRendererAngularComp {

    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    public params: any;
    public placeHolder: any;
    public logs: any[] = [];
    public isLoading: boolean = false;
    constructor(private modalService: NgbModal, private scandataService: ScanDataService) {

    }

    agInit(params: any): void {
        this.params = params;
    }
    refresh(): boolean {
        return false;
    }

    handleNoOfAttemptsClick() {
        if(this.params && this.params.data && this.params.data.ackId > 0) {
            this.modalService.open(this.modalContent);
            this.isLoading = true;
            this.logs = [];
            this.scandataService.getScanDataAcknowledgmentLogs(this.params.data.ackId).subscribe(res => {
                this.isLoading = false;
                if(res.status)
                    this.logs = res.result;
                else
                    this.logs = [];
            });
        }
    }
}