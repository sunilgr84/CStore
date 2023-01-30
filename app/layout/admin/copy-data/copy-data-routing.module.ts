import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CopyDataComponent } from './copy-data.component';

const routes: Routes = [
  { path: '', component: CopyDataComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CopyDataRoutingModule { }
