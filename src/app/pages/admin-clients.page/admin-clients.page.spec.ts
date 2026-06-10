import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClientsPage } from './admin-clients.page';

describe('AdminUsersPage', () => {
  let component: AdminClientsPage;
  let fixture: ComponentFixture<AdminClientsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminClientsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminClientsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
