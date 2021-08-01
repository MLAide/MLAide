import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Project } from "./entities/project.model";
import { User } from "./entities/user.model";
import { initializeLogin, login, logout } from "@mlaide/state/auth/auth.actions";
import { selectIsUserAuthenticated } from "@mlaide/state/auth/auth.selectors";
import { selectProjects } from "./state/project/project.selectors";
import { selectCurrentUser } from "./state/user/user.selectors";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements AfterViewInit {
  @ViewChild("tabBar") public elementView: ElementRef;
  public isUserAuthenticated$: Observable<boolean>;
  public projects$: Observable<Project[]>;
  public user$: Observable<User>;
  public tabBarHeight: number;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private store: Store,
  ) {
    this.user$ = this.store.select(selectCurrentUser);
    this.isUserAuthenticated$ = this.store.select(selectIsUserAuthenticated);
    this.projects$ = this.store.select(selectProjects);

    this.store.dispatch(initializeLogin());
  }

  login() {
    this.store.dispatch(login({ targetUrl: "/projects"}))
  }

  logout() {
    this.store.dispatch(logout());
  }

  ngAfterViewInit(): void {
    this.tabBarHeight = this.elementView.nativeElement.offsetHeight;
    this.changeDetectorRef.detectChanges();
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
