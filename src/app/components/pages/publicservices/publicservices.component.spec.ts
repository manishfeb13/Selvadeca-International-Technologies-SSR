import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicservicesComponent } from './publicservices.component';

describe('PublicservicesComponent', () => {
  let component: PublicservicesComponent;
  let fixture: ComponentFixture<PublicservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicservicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
