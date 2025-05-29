import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProgressBarMode, MatProgressBarModule} from '@angular/material/progress-bar';
import { Meta } from '@angular/platform-browser';


@Component({
  selector: 'app-under-maintenance',
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './under-maintenance.component.html',
  styleUrl: './under-maintenance.component.scss'
})
export class UnderMaintenanceComponent {
  title = 'UnderConstructionWebsite';

  google_form_link= 'https://forms.gle/J1a3BrabJ8eMxtAw8' //old form: 'https://forms.gle/najZaKZYWzBQaLb29' 
  mode: ProgressBarMode = 'buffer';
  value = 55;
  bufferValue = 65;

  constructor(private meta: Meta) {
    // noindex → don’t show this page in search results. nofollow → don’t follow links from this page.
    // this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }
}
