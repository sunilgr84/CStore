import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormMode } from '../../models/form-mode.enum';
import { Department } from '@models/department.model';
import { CommonService } from '@shared/services/commmon/common.service';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-department-details-container',
  templateUrl: './department-details-container.component.html',
  styleUrls: ['./department-details-container.component.scss']
})
export class DepartmentDetailsContainerComponent implements OnInit {
  @ViewChild('tabs') public tabs: NgbTabset;
  @Input() formMode: FormMode;
  @Input() selectedDepartment: Department;

  @Output() showAllDepartment = new EventEmitter<boolean>();

  gridRowNode: any;
  currentRowIndex: number;
  isActive: boolean;
  constructor(private commonService: CommonService) { }

  ngOnInit() {
    console.log(this.selectedDepartment);
    // setTimeout(() => {
    const currentRow = this.getSelectedNode();
    this.currentRowIndex = currentRow.length > 0 ? currentRow[0].rowIndex + 1 : this.selectedDepartment ?
      this.selectedDepartment['rowIndex'] : 0;
    this.totalGridRecord();
    // }, 2000);
  }

  displayFormTitle() {
    if (this.formMode === FormMode.ADD) {
      return 'Add New Department';
    } else if (this.formMode === FormMode.EDIT) {
      return `Editing Department - ${this.selectedDepartment.departmentDescription}`;
    }
  }

  previous(isActive) {
    this.isActive = isActive;
    this.currentRowIndex = this.currentRowIndex <= 0 ? 0 : this.currentRowIndex - 1;
    this.selectedDepartment = this.gridRowNode[this.currentRowIndex].data;
    this.currentRowIndex = this.currentRowIndex <= 0 ? 0 : this.currentRowIndex--;
  }
  next(isActive) {
    this.isActive = isActive;
    if (this.gridRowNode.length === this.currentRowIndex + 1) {
      return;
    }
    this.selectedDepartment = this.gridRowNode[this.currentRowIndex + 1].data;
    this.currentRowIndex++;
  }
  getSelectedNode() {
    return this.commonService.departmentGridOptions.api.getSelectedNodes();
  }
  // getSelectedNodeById(id) {
  //   return this.commonService.departmentGridOptions.api.;
  // }
  totalGridRecord() {
    this.gridRowNode = this.commonService.departmentGridOptions.api['rowModel'].rowsToDisplay;
  }
  isAddMode() {
    return this.formMode === FormMode.ADD;
  }
  enableTabs(params) {
    console.log(params);
    this.selectedDepartment = params.addedDepartmentDetail;
    this.formMode = FormMode.EDIT;
    this.isAddMode();
  }
  tabChange(event) {

  }
  selectTab(params) {
    this.tabs.select(params.tabId);
  }
}
