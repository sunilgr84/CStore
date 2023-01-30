import { Component } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-cell-action',
  templateUrl: './cell-action.component.html',
  styleUrls: ['./cell-action.component.scss']
})
export class CellActionComponent implements ICellRendererAngularComp {
  public params: any;
  constructor(private constantService: ConstantService) { }

  agInit(params: any): void {
    this.params = params;
  }
  public edit() {
    this.params.context.componentParent.editAction(this.params);
  }
  public delete() {
    this.params.context.componentParent.delAction(this.params);
  }
  public clone() {
    this.params.context.componentParent.cloneAction(this.params);
  }
  public note() {
    this.params.context.componentParent.noteAction(this.params);
  }
  public open() {
    this.params.context.componentParent.openAction(this.params);
  }
  public added() {
    this.params.context.componentParent.addAction(this.params);
  }
  public details() {
    this.params.context.componentParent.detailsAction(this.params);
  }
  public childDetails() {
    this.params.context.componentParent.childAction(this.params);
  }

  public approve() {
    this.params.context.componentParent.approveAction(this.params);
  }

  public reject() {
    this.params.context.componentParent.rejectAction(this.params);
  }

  public rejectEmployee() {
    this.params.context.componentParent.rejectEmployeeAction(this.params);
  }

  public download() {
    this.params.context.componentParent.downloadAction(this.params);
  }
  public save() {
    this.params.context.componentParent.saveAction(this.params);
  }
  public suspend() {
    this.params.context.componentParent.suspendAction(this.params);
  }
  public recover() {
    this.params.context.componentParent.recoverAction(this.params);
  }

  public itemHistory() {
    this.params.context.componentParent.itemHistoryAction(this.params);
  }

  public salesActivity() {
    this.params.context.componentParent.salesActivityAction(this.params);
  }

  refresh(refreshParams: any): boolean {
    if (this.params.gridType && this.params.gridType === this.constantService.gridTypes.masterManufacturerGrid) {
      this.params.showDownload = false;
      this.params.hideDeleteAction = false;
      this.params.hideEditAction = false;
      return true;
    } else if (this.params.gridType && this.params.gridType === this.constantService.gridTypes.masterBrandGrid) {
      this.params.hideEditAction = true;
      this.params.isSaveRequired = false;
      this.params.hideDeleteAction = false;
      this.params.showEditActionForGrouping = true;
      return true;
    } else if (this.params.gridType && this.params.gridType === this.constantService.gridTypes.masterDepartmentTypeGrid) {
      this.params.hideDeleteAction = false;
      this.params.hideEditAction = false;
      return true;
    } else if (this.params.gridType && this.params.gridType === this.constantService.gridTypes.masterDepartmentGrid) {
      this.params.hideDeleteAction = false;
      this.params.hideEditAction = false;
      return true;
    } else if (this.params.gridType && this.params.gridType === this.constantService.gridTypes.priceGroupGrid) {
      this.params.hideDeleteAction = false;
      this.params.hideEditAction = false;
      this.params.showDetails = true;
      return true;
    } else
      return false;
  }
  isBoolean(val) { return typeof val === 'boolean'; }
}
