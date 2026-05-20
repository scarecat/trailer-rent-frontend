import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminToolbar } from './admin-toolbar';

describe('AdminToolbar', () => {
  let component: AdminToolbar;
  let fixture: ComponentFixture<AdminToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminToolbar],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
