import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyDownManagerRoutingModule } from './buy-down-manager-routing.module';
import { BuyDownManagerComponent } from './buy-down-manager.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [BuyDownManagerComponent],
  imports: [
    CommonModule,
    BuyDownManagerRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule

  ]
})
export class BuyDownManagerModule { }
