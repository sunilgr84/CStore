import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlynumberDirective } from './number-only.directive';
import { DecimalOnlyDirective, TwoDecimalOnlyDirective } from './decimal-only.directive';
import { FloatOnlyDirective } from './float-only.directive';
import { NagetiveFloatOnlyDirective } from './nagetive-float-directive';
import { NagetiveNumbersOnlyDirective } from './nagetive-number-directive';
import { NgxPasswordToggleDirective } from './password-toggle-directive';
import { AutofocusDirective } from './auto-focus';
import { NumericDirective } from './only-number.directive';
import { NumberOnlyTwoDecimalDirective } from './numberFomatTwoDecimal.directive';
import { MoneyDirective } from './money.directive';
import { NumberOnlyThreeDecimalDirective } from './numberFomatThreeDecimal.directive';

@NgModule({
    imports: [CommonModule],
    declarations: [OnlynumberDirective, DecimalOnlyDirective, TwoDecimalOnlyDirective, FloatOnlyDirective, NagetiveFloatOnlyDirective
        , NagetiveNumbersOnlyDirective, NgxPasswordToggleDirective, AutofocusDirective, NumericDirective,
        NumberOnlyTwoDecimalDirective, MoneyDirective, NumberOnlyThreeDecimalDirective],
    exports: [OnlynumberDirective, DecimalOnlyDirective, TwoDecimalOnlyDirective, FloatOnlyDirective, NagetiveFloatOnlyDirective
        , NagetiveNumbersOnlyDirective, NgxPasswordToggleDirective, AutofocusDirective, NumericDirective, MoneyDirective, NumberOnlyTwoDecimalDirective, NumberOnlyThreeDecimalDirective]
})
export class DirectivesModule { }
