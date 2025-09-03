import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RegistrationDataService } from '../../shared/services/registration-data.service';
import { FirestoreService } from '../../shared/services/firestore.service';
import { SearchService } from '../../shared/services/search.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  constructor(
    private fb: FormBuilder,
    private regData: RegistrationDataService,
    private firestore: FirestoreService,
    private searchService: SearchService
  ) {}

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    privacy: [false, [Validators.requiredTrue]],
  });

  addUser() {
    if (this.form.valid) {
      const formValue = this.form.value;

      // nameSearch ergänzen
      const userData = {
        ...formValue,
        nameSearch: this.searchService.normalizeName(formValue.name || ''),
        nameSearchTokens: this.searchService.createNameSearchTokens(formValue.name || ''),
      };

      this.regData.setData('form', userData);
    }
  }
}
