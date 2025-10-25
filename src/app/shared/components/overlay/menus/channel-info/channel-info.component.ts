import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, switchMap, tap } from 'rxjs';
import { ChannelMembersComponent } from '../channel-members/channel-members.component';
import { OverlayService } from '../../../../services/overlay.service';
import { TextareaResizeService } from '../../../../services/textarea-resize.service';
import { FirestoreService } from '../../../../services/firestore.service';
import { ChatService } from '../../../../services/chat.service';
import { ScreenService } from '../../../../services/screen.service';
import { Channel } from '../../../../models/database.model';
import { OverlayType } from '../../../../models/chat.enums';

@Component({
  selector: 'app-channel-info',
  standalone: true,
  imports: [CommonModule, ChannelMembersComponent],
  templateUrl: './channel-info.component.html',
  styleUrl: './channel-info.component.scss',
})
export class ChannelInfoComponent {
  @ViewChild('inputName') inputName!: ElementRef;
  @ViewChild('inputDescription') inputDescription!: ElementRef;

  channelId: string = '';
  channel: Channel | null = null;
  channelCreator: string = '';

  isNameEditorActive: boolean = false;
  isDescriptionEditorActive: boolean = false;

  isFormInvalid: boolean = true;
  isChannelNameAssigned: boolean = false;
  isErrorMessageVisible: boolean = false;

  overlayType: OverlayType = OverlayType.Normal;
  OverlayType = OverlayType;

  private destroy$ = new Subject<void>();

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService,
    private screenService: ScreenService,
    public textareaResizeService: TextareaResizeService
  ) {}

  ngOnInit() {
    this.chatService.selectedChatId$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((chatId) => {
          this.channelId = chatId;
          return this.firestore.getChannel(chatId);
        }),
        tap((channel) => (this.channel = channel)),
        switchMap((channel) =>
          this.firestore.getUser(channel.creatorId).pipe(
            tap((user) => (this.channelCreator = user.name)),
            // Kombiniere mit ScreenService
            switchMap(() => this.screenService.isMobile$)
          )
        ),
        tap((isMobile) => {
          this.overlayType = isMobile ? OverlayType.FullSize : OverlayType.Normal;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeOverlay() {
    this.overlayService.close();
  }

  toggleEditor(editor: string) {
    switch (editor) {
      case 'name':
        this.isNameEditorActive = !this.isNameEditorActive;
        break;
      case 'description':
        this.isDescriptionEditorActive = !this.isDescriptionEditorActive;
        break;
    }
  }

  saveEdit(editor: string) {
    switch (editor) {
      case 'name':
        this.setNewChannelName();
        break;
      case 'description':
        this.setNewChannelDescription();
        break;
    }
  }

  async setNewChannelName() {
    const newName = this.inputName.nativeElement.value;
    try {
      const result = await this.firestore.updateChannelName(
        this.channelId,
        newName
      );

      if (result.exists) {
        this.isChannelNameAssigned = true;
        this.isFormInvalid = true;
      } else {
        this.isChannelNameAssigned = false;
        this.isNameEditorActive = false;
      }
    } catch (error) {
      this.isErrorMessageVisible = true;
    }
  }

  setNewChannelDescription() {
    const newDescription = this.inputDescription.nativeElement.value;
    this.toggleEditor('description');
    this.firestore
      .updateChannelDescription(this.channelId, newDescription)
      .catch((error) => console.error(error));
  }

  leaveChannel() {
    if (!this.channel?.id) {
      return;
    }

    this.firestore
      .removeMemberFromChannel(this.channel.id, this.firestore.loggedInUserId)
      .then(() => this.overlayService.close())
      .catch((err) => console.error('Fehler beim Entfernen des Users:', err));
  }
}
