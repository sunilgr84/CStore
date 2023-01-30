import { Directive, ElementRef, HostListener, Input } from '@angular/core';


@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[nagetiveNumberstOnly]'
})
export class NagetiveNumbersOnlyDirective {
    private regex: RegExp = new RegExp(/^(-|\+)?\d+$/); // new RegExp(/^\d+$/)
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
    constructor(private el: ElementRef) {
    }
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Allow Backspace, tab, end, and home keys
        if (this.specialKeys.indexOf(event.key) !== -1 ||
            // tslint:disable-next-line: deprecation
            event.keyCode === 109 || event.keyCode === 110 ||
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
            (event.keyCode >= 35 && event.keyCode <= 39) // Home, End, Left, Right
        ) {
            return;
        }
        const current: string = this.el.nativeElement.value;
        const position = this.el.nativeElement.selectionStart;
        const next: string = [current.slice(0, position), event.key === 'Decimal' ? '.' : event.key, current.slice(position)].join('');
        if (next && !String(next).match(this.regex)) {
            event.preventDefault();
        }
    }
}
