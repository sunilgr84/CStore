import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccoutingComponent } from './accouting.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [AccoutingComponent],
  imports: [
    CommonModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  exports: [AccoutingComponent]
})
export class AccoutingModule { }
