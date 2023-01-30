import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperItemsRoutingModule } from './super-items-routing.module';
import { SuperItemsComponent } from './super-items.component';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [SuperItemsComponent],
  imports: [
    CommonModule,
    SuperItemsRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SuperItemsModule { }
