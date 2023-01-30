import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MixMatchesComponent } from './mix-matches.component';

const routes: Routes = [
  {
    path: '', component: MixMatchesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MixMatchesRoutingModule { }
