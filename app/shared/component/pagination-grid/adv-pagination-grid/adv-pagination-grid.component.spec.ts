import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvPaginationGridComponent } from './adv-pagination-grid.component';

describe('AdvPaginationGridComponent', () => {
  let component: AdvPaginationGridComponent;
  let fixture: ComponentFixture<AdvPaginationGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvPaginationGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvPaginationGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
