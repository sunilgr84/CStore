import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { throwIfAlreadyLoaded } from '../core/module-import-guard';
import { LoggerService } from './logger/logger.service';
import { GridService } from './grid/grid.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ConstantService } from './constant/constant.service';
import { EditableGridService } from './editableGrid/editable-grid.service';
import { SetupService } from './setupService/setup-service';
import { WeatherService } from './weather/weather.service';
import { StoreService } from './store/store.service';
import { UtilityService } from './utility/utility.service';
import { CommonService } from './commmon/common.service';
import { RouteConfigService } from './routeConfig/route-config.service';
import { ReportService } from './report/report.service';
import { DataImportService } from './dataImport/data-import.service';
import { MessageService } from './commmon/message-Service';
import { PDFGenrateService } from './pdf-genrate/pdf-genrate.service';
import { ExcelGeneratedService } from './excelGenerate/excel-generated.service';
import { ReportGridService } from './report/report-grid.service';
import { StoreMessageService } from './commmon/store-message.service';
import { ScanDataService } from './scanDataService/scan-data.service';
import { PaginationGridService } from './paginationGrid/pagination-grid.service';
import { NewRouteConfigService } from './routeConfig/new-route-config.service';

@NgModule({
    imports: [CommonModule],
})
export class CommonServiceModule {
    constructor(@Optional() @SkipSelf() parentModule: CommonServiceModule) {
        throwIfAlreadyLoaded(parentModule, 'CommonServiceModule');
    }
    static forRoot(): ModuleWithProviders { //  forRoot(config: UserServiceConfig)
        return {
            ngModule: CommonServiceModule,
            providers: [ // {provide: UserServiceConfig, useValue: config }, // future scope
                LoggerService, GridService, ConstantService, EditableGridService,
                RouteConfigService, NewRouteConfigService, MessageService,
                SetupService, WeatherService, StoreService, UtilityService, CommonService, DatePipe,
                ReportService, DataImportService, PDFGenrateService, ExcelGeneratedService,
                ReportGridService, StoreMessageService, ScanDataService, PaginationGridService
            ]
        };
    }
}
