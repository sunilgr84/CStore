import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteMessageRoutingModule } from './site-message-routing.module';
import { SiteMessageComponent } from './site-message.component';
import { PageHeaderModule } from 'src/app/shared';
import { FormsModule } from '@angular/forms';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
@NgModule({
  declarations: [SiteMessageComponent],
  imports: [
    CommonModule,
    SiteMessageRoutingModule,
    PageHeaderModule,
    FormsModule,
    CommonComponentModule
  ]
})
export class SiteMessageModule { }
