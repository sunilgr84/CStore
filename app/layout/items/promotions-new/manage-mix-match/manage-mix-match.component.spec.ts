import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMixMatchComponent } from './manage-mix-match.component';

describe('ManageMixMatchComponent', () => {
  let component: ManageMixMatchComponent;
  let fixture: ComponentFixture<ManageMixMatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageMixMatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMixMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
