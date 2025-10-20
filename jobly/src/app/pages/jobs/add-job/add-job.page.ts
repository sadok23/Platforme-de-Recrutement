import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { JobsService } from 'src/app/services/jobs/jobs.service';
import { AuthService } from 'src/app/services/auth/auth-service';
import * as maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-add-job',
  standalone: true,
  templateUrl: './add-job.page.html',
  styleUrls: ['./add-job.page.scss'],
  imports: [IonBackButton, IonButtons, CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput, IonButton]
})
export class AddJobPage implements AfterViewInit {
  form: FormGroup;
  map!: maplibregl.Map;
  marker!: maplibregl.Marker;

  constructor(
    private fb: FormBuilder,
    private jobs: JobsService,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      salary: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    this.map = new maplibregl.Map({
      container: 'map',
      style: `https://api.maptiler.com/maps/streets/style.json?key=tWA5TOZeh8I9IDAPISTi`,
      center: [10.1815, 36.8065], // Tunis
      zoom: 12
    });

    this.map.on('click', (e: any) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      if (this.marker) this.marker.setLngLat([lng, lat]);
      else this.marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(this.map);

      this.form.patchValue({
        latitude: lat,
        longitude: lng,
        location: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
      });
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.auth.getCurrentUser().subscribe(user => {
      const payload = { recruiter: user.id, ...this.form.value };
      this.jobs.createJob(payload).subscribe(() => {
        this.router.navigateByUrl('/recruiter-home');
      });
    });
  }

  back() {
    this.router.navigateByUrl('/recruiter-home');
  }
}