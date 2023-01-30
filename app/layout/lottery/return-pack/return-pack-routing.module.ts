import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReturnPackComponent } from './return-pack.component';

const routes: Routes = [
  { path: '', component: ReturnPackComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReturnPackRoutingModule { }
