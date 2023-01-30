import { Component, ElementRef, ViewEncapsulation } from "@angular/core";
import { UtilityService } from "@shared/services/utility/utility.service";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'vendor-inv-actions-cell-renderer',
    template:
        '<div class="mb-0 mt-1 line-height-def"><h5 class="mb-0 d-inline-block w-40 fsize-9 text-elipsis">{{params.data.vendorName}} </h5></div>' +
        '<div class="text-secondary" style="font-size: 12px;line-height: 20px;"><span class="d-inline-block" style="width:15%">Cost</span><span class="d-inline-block">Payments</span></div>' +
        '<div class="text-secondary" style="font-size: 12px;line-height: 20px;"><span class="d-inline-block" style="width:15%">{{this.utilityService.formatDecimalCurrency(params.data.invoiceAmount)}}</span><span class="d-inline-block w-85" [innerHTML]="paymentsList"></span></div>' +
        '<div class="text-secondary" style="font-size: 12px;line-height: 20px;"><span class="d-inline-block w-tpayments"></span><span [innerHTML]="totalPayments" class="total-payments d-inline-block"></span></div>',
    encapsulation: ViewEncapsulation.None,
    styles: [`
    .w-40{
        width:40%;
    }
    .w-85{
        width:85%;
    }
    .w-20{
        width:20%;
    }
    .w-tpayments{
        width:49%;
    }
    .total-payments{
        border-top: 1px solid #e4e4e4;
        padding-top: 2px;
    }
    .line-height-def{
        line-height:1.2;
    }
    .fsize-9{
        font-size:0.9rem !important;
    }
    .text-elipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    `]
})
export class VendorInvoiceCellRenderer implements ICellRendererAngularComp {
    paymentsList: any = "";
    totalPayments: any = "";
    totalPaymentAmount: any = 0.0;

    public params: any;

    constructor(public utilityService: UtilityService, private elRef: ElementRef) { }
    // <h5 class="mb-0 d-inline-block fsize-9">INV# {{params.data.invoiceNo}}&nbsp;&nbsp; @{{params.data.storeName}}</h5>
    agInit(params: any): void {
        this.params = params;
        if (params.data && params.data.paymentMethods) {
            params.data.paymentMethods.forEach((data, index) => {
                if (Number(data.amountPaid) > 0) {
                    let printButton = "";
                    if (parseInt(data.paymentID) === 13) {
                        printButton = '<i class="' + index + ' fa fa-print ml-2 cursor-pointer print-btn"></i>';
                        if (data.checkNumber !== "" && data.checkNumber !== null) printButton += '<span class="ml-2"># ' + data.checkNumber + '</span>';
                    }
                    this.paymentsList += '<span class="d-block"><span class="text-secondary d-inline-block w-40">' + data.methodOfPaymentDescription + '</span><span>' + this.utilityService.formatDecimalCurrency(data.amountPaid) + '</span>' + printButton + '</span>'
                    this.totalPaymentAmount += data.amountPaid;
                }
            });
            if (params.data.paymentMethods && params.data.paymentMethods.length === 0) this.paymentsList = "NA";
            if (Number(this.totalPaymentAmount) > 0) {
                this.totalPayments = this.utilityService.formatDecimalCurrency(this.totalPaymentAmount);
            }
            setTimeout(() => {
                this.elRef.nativeElement.querySelector('.print-btn') ? this.elRef.nativeElement.querySelector('.print-btn').addEventListener('click', this.print.bind(this)) : "";
            });
        }
    }

    refresh(): boolean {
        return false;
    }

    public print(event) {
        let selectedIndex = event.srcElement ? event.srcElement.classList[0] : "-1";
        this.params.selectedPaymentIndex = Number(selectedIndex);
        this.params.context.componentParent.printAction(this.params);
    }
}