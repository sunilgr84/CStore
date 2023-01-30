import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[numbersOnly]'
})
export class OnlynumberDirective {

    // tslint:disable-next-line:no-input-rename    @Input('numericType')
    numericType = 'number'; // number | decimal

    private regex = {
        number: new RegExp(/^\d+$/),
        decimal: new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g)
    };

    private specialKeys = {
        number: ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete', 'Ctrl'],
        decimal: ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'],
    };

    constructor(private el: ElementRef) {
    }

    // @HostListener('keydown', ['$event'])
    // onKeyDown(event: KeyboardEvent) {

    //     if (this.specialKeys[this.numericType].indexOf(event.key) !== -1) {
    //         return;
    //     }
    //     // Do not use event.keycode this is deprecated.
    //     // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    //     const current: string = this.el.nativeElement.value;
    //     const next: string = current.concat(event.key);
    //     if (next && !String(next).match(this.regex[this.numericType])) {
    //         event.preventDefault();
    //     }
    // }
    @HostListener('keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (
            // Allow: Delete, Backspace, Tab, Escape, Enter
            // tslint:disable-next-line: deprecation
            [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
            // tslint:disable-next-line: deprecation
            (e.keyCode === 65 && e.ctrlKey === true) || // Allow: Ctrl+A
            // tslint:disable-next-line: deprecation
            (e.keyCode === 67 && e.ctrlKey === true) || // Allow: Ctrl+C
            // tslint:disable-next-line: deprecation
            (e.keyCode === 86 && e.ctrlKey === true) || // Allow: Ctrl+V
            // tslint:disable-next-line: deprecation
            (e.keyCode === 88 && e.ctrlKey === true) || // Allow: Ctrl+X
            // tslint:disable-next-line: deprecation
            (e.keyCode === 65 && e.metaKey === true) || // Cmd+A (Mac)
            // tslint:disable-next-line: deprecation
            (e.keyCode === 67 && e.metaKey === true) || // Cmd+C (Mac)
            // tslint:disable-next-line: deprecation
            (e.keyCode === 86 && e.metaKey === true) || // Cmd+V (Mac)
            // tslint:disable-next-line: deprecation
            (e.keyCode === 88 && e.metaKey === true) || // Cmd+X (Mac)
            // tslint:disable-next-line: deprecation
            (e.keyCode >= 35 && e.keyCode <= 39) // Home, End, Left, Right
        ) {
            return;  // let it happen, don't do anything
        }
        // Ensure that it is a number and stop the keypress
        // tslint:disable-next-line: deprecation
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }
    @HostListener('paste', ['$event'])
    onPaste(event: any) {
        event.preventDefault();
        const pastedInput: string = event.clipboardData
            .getData('text/plain')
            .replace(/\D/g, ''); // get a digit-only string
        document.execCommand('insertText', false, pastedInput);
    }
    @HostListener('drop', ['$event'])
    onDrop(event: any) {
        event.preventDefault();
        const textData = event.dataTransfer
            .getData('text').replace(/\D/g, '');
        //  this.inputElement.focus();
        document.execCommand('insertText', false, textData);
    }
}
