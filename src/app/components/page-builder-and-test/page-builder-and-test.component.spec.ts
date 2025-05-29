import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBuilderAndTestComponent } from './page-builder-and-test.component';

describe('PageBuilderAndTestComponent', () => {
  let component: PageBuilderAndTestComponent;
  let fixture: ComponentFixture<PageBuilderAndTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageBuilderAndTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageBuilderAndTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
