import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpTimeCardRoutingModule } from './emp-time-card-routing.module';
import { EmpTimeCardComponent } from './emp-time-card.component';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [EmpTimeCardComponent],
  imports: [
    CommonModule,
    EmpTimeCardRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ]
})
export class EmpTimeCardModule { }
