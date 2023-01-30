import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SettingTimeOffComponent } from './setting-time-off.component';
import { SettingTimeOffRoutingModule } from './setting-time-off-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AmazingTimePickerModule } from 'amazing-time-picker';

@NgModule({
  declarations: [SettingTimeOffComponent],
  imports: [
    CommonModule,
    CommonComponentModule,
    SettingTimeOffRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ReactiveFormsModule,
    AmazingTimePickerModule
  ],
  exports: [SettingTimeOffComponent]
})
export class SettingTimeoffModule { }
