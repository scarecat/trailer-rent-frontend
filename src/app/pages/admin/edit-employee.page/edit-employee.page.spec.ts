import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEmployeePage } from './edit-employee.page';

describe('EditEmployeePage', () => {
  let component: EditEmployeePage;
  let fixture: ComponentFixture<EditEmployeePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEmployeePage],
    }).compileComponents();

    fixture = TestBed.createComponent(EditEmployeePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
