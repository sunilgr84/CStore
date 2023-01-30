import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SiteMessageComponent } from './site-message.component';

const routes: Routes = [
  { path: '', component: SiteMessageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteMessageRoutingModule { }
