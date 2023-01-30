import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-dialog-confirm-remove',
  templateUrl: './dialog-confirm-remove.component.html',
})
export class DialogConfirmRemoveComponent implements OnInit {
  @Input() isDialogOpen: boolean;
  @Input() dialogTitle: string;
  @Input() dialogSubTitle: string;

  @Input() customHeaderTemplate: TemplateRef<any>;

  @Input() maxWidth: 'xs'|'sm'|'md'|'lg'|'xl' = 'xs';
  @Input() fullWidth: boolean = true;

  @Output() onClose: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {

  }

  handleActionClick(e, action: 'cancel'|'confirm') {
  //  e.preventDefault();
    this.onClose.emit(action);
  }
}
