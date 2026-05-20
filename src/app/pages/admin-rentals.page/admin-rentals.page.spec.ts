import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRentalsPage } from './admin-rentals.page';

describe('AdminRentalsPage', () => {
  let component: AdminRentalsPage;
  let fixture: ComponentFixture<AdminRentalsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRentalsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRentalsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
