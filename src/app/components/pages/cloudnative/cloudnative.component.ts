import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-cloudnative',
  imports: [ MatIconModule, MatButtonModule, MatCardModule ],
  templateUrl: './cloudnative.component.html',
  styleUrl: './cloudnative.component.scss'
})
export class CloudnativeComponent {

}
