import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sold-inventory',
  templateUrl: './sold-inventory.component.html',
  styleUrls: ['./sold-inventory.component.scss']
})
export class SoldInventoryComponent implements OnInit {
  @Input() editRowData?: any;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }
  editAndSaveClose() {
    alert('save');
    this.activeModal.dismiss('Save Click');
  }
}
