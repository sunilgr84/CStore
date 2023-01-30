import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormBuilderComponent } from './dynamic-form-builder.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [ DynamicFormBuilderComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,FormsModule
  ],
  exports: [DynamicFormBuilderComponent]
})
export class DynamicFormBuilderModule { }
