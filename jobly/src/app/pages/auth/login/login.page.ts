import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonButton,
} from '@ionic/angular/standalone';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
    IonButton,
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  loginError: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
      console.log('LoginPage constructor called');

  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSignup() {
    this.router.navigate(['/signup']);
  }

  onSubmit() {
  if (this.loginForm.invalid) return;

  const { username, password } = this.loginForm.value;
  console.log('Attempting login with', username, password);

  this.authService
    .login(username, password)
    .pipe(
      catchError((err) => {
        console.error('Login error:', err);
        this.loginError = 'Invalid username or password';
        return of(null);
      })
    )
    .subscribe((res) => {
      if (res) {
        this.authService.getCurrentUser().subscribe(
          (user) => {
            if (user.role === 'candidate') {
              this.router.navigate(['/candidate-home']);
            } else if (user.role === 'recruiter') {
              this.router.navigate(['/recruiter-home']);
            } else {
              this.router.navigate(['/home']); 
            }
          },
          (err) => {
            console.error('Error fetching user data:', err);
            this.loginError = 'Unable to fetch user info';
          }
        );
      }
    });
}

}
