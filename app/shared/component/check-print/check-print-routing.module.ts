import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckPrintComponent } from './check-print.component';

const routes: Routes = [
    {
        path: '',
        component: CheckPrintComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CheckPrintRoutingModule {}