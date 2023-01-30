import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemsRoutingModule } from './items-routing.module';
import { ItemsComponent } from './items.component';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import { MatRadioModule, MatCheckboxModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [
    ItemsComponent,
  ],
  imports: [
    CommonModule,
    ItemsRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    MatRadioModule,
    MatCheckboxModule,
    FormsModule,
    NgSelectModule
  ],
  providers: [ConfirmationDialogService]
})
export class ItemsModule { }
