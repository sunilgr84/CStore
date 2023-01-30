import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { get as _get } from 'lodash';

@Component({
  selector: 'app-action',
  template: ` <div>
    <button
      *ngIf="checkVisibility('hideEdit')"
      data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Edit" 
      class="v-btn-icon v-small v-btn-edit v-primary"
      (click)="handleClick('edit')"
    >
      <img src="assets/images/icons/edit_new.png" style="width: 15px; height : 14px;" />
    </button>
    <button
    *ngIf="checkVisibility('hideItemHistory')"
    data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Item History" 
    class="v-btn-icon v-btn-small"
    (click)="handleClick('itemHistory')">
    <i class="fa fa-history"></i>
  </button>
  <button
    *ngIf="checkVisibility('hideSalesActivity')"
    data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Sales Activity" 
    class="v-btn-icon v-btn-small"
    (click)="handleClick('salesActivity')">
    <i class="fa fa-align-justify"></i>
  </button>
    <button
      *ngIf="checkVisibility('hideDownload')"
      data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Download" 
      class="v-btn-icon v-small v-primary"
      (click)="handleClick('download')"
    >
      <i class="flaticon-download"></i>
    </button>
    <button
    *ngIf="checkVisibility('hideSuspend')"
    data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Suspend" 
    class="v-btn-icon v-small v-btn-disabled"
    (click)="handleClick('suspend')"
  >
    <img src="assets/images/icons/suspend_new.png" style="width: 18px; height : 18px;" />
  </button>
    <button
      *ngIf="checkVisibility('hideDelete')"
      data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Delete" 
      class="v-btn-icon v-small v-btn-delete v-danger"
      (click)="handleClick('delete')"
    >
      <img src="assets/images/icons/delete_new.png" style="width: 15px; height : 18px;" />
    </button>
    <button
      *ngIf="checkVisibility('hideRecover')"
      data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Recover" 
      class="v-btn-icon v-btn-small"
      (click)="handleClick('recover')"
    >
      <i class="flaticon-reload"></i>
    </button>
    <button
      *ngIf="checkVisibility('hideSave')"
      data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Save" 
      class="v-btn-icon v-small v-btn-save v-primary"
      (click)="handleClick('save')"
    >
      <img src="assets/images/icons/save_new.png" style="width: 15px; height : 14px;" />
    </button>
    <button
    *ngIf="checkVisibility('hideCancel')"
    data-toggle="tooltip" container="body" data-placement="bottom" ngbTooltip="Cancel" 
    class="v-btn-icon v-small v-btn-cancel v-primary"
    (click)="handleClick('cancel')"
  >
    <img src="assets/images/icons/cancel_new.png" style="width: 18px; height : 18px;" />
  </button>
  </div>`,
})
// tslint:disable-next-line:component-class-suffix
export class AdvActionRenderer implements ICellRendererAngularComp {
  public params: any;
  isEditModeOn: boolean = false;
  constructor() { }

  agInit(params: any): void {
    this.params = params;
    if (this.params.data && this.params.data.isNewRecord) this.isEditModeOn = true;
  }

  handleClick(action: 'edit' | 'delete' | 'suspend' | 'recover' | 'download' | 'itemHistory' | 'salesActivity' | 'save' | 'cancel') {
    switch (action) {
      case 'edit':
        this.isEditModeOn = true;
        this.params.context.componentParent.editAction(this.params);
        break;
      case 'delete':
        this.isEditModeOn = false;
        this.params.context.componentParent.deleteAction(this.params);
        break;
      case 'suspend':
        this.isEditModeOn = false;
        this.params.context.componentParent.suspendAction(this.params);
        break;
      case 'recover':
        this.isEditModeOn = false;
        this.params.context.componentParent.recoverAction(this.params);
        break;
      case 'download':
        this.isEditModeOn = false;
        this.params.context.componentParent.downloadAction(this.params);
        break;
      case 'itemHistory':
        this.isEditModeOn = false;
        this.params.context.componentParent.itemHistoryAction(this.params);
        break;
      case 'salesActivity':
        this.isEditModeOn = false;
        this.params.context.componentParent.salesActivityAction(this.params);
        break;
      case 'save':
        this.isEditModeOn = false;
        this.params.context.componentParent.saveAction(this.params);
        break;
      case 'cancel':
        this.isEditModeOn = false;
        this.params.context.componentParent.cancelAction(this.params);
        break;
      default:
        console.log('Provided action not defined/supported');
    }
  }

  checkVisibility(key): boolean {
    let hiddenByParam: boolean = _get(this.params, [key], false);
    let hiddenByAction: boolean = false;

    if (this.params.data && this.params.data.rowEditingStarted) {
      if (key === 'hideSave' || key === 'hideCancel') {
        return true;
      } else return false;
    } else {

      if (this.params.data && this.params.data.isNewRecord) {
        this.isEditModeOn = true;
      }

      switch (key) {
        case 'hideEdit':
          if (key == 'hideEdit' && this.params.noSave) {
            hiddenByAction = !this.isEditModeOn;
          } else hiddenByAction = this.isEditModeOn;
          break;
        case 'hideDelete':
          if (key == 'hideDelete' && this.params.noSave) {
            hiddenByAction = !this.isEditModeOn;
          } else hiddenByAction = this.isEditModeOn;
          break;
        case 'hideSave':
          if (key == 'hideSave' && this.params.noSave) {
            hiddenByAction = this.isEditModeOn;
          } else hiddenByAction = !this.isEditModeOn;
          break;
        case 'hideCancel':
          if (key == 'hideCancel' && this.params.noSave) {
            hiddenByAction = this.isEditModeOn;
          } else hiddenByAction = !this.isEditModeOn;
          break;
        case 'hidePrint':
          hiddenByAction = this.isEditModeOn;
          break;
        case 'hideDownload':
          hiddenByAction = this.isEditModeOn;
          break;
        case 'hideItemHistory':
          if (key == 'hideItemHistory' && this.params.noSave) {
            hiddenByAction = !this.isEditModeOn;
          } else hiddenByAction = this.isEditModeOn;
          break;
        case 'hideSalesActivity':
          if (key == 'hideSalesActivity' && this.params.noSave) {
            hiddenByAction = !this.isEditModeOn;
          } else hiddenByAction = this.isEditModeOn;
          break;
      }

      if (this.isEditModeOn) {
        return !hiddenByAction;
      } else {
        return !hiddenByParam;
      }
    }
  }

  refresh(params): boolean {
    if (params.data.hasOwnProperty('rowEditingStarted')) {
      this.isEditModeOn = params.data.rowEditingStarted;
      this.params.noSave = false;
      return true;
    } else {
      return false;
    }
  }
}
