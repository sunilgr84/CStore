import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeFormat' })
export class TimeFormat implements PipeTransform {
    transform(value: string): string {
        let formatedValue: any;
        if (value) {
            formatedValue = value.slice(0, 5);
        }
        return formatedValue;
    }
}
