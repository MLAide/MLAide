import { GlobalPositionStrategy, Overlay, OverlayConfig, OverlayPositionBuilder, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { TestBed } from "@angular/core/testing";
import { MatSpinner } from "@angular/material/progress-spinner";
import { SpinnerUiService } from "./spinner-ui.service";

describe("SpinnerUiService", () => {
  let service: SpinnerUiService;

  // mocks
  let overlayStub: jasmine.SpyObj<Overlay>;
  let overlayRefStub: jasmine.SpyObj<OverlayRef>;
  let overlayPositionBuilderStub: jasmine.SpyObj<OverlayPositionBuilder>;
  let positionStrategy: GlobalPositionStrategy;

  beforeEach(() => {
    overlayRefStub = jasmine.createSpyObj("overlayRef", ["attach", "detach"]);

    positionStrategy = new GlobalPositionStrategy();
    overlayPositionBuilderStub = jasmine.createSpyObj("overlayPositionBuilder", ["global"]);
    overlayPositionBuilderStub.global.and.returnValue(positionStrategy);

    overlayStub = jasmine.createSpyObj("overlay", ["create", "position"]);
    overlayStub.position.and.returnValue(overlayPositionBuilderStub);
    overlayStub.create.and.returnValue(overlayRefStub);

    TestBed.configureTestingModule({
      providers: [{ provide: Overlay, useValue: overlayStub }],
      imports: [],
    });

    service = TestBed.inject(SpinnerUiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should create overlay ref with correct configuration", () => {
    const overlayConfig: OverlayConfig = overlayStub.create.calls.mostRecent().args[0];

    expect(overlayConfig.hasBackdrop).toBe(true);
    expect(overlayConfig.backdropClass).toBe("dark-backdrop");
    expect(overlayConfig.positionStrategy).toBe(positionStrategy);

    expect(positionStrategy["_justifyContent"]).toBe("center");
    expect(positionStrategy["_alignItems"]).toBe("center");
  });

  describe("showSpinner", () => {
    it("should attach spinner to overlay", () => {
      service.showSpinner();

      expect(overlayRefStub.attach).toHaveBeenCalled();
      const attachTo: ComponentPortal<MatSpinner> = overlayRefStub.attach.calls.mostRecent().args[0];
      expect(attachTo.component).toBe(MatSpinner, "expected that spinner is attached to overlay");
    });
  });

  describe("stopSpinner", () => {
    it("should detach everything from overlay", () => {
      service.stopSpinner();

      expect(overlayRefStub.detach).toHaveBeenCalled();
    });
  });
});
