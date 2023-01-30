import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from "@angular/core";
import { SetupService } from "@shared/services/setupService/setup-service";
import { ICellRendererAngularComp } from "ag-grid-angular/main";

@Component({
    selector: 'detail-button',
    template: `<button (click)="btnClickedHandler($event)" class='btn btn-primary'>Details</button>`,
    styles: [``]

})

export class DetailButtonComponent implements ICellRendererAngularComp {
	showDetailsTable: boolean = false;
	detailTableData: any;

    constructor(
        private setupService: SetupService
    ) { }

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

    btnClickedHandler(e:any) {
        let departmentId = this.params.value;
        let movementHeaderId = sessionStorage.getItem('movementHeaderID');

        this.setupService
            .getData(`MovementHeader/GetDeptSalesDetailsByMovementIDDeptID/${movementHeaderId}/${departmentId}`)
            .subscribe( response => {
				this.detailTableData = response;
				this.showDetailsTable = true;
				sessionStorage.setItem('detailTableData', JSON.stringify(this.detailTableData));
				sessionStorage.setItem('showDetailsTable', String(this.showDetailsTable));
                console.log('NEW TABLE RESPONSE ONCLICK =>', this.detailTableData);
            })
    }
}