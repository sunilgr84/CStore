import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular/main";
//import { ICellRendererAngularComp } from 'ag-grid-angular';
//import { CellActionComponent } from 'src/app/shared/component/cstore-grid/partials/cell-action/cell-action.component';
@Component({
    selector: 'edit-button',
    template: `
    <i class="fa fa-save" (click)="save()"></i>&nbsp;`
   
})
 /* <i class="fa fa-pencil" aria-hidden="true" *ngIf="isEdit" (click)="edit()"></i>&nbsp; */
export class EditButtonComponent implements ICellRendererAngularComp {
    isEdit: boolean;
  
    refresh(params: any): boolean {
        throw new Error("Method not implemented.");
    }
    afterGuiAttached?(params?: import("ag-grid-community").IAfterGuiAttachedParams): void {
        throw new Error("Method not implemented.");
    }
    public params: any;

    agInit(params: any): void {
        this.params = params;      
        this.isEdit=this.params.context.componentParent.isEdit;
    }
/* public invokeDeleteMethod() {
       var selectedData = this.params.api.getSelectedRows();
       this.params.api.updateRowsData({remove: selectedData});
} */

  public save() {
   // this.isEdit=this.params.context.componentParent.isEdit;
   // this.params.context.gapi.stopEditing();
        this.params.context.componentParent.onBtStopEditing(this.params);
  }
    public edit() {
    //  this.params.api.getColumn('bankNickName').getColDef().editable = true;
         this.params.api.setFocusedCell(this.params.node.rowIndex, 'bankNickName');
         this.params.api.startEditingCell({
         rowIndex: this.params.node.rowIndex,
        colKey: 'bankNickName',
        }
     );
    // this.isEdit=false;
    }

}