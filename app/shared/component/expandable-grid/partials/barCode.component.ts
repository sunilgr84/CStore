import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular/main";
import { NgxBarcodeModule } from 'ngx-barcode';
//import { ICellRendererAngularComp } from 'ag-grid-angular';
//import { CellActionComponent } from 'src/app/shared/component/cstore-grid/partials/cell-action/cell-action.component';
@Component({
    selector: 'barCode',
    template: `<div *ngIf="upcCode!=''">
    <ngx-barcode *ngFor="let bcValue of barcodeContent" [bc-element-type]="elementType" [bc-value]="bcValue"
          [bc-format]="format" [bc-line-color]="lineColor" [bc-width]="width" [bc-height]="height"
          [bc-display-value]="true" [bc-font-options]="fontOptions" [bc-font]="font" [bc-text-align]="textAlign"
          [bc-text-position]="textPosition" [bc-text-margin]="textMargin" [bc-font-size]="fontSize"
          [bc-background]="background" [bc-margin]="margin" [bc-margin-top]="marginTop"
          [bc-margin-bottom]="marginBottom" [bc-margin-left]="marginLeft" [bc-margin-right]="marginRight">
        </ngx-barcode></div>
  `

})
export class BarCodeComponent implements ICellRendererAngularComp {
    upcCode: string;
    barcodeContent: any;
    format = 'UPC'; // 'CODE128';  // 'CODE128A'; // 'CODE128B';
    elementType = 'svg';
    // value = 'someValue12340987';
    lineColor = '#000000';
    width = 1;
    height = 15;
    displayValue = true;
    fontOptions = '';
    font = 'monospace';
    textAlign = 'center';
    textPosition = 'bottom';
    textMargin = 2;
    fontSize = 20;
    background = '#ffffff';
    margin = 10;
    marginTop = 10;
    marginBottom = 10;
    marginLeft = 10;
    marginRight = 10;
    tempId = 0;
    addrow = 0;

    refresh(params: any): boolean {
        throw new Error("Method not implemented.");
    }
    afterGuiAttached?(params?: import("ag-grid-community").IAfterGuiAttachedParams): void {
        throw new Error("Method not implemented.");
    }
    public params: any;

    agInit(params: any): void {
        this.params = params;
        this.upcCode = this.params.value;
        if (this.upcCode)
            this.barcodeContent = this.upcCode.split('\n');
    }


}