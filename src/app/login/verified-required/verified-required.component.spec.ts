import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedRequiredComponent } from './verified-required.component';

describe('VerifiedRequiredComponent', () => {
  let component: VerifiedRequiredComponent;
  let fixture: ComponentFixture<VerifiedRequiredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifiedRequiredComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifiedRequiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
