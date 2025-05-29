import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-publicservices',
  imports: [ MatIconModule, MatButtonModule, MatCardModule ],
  templateUrl: './publicservices.component.html',
  styleUrl: './publicservices.component.scss'
})
export class PublicservicesComponent {

}
