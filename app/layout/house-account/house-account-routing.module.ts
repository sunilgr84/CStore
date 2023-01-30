import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HouseAccountComponent } from './house-account.component';

const routes: Routes = [
    {
        path: '', component: HouseAccountComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HouseAccountRoutingModule { }
