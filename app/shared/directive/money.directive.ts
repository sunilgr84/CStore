import { Directive, ElementRef, HostListener } from '@angular/core';
import { CommonService } from '@shared/services/commmon/common.service';


@Directive({
  selector: '[money]'
})
export class MoneyDirective {
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  
  currencyChars = new RegExp('[\.,]', 'g'); // we're going to remove commas and dots
  constructor(private el: ElementRef, private commonService: CommonService){}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1 ||
       // tslint:disable-next-line: deprecation
       event.keyCode === 110 ||
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
      (event.keyCode >= 35 && event.keyCode <= 39)) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key === 'Decimal' ? '.' : event.key, current.slice(position)].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value){
    this.el.nativeElement.value = value.replace('$', '').replace(/,/g,'');
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value){
    this.el.nativeElement.value = this.commonService.setMoneyFormat(value);
  }

}