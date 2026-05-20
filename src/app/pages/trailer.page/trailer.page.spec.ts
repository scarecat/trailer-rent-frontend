import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailerPage } from './trailer.page';

describe('TrailerPage', () => {
  let component: TrailerPage;
  let fixture: ComponentFixture<TrailerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrailerPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TrailerPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
