import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleMessageComponent } from './single-message.component';

describe('MessageBubbleComponent', () => {
  let component: SingleMessageComponent;
  let fixture: ComponentFixture<SingleMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SingleMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
