import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRentalsPage } from './my-rentals.page';

describe('MyRentalsPage', () => {
  let component: MyRentalsPage;
  let fixture: ComponentFixture<MyRentalsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRentalsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRentalsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
