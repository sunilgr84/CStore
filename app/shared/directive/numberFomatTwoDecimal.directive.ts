import { Directive, ElementRef, HostListener, Input } from '@angular/core';
const PADDING = '000000';
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[numberTwoDecimalOnly]'
})
export class NumberOnlyTwoDecimalDirective {
    // tslint:disable-next-line:no-input-rename
    @Input() length: number;
    private regex: RegExp = new RegExp(/^\d{0,4}\.?\d{0,2}$/g);
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
    constructor(private el: ElementRef) {
    }
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Allow Backspace, tab, end, and home keys
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        const current: string = this.el.nativeElement.value;
        const position = this.el.nativeElement.selectionStart;
        const next: string = [current.slice(0, position), event.key === 'Decimal' ? '.' : event.key, current.slice(position)].join('');
        if (next.indexOf('.') === -1) {
            if ((this.length && next.length > this.length) || (!this.length && next.length > 4)) {
                event.preventDefault();
            }
        }
        if (next && !String(next).match(this.regex)) {
            event.preventDefault();
        }
    }
}
