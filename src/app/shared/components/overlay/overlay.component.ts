import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../services/overlay.service';
import { AddChannelMenuComponent } from './menus/add-channel-menu/add-channel-menu.component';
import { ProfileMenuComponent } from './menus/profile-menu/profile-menu.component';
import { ProfileComponent } from './menus/profile/profile.component';
import { AddUserMenuComponent } from './menus/add-user-menu/add-user-menu.component';
import { ChannelMembersComponent } from './menus/channel-members/channel-members.component';
import { ChannelInfoComponent } from './menus/channel-info/channel-info.component';
import { AvatarEditorComponent } from './menus/avatar-editor/avatar-editor.component';


@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    CommonModule,
    AddChannelMenuComponent,
    ProfileMenuComponent,
    ProfileComponent,
    AddUserMenuComponent,
    ChannelMembersComponent,
    ChannelInfoComponent,
    AvatarEditorComponent
  ],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss',
})
export class OverlayComponent {
  overlayOpen: boolean = true;

  constructor(public overlayService: OverlayService) {
    this.overlayService.overlayOpen$.subscribe((open) => {
      this.overlayOpen = open;
    });
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
