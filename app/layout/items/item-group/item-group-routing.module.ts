import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItemGroupComponent } from './item-group.component';

const routes: Routes = [
  { path: '', component: ItemGroupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemGroupRoutingModule { }
