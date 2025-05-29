import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit{
  currentServerRegion = 'unknown';
  regionCode = 'G';

  constructor(private apiService: ApiService){}

  ngOnInit(): void {
    this. currentServerRegion = this.apiService.getCurrentServerRegion()

    // setting up region code based on the server region
    if(this.currentServerRegion === 'us') this.regionCode = 'U';
    else if(this.currentServerRegion === 'eu') this.regionCode = 'E';
    else if(this.currentServerRegion === 'asia') this.regionCode = 'A';
    else this.regionCode = 'G'
    
  }

}
