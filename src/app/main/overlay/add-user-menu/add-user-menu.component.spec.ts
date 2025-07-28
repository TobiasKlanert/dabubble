import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserMenuComponent } from './add-user-menu.component';

describe('AddUserMenuComponent', () => {
  let component: AddUserMenuComponent;
  let fixture: ComponentFixture<AddUserMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
