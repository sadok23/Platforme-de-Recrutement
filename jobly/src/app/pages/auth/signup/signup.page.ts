import { Component, OnInit, Injector, Inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ToastController } from '@ionic/angular';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonInput, IonItem, IonLabel, IonNote, IonRadio, IonRadioGroup, IonIcon, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Candidat } from 'src/app/services/users/candidats/candidat';
import { Recruiter } from 'src/app/services/users/recruiters/recruiter';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [IonToolbar, IonHeader, 
    IonIcon, CommonModule, NgIf, ReactiveFormsModule, HttpClientModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonItem, IonLabel, IonInput, IonNote, IonRadio,
    IonRadioGroup, IonButton
  ]
})
export class SignupPage implements OnInit {
  signupForm!: FormGroup;
  cvName: string | null = null;
  cvFile: File | null = null;
  isSubmitting = false;
  signupError: string | null = null;

  constructor(
    private fb: FormBuilder,
    @Inject(Router) private router: Router,
    private injector: Injector,
    private toastCtrl: ToastController  // <-- add this

  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      first_name: [''],
      last_name: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', Validators.required],
      company_name: ['']
    }, { validators: this.passwordMatchValidator });

    // Clear error when user types
    this.signupForm.valueChanges.subscribe(() => {
      this.signupError = null;
    });
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.cvName = null;
      this.cvFile = null;
      return;
    }
    const file = input.files[0];
    this.cvName = file.name;
    this.cvFile = file;
  }

 async onSubmit() {
  if (this.signupForm.invalid || this.isSubmitting) return;
  this.isSubmitting = true;

  const form = this.signupForm.value;

  // Helper to show toast
  const showToast = async (message: string, color: 'success' | 'danger' = 'success') => {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  };

  if (form.role === 'recruiter') {
    // Recruiter payload
    const payload: any = {
      username: form.username,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
      company_name: form.company_name
    };

    const recruiterService = this.injector.get(Recruiter);
    console.log('creating recruiter:', payload);

    recruiterService.addRecruiter(payload).subscribe({
      next: async res => {
        console.log('Recruiter created', res);
        await showToast('Recruiter account created successfully!', 'success');
        this.router.navigateByUrl('/login', { replaceUrl: true });
        this.isSubmitting = false;
      },
      error: async err => {
        console.error('Failed to create recruiter', err);
        await showToast('Failed to create recruiter: ' + (err.error?.username ? err.error.username : ''), 'danger');
        this.isSubmitting = false;
      }
    });

  } else if (form.role === 'candidate') {
    // Candidate payload
    const payload: any = {
      username: form.username,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
    };

    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    if (this.cvFile) {
      formData.append('cv', this.cvFile);
    }

    console.log('creating candidate:', formData);
    const candidatService = this.injector.get(Candidat);
    candidatService.addCandidat(formData).subscribe({
      next: async res => {
        console.log('Candidate created', res);
        await showToast('Candidate account created successfully!', 'success');
        this.router.navigateByUrl('/login', { replaceUrl: true });
        this.isSubmitting = false;
      },
      error: async err => {
        console.error('Failed to create candidate', err);
        await showToast('Failed to create candidate: ' + (err.error?.username ? err.error.username : ''), 'danger');
        this.isSubmitting = false;
      }
    });

  } else {
    console.warn('No valid role selected');
    await showToast('Please select a valid role', 'danger');
    this.isSubmitting = false;
  }
}



  onLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
