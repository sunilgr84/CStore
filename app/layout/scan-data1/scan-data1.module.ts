import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { ScanData1RoutingModule } from './scan-data1-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { ScanDataManufacturerComponent } from './scan-data-manufacturer/scan-data-manufacturer.component';
import { ScanDataSetupComponent } from './scan-data-setup/scan-data-setup.component';
import { DataComponent } from './data/data.component';
import { ScanData1Component } from './scan-data1.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScanDataErrorsComponent } from './scan-data-errors/scan-data-errors.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { MatButtonToggleModule, MatChipsModule, MatIconModule, MatTooltipModule, MAT_DATE_FORMATS, MatSelectModule, MatDatepickerModule, MatInputModule } from '@angular/material';
import { AlertModalComponent } from './alert-modal/alert-modal.component';
import { DownloadConfirmModalComponent } from './download-confirm-modal/download-confirm-modal.component';
import { FileLogComponent } from './file-log/file-log.component';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { ScanDataConfigComponent } from './scan-data-config/scan-data-config.component';
import { ScanDataAcknowledgmentComponent } from './scan-data-acknowledgment/scan-data-acknowledgment.component';

export const MY_FORMATS = {
    parse: {
      dateInput: 'MM/YYYY',
    },
    display: {
      dateInput: 'MMM YYYY',
      monthYearLabel: 'MMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY',
    },
  };

@NgModule({
  declarations: [ScanData1Component, ScanDataManufacturerComponent, ScanDataSetupComponent, DataComponent, ScanDataErrorsComponent, ConfirmationModalComponent, AlertModalComponent, DownloadConfirmModalComponent, FileLogComponent, ScanDataConfigComponent, ScanDataAcknowledgmentComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScanData1RoutingModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    PageHeaderModule,
    NgSelectModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MomentDateModule,
    MatInputModule,
  ],
  entryComponents: [
    ConfirmationModalComponent,
    AlertModalComponent,
    DownloadConfirmModalComponent
  ],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
  exports:[ScanDataManufacturerComponent]
})
export class ScanData1Module { }
