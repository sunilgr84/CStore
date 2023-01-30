import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'negativeNumber' })
export class NegativeNumberPipe implements PipeTransform {
    transform(value: any): string {
        if (value < 0) {
            return Math.abs(value).toFixed(2);
            // return `${value.toString().substr(1)}`;
        }
        return Math.abs(value).toFixed(2);
        // return `${ value } | number`;
    }
}
