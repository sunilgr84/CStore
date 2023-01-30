import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PjrSearchComponent } from './pjr-search.component';

const routes: Routes = [
  {
    path: '', component: PjrSearchComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PjrSearchRoutingModule { }
