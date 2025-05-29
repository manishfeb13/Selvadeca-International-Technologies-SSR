import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutTheAuthorComponent } from './about-the-author.component';

describe('AboutTheAuthorComponent', () => {
  let component: AboutTheAuthorComponent;
  let fixture: ComponentFixture<AboutTheAuthorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutTheAuthorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutTheAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
