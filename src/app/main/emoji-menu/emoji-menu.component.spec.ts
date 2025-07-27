import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiMenuComponent } from './emoji-menu.component';

describe('EmojiMenuComponent', () => {
  let component: EmojiMenuComponent;
  let fixture: ComponentFixture<EmojiMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmojiMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
