import { Component, ViewChild, ElementRef } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular/main";
import { ToastrService } from "ngx-toastr";
import { DomSanitizer } from '@angular/platform-browser';
//import { ICellRendererAngularComp } from 'ag-grid-angular';
//import { CellActionComponent } from 'src/app/shared/component/cstore-grid/partials/cell-action/cell-action.component';
@Component({
    selector: 'edit-button',
    template: `<div style="height:10px;"> 
    <span class="col-md-4 image-card" *ngIf="imgURL">
    <img [src]="imgURL" class="image" id="image1" *ngIf="imgURL"></span>
    </div>`,

    /* <span class="col-md-4" *ngIf="!imgURL">
        <label class="btn1 btn-xs"  style="width:20px !important;">
        <i class="fa fa-upload"></i><input type="file"  accept="image/*" class="custom-file-input" id="fileUpload" name="fileUpload" (change)="upload($event)" #file>
        </label>
        </span> <span class="col-md-4 image-card" *ngIf="imgURL">
        <img [src]="imgURL" class="image" id="image1" *ngIf="imgURL">
        <i class="fa fa-close delete" (click)="deleteImage()"></i></span> */
    styles: [`.image {left:-4px;
   width:26px;
   height:28px; position: relative;
 }
 .image-card:hover img{
    opacity:0.5;
}
.image-card:hover i {
    display: block;
}
.image-card i {
    position:absolute;
    display:none;
}

.image-card i.delete {
    top: -6px;
    left: 70%;
}`]

})

export class UploadButtonComponent implements ICellRendererAngularComp {
    isEdit: boolean;
    imgURL: any | '';
    @ViewChild('image1') image1: ElementRef;
    ngAfterViewInit() {

    }
    constructor(private toastr: ToastrService, private domSanitizer: DomSanitizer, private el: ElementRef) {

    }
    refresh(params: any): boolean {
        throw new Error("Method not implemented.");
    }
    afterGuiAttached?(params?: import("ag-grid-community").IAfterGuiAttachedParams): void {
        throw new Error("Method not implemented.");
    }
    public params: any;

    agInit(params: any): void {
        this.params = params;
        if (this.params.data.signature) {
            this.imgURL = this.params.data.signature;
        }
    }
   /*  public deleteImage() {
        this.imgURL = '';
    }
    public upload(evt) {

        var files = evt.target.files;
        var file = files[0];

        if (files && file) {
            var reader = new FileReader();
            if (file.type.indexOf("image") == -1) {
                this.toastr.error('Upload only images', 'Error');
                return;
            }
            else {
                reader.onload = this._handleReaderLoaded.bind(this);
                reader.readAsDataURL(file);
            }

            //  reader.readAsBinaryString(file);
        }
    }
    public _handleReaderLoaded(readerEvt) {
        var binaryString = readerEvt.target.result;
        //  this.base64textString= btoa(binaryString);
        // console.log(btoa(binaryString));

        this.imgURL = binaryString;

    }
    public upload1(e) {
        this.params.context.componentParent.uploadFile(e);
    } */
}