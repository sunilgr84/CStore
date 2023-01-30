import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreServicesComponent } from './store-services.component';
import { MatStepperModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';
@NgModule({
  declarations: [StoreServicesComponent],
  imports: [
    CommonModule,
    MatStepperModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DirectivesModule
  ],
  exports: [StoreServicesComponent]
})
export class StoreServicesModule { }
