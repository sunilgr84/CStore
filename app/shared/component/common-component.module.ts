import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableGridComponent } from './editable-grid/editable-grid.component';
import { CstoreGridComponent } from './cstore-grid/cstore-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { CellActionRenderer } from './editable-grid/partials/cell-action-renderer.component';
import { AdvCellActionRenderer } from './editable-grid/partials/adv-cell-action-renderer.component';
import { AdvActionRenderer } from './editable-grid/partials/adv-action-renderer.component';
import { DialogComponent } from './dialog/dialog.component';
import { DialogHeaderComponent } from './dialog/dialog.component';
import { DialogBodyComponent } from './dialog/dialog.component';
import { DialogFooterComponent } from './dialog/dialog.component';
import { DialogConfirmRemoveComponent } from './dialog/dialog-confirm-remove/dialog-confirm-remove.component';
import { CellActionComponent } from './cstore-grid/partials/cell-action/cell-action.component';
import { InputCellEditorComponent, InputCellRendererComponent, InputNumberCellEditorComponent, InputSelectCellEditorComponent, InputSwitchCellEditorComponent } from '@shared/component/editable-grid/partials/input-cell-renderer.component';
import { ExpandableGridComponent } from './expandable-grid/expandable-grid.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CheckboxCellRenderer } from './editable-grid/customGridControls/checkbox-cell-renderer.component';
import { DetailCellRenderer } from './expandable-grid/partials/detail-cell-renderer.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { CheckUncheckIconCellRendererComponent } from './cstore-grid/partials/check-uncheck-icon.cell-renderer.component';
import { ConfirmationDialogService } from './confirmation-dialog/confirmation-dialog.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule } from '@angular/material';
import { BlendDetailCellRenderer } from './expandable-grid/partials/blend-details-renderer.component';
import { TankDetailCellRenderer } from './expandable-grid/partials/tank-details-renderer.component';
import { PriceGroupCellRenderer } from './expandable-grid/partials/pricegroup-cell-renderer.component';
import { FuelInvoiceCellRender } from './expandable-grid/partials/fuel-invoice-renderer.component';
import { InvoiceAddItemComponent } from './invoice-add-item/invoice-add-item.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckboxCellRendererSelesTax } from './editable-grid/customGridControls/checkbox-cell-renderer-sales-tax.component';
import { CheckboxCellRendererStoreFees } from './editable-grid/customGridControls/checkbox-cell-renderer-store-fees.component';
import { CheckboxCellRendererMOP } from './editable-grid/customGridControls/checkbox-cell-renderer-mop.component';
// tslint:disable-next-line:max-line-length
import { CheckboxCellRendererSalesRestriction } from './editable-grid/customGridControls/checkbox-cell-renderer.sales-restriction.component';
import { NumericEditor } from './editable-grid/partials/numeric-editor.component';
import { PositiveNumericEditor } from './editable-grid/partials/numeric-editor.component'
import { MasterLinkedItemCellRenderer } from './expandable-grid/partials/master-linked-item-renderer.component';
import { DirectivesModule } from '@shared/directive/directives.module';
import { OnlyNumericEditor } from './editable-grid/partials/onlynumber-editor.component';
import { PriceGroupDetailsCellRenderer } from './expandable-grid/partials/price-group-details-renderer.component';
import { ReportGridComponent } from './report-grid/report-grid.component';
import { DaterangepickerComponent } from './daterangepicker/daterangepicker.component';
import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';
import { FourDigitEditor } from './editable-grid/partials/fourdigits.editor.component';
import { DecimalEditor, DecimalWithDollarEditor } from './editable-grid/partials/decimal.editor.component';
import { CheckboxPrivilegeRenderer } from './cstore-grid/partials/checkbox-privilege-renderer.component';
import { FuelTankComponent } from './fuel-tank/fuel-tank.component';
import { BankDetailCellRenderer } from './expandable-grid/partials/bank-details-renderer.component';
import { EditButtonComponent } from './expandable-grid/partials/edit-button.component';
import { SaveButtonComponent } from './expandable-grid/partials/save-button.component';
import { UploadButtonComponent } from './expandable-grid/partials/upload-button.component';
import { DetailButtonComponent } from './expandable-grid/partials/details-button-renderer.component';
import { BankLogoButtonComponent } from './expandable-grid/partials/bank-logo.component';
import { AccountDetailCellRenderer } from './expandable-grid/partials/account-detail-cell-renderer.component';
import { ChildSelectRenderer } from './expandable-grid/partials/childselect.component';
import { SelectRenderer } from './expandable-grid/partials/select.component';
import { ChildCheckBoxRenderer } from './expandable-grid/partials/childcheckbox.component';
import { ChildRowRenderer } from './expandable-grid/partials/childRow.component';
import { ChildInputRenderer } from './expandable-grid/partials/childinput.component';
import { ChildSaveButtonComponent } from './expandable-grid/partials/childSaveButton.component';
import { BarCodeComponent } from './expandable-grid/partials/barCode.component';
import { NgxBarcodeModule } from 'ngx-barcode';
import { DateTimeEditorRenderer } from './editable-grid/partials/date-time-picker.editor.component';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from 'ngx-mat-datetime-picker';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatetimerangepickerComponent } from './datetimerangepicker/datetimerangepicker.component';
import { ChartRangeSelectorComponent } from './chart-range-selector/chart-range-selector.component';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { SaveButtonParentComponent } from './expandable-grid/partials/save-button-parent.component';
import { CheckboxCellEditor } from './editable-grid/partials/checkbox-cell-editor.component';
import { PaginationGridComponent } from './pagination-grid/pagination-grid.component';
import { SixDecimalNumericEditor } from './editable-grid/partials/sixdecimal.editor.component';
import { ToggleRenderer } from './pagination-grid/partials/toggle-renderer.component';
import { GroupDetailCellRenderer } from './pagination-grid/partials/group-detail-cell-renderer.component';
import { SelectMenuCellRenderer } from './pagination-grid/partials/select-menu-cell-renderer.component';
import { InputDateCellRenderer } from './pagination-grid/partials/input-date-cell-renderer.component';
import { InputDateTimeCellRenderer } from './pagination-grid/partials/input-date-time-cell-renderer.component';
import { LineChartRangeSelectorComponent } from './line-chart-range-selector/line-chart-range-selector.component';
import { ViewFileButtonComponent } from './cstore-grid/partials/view-file-button.component';
import { ScanDataActionsCellRenderer } from './pagination-grid/partials/scan-data-actios-cell-renderer.component';
import { VendorInvoiceActionsCellRenderer } from './pagination-grid/partials/vendor-invoice-actions-cell-renderer.component';
import { VendorInvoiceCellRenderer } from './pagination-grid/partials/vendor-invoice-cell-renderer.component';
import { EditButtonRendererComponent } from './pagination-grid/partials/edit-button-renderer.component';
import { DateTimeSelectMenuCellRenderer } from './pagination-grid/partials/date-time-selectmenu-cell-renderer.component';
import { BillOfLadingActionsCellRenderer } from './pagination-grid/partials/bill-of-lading-actions-cell-renderer.component';
import { FuelInvoiceActionsCellRenderer } from './pagination-grid/partials/fuel-invoice-action-cell-renderer.component';
import { ItemUPCDetailsCellRenderer } from './pagination-grid/partials/item-detail-cell-renderer.component';
import { SelectCheckAllComponent } from './select-check-all-component/select-check-all.component';
import { CustomGridComponent } from './custom-grid/custom-grid.component';
import { AdvPaginationGridComponent } from './pagination-grid/adv-pagination-grid/adv-pagination-grid.component';
import { AdvSelectMenuCellRenderer } from './editable-grid/partials/adv-select-menu-cell-renderer.component';
import { ButtonCellRendererComponent } from './pagination-grid/partials/button-cell-renderer.component';
import { ScanDataStoreNameCellRenderer } from './pagination-grid/partials/scan-data-store-name-cell-renderer.component';
import { ScanDataAckStatusCellRenderer } from './pagination-grid/partials/scan-data-ack-status-cell-renderer.component';
import { ScanDataNoOfAtteptsCellRenderer } from './pagination-grid/partials/scan-data-no-of-attempts-cell-renderer.component';
import { TimeFormat } from '@shared/pipes/time.pipe';
import { ATMActionRenderer } from './editable-grid/partials/atm-action-cell-renderer.component';

const sharedDialogComponents = [
  DialogComponent,
  DialogHeaderComponent,
  DialogBodyComponent,
  DialogFooterComponent,
  DialogConfirmRemoveComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // <-- import the FormsModule before binding with [(ngModel)]
    ReactiveFormsModule,
    NgSelectModule,
    NgxMatDrpModule,
    NgxBarcodeModule, Ng2Charts,
    AgGridModule.withComponents([BarCodeComponent, BankLogoButtonComponent, UploadButtonComponent, DetailButtonComponent, EditButtonComponent, ChildSaveButtonComponent, SaveButtonComponent, EditButtonRendererComponent, SelectRenderer, SaveButtonParentComponent, CellActionRenderer, AdvCellActionRenderer, AdvActionRenderer, AdvSelectMenuCellRenderer, ButtonCellRendererComponent, DialogComponent, DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent, DialogConfirmRemoveComponent, CellActionComponent, InputCellRendererComponent, ViewFileButtonComponent, CheckboxCellRenderer, CheckboxCellRendererSelesTax,
      CheckboxCellRendererStoreFees, CheckboxCellRendererMOP, CheckboxCellRendererSalesRestriction, CheckboxPrivilegeRenderer,
      DetailCellRenderer, GroupDetailCellRenderer, ScanDataActionsCellRenderer, ScanDataStoreNameCellRenderer, ScanDataAckStatusCellRenderer, ScanDataNoOfAtteptsCellRenderer, VendorInvoiceActionsCellRenderer, ItemUPCDetailsCellRenderer, FuelInvoiceActionsCellRenderer, ATMActionRenderer, BillOfLadingActionsCellRenderer, VendorInvoiceCellRenderer, SelectMenuCellRenderer, DateTimeSelectMenuCellRenderer, InputDateCellRenderer, InputDateTimeCellRenderer, CheckUncheckIconCellRendererComponent, BlendDetailCellRenderer, TankDetailCellRenderer, PriceGroupCellRenderer, ToggleRenderer,
      PriceGroupDetailsCellRenderer, DecimalEditor, DecimalWithDollarEditor,
      FuelInvoiceCellRender, NumericEditor, PositiveNumericEditor, MasterLinkedItemCellRenderer, OnlyNumericEditor, FourDigitEditor, DateTimeEditorRenderer, BankDetailCellRenderer, AccountDetailCellRenderer, ChildSelectRenderer, ChildCheckBoxRenderer, ChildRowRenderer, ChildInputRenderer, SelectRenderer, CheckboxCellEditor, SixDecimalNumericEditor, MatSlideToggleModule,
      InputNumberCellEditorComponent, InputSwitchCellEditorComponent, InputSelectCellEditorComponent, InputCellEditorComponent])
    , MatSlideToggleModule, NgbModule, MatIconModule, MatDatepickerModule, MatCheckboxModule, FormsModule, NgxMatDatetimePickerModule, NgxMatTimepickerModule, MatMomentDateModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, DirectivesModule,
  ],
  exports: [TimeFormat, BarCodeComponent, BankLogoButtonComponent, UploadButtonComponent, DetailButtonComponent, EditButtonComponent, SaveButtonComponent, ChildSaveButtonComponent, EditButtonRendererComponent, SaveButtonParentComponent, EditableGridComponent, CstoreGridComponent, PaginationGridComponent, AdvPaginationGridComponent, ExpandableGridComponent, DatepickerComponent
    , MatSlideToggleModule, MatDatepickerModule, NgxMatDatetimePickerModule, NgxMatTimepickerModule, MatMomentDateModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, InvoiceAddItemComponent, DirectivesModule
    , NumericEditor, PositiveNumericEditor, CheckboxCellEditor, FourDigitEditor, DateTimeEditorRenderer, DecimalEditor, DecimalWithDollarEditor, MasterLinkedItemCellRenderer, ToggleRenderer,
    BankDetailCellRenderer, AccountDetailCellRenderer, ChildSelectRenderer, ChildCheckBoxRenderer, ReportGridComponent, DaterangepickerComponent, DatetimerangepickerComponent, FuelTankComponent, ReportGridComponent, ChartRangeSelectorComponent, LineChartRangeSelectorComponent, ChildRowRenderer, SelectRenderer, ChildInputRenderer, SixDecimalNumericEditor, SelectCheckAllComponent,
    CustomGridComponent, ...sharedDialogComponents, InputCellRendererComponent, AdvSelectMenuCellRenderer, InputNumberCellEditorComponent, InputSwitchCellEditorComponent, InputSelectCellEditorComponent, InputCellEditorComponent, ButtonCellRendererComponent],
  declarations: [BarCodeComponent, BankLogoButtonComponent, UploadButtonComponent, DetailButtonComponent, EditButtonComponent, SaveButtonComponent, ChildSaveButtonComponent, EditButtonRendererComponent, SaveButtonParentComponent,
    EditableGridComponent, CstoreGridComponent, CellActionRenderer, AdvCellActionRenderer, AdvActionRenderer, CellActionComponent, InputCellRendererComponent, ViewFileButtonComponent, BlendDetailCellRenderer, ToggleRenderer,
    ExpandableGridComponent, CheckboxCellRenderer, CheckboxPrivilegeRenderer,
    CheckboxCellRendererSelesTax, CheckboxCellRendererStoreFees, CheckboxCellRendererMOP,
    CheckboxCellRendererSalesRestriction, DatepickerComponent, DetailCellRenderer, GroupDetailCellRenderer, ScanDataActionsCellRenderer, ScanDataStoreNameCellRenderer, ScanDataAckStatusCellRenderer, ScanDataNoOfAtteptsCellRenderer, FuelInvoiceActionsCellRenderer, ATMActionRenderer, VendorInvoiceActionsCellRenderer, ItemUPCDetailsCellRenderer, BillOfLadingActionsCellRenderer, VendorInvoiceCellRenderer, SelectMenuCellRenderer, DateTimeSelectMenuCellRenderer, InputDateCellRenderer, InputDateTimeCellRenderer, PriceGroupDetailsCellRenderer,
    TankDetailCellRenderer, PriceGroupCellRenderer, FuelInvoiceCellRender, OnlyNumericEditor,
    ConfirmationDialogComponent, CheckUncheckIconCellRendererComponent, InvoiceAddItemComponent,
    NumericEditor, PositiveNumericEditor, CheckboxCellEditor, FourDigitEditor, DateTimeEditorRenderer, DecimalEditor, DecimalWithDollarEditor, MasterLinkedItemCellRenderer, ReportGridComponent, DaterangepickerComponent, FuelTankComponent, DatetimerangepickerComponent
    , BankDetailCellRenderer, AccountDetailCellRenderer, SelectRenderer, ChildSelectRenderer, ChildCheckBoxRenderer, ChartRangeSelectorComponent, ToggleRenderer, ChildRowRenderer, ChildInputRenderer, PaginationGridComponent, SixDecimalNumericEditor, LineChartRangeSelectorComponent, SelectCheckAllComponent,
    CustomGridComponent, InputNumberCellEditorComponent, InputSwitchCellEditorComponent, InputSelectCellEditorComponent, InputCellEditorComponent,
    AdvPaginationGridComponent, AdvSelectMenuCellRenderer, ButtonCellRendererComponent,
    ...sharedDialogComponents, TimeFormat],
  providers: [ConfirmationDialogService, { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }],
  entryComponents: [ConfirmationDialogComponent]
})
export class CommonComponentModule { }
