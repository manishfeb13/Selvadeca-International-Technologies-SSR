import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudnativeComponent } from './cloudnative.component';

describe('CloudnativeComponent', () => {
  let component: CloudnativeComponent;
  let fixture: ComponentFixture<CloudnativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudnativeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudnativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
