import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlankPageRoutingModule } from './blank-page-routing.module';
import { BlankPageComponent } from './blank-page.component';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [CommonModule, CommonComponentModule, BlankPageRoutingModule,
        FormsModule, HttpClientModule],
    declarations: [BlankPageComponent]
})
export class BlankPageModule { }
