import { Component } from '@angular/core';
import { CommonService } from '@shared/services/commmon/common.service';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-atm-action-cell',
  template: `
          <span class="cpointer" *ngIf="params && params.data && params.data.isSaveRequired">
            <i class="fa fa-floppy-o" aria-hidden="true" (click)="save()"></i>
          </span>
          <span class="cursor-pointer">
            <i class="fa fa-trash" *ngIf="params.data && params.data.showDeleteAction" (click)="delete()"></i>
          </span>
          <span *ngIf="!params.hideEditAction && (params.data && !params.data.isSaveRequired)">
            <i class="fa fa-floppy-o" aria-hidden="true" (click)="edit()"></i>
          </span>
          <span class="cursor-pointer" >
            <i class="fa fa-floppy-o" *ngIf="params.showExtraSave" aria-hidden="true" (click)="save()"></i>
          </span>
          <input hidden type="file" multiple #uploader (change)="uploadFile($event)" />
          <i *ngIf="showUpload" class="fa fa-upload fa-18 cursor-pointer" title="Upload" (click)="uploader.click()"></i>
          <i *ngIf="showDownload" class="fa fa-download fa-18 cursor-pointer" title="Download" (click)="download()"></i>
          <span class="cursor-pointer">
            <i class="fa fa-trash" *ngIf="!params.hideDeleteAction" (click)="delete()"></i>
          </span>
          `,
  styles: [
    `.btn {
          line-height: 1;
          padding: 1px 5px;
          margin-right: 2px;
        }
        .btn-primary-icon {
          color: #fff;
          background-color: #19B5FE;
          border-color: #19B5FE;
      }
      .fa{
        margin-left: 10px;
      }
      .cursor-pointer{
        cursor: pointer;
      }
        `
  ]
})
// tslint:disable-next-line:component-class-suffix fa fa-pencil
export class ATMActionRenderer implements ICellRendererAngularComp {

  public params: any;
  isShowUpdateBtn = false;
  public showDownload: boolean = false;
  public showUpload: boolean = false;

  constructor(private commonService: CommonService) {
    this.commonService.getCellChange().subscribe(gridParams => {
      if (this.params.gridtype === 'atmGrid') {
        if (gridParams.data && Number(gridParams.data.ATMTransactionID) > 0) {
          if (gridParams.data.DocuPath && gridParams.data.DocuPath !== "") {
            this.showDownload = true;
            this.showUpload = false;
          } else {
            this.showUpload = true;
            this.showDownload = false;
          }
        } else if (gridParams.data && Number(gridParams.data.BeginAmount) > 0) {
          if (gridParams.data.DocuPath && gridParams.data.DocuPath !== "") {
            this.showDownload = true;
            this.showUpload = false;
          } else {
            this.showUpload = true;
            this.showDownload = false;
          }
        } else {
          this.showUpload = false;
          this.showDownload = false;
        }
      }
    });
  }

  agInit(params: any): void {
    this.params = params;
    if (params.data && Number(params.data.ATMTransactionID) > 0) {
      params.hideDeleteAction = false;
    } else {
      params.hideDeleteAction = true;
    }
    if (params.data && Number(params.data.ATMTransactionID) > 0) {
      if (params.data.DocuPath && params.data.DocuPath !== "") {
        this.showDownload = true;
        this.showUpload = false;
      } else {
        this.showUpload = true;
        this.showDownload = false;
      }
    } else if (params.data && Number(params.data.BeginAmount) > 0) {
      this.showUpload = true;
      this.showDownload = false;
    } else {
      this.showUpload = false;
      this.showDownload = false;
    }
  }

  public edit() {
    this.params.context.componentParent.editAction(this.params);
  }

  public delete() {
    this.params.context.componentParent.delAction(this.params);
  }

  public save() {
    this.params.context.componentParent.saveAction(this.params);
  }

  public uploadFile(event) {
    event.data = this.params.data;
    this.params.context.componentParent.viewAction(event);
  }

  public download() {
    this.params.context.componentParent.downloadAction(this.params);
  }
  refresh(): boolean {
    return false;
  }

  isBoolean(val) { return typeof val === 'boolean'; }

}
