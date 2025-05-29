import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-error-page',
  imports: [RouterModule, CommonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent implements OnInit {
  errorCode: number | null = null;
  errorMessage: string = 'Something went wrong'; // default value

  constructor(private apiService: ApiService, private meta: Meta) {
    // noindex → don’t show this page in search results. nofollow → don’t follow links from this page.
    // this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  ngOnInit() {
    const error = this.apiService.getError()
    this.errorCode = error.errorCode;
    this.errorMessage = error.errorMessage || this.errorMessage;

    // Clear the error from the apiService
    this.apiService.clearError();
  }

}
