import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import {
  ChangeDetectorRef,
  ElementRef,
  HostListener,
  ViewChild,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { flatMap } from "rxjs/operators";
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
  public canActivateProtectedRoutes$: Observable<boolean>;
  @ViewChild("tabBar") elementView: ElementRef;
  public isAuthenticated$: Observable<boolean>;
  public isDoneLoading$: Observable<boolean>;
  public projects: Project[];
  public user: User;
  tabBarHeight: number;
  title = "web-ui";
  private isAuthenticatedSubscription: Subscription;
  private projectListSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private projectsApiService: ProjectsApiService,
    private userService: UsersApiService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.isDoneLoading$ = this.authService.isDoneLoading$;
    this.isDoneLoading$
      .pipe(
        flatMap((isAuthenticated) => {
          if (isAuthenticated) {
            return this.userService.getCurrentUser();
          }
        })
      )
      ?.subscribe(
        (user) => {
          this.user = user;
        },
        (error) => {
          // This is intentional
        }
      );
    this.canActivateProtectedRoutes$ = this.authService.canActivateProtectedRoutes$;

    this.authService.runInitialLoginSequence();
  }

  clearStorage() {
    localStorage.clear();
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
    this.projectListSubscription.unsubscribe();
    this.isAuthenticatedSubscription.unsubscribe();
  }

  ngOnInit() {
    this.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        const projectListDataSource = this.projectsApiService.getProjects();
        this.projectListSubscription = projectListDataSource.items$.subscribe(
          (projects) => (this.projects = projects.items)
        );
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
  refresh() {
    this.authService.refresh();
  }
  reload() {
    window.location.reload();
  }
}
