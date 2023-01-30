import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardSettingRoutingModule } from './dashboard-setting-routing.module';
import { DashboardSettingComponent } from './dashboard-setting.component';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [DashboardSettingComponent],
  imports: [
    CommonModule,
    DashboardSettingRoutingModule,
    CommonComponentModule
  ]
})
export class DashboardSettingModule { }
