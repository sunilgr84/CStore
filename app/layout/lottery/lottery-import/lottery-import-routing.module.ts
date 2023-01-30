import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LotteryImportComponent } from './lottery-import.component';

const routes: Routes = [
  { path: '', component: LotteryImportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LotteryImportRoutingModule { }
