import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-healthcare',
  imports: [ MatIconModule, MatButtonModule, MatCardModule ],
  templateUrl: './healthcare.component.html',
  styleUrl: './healthcare.component.scss'
})
export class HealthcareComponent {

}
