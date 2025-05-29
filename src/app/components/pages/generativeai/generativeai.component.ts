import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-generativeai',
  imports: [ MatIconModule, MatButtonModule, MatCardModule ],
  templateUrl: './generativeai.component.html',
  styleUrl: './generativeai.component.scss'
})
export class GenerativeaiComponent {

}
