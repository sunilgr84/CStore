import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MiscComponent } from './misc.component';

const routes: Routes = [
  { path: '', component: MiscComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiscRoutingModule { }
