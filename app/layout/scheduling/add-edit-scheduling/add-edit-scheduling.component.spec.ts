import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditSchedulingComponent } from './add-edit-scheduling.component';


describe('AddEditSchedulingComponent', () => {
  let component: AddEditSchedulingComponent;
  let fixture: ComponentFixture<AddEditSchedulingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditSchedulingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
