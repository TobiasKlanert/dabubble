import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../../shared/services/firestore.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  showIntro: boolean = true;

  constructor(
    private fb: FormBuilder, 
    private firestoreService: FirestoreService,
    private router: Router,
  ) { }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  ngOnInit(): void {
    setTimeout(() => {
      this.showIntro = false;
    }, 4000);
  }

  login() {
    this.firestoreService.login()
      .then(user => {
        this.router.navigate(['/main']);
      })
      .catch(error => console.error('Login fehlgeschlagen:', error));
  }
}
