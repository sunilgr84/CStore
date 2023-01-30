import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DualListBoxComponent } from './dual-list-box.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ArraySortPipe, ArrayFilterPipe } from './array.pipe';

@NgModule({
  declarations: [
    ArraySortPipe,
    ArrayFilterPipe,
    DualListBoxComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [DualListBoxComponent]
})
export class DualListBoxModule { }
