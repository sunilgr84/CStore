import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ISMUpdateComponent } from './ismupdate.component';

const routes: Routes = [
  { path: '', component: ISMUpdateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ISMUpdateRoutingModule { }
