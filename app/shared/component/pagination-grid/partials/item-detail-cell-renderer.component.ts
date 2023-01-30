import { Component } from "@angular/core";
import { UtilityService } from "@shared/services/utility/utility.service";
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'item-upc-detail-cell-renderer',
    template:
        `<div class="upcDescription" (click)="copyDescription()">{{params.data.Description}}</div>
         <div class="upcCode" (click)="copyUPCCode()">{{params.data.POSCodeWithCheckDigit}}</div>
        `,
    styles: [`
    .upcDescription{
        font-size:13px;
        font-weight:700;
        line-height:22px;
        cursor: pointer;
        color: black;
    }
    .upcDescription:hover{
        color:blue;
    }
    .upcCode{
        line-height:20px;
        cursor: pointer;
        color: black;
    }
    .upcCode:hover{
        color:blue;
    }
    `]
})
export class ItemUPCDetailsCellRenderer implements ICellRendererAngularComp {

    constructor(private toastr: ToastrService, private utilityService: UtilityService) {
    }

    public params: any;
    public placeHolder: any;
    public showDownload: boolean = false;
    public showUpload: boolean = false;

    agInit(params: any): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }

    copyDescription() {
        this.utilityService.copyText(this.params.data.Description);
        this.toastr.success('Description Copied');
    }

    copyUPCCode() {
        this.utilityService.copyText(this.params.data.POSCodeWithCheckDigit);
        this.toastr.success('UPC Code Copied');
    }
}