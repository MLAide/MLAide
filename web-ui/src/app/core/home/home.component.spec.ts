import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { ActivatedRoute } from "@angular/router";
import { OAuthService } from "angular-oauth2-oidc";

import { ActivatedRouteStub } from "../../mocks/activated-route.stub";
import { HomeComponent } from "./home.component";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const activatedRoute: ActivatedRoute = new ActivatedRouteStub() as any;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OAuthService, useValue: {} },
        ],
        imports: [MatButtonModule, MatCardModule, MatDividerModule],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
