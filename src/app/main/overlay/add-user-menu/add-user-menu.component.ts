import { Component } from '@angular/core';
import { OverlayService } from '../../../shared/services/overlay.service';

@Component({
  selector: 'app-add-user-menu',
  standalone: true,
  imports: [],
  templateUrl: './add-user-menu.component.html',
  styleUrl: './add-user-menu.component.scss'
})
export class AddUserMenuComponent {
  isInputEmpty: boolean = true;

  constructor(private overlayService: OverlayService) {}

  toggleButton(value: string) {
        this.isInputEmpty = value.trim().length === 0;
    }

  addUser(value: string) {
    //Placeholder
    console.log("Added User: ", value);
    this.closeOverlay();
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
