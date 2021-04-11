import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { filter, mergeMap } from "rxjs/operators";
import { AuthService } from "./auth/auth.service";
import { Project } from "./core/models/project.model";
import { User } from "./core/models/user.model";
import { ProjectsApiService } from "./core/services/projects-api.service";
import { UsersApiService } from "./core/services/users-api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("tabBar") public elementView: ElementRef;
  public isAuthenticated$: Observable<boolean>;
  public projects: Project[];
  public user: User;
  public tabBarHeight: number;

  private isAuthenticatedSubscription: Subscription;
  private isAuthenticatedSubscriptionForProjects: Subscription;
  private projectListSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private projectsApiService: ProjectsApiService,
    private userService: UsersApiService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.isAuthenticatedSubscription = this.isAuthenticated$
      .pipe(
        filter((isAuthenticated) => isAuthenticated),
        mergeMap(() => this.userService.getCurrentUser())
      )
      .subscribe((user) => {
        this.user = user;
      });

    this.authService.runInitialLoginSequence();
  }

  login() {
    this.authService.loginWithUserInteraction("/projects");
  }

  logout() {
    this.authService.logout();
  }

  ngAfterViewInit(): void {
    this.tabBarHeight = this.elementView.nativeElement.offsetHeight;
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    if (this.projectListSubscription) {
      this.projectListSubscription.unsubscribe();
    }
    if (this.isAuthenticatedSubscription) {
      this.isAuthenticatedSubscription.unsubscribe();
    }
    if (this.isAuthenticatedSubscriptionForProjects) {
      this.isAuthenticatedSubscriptionForProjects.unsubscribe();
    }
  }

  ngOnInit() {
    this.isAuthenticatedSubscriptionForProjects = this.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        const projectListDataSource = this.projectsApiService.getProjects();
        this.projectListSubscription = projectListDataSource.items$.subscribe((projects) => (this.projects = projects.items));
      }
    });
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    const element = document.querySelector(".app-toolbar");
    if (window.pageYOffset > 0) {
      element.classList.add("app-toolbar-active");
      element.classList.remove("app-toolbar-inactive");
    } else {
      element.classList.add("app-toolbar-inactive");
      element.classList.remove("app-toolbar-active");
    }
  }
}
