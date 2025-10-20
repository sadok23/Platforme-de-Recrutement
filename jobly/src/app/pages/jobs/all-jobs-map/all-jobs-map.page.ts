  import { Component, AfterViewInit } from '@angular/core';
  import { Router } from '@angular/router';
  import * as maplibregl from 'maplibre-gl';
  import { JobsService, JobDto } from 'src/app/services/jobs/jobs.service';
  import { IonContent, IonBackButton, IonTitle, IonButtons, IonToolbar, IonHeader } from "@ionic/angular/standalone";

  @Component({
    selector: 'app-all-jobs-map',
    templateUrl: './all-jobs-map.page.html',
    styleUrls: ['./all-jobs-map.page.scss'],
    imports: [IonContent, IonBackButton, IonTitle, IonButtons, IonToolbar, IonHeader]
  })
  export class AllJobsMapPage implements AfterViewInit {
    map!: maplibregl.Map;

    constructor(private jobsService: JobsService, private router: Router) {}

    ngAfterViewInit() {
      this.initMap();
        setTimeout(() => {
    this.map.resize();
  }, 100);
    }

    private initMap() {
      this.map = new maplibregl.Map({
        container: 'jobs-map',
        style: 'https://api.maptiler.com/maps/streets/style.json?key=tWA5TOZeh8I9IDAPISTi',
        center: [10.1815, 36.8065], // center on Tunis
        zoom: 12
      });

      this.map.on('load', () => {
        this.jobsService.listJobs().subscribe(jobs => this.addJobsMarkers(jobs));
      });
    }

private addJobsMarkers(jobs: any[]) {
  jobs.forEach(job => {
    if (job.latitude != null && job.longitude != null) {
      const el = document.createElement('div');
      el.className = 'job-marker';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.backgroundColor = '#FF5722';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';

      const popupContent = document.createElement('div');
      popupContent.style.padding = '8px';
      popupContent.style.maxWidth = '200px';
      popupContent.style.fontFamily = 'Arial, sans-serif';
      popupContent.style.fontSize = '14px';
      popupContent.style.color = '#000';

      const titleEl = document.createElement('div');
      titleEl.innerText = job.title;
      titleEl.style.fontWeight = 'bold';
      popupContent.appendChild(titleEl);

      const locEl = document.createElement('div');
      locEl.innerText = job.location;
      popupContent.appendChild(locEl);

      const btn = document.createElement('button');
      btn.innerText = 'View Job';
      btn.style.marginTop = '5px';
      btn.style.padding = '5px 10px';
      btn.style.backgroundColor = '#1976d2';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.borderRadius = '3px';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        this.router.navigateByUrl(`/job/${job.id}`);
      });

      popupContent.appendChild(btn);

      const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupContent);

      const marker = new maplibregl.Marker(el)
        .setLngLat([job.longitude, job.latitude])
        .setPopup(popup)
        .addTo(this.map);

      el.addEventListener('click', () => {
        marker.togglePopup();
      });
    }
  });
}


  }
