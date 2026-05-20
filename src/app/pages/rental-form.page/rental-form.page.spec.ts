import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentFormPage } from './rental-form.page';

describe('RentFormPage', () => {
  let component: RentFormPage;
  let fixture: ComponentFixture<RentFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentFormPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RentFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
