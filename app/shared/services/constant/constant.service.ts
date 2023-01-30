import { Injectable } from '@angular/core';
import { gridOptions } from '../../config/grid.config';
import { editGridOptions } from '../../config/editable-grid.config';
import { defaultDropDownSettings } from '../../config/dropdown.config';
import { messages } from '../../config/validations-messages';
import { reportTypes } from '@shared/config/report.config';

@Injectable()
export class ConstantService {
  gridTypes: any;
  defaultSetting: any;
  editableGridConfig: any;
  defaultDropDownSettings: any;
  infoMessages: any;
  reportTypes: any;
  // whole application check rolename set const superadmin
  roleName = 'superadmin';
  constructor() {
    this.gridTypes = gridOptions.gridTypes;
    this.defaultSetting = gridOptions.defaultSetting;
    this.editableGridConfig = editGridOptions;
    this.defaultDropDownSettings = defaultDropDownSettings;
    this.infoMessages = messages.infoMessage;
    this.reportTypes = reportTypes;
  }

  getUserInfo() {
    return JSON.parse(sessionStorage.getItem('userInfo'));
  }

  // TODO:Set StoreLocationId in session at header component
  getStoreLocationId() {
    return JSON.parse(sessionStorage.getItem('selectedStoreLocationId'));
  }
}
