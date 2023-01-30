import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MovePackComponent } from './move-pack.component';

const routes: Routes = [
  { path: '', component: MovePackComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovePackRoutingModule { }
