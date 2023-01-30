import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FromPosComponent } from './from-pos.component';

const routes: Routes = [
  { path: '', component: FromPosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FromPosRoutingModule { }
