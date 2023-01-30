import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterPriceBookWizardComponent } from './master-price-book-wizard.component';

describe('MasterPriceBookWizardComponent', () => {
  let component: MasterPriceBookWizardComponent;
  let fixture: ComponentFixture<MasterPriceBookWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterPriceBookWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterPriceBookWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
