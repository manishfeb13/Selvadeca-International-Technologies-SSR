import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynaplogixComponent } from './synaplogix.component';

describe('SynaplogixComponent', () => {
  let component: SynaplogixComponent;
  let fixture: ComponentFixture<SynaplogixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SynaplogixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SynaplogixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
