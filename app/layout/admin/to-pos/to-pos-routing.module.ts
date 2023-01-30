import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ToPosComponent } from './to-pos.component';

const routes: Routes = [
  { path: '', component: ToPosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToPosRoutingModule { }
