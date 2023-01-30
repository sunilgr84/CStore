import { NgModule, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckPrintComponent } from './check-print.component';
import { CheckPrintRoutingModule } from './check-print-routing.module';
import { Router } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        CheckPrintRoutingModule
    ],
    declarations: [CheckPrintComponent],
})
export class CheckPrintModule implements OnInit, OnDestroy {

    constructor(private router: Router) { }

    ngOnInit() {
    }

    ngOnDestroy() {

    }
}


