import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAttributes } from './admin-attributes';

describe('AdminAttributes', () => {
  let component: AdminAttributes;
  let fixture: ComponentFixture<AdminAttributes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAttributes],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAttributes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
