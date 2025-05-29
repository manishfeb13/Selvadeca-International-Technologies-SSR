import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-about-the-author',
  imports: [CommonModule],
  templateUrl: './about-the-author.component.html',
  styleUrl: './about-the-author.component.scss'
})
export class AboutTheAuthorComponent {
  @Input() authorName: string = ''; // Data received from parent
}
