import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreGroupComponent } from './store-group.component';
import { StoreGroupRoutingModule } from './store-group-routing.module';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [StoreGroupComponent],
  imports: [
    CommonModule,
    StoreGroupRoutingModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule
  ]
})
export class StoreGroupModule { }
