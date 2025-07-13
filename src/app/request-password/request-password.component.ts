import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-password',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './request-password.component.html',
  styleUrl: './request-password.component.scss'
})
export class RequestPasswordComponent {

  constructor(private fb: FormBuilder) { }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  })

}
