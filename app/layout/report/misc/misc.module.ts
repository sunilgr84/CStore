import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiscComponent } from './misc.component';
import { MiscRoutingModule } from './misc-routing.module';
import { PageHeaderModule } from 'src/app/shared';

@NgModule({
  declarations: [MiscComponent],
  imports: [
    CommonModule,
    MiscRoutingModule,
    PageHeaderModule
  ]
})
export class MiscModule { }
