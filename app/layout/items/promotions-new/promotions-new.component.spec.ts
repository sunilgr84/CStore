import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionsNewComponent } from './promotions-new.component';

describe('PromotionsNewComponent', () => {
  let component: PromotionsNewComponent;
  let fixture: ComponentFixture<PromotionsNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromotionsNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
