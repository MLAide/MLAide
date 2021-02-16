import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root',
})
export class SpinnerUiService {
  private overlayRef: OverlayRef = this.createSpinner();

  constructor(private overlay: Overlay) { }

  private createSpinner() {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });
 }

 public showSpinner() {
  this.overlayRef.attach(new ComponentPortal(MatSpinner))
 }

 public stopSpinner() {
  this.overlayRef.detach();
 }
}
