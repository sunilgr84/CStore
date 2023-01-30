import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { SiteMessage } from '../../models/site-message.model';
@Component({
  selector: 'app-site-message',
  templateUrl: './site-message.component.html',
  styleUrls: ['./site-message.component.scss'],
  animations: [routerTransition()]

})
export class SiteMessageComponent implements OnInit {
  rowData: any[];
  gridOptions: GridOptions;
  isAddUpdate = false;
  isEdit = false;
  siteMessage: any;
  constructor(private gridService: GridService, private constants: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.siteMessageGrid);
  }

  ngOnInit() {
  }
  addNew(isAdd) {
    this.siteMessage = new SiteMessage();
    this.isEdit = false;
    this.isAddUpdate = isAdd;
  }
  backToList() {
    this.isAddUpdate = false;
  }
  editAction(params) {
    this.siteMessage = params.data;
    this.isEdit = true;
    this.isAddUpdate = true;
  }
  delAction(params) {
    alert('coming soon..');
  }
}
