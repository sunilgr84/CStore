import { AfterViewInit, Component, ViewChild, ViewContainerRef, HostListener, ElementRef } from '@angular/core';

import { ICellEditorAngularComp } from 'ag-grid-angular';

import * as moment from 'moment';


@Component({
    selector: 'app-date-time',
    template: ` <mat-form-field tabindex="-1">
    <input #input matInput tabindex="-1" [ngxMatDatetimePicker]="picker" placeholder="Choose a date" [(ngModel)]="value" >
    <mat-datepicker-toggle tabindex="-1" matSuffix [for]="picker"></mat-datepicker-toggle>
    <ngx-mat-datetime-picker tabindex="-1" #picker></ngx-mat-datetime-picker>
  </mat-form-field>`,
    styles: []
})
export class DateTimeEditorRenderer implements ICellEditorAngularComp, AfterViewInit {

    private params: any;
    public value: any;

    @ViewChild('picker') public picker:any;

    @ViewChild('input') public input: any;
    constructor(private eRef: ElementRef) { }

    agInit(params: any): void {
        this.params = params;
        let timeNow = moment().format('YYYY-MM-DDThh:mm:ss');
        if(!this.params.value)
            this.value = timeNow;
        else
            this.value = this.params.value;
    }
    getValue(): any {
        try {
            let rowNode = this.params.api.getRowNode(this.params.node.id);
            if(rowNode.data.storeTankVolumeHistoryID === 0 && !this.value)
                return null;
            else
                return this.value.format('YYYY-MM-DDThh:mm:ss');
        } catch (Error) {
            return this.value;
        }
    }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (this.eRef.nativeElement.contains(event.target)||event.target.closest("ngx-mat-datetime-content")!==null) {
            console.log("clicked inside");
        } else {
            this.picker.close();
        }
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        // window.setTimeout(() => {
        //     this.input.nativeElement.focus();
        // });
    }

       
    focusIn() {
        this.input.nativeElement.focus();
    }
}
