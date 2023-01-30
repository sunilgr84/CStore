import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilesRoutingModule } from './files-routing.module';
import { FilesComponent } from './files.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '@shared/modules';

@NgModule({
  declarations: [FilesComponent],
  imports: [
    CommonModule,
    FilesRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule
  ]
})
export class FilesModule { }
