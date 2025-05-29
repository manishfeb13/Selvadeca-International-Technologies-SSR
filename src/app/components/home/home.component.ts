import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo/seo.service';


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  constructor(private meta: Meta, private seoService: SeoService) {
    // noindex → don’t show this page in search results. nofollow → don’t follow links from this page.
    // this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ name: 'robots', content: 'index' });
  }
  ngOnInit(): void {
    this.seoService.updateMeta({})
  }

  scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
}
