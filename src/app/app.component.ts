import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ApiService } from './services/api/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopNavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Selvadeca International | Technologies';
  constructor() {}
  ngOnInit(): void {
  
  }
}
