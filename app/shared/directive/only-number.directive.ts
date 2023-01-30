import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[numeric]'
})

export class NumericDirective {
    // tslint:disable-next-line:no-input-rename
    @Input('decimals') decimal = 0;
    private specialKeys: Array<string> = ['Backspace', 'Ctrl', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

    constructor(private el: ElementRef) {
    }



    private check(value: string, decimals: number) {
        if (decimals <= 0) {
            return String(value).match(new RegExp(/^\d+$/));
        } else {
            // const regExpString = '^\\s*((\\d+(\\.\\d{0,' + decimals + '})?)|((\\d*(\\.\\d{1,' + decimals + '}))))\\s*$';
            const regExpString = '^(-)?\\d*\\.?\\d{0,' + decimals + '}$';
            return String(value).match(new RegExp(regExpString));
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Allow Backspace, tab, end, and home keys
        if (this.specialKeys.indexOf(event.key) !== -1 ||
            // tslint:disable-next-line: deprecation
            // event.keyCode === 110 ||
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
        // Do not use event.keycode this is deprecated.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
        let current: string = this.el.nativeElement.value;
        const position = this.el.nativeElement.selectionStart;
        // let next: string = current.concat(event.key);
        let next: string = [current.slice(0, position), event.key === 'Decimal' ? '.' : event.key, current.slice(position)].join('');
        if (next && !this.check(next, this.decimal)) {
            event.preventDefault();
        }
    }
}