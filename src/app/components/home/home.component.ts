import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor(private meta: Meta) {
    // noindex → don’t show this page in search results. nofollow → don’t follow links from this page.
    // this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ name: 'robots', content: 'index' });
  }

  scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
}
