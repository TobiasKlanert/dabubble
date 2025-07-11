import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestPasswordComponent } from './request-password.component';

describe('ResetPasswordComponent', () => {
  let component: RequestPasswordComponent;
  let fixture: ComponentFixture<RequestPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestPasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
