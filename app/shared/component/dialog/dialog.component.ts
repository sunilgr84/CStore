import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-dialog',
  template: `
    <ng-container>
      <div class="dialog-backdrop-root" (click)="handleBackdropClick($event)"></div>
      <div class="dialog-wrapper">
        <div class="aside-label-wrapper aside-label-wrapper-default" (click)="handlePanelClick($event)">
          <a class="aside-label">{{dialogLabel}}</a>
        </div>
        <div *ngFor="let panel of sidePanels; index as i" class="aside-label-wrapper aside-label-wrapper-{{i}}" (click)="handlePanelClick($event,panel)">
          <a class="aside-label">{{panel.panelName}}</a>
        </div>
        <div [class]="containerClasses" [style]="containerStyles">
          <ng-content></ng-content>
        </div>
      </div>
    </ng-container>
  `,
})
export class DialogComponent implements OnInit {
  containerClasses: string = 'dialog-container';
  @Input() isOpen: boolean;
  @Input() fullscreen: boolean = false;
  @Input() containerStyles: string = '';
  @Input() fullWidth: boolean = true;
  @Input() maxWidth: 'lg' | 'md' | 'sm' | 'xl' | 'xs' = 'sm';
  @Input() dialogLabel: string;

  @Input() sidePanels: any = [];

  @Output() onBackdropClick: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onPanelSelection: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if (this.fullscreen) {
      this.containerClasses += ' dialog-container-fullscreen';
    }
    if (this.maxWidth) {
      this.containerClasses += ` dialog-container-${this.maxWidth}`;
    }
    if (this.fullWidth) {
      this.containerClasses += ' dialog-container-fullwidth';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isOpen && changes.isOpen.currentValue) {
      document.body.classList.add('dialog-open');
    }
    if (changes.isOpen && !changes.isOpen.currentValue) {
      document.body.classList.remove('dialog-open');
    }
  }

  handleBackdropClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.onClose.emit();
  }

  handlePanelClick(e, panel?) {
    this.onPanelSelection.emit(panel);
  }

}

@Component({
  selector: 'app-dialog-header',
  template: `
    <ng-container
      *ngTemplateOutlet="
        headerTemplate ? headerTemplate : defaultHeaderTemplate
      "
    ></ng-container>
    <ng-template #defaultHeaderTemplate>
      <header class="dialog-header-container">
        <div class="col">
          <div class="dialog-title-wrapper">
            <span *ngIf="dialogTitle" class="dialog-title">
              {{ dialogTitle }}
            </span>
            <span *ngIf="dialogSubTitle" class="dialog-subtitle">
              {{ dialogSubTitle }}
            </span>
          </div>
        </div>
        <div class="col-auto">
          <button
            class="v-btn-icon v-small"
            (click)="handleActionClick($event, 'cancel')"
          >
            <i class="flaticon-cancel"></i>
          </button>
        </div>
      </header>
    </ng-template>
  `,
})
export class DialogHeaderComponent implements OnInit {
  @Input() dialogTitle: string;
  @Input() dialogSubTitle: string;
  @Input() headerTemplate: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter();

  constructor() { }
  ngOnInit() { }

  handleActionClick(e, action) {
    e.preventDefault();
    e.stopPropagation();
    this.onClose.emit({ event: e, action: action });
  }
}

@Component({
  selector: 'app-dialog-body',
  template: `
    <ng-container>
      <ng-content></ng-content>
    </ng-container>
  `,
})
export class DialogBodyComponent implements OnInit {
  constructor() { }
  ngOnInit() { }
}

@Component({
  selector: 'app-dialog-footer',
  template: `
    <ng-container
      *ngTemplateOutlet="
        footerTemplate ? footerTemplate : defaultFooterTemplate
      "
    ></ng-container>
    <ng-template #defaultFooterTemplate>
      <footer class="dialog-footer-container">
        <ng-content></ng-content>
      </footer>
    </ng-template>
  `,
})
export class DialogFooterComponent implements OnInit {
  @Input() footerTemplate: TemplateRef<any>;

  constructor() { }
  ngOnInit() { }
}
