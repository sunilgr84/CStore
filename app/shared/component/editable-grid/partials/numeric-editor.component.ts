import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';

import { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-numeric-cell',
    template: `<input type="text"  #input numeric [decimals]="2"  class="ag-cell-edit-input"
        [(ngModel)]="value" style="width: 100%">`,
    styles: []
})
// <input #input class="form-control" (keydown)="onKeyDown($event)"
//      [(ngModel)]="value" style="width: 100%">
// <input type="text"  #input numeric [decimals]="2"  class="form-control"
//     [(ngModel)]="value" style="width: 100%">
// tslint:disable-next-line:component-class-suffix
export class NumericEditor implements ICellEditorAngularComp, AfterViewInit {
    private params: any;
    public value: number;
    private cancelBeforeStart = false;

    @ViewChild('input') public input: any;


    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue(): any {
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 1000000;
    }

    onKeyDown(event): void {
        if (!this.isKeyPressedNumeric(event) && !this.isKeyPressedNavigation(event)) {
            if (event.preventDefault) {
                event.preventDefault();
            }
        }
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        // window.setTimeout(() => {
        //     this.input.nativeElement.focus();
        // });
    }

    private getCharCodeFromEvent(event): any {
        // tslint:disable-next-line: deprecation
        event = event || window.event;
        return (typeof event.which === 'undefined') ? event.keyCode : event.which;
    }

    private isCharNumeric(charStr): boolean {
        return !!/\d/.test(charStr);
    }

    private isKeyPressedNumeric(event): boolean {
        const charCode = this.getCharCodeFromEvent(event);
        const charStr = event.key ? event.key : String.fromCharCode(charCode);
        return this.isCharNumeric(charStr);
    }

    isKeyPressedNavigation(event) {
        const isAllowKey = event && (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 190
            || event.keyCode === 109 || event.keyCode === 110 ||
            // tslint:disable-next-line: deprecation
            (event.keyCode === 65 && event.ctrlKey === true) || // Allow: Ctrl+A
            // tslint:disable-next-line: deprecation
            (event.keyCode === 67 && event.ctrlKey === true) || // Allow: Ctrl+C
            // tslint:disable-next-line: deprecation
            (event.keyCode === 86 && event.ctrlKey === true) || // Allow: Ctrl+V
            // tslint:disable-next-line: deprecation
            (event.keyCode === 88 && event.ctrlKey === true) || // Allow: Ctrl+X
            // tslint:disable-next-line: deprecation
            (event.keyCode === 65 && event.metaKey === true) || // Cmd+A (Mac)
            // tslint:disable-next-line: deprecation
            (event.keyCode === 67 && event.metaKey === true) || // Cmd+C (Mac)
            // tslint:disable-next-line: deprecation
            (event.keyCode === 86 && event.metaKey === true) || // Cmd+V (Mac)
            // tslint:disable-next-line: deprecation
            (event.keyCode === 88 && event.metaKey === true) || // Cmd+X (Mac)
            // tslint:disable-next-line: deprecation
            (event.keyCode >= 35 && event.keyCode <= 39)) ? true : false;
        return isAllowKey;
    }

    focusIn() {
        this.input.nativeElement.focus();
    }
}




@Component({
    selector: 'app-numeric-cell',
    template: `<input type="text"  (keydown)="onKeyDown($event)" [maxLength]="15"  #input numeric [decimals]="2"  class="ag-cell-edit-input"
        [(ngModel)]="value" style="width: 100%">`,
    styles: []
})
// <input #input class="form-control" (keydown)="onKeyDown($event)"
//      [(ngModel)]="value" style="width: 100%">
// <input type="text"  #input numeric [decimals]="2"  class="form-control"
//     [(ngModel)]="value" style="width: 100%">
// tslint:disable-next-line:component-class-suffix
export class PositiveNumericEditor implements ICellEditorAngularComp, AfterViewInit {
    private params: any;
    public value: number;
    private cancelBeforeStart = false;

    @ViewChild('input') public input: any;


    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue(): any {
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 1000000;
    }

    onKeyDown(event): void {
        if ((!this.isKeyPressedNumeric(event) && !this.isKeyPressedNavigation(event))|| event.key == '-') {
            if (event.preventDefault) {
                event.preventDefault();
            }
        }
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        // window.setTimeout(() => {
        //     this.input.nativeElement.focus();
        // });
    }

    private getCharCodeFromEvent(event): any {
        // tslint:disable-next-line: deprecation
        event = event || window.event;
        return (typeof event.which === 'undefined') ? event.keyCode : event.which;
    }

    private isCharNumeric(charStr): boolean {
        return !!/\d/.test(charStr);
    }

    private isKeyPressedNumeric(event): boolean {
        const charCode = this.getCharCodeFromEvent(event);
        const charStr = event.key ? event.key : String.fromCharCode(charCode);
        return this.isCharNumeric(charStr);
    }

    isKeyPressedNavigation(event) {
        const isAllowKey = event && (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 190
            || event.keyCode === 109 || event.keyCode === 110 ||
            // tslint:disable-next-line: deprecation
            (event.keyCode === 65 && event.ctrlKey === true) || // Allow: Ctrl+A
            // tslint:disable-next-line: deprecation
            (event.keyCode === 67 && event.ctrlKey === true) || // Allow: Ctrl+C
            // tslint:disable-next-line: deprecation
            (event.keyCode === 86 && event.ctrlKey === true) || // Allow: Ctrl+V
            // tslint:disable-next-line: deprecation
            (event.keyCode === 88 && event.ctrlKey === true) || // Allow: Ctrl+X
            // tslint:disable-next-line: deprecation
            (event.keyCode === 65 && event.metaKey === true) || // Cmd+A (Mac)
            // tslint:disable-next-line: deprecation
            (event.keyCode === 67 && event.metaKey === true) || // Cmd+C (Mac)
            // tslint:disable-next-line: deprecation
            (event.keyCode === 86 && event.metaKey === true) || // Cmd+V (Mac)
            // tslint:disable-next-line: deprecation
            (event.keyCode === 88 && event.metaKey === true) || // Cmd+X (Mac)
            // tslint:disable-next-line: deprecation
            (event.keyCode >= 35 && event.keyCode <= 39)) ? true : false;
        return isAllowKey;
    }

    focusIn() {
        this.input.nativeElement.focus();
    }
}
