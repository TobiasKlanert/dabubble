import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChannelMenuComponent } from './add-channel-menu.component';

describe('AddChannelMenuComponent', () => {
  let component: AddChannelMenuComponent;
  let fixture: ComponentFixture<AddChannelMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChannelMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddChannelMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
