/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, ElementRef, HostBinding, HostListener, Input, ViewChild, ViewContainerRef, Inject, PLATFORM_ID, } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { convertToBoolProperty } from '../helpers';
import { NB_WINDOW, NB_DOCUMENT } from '../../theme.options';
import * as i0 from "@angular/core";
import * as i1 from "../../services/theme.service";
import * as i2 from "../../services/spinner.service";
import * as i3 from "../../services/direction.service";
import * as i4 from "../../services/scroll.service";
import * as i5 from "../../services/ruler.service";
import * as i6 from "./restore-scroll-top.service";
import * as i7 from "../cdk/adapter/overlay-container-adapter";
/**
 * Layout container component.
 * When using with Nebular Theme System it is required that all child components should be placed inside.
 *
 * Basic example of two column layout with header:
 *
 * @stacked-example(Showcase, layout/layout-showcase.component)
 *
 * Can contain the following components inside:
 *
 * ```html
 * <nb-layout>
 *  <nb-layout-header></nb-layout-header>
 *  <nb-layout-footer></nb-layout-footer>
 *  <nb-layout-column></nb-layout-column>
 *  <nb-sidebar></nb-sidebar>
 * </nb-layout>
 * ```
 * ### Installation
 *
 * Import `NbLayoutModule` to your app module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbLayoutModule,
 *   ],
 * })
 * export class AppModule { }
 * ```
 * ### Usage
 * By default the layout fills up the whole view-port.
 * The window scrollbars are disabled on the body and moved inside of the nb-layout, so that the scrollbars
 * won't mess with the fixed nb-header.
 *
 * The child components are projected into a flexible layout structure allowing to adjust the layout behavior
 * based on the settings provided.
 *
 * The layout content (columns) becomes centered when the window width is more than
 * the value specified in the theme variable `layout-content-width`.
 *
 * The layout also contains the area on the very top (the first child of the nb-layout), which could be used
 * to dynamically append some components like modals or spinners/loaders
 * so that they are located on top of the elements hierarchy.
 * More details are under the `ThemeService` section.
 *
 * The layout component is also responsible for changing application themes.
 * It listens to the `themeChange` event and change a theme CSS class appended to body.
 * Based on the class appended, specific CSS-theme is applied to the application.
 * More details of the Theme System could be found here [Enabling Theme System](#/docs/concepts/theme-system)
 *
 * A simple layout with footer:
 *
 * @stacked-example(Layout With Footer, layout/layout-w-footer.component)
 *
 * It is possible to ask the layout to center the columns (notice: we added a `center` attribute
 * to the layout:
 *
 * ```html
 * <nb-layout center>
 *   <nb-layout-header>Awesome Company</nb-layout-header>
 *
 *   <nb-layout-column>
 *     Hello World!
 *   </nb-layout-column>
 *
 *   <nb-layout-footer>Contact us</nb-layout-footer>
 * </nb-layout>
 * ```
 *
 * @styles
 *
 * layout-background-color:
 * layout-text-color:
 * layout-text-font-family:
 * layout-text-font-size:
 * layout-text-font-weight:
 * layout-text-line-height:
 * layout-min-height:
 * layout-content-width:
 * layout-window-mode-min-width:
 * layout-window-mode-background-color:
 * layout-window-mode-padding-top:
 * layout-window-shadow:
 * layout-padding:
 * layout-medium-padding:
 * layout-small-padding:
 * layout-scrollbar-background-color:
 * layout-scrollbar-color:
 * layout-scrollbar-width:
 */
export class NbLayoutComponent {
    constructor(themeService, spinnerService, elementRef, renderer, window, document, platformId, layoutDirectionService, scrollService, rulerService, scrollTop, overlayContainer) {
        this.themeService = themeService;
        this.spinnerService = spinnerService;
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.window = window;
        this.document = document;
        this.platformId = platformId;
        this.layoutDirectionService = layoutDirectionService;
        this.scrollService = scrollService;
        this.rulerService = rulerService;
        this.scrollTop = scrollTop;
        this.overlayContainer = overlayContainer;
        this.scrollBlockClass = 'nb-global-scrollblock';
        this.isScrollBlocked = false;
        this.centerValue = false;
        this.restoreScrollTopValue = true;
        this.windowModeValue = false;
        this.withScrollValue = false;
        this.withSubheader = false;
        this.afterViewInit$ = new BehaviorSubject(null);
        this.destroy$ = new Subject();
        this.registerAsOverlayContainer();
        this.themeService
            .onThemeChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe((theme) => {
            const body = this.document.getElementsByTagName('body')[0];
            if (theme.previous) {
                this.renderer.removeClass(body, `nb-theme-${theme.previous}`);
            }
            this.renderer.addClass(body, `nb-theme-${theme.name}`);
        });
        this.themeService
            .onAppendLayoutClass()
            .pipe(takeUntil(this.destroy$))
            .subscribe((className) => {
            this.renderer.addClass(this.elementRef.nativeElement, className);
        });
        this.themeService
            .onRemoveLayoutClass()
            .pipe(takeUntil(this.destroy$))
            .subscribe((className) => {
            this.renderer.removeClass(this.elementRef.nativeElement, className);
        });
        this.spinnerService.registerLoader(new Promise((resolve) => {
            this.afterViewInit$.pipe(takeUntil(this.destroy$)).subscribe((_) => resolve());
        }));
        this.spinnerService.load();
        this.rulerService
            .onGetDimensions()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ listener }) => {
            listener.next(this.getDimensions());
            listener.complete();
        });
        this.scrollService
            .onGetPosition()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ listener }) => {
            listener.next(this.getScrollPosition());
            listener.complete();
        });
        this.scrollTop
            .shouldRestore()
            .pipe(filter(() => this.restoreScrollTopValue), takeUntil(this.destroy$))
            .subscribe(() => {
            this.scroll(0, 0);
        });
        this.scrollService
            .onScrollableChange()
            .pipe(filter(() => this.withScrollValue), takeUntil(this.destroy$))
            .subscribe((scrollable) => {
            /**
             * In case when Nebular Layout custom scroll `withScroll` mode is enabled
             * we need to disable default CDK scroll blocker (@link NbBlockScrollStrategyAdapter) on HTML element
             * so that it won't add additional positioning.
             */
            if (scrollable) {
                this.enableScroll();
            }
            else {
                this.blockScroll();
            }
        });
        if (isPlatformBrowser(this.platformId)) {
            // trigger first time so that after the change we have the initial value
            this.themeService.changeWindowWidth(this.window.innerWidth);
        }
    }
    /**
     * Defines whether the layout columns will be centered after some width
     * @param {boolean} val
     */
    set center(val) {
        this.centerValue = convertToBoolProperty(val);
    }
    /**
     * Defines whether the layout enters a 'window' mode, when the layout content (including sidebars and fixed header)
     * becomes centered by width with a margin from the top of the screen, like a floating window.
     * Automatically enables `withScroll` mode, as in the window mode scroll must be inside the layout and cannot be on
     * window. (TODO: check this)
     * @param {boolean} val
     */
    set windowMode(val) {
        this.windowModeValue = convertToBoolProperty(val);
        this.withScroll = this.windowModeValue;
    }
    /**
     * Defines whether to move the scrollbars to layout or leave it at the body level.
     * Automatically set to true when `windowMode` is enabled.
     * @param {boolean} val
     */
    set withScroll(val) {
        this.withScrollValue = convertToBoolProperty(val);
        // TODO: is this the best way of doing it? as we don't have access to body from theme styles
        // TODO: add e2e test
        const body = this.document.getElementsByTagName('body')[0];
        if (this.withScrollValue) {
            this.renderer.setStyle(body, 'overflow', 'hidden');
        }
        else {
            this.renderer.setStyle(body, 'overflow', 'initial');
        }
    }
    /**
     * Restores scroll to the top of the page after navigation
     * @param {boolean} val
     */
    set restoreScrollTop(val) {
        this.restoreScrollTopValue = convertToBoolProperty(val);
    }
    ngAfterViewInit() {
        this.layoutDirectionService
            .onDirectionChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe((direction) => (this.document.dir = direction));
        this.scrollService
            .onManualScroll()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ x, y }) => this.scroll(x, y));
        this.afterViewInit$.next(true);
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.unregisterAsOverlayContainer();
    }
    onScroll($event) {
        this.scrollService.fireScrollChange($event);
    }
    onResize(event) {
        this.themeService.changeWindowWidth(event.target.innerWidth);
    }
    /**
     * Returns scroll and client height/width
     *
     * Depending on the current scroll mode (`withScroll=true`) returns sizes from the body element
     * or from the `.scrollable-container`
     * @returns {NbLayoutDimensions}
     */
    getDimensions() {
        let clientWidth, clientHeight, scrollWidth, scrollHeight = 0;
        if (this.withScrollValue) {
            const container = this.scrollableContainerRef.nativeElement;
            clientWidth = container.clientWidth;
            clientHeight = container.clientHeight;
            scrollWidth = container.scrollWidth;
            scrollHeight = container.scrollHeight;
        }
        else {
            const { documentElement, body } = this.document;
            clientWidth = documentElement.clientWidth || body.clientWidth;
            clientHeight = documentElement.clientHeight || body.clientHeight;
            scrollWidth = documentElement.scrollWidth || body.scrollWidth;
            scrollHeight = documentElement.scrollHeight || body.scrollHeight;
        }
        return {
            clientWidth,
            clientHeight,
            scrollWidth,
            scrollHeight,
        };
    }
    /**
     * Returns scroll position of current scroll container.
     *
     * If `withScroll` = true, returns scroll position of the `.scrollable-container` element,
     * otherwise - of the scrollable element of the window (which may be different depending of a browser)
     *
     * @returns {NbScrollPosition}
     */
    getScrollPosition() {
        if (!isPlatformBrowser(this.platformId)) {
            return { x: 0, y: 0 };
        }
        if (this.withScrollValue) {
            const container = this.scrollableContainerRef.nativeElement;
            return { x: container.scrollLeft, y: container.scrollTop };
        }
        const documentRect = this.document.documentElement.getBoundingClientRect();
        const x = -documentRect.left ||
            this.document.body.scrollLeft ||
            this.window.scrollX ||
            this.document.documentElement.scrollLeft ||
            0;
        const y = -documentRect.top ||
            this.document.body.scrollTop ||
            this.window.scrollY ||
            this.document.documentElement.scrollTop ||
            0;
        return { x, y };
    }
    registerAsOverlayContainer() {
        if (this.overlayContainer.setContainer) {
            this.overlayContainer.setContainer(this.elementRef.nativeElement);
        }
    }
    unregisterAsOverlayContainer() {
        if (this.overlayContainer.clearContainer) {
            this.overlayContainer.clearContainer();
        }
    }
    scroll(x = null, y = null) {
        const { x: currentX, y: currentY } = this.getScrollPosition();
        x = x == null ? currentX : x;
        y = y == null ? currentY : y;
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        if (this.withScrollValue) {
            const scrollable = this.scrollableContainerRef.nativeElement;
            if (scrollable.scrollTo) {
                scrollable.scrollTo(x, y);
            }
            else {
                scrollable.scrollLeft = x;
                scrollable.scrollTop = y;
            }
        }
        else {
            this.window.scrollTo(x, y);
        }
    }
    // TODO: Extract into block scroll strategy
    blockScroll() {
        if (this.isScrollBlocked) {
            return;
        }
        this.isScrollBlocked = true;
        this.renderer.addClass(this.document.documentElement, this.scrollBlockClass);
        const scrollableContainerElement = this.scrollableContainerRef.nativeElement;
        const layoutElement = this.layoutContainerRef.nativeElement;
        const layoutWithScrollWidth = layoutElement.clientWidth;
        this.scrollableContainerOverflowOldValue = scrollableContainerElement.style.overflow;
        scrollableContainerElement.style.overflow = 'hidden';
        const layoutWithoutScrollWidth = layoutElement.clientWidth;
        const scrollWidth = layoutWithoutScrollWidth - layoutWithScrollWidth;
        if (!scrollWidth) {
            return;
        }
        this.layoutPaddingOldValue = {
            left: layoutElement.style.paddingLeft,
            right: layoutElement.style.paddingRight,
        };
        if (this.layoutDirectionService.isLtr()) {
            layoutElement.style.paddingRight = `${scrollWidth}px`;
        }
        else {
            layoutElement.style.paddingLeft = `${scrollWidth}px`;
        }
    }
    enableScroll() {
        if (this.isScrollBlocked) {
            this.isScrollBlocked = false;
            this.renderer.removeClass(this.document.documentElement, this.scrollBlockClass);
            this.scrollableContainerRef.nativeElement.style.overflow = this.scrollableContainerOverflowOldValue;
            if (this.layoutPaddingOldValue) {
                const layoutElement = this.layoutContainerRef.nativeElement;
                layoutElement.style.paddingLeft = this.layoutPaddingOldValue.left;
                layoutElement.style.paddingRight = this.layoutPaddingOldValue.right;
                this.layoutPaddingOldValue = null;
            }
        }
    }
}
NbLayoutComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbLayoutComponent, deps: [{ token: i1.NbThemeService }, { token: i2.NbSpinnerService }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: NB_WINDOW }, { token: NB_DOCUMENT }, { token: PLATFORM_ID }, { token: i3.NbLayoutDirectionService }, { token: i4.NbLayoutScrollService }, { token: i5.NbLayoutRulerService }, { token: i6.NbRestoreScrollTopHelper }, { token: i7.NbOverlayContainerAdapter }], target: i0.ɵɵFactoryTarget.Component });
NbLayoutComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbLayoutComponent, selector: "nb-layout", inputs: { center: "center", windowMode: "windowMode", withScroll: "withScroll", restoreScrollTop: "restoreScrollTop" }, host: { listeners: { "window:scroll": "onScroll($event)", "window:resize": "onResize($event)" }, properties: { "class.window-mode": "this.windowModeValue", "class.with-scroll": "this.withScrollValue", "class.with-subheader": "this.withSubheader" } }, viewQueries: [{ propertyName: "veryTopRef", first: true, predicate: ["layoutTopDynamicArea"], descendants: true, read: ViewContainerRef }, { propertyName: "scrollableContainerRef", first: true, predicate: ["scrollableContainer"], descendants: true, read: ElementRef, static: true }, { propertyName: "layoutContainerRef", first: true, predicate: ["layoutContainer"], descendants: true, read: ElementRef }], ngImport: i0, template: `
    <div class="scrollable-container" #scrollableContainer (scroll)="onScroll($event)">
      <div class="layout" #layoutContainer>
        <ng-content select="nb-layout-header:not([subheader])"></ng-content>
        <div class="layout-container">
          <ng-content select="nb-sidebar"></ng-content>
          <div class="content" [class.center]="centerValue">
            <ng-content select="nb-layout-header[subheader]"></ng-content>
            <div class="columns">
              <ng-content select="nb-layout-column"></ng-content>
            </div>
            <ng-content select="nb-layout-footer"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `, isInline: true, styles: ["/**\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n */:host{-webkit-font-smoothing:antialiased}[dir=ltr] :host{text-align:left}[dir=rtl] :host{text-align:right}:host .layout{display:flex;flex-direction:column}:host ::ng-deep nb-layout-header{display:block}:host ::ng-deep nb-layout-header nav{align-items:center;justify-content:flex-start;display:flex}:host ::ng-deep nb-layout-header.fixed{position:fixed;top:0;left:0;right:0;z-index:1040}:host .layout-container{display:flex;flex:1;-ms-flex:1 1 auto;flex-direction:row}[dir=ltr] :host .layout-container ::ng-deep nb-sidebar.left{order:0}[dir=rtl] :host .layout-container ::ng-deep nb-sidebar.left{order:2}[dir=ltr] :host .layout-container ::ng-deep nb-sidebar.right{order:2}[dir=rtl] :host .layout-container ::ng-deep nb-sidebar.right{order:0}:host .layout-container ::ng-deep nb-sidebar.end{order:2}:host .layout-container ::ng-deep nb-sidebar .fixed{position:fixed;width:100%;overflow-y:auto;height:100%}:host .layout-container .content{display:flex;flex:1;-ms-flex:1 1 auto;flex-direction:column;min-width:0}:host .layout-container .content.center{max-width:100%;position:relative;margin-left:auto;margin-right:auto}:host .layout-container .content .columns{display:flex;flex:1;-ms-flex:1 1 auto;flex-direction:row;width:100%}:host .layout-container .content .columns ::ng-deep nb-layout-column{order:1;flex:1 0;min-width:0}[dir=ltr] :host .layout-container .content .columns ::ng-deep nb-layout-column.left{order:0}[dir=rtl] :host .layout-container .content .columns ::ng-deep nb-layout-column.left{order:2}:host .layout-container .content .columns ::ng-deep nb-layout-column.start{order:0}:host .layout-container .content ::ng-deep nb-layout-footer{display:block;margin-top:auto}:host .layout-container .content ::ng-deep nb-layout-footer nav{justify-content:center;display:flex}\n"] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbLayoutComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nb-layout', template: `
    <div class="scrollable-container" #scrollableContainer (scroll)="onScroll($event)">
      <div class="layout" #layoutContainer>
        <ng-content select="nb-layout-header:not([subheader])"></ng-content>
        <div class="layout-container">
          <ng-content select="nb-sidebar"></ng-content>
          <div class="content" [class.center]="centerValue">
            <ng-content select="nb-layout-header[subheader]"></ng-content>
            <div class="columns">
              <ng-content select="nb-layout-column"></ng-content>
            </div>
            <ng-content select="nb-layout-footer"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `, styles: ["/**\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n */:host{-webkit-font-smoothing:antialiased}[dir=ltr] :host{text-align:left}[dir=rtl] :host{text-align:right}:host .layout{display:flex;flex-direction:column}:host ::ng-deep nb-layout-header{display:block}:host ::ng-deep nb-layout-header nav{align-items:center;justify-content:flex-start;display:flex}:host ::ng-deep nb-layout-header.fixed{position:fixed;top:0;left:0;right:0;z-index:1040}:host .layout-container{display:flex;flex:1;-ms-flex:1 1 auto;flex-direction:row}[dir=ltr] :host .layout-container ::ng-deep nb-sidebar.left{order:0}[dir=rtl] :host .layout-container ::ng-deep nb-sidebar.left{order:2}[dir=ltr] :host .layout-container ::ng-deep nb-sidebar.right{order:2}[dir=rtl] :host .layout-container ::ng-deep nb-sidebar.right{order:0}:host .layout-container ::ng-deep nb-sidebar.end{order:2}:host .layout-container ::ng-deep nb-sidebar .fixed{position:fixed;width:100%;overflow-y:auto;height:100%}:host .layout-container .content{display:flex;flex:1;-ms-flex:1 1 auto;flex-direction:column;min-width:0}:host .layout-container .content.center{max-width:100%;position:relative;margin-left:auto;margin-right:auto}:host .layout-container .content .columns{display:flex;flex:1;-ms-flex:1 1 auto;flex-direction:row;width:100%}:host .layout-container .content .columns ::ng-deep nb-layout-column{order:1;flex:1 0;min-width:0}[dir=ltr] :host .layout-container .content .columns ::ng-deep nb-layout-column.left{order:0}[dir=rtl] :host .layout-container .content .columns ::ng-deep nb-layout-column.left{order:2}:host .layout-container .content .columns ::ng-deep nb-layout-column.start{order:0}:host .layout-container .content ::ng-deep nb-layout-footer{display:block;margin-top:auto}:host .layout-container .content ::ng-deep nb-layout-footer nav{justify-content:center;display:flex}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.NbThemeService }, { type: i2.NbSpinnerService }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_WINDOW]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_DOCUMENT]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i3.NbLayoutDirectionService }, { type: i4.NbLayoutScrollService }, { type: i5.NbLayoutRulerService }, { type: i6.NbRestoreScrollTopHelper }, { type: i7.NbOverlayContainerAdapter }]; }, propDecorators: { windowModeValue: [{
                type: HostBinding,
                args: ['class.window-mode']
            }], withScrollValue: [{
                type: HostBinding,
                args: ['class.with-scroll']
            }], withSubheader: [{
                type: HostBinding,
                args: ['class.with-subheader']
            }], center: [{
                type: Input
            }], windowMode: [{
                type: Input
            }], withScroll: [{
                type: Input
            }], restoreScrollTop: [{
                type: Input
            }], veryTopRef: [{
                type: ViewChild,
                args: ['layoutTopDynamicArea', { read: ViewContainerRef }]
            }], scrollableContainerRef: [{
                type: ViewChild,
                args: ['scrollableContainer', { read: ElementRef, static: true }]
            }], layoutContainerRef: [{
                type: ViewChild,
                args: ['layoutContainer', { read: ElementRef }]
            }], onScroll: [{
                type: HostListener,
                args: ['window:scroll', ['$event']]
            }], onResize: [{
                type: HostListener,
                args: ['window:resize', ['$event']]
            }] } });
/**
 * A container component which determines a content position inside of the layout.
 * The layout could contain unlimited columns (not including the sidebars).
 *
 * By default the columns are ordered from the left to the right,
 * but it's also possible to overwrite this behavior by setting a `left` attribute to the column,
 * moving it to the very first position:
 *
 * @stacked-example(Column Left, layout/layout-column-left.component)
 */
export class NbLayoutColumnComponent {
    /**
     * Move the column to the very left position in the layout.
     * @param {boolean} val
     */
    set left(val) {
        this.leftValue = convertToBoolProperty(val);
        this.startValue = false;
    }
    /**
     * Make column first in the layout.
     * @param {boolean} val
     */
    set start(val) {
        this.startValue = convertToBoolProperty(val);
        this.leftValue = false;
    }
}
NbLayoutColumnComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbLayoutColumnComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
NbLayoutColumnComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbLayoutColumnComponent, selector: "nb-layout-column", inputs: { left: "left", start: "start" }, host: { properties: { "class.left": "this.leftValue", "class.start": "this.startValue" } }, ngImport: i0, template: `<ng-content></ng-content>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbLayoutColumnComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nb-layout-column',
                    template: `<ng-content></ng-content>`,
                }]
        }], propDecorators: { leftValue: [{
                type: HostBinding,
                args: ['class.left']
            }], startValue: [{
                type: HostBinding,
                args: ['class.start']
            }], left: [{
                type: Input
            }], start: [{
                type: Input
            }] } });
/**
 * Page header component.
 * Located on top of the page above the layout columns and sidebars.
 * Could be made `fixed` by setting the corresponding property. In the fixed mode the header becomes
 * sticky to the top of the nb-layout (to of the page). Here's an example:
 *
 * @stacked-example(Fixed Header, layout/layout-fixed-header.component)
 *
 * In a pair with sidebar it is possible to setup a configuration when header is placed on a side of the sidebar
 * and not on top of it. To achieve this simply put a `subheader` property to the header like this:
 * ```html
 * <nb-layout-header subheader></nb-layout-header>
 * ```
 * @stacked-example(Subheader, layout/layout-sidebar-subheader.component)
 * Note that in such configuration sidebar shadow is removed and header cannot be make `fixed`.
 *
 * Same way you can put both `fixed` and `clipped` headers adding creating a sub-header for your app:
 *
 * @stacked-example(Subheader, layout/layout-subheader.component)
 *
 * @styles
 *
 * header-background-color:
 * header-text-color:
 * header-text-font-family:
 * header-text-font-size:
 * header-text-font-weight:
 * header-text-line-height:
 * header-height:
 * header-padding:
 * header-shadow:
 */
export class NbLayoutHeaderComponent {
    constructor(layout) {
        this.layout = layout;
    }
    /**
     * Makes the header sticky to the top of the nb-layout.
     * @param {boolean} val
     */
    set fixed(val) {
        this.fixedValue = convertToBoolProperty(val);
    }
    /**
     * Places header on a side of the sidebar, and not above.
     * Disables fixed mode for this header and remove a shadow from the sidebar.
     * @param {boolean} val
     */
    set subheader(val) {
        this.subheaderValue = convertToBoolProperty(val);
        this.fixedValue = false;
        this.layout.withSubheader = this.subheaderValue;
    }
}
NbLayoutHeaderComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbLayoutHeaderComponent, deps: [{ token: NbLayoutComponent }], target: i0.ɵɵFactoryTarget.Component });
NbLayoutHeaderComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbLayoutHeaderComponent, selector: "nb-layout-header", inputs: { fixed: "fixed", subheader: "subheader" }, host: { properties: { "class.fixed": "this.fixedValue", "class.subheader": "this.subheaderValue" } }, ngImport: i0, template: `
    <nav [class.fixed]="fixedValue">
      <ng-content></ng-content>
    </nav>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbLayoutHeaderComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nb-layout-header',
                    template: `
    <nav [class.fixed]="fixedValue">
      <ng-content></ng-content>
    </nav>
  `,
                }]
        }], ctorParameters: function () { return [{ type: NbLayoutComponent }]; }, propDecorators: { fixedValue: [{
                type: HostBinding,
                args: ['class.fixed']
            }], subheaderValue: [{
                type: HostBinding,
                args: ['class.subheader']
            }], fixed: [{
                type: Input
            }], subheader: [{
                type: Input
            }] } });
/**
 * Page footer.
 * Located under the nb-layout content (specifically, under the columns).
 * Could be made `fixed`, becoming sticky to the bottom of the view port (window).
 *
 * @styles
 *
 * footer-background-color:
 * footer-text-color:
 * footer-text-font-family:
 * footer-text-font-size:
 * footer-text-font-weight:
 * footer-text-line-height:
 * footer-text-highlight-color:
 * footer-height:
 * footer-padding:
 * footer-divider-color:
 * footer-divider-style:
 * footer-divider-width:
 * footer-shadow:
 */
export class NbLayoutFooterComponent {
    /**
     * Makes the footer sticky to the bottom of the window.
     * @param {boolean} val
     */
    set fixed(val) {
        this.fixedValue = convertToBoolProperty(val);
    }
}
NbLayoutFooterComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbLayoutFooterComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
NbLayoutFooterComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbLayoutFooterComponent, selector: "nb-layout-footer", inputs: { fixed: "fixed" }, host: { properties: { "class.fixed": "this.fixedValue" } }, ngImport: i0, template: `
    <nav [class.fixed]="fixedValue">
      <ng-content></ng-content>
    </nav>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbLayoutFooterComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nb-layout-footer',
                    template: `
    <nav [class.fixed]="fixedValue">
      <ng-content></ng-content>
    </nav>
  `,
                }]
        }], propDecorators: { fixedValue: [{
                type: HostBinding,
                args: ['class.fixed']
            }], fixed: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvdGhlbWUvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxFQUVMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsV0FBVyxFQUNYLFlBQVksRUFDWixLQUFLLEVBR0wsU0FBUyxFQUNULGdCQUFnQixFQUNoQixNQUFNLEVBQ04sV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hELE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFbkQsT0FBTyxFQUFFLHFCQUFxQixFQUFrQixNQUFNLFlBQVksQ0FBQztBQU9uRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7Ozs7QUFHN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBGRztBQXNCSCxNQUFNLE9BQU8saUJBQWlCO0lBZ0Y1QixZQUNZLFlBQTRCLEVBQzVCLGNBQWdDLEVBQ2hDLFVBQXNCLEVBQ3RCLFFBQW1CLEVBQ0EsTUFBTSxFQUNKLFFBQVEsRUFDUixVQUFrQixFQUN2QyxzQkFBZ0QsRUFDaEQsYUFBb0MsRUFDcEMsWUFBa0MsRUFDbEMsU0FBbUMsRUFDbkMsZ0JBQTJDO1FBWDNDLGlCQUFZLEdBQVosWUFBWSxDQUFnQjtRQUM1QixtQkFBYyxHQUFkLGNBQWMsQ0FBa0I7UUFDaEMsZUFBVSxHQUFW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LGNBQWMsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQ2xELENBQUM7O3FIQTFCVSx1QkFBdUI7eUdBQXZCLHVCQUF1QixrTkFOeEI7Ozs7R0FJVDs0RkFFVSx1QkFBdUI7a0JBUm5DLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsUUFBUSxFQUFFOzs7O0dBSVQ7aUJBQ0Y7cUdBRTZCLFVBQVU7c0JBQXJDLFdBQVc7dUJBQUMsYUFBYTtnQkFDTSxjQUFjO3NCQUE3QyxXQUFXO3VCQUFDLGlCQUFpQjtnQkFTMUIsS0FBSztzQkFEUixLQUFLO2dCQVlGLFNBQVM7c0JBRFosS0FBSzs7QUFTUjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFTSCxNQUFNLE9BQU8sdUJBQXVCO0lBR2xDOzs7T0FHRztJQUNILElBQ0ksS0FBSyxDQUFDLEdBQVk7UUFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQyxDQUFDOztxSEFWVSx1QkFBdUI7eUdBQXZCLHVCQUF1QixnSkFOeEI7Ozs7R0FJVDs0RkFFVSx1QkFBdUI7a0JBUm5DLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsUUFBUSxFQUFFOzs7O0dBSVQ7aUJBQ0Y7OEJBRTZCLFVBQVU7c0JBQXJDLFdBQVc7dUJBQUMsYUFBYTtnQkFPdEIsS0FBSztzQkFEUixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEFrdmVvLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEhvc3RCaW5kaW5nLFxuICBIb3N0TGlzdGVuZXIsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIFJlbmRlcmVyMixcbiAgVmlld0NoaWxkLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBJbmplY3QsXG4gIFBMQVRGT1JNX0lELFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGlzUGxhdGZvcm1Ccm93c2VyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZmlsdGVyLCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSwgTmJCb29sZWFuSW5wdXQgfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCB7IE5iVGhlbWVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvdGhlbWUuc2VydmljZSc7XG5pbXBvcnQgeyBOYlNwaW5uZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvc3Bpbm5lci5zZXJ2aWNlJztcbmltcG9ydCB7IE5iTGF5b3V0RGlyZWN0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2RpcmVjdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IE5iUmVzdG9yZVNjcm9sbFRvcEhlbHBlciB9IGZyb20gJy4vcmVzdG9yZS1zY3JvbGwtdG9wLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmJTY3JvbGxQb3NpdGlvbiwgTmJMYXlvdXRTY3JvbGxTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvc2Nyb2xsLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmJMYXlvdXREaW1lbnNpb25zLCBOYkxheW91dFJ1bGVyU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL3J1bGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgTkJfV0lORE9XLCBOQl9ET0NVTUVOVCB9IGZyb20gJy4uLy4uL3RoZW1lLm9wdGlvbnMnO1xuaW1wb3J0IHsgTmJPdmVybGF5Q29udGFpbmVyQWRhcHRlciB9IGZyb20gJy4uL2Nkay9hZGFwdGVyL292ZXJsYXktY29udGFpbmVyLWFkYXB0ZXInO1xuXG4vKipcbiAqIExheW91dCBjb250YWluZXIgY29tcG9uZW50LlxuICogV2hlbiB1c2luZyB3aXRoIE5lYnVsYXIgVGhlbWUgU3lzdGVtIGl0IGlzIHJlcXVpcmVkIHRoYXQgYWxsIGNoaWxkIGNvbXBvbmVudHMgc2hvdWxkIGJlIHBsYWNlZCBpbnNpZGUuXG4gKlxuICogQmFzaWMgZXhhbXBsZSBvZiB0d28gY29sdW1uIGxheW91dCB3aXRoIGhlYWRlcjpcbiAqXG4gKiBAc3RhY2tlZC1leGFtcGxlKFNob3djYXNlLCBsYXlvdXQvbGF5b3V0LXNob3djYXNlLmNvbXBvbmVudClcbiAqXG4gKiBDYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGNvbXBvbmVudHMgaW5zaWRlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxuYi1sYXlvdXQ+XG4gKiAgPG5iLWxheW91dC1oZWFkZXI+PC9uYi1sYXlvdXQtaGVhZGVyPlxuICogIDxuYi1sYXlvdXQtZm9vdGVyPjwvbmItbGF5b3V0LWZvb3Rlcj5cbiAqICA8bmItbGF5b3V0LWNvbHVtbj48L25iLWxheW91dC1jb2x1bW4+XG4gKiAgPG5iLXNpZGViYXI+PC9uYi1zaWRlYmFyPlxuICogPC9uYi1sYXlvdXQ+XG4gKiBgYGBcbiAqICMjIyBJbnN0YWxsYXRpb25cbiAqXG4gKiBJbXBvcnQgYE5iTGF5b3V0TW9kdWxlYCB0byB5b3VyIGFwcCBtb2R1bGUuXG4gKiBgYGB0c1xuICogQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW1xuICogICAgIC8vIC4uLlxuICogICAgIE5iTGF5b3V0TW9kdWxlLFxuICogICBdLFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHBNb2R1bGUgeyB9XG4gKiBgYGBcbiAqICMjIyBVc2FnZVxuICogQnkgZGVmYXVsdCB0aGUgbGF5b3V0IGZpbGxzIHVwIHRoZSB3aG9sZSB2aWV3LXBvcnQuXG4gKiBUaGUgd2luZG93IHNjcm9sbGJhcnMgYXJlIGRpc2FibGVkIG9uIHRoZSBib2R5IGFuZCBtb3ZlZCBpbnNpZGUgb2YgdGhlIG5iLWxheW91dCwgc28gdGhhdCB0aGUgc2Nyb2xsYmFyc1xuICogd29uJ3QgbWVzcyB3aXRoIHRoZSBmaXhlZCBuYi1oZWFkZXIuXG4gKlxuICogVGhlIGNoaWxkIGNvbXBvbmVudHMgYXJlIHByb2plY3RlZCBpbnRvIGEgZmxleGlibGUgbGF5b3V0IHN0cnVjdHVyZSBhbGxvd2luZyB0byBhZGp1c3QgdGhlIGxheW91dCBiZWhhdmlvclxuICogYmFzZWQgb24gdGhlIHNldHRpbmdzIHByb3ZpZGVkLlxuICpcbiAqIFRoZSBsYXlvdXQgY29udGVudCAoY29sdW1ucykgYmVjb21lcyBjZW50ZXJlZCB3aGVuIHRoZSB3aW5kb3cgd2lkdGggaXMgbW9yZSB0aGFuXG4gKiB0aGUgdmFsdWUgc3BlY2lmaWVkIGluIHRoZSB0aGVtZSB2YXJpYWJsZSBgbGF5b3V0LWNvbnRlbnQtd2lkdGhgLlxuICpcbiAqIFRoZSBsYXlvdXQgYWxzbyBjb250YWlucyB0aGUgYXJlYSBvbiB0aGUgdmVyeSB0b3AgKHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgbmItbGF5b3V0KSwgd2hpY2ggY291bGQgYmUgdXNlZFxuICogdG8gZHluYW1pY2FsbHkgYXBwZW5kIHNvbWUgY29tcG9uZW50cyBsaWtlIG1vZGFscyBvciBzcGlubmVycy9sb2FkZXJzXG4gKiBzbyB0aGF0IHRoZXkgYXJlIGxvY2F0ZWQgb24gdG9wIG9mIHRoZSBlbGVtZW50cyBoaWVyYXJjaHkuXG4gKiBNb3JlIGRldGFpbHMgYXJlIHVuZGVyIHRoZSBgVGhlbWVTZXJ2aWNlYCBzZWN0aW9uLlxuICpcbiAqIFRoZSBsYXlvdXQgY29tcG9uZW50IGlzIGFsc28gcmVzcG9uc2libGUgZm9yIGNoYW5naW5nIGFwcGxpY2F0aW9uIHRoZW1lcy5cbiAqIEl0IGxpc3RlbnMgdG8gdGhlIGB0aGVtZUNoYW5nZWAgZXZlbnQgYW5kIGNoYW5nZSBhIHRoZW1lIENTUyBjbGFzcyBhcHBlbmRlZCB0byBib2R5LlxuICogQmFzZWQgb24gdGhlIGNsYXNzIGFwcGVuZGVkLCBzcGVjaWZpYyBDU1MtdGhlbWUgaXMgYXBwbGllZCB0byB0aGUgYXBwbGljYXRpb24uXG4gKiBNb3JlIGRldGFpbHMgb2YgdGhlIFRoZW1lIFN5c3RlbSBjb3VsZCBiZSBmb3VuZCBoZXJlIFtFbmFibGluZyBUaGVtZSBTeXN0ZW1dKCMvZG9jcy9jb25jZXB0cy90aGVtZS1zeXN0ZW0pXG4gKlxuICogQSBzaW1wbGUgbGF5b3V0IHdpdGggZm9vdGVyOlxuICpcbiAqIEBzdGFja2VkLWV4YW1wbGUoTGF5b3V0IFdpdGggRm9vdGVyLCBsYXlvdXQvbGF5b3V0LXctZm9vdGVyLmNvbXBvbmVudClcbiAqXG4gKiBJdCBpcyBwb3NzaWJsZSB0byBhc2sgdGhlIGxheW91dCB0byBjZW50ZXIgdGhlIGNvbHVtbnMgKG5vdGljZTogd2UgYWRkZWQgYSBgY2VudGVyYCBhdHRyaWJ1dGVcbiAqIHRvIHRoZSBsYXlvdXQ6XG4gKlxuICogYGBgaHRtbFxuICogPG5iLWxheW91dCBjZW50ZXI+XG4gKiAgIDxuYi1sYXlvdXQtaGVhZGVyPkF3ZXNvbWUgQ29tcGFueTwvbmItbGF5b3V0LWhlYWRlcj5cbiAqXG4gKiAgIDxuYi1sYXlvdXQtY29sdW1uPlxuICogICAgIEhlbGxvIFdvcmxkIVxuICogICA8L25iLWxheW91dC1jb2x1bW4+XG4gKlxuICogICA8bmItbGF5b3V0LWZvb3Rlcj5Db250YWN0IHVzPC9uYi1sYXlvdXQtZm9vdGVyPlxuICogPC9uYi1sYXlvdXQ+XG4gKiBgYGBcbiAqXG4gKiBAc3R5bGVzXG4gKlxuICogbGF5b3V0LWJhY2tncm91bmQtY29sb3I6XG4gKiBsYXlvdXQtdGV4dC1jb2xvcjpcbiAqIGxheW91dC10ZXh0LWZvbnQtZmFtaWx5OlxuICogbGF5b3V0LXRleHQtZm9udC1zaXplOlxuICogbGF5b3V0LXRleHQtZm9udC13ZWlnaHQ6XG4gKiBsYXlvdXQtdGV4dC1saW5lLWhlaWdodDpcbiAqIGxheW91dC1taW4taGVpZ2h0OlxuICogbGF5b3V0LWNvbnRlbnQtd2lkdGg6XG4gKiBsYXlvdXQtd2luZG93LW1vZGUtbWluLXdpZHRoOlxuICogbGF5b3V0LXdpbmRvdy1tb2RlLWJhY2tncm91bmQtY29sb3I6XG4gKiBsYXlvdXQtd2luZG93LW1vZGUtcGFkZGluZy10b3A6XG4gKiBsYXlvdXQtd2luZG93LXNoYWRvdzpcbiAqIGxheW91dC1wYWRkaW5nOlxuICogbGF5b3V0LW1lZGl1bS1wYWRkaW5nOlxuICogbGF5b3V0LXNtYWxsLXBhZGRpbmc6XG4gKiBsYXlvdXQtc2Nyb2xsYmFyLWJhY2tncm91bmQtY29sb3I6XG4gKiBsYXlvdXQtc2Nyb2xsYmFyLWNvbG9yOlxuICogbGF5b3V0LXNjcm9sbGJhci13aWR0aDpcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmItbGF5b3V0JyxcbiAgc3R5bGVVcmxzOiBbJy4vbGF5b3V0LmNvbXBvbmVudC5zY3NzJ10sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cInNjcm9sbGFibGUtY29udGFpbmVyXCIgI3Njcm9sbGFibGVDb250YWluZXIgKHNjcm9sbCk9XCJvblNjcm9sbCgkZXZlbnQpXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibGF5b3V0XCIgI2xheW91dENvbnRhaW5lcj5cbiAgICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwibmItbGF5b3V0LWhlYWRlcjpub3QoW3N1YmhlYWRlcl0pXCI+PC9uZy1jb250ZW50PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibGF5b3V0LWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxuZy1jb250ZW50IHNlbGVjdD1cIm5iLXNpZGViYXJcIj48L25nLWNvbnRlbnQ+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIiBbY2xhc3MuY2VudGVyXT1cImNlbnRlclZhbHVlXCI+XG4gICAgICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJuYi1sYXlvdXQtaGVhZGVyW3N1YmhlYWRlcl1cIj48L25nLWNvbnRlbnQ+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sdW1uc1wiPlxuICAgICAgICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJuYi1sYXlvdXQtY29sdW1uXCI+PC9uZy1jb250ZW50PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJuYi1sYXlvdXQtZm9vdGVyXCI+PC9uZy1jb250ZW50PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgLFxufSlcbmV4cG9ydCBjbGFzcyBOYkxheW91dENvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCBzY3JvbGxCbG9ja0NsYXNzID0gJ25iLWdsb2JhbC1zY3JvbGxibG9jayc7XG4gIHByb3RlY3RlZCBpc1Njcm9sbEJsb2NrZWQgPSBmYWxzZTtcbiAgcHJvdGVjdGVkIHNjcm9sbGFibGVDb250YWluZXJPdmVyZmxvd09sZFZhbHVlOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBsYXlvdXRQYWRkaW5nT2xkVmFsdWU6IHsgbGVmdDogc3RyaW5nOyByaWdodDogc3RyaW5nIH07XG5cbiAgY2VudGVyVmFsdWU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcmVzdG9yZVNjcm9sbFRvcFZhbHVlOiBib29sZWFuID0gdHJ1ZTtcblxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLndpbmRvdy1tb2RlJykgd2luZG93TW9kZVZhbHVlOiBib29sZWFuID0gZmFsc2U7XG4gIEBIb3N0QmluZGluZygnY2xhc3Mud2l0aC1zY3JvbGwnKSB3aXRoU2Nyb2xsVmFsdWU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy53aXRoLXN1YmhlYWRlcicpIHdpdGhTdWJoZWFkZXI6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogRGVmaW5lcyB3aGV0aGVyIHRoZSBsYXlvdXQgY29sdW1ucyB3aWxsIGJlIGNlbnRlcmVkIGFmdGVyIHNvbWUgd2lkdGhcbiAgICogQHBhcmFtIHtib29sZWFufSB2YWxcbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBjZW50ZXIodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5jZW50ZXJWYWx1ZSA9IGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSh2YWwpO1xuICB9XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jZW50ZXI6IE5iQm9vbGVhbklucHV0O1xuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHdoZXRoZXIgdGhlIGxheW91dCBlbnRlcnMgYSAnd2luZG93JyBtb2RlLCB3aGVuIHRoZSBsYXlvdXQgY29udGVudCAoaW5jbHVkaW5nIHNpZGViYXJzIGFuZCBmaXhlZCBoZWFkZXIpXG4gICAqIGJlY29tZXMgY2VudGVyZWQgYnkgd2lkdGggd2l0aCBhIG1hcmdpbiBmcm9tIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiwgbGlrZSBhIGZsb2F0aW5nIHdpbmRvdy5cbiAgICogQXV0b21hdGljYWxseSBlbmFibGVzIGB3aXRoU2Nyb2xsYCBtb2RlLCBhcyBpbiB0aGUgd2luZG93IG1vZGUgc2Nyb2xsIG11c3QgYmUgaW5zaWRlIHRoZSBsYXlvdXQgYW5kIGNhbm5vdCBiZSBvblxuICAgKiB3aW5kb3cuIChUT0RPOiBjaGVjayB0aGlzKVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbFxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHdpbmRvd01vZGUodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy53aW5kb3dNb2RlVmFsdWUgPSBjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsKTtcbiAgICB0aGlzLndpdGhTY3JvbGwgPSB0aGlzLndpbmRvd01vZGVWYWx1ZTtcbiAgfVxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfd2luZG93TW9kZTogTmJCb29sZWFuSW5wdXQ7XG5cbiAgLyoqXG4gICAqIERlZmluZXMgd2hldGhlciB0byBtb3ZlIHRoZSBzY3JvbGxiYXJzIHRvIGxheW91dCBvciBsZWF2ZSBpdCBhdCB0aGUgYm9keSBsZXZlbC5cbiAgICogQXV0b21hdGljYWxseSBzZXQgdG8gdHJ1ZSB3aGVuIGB3aW5kb3dNb2RlYCBpcyBlbmFibGVkLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbFxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHdpdGhTY3JvbGwodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy53aXRoU2Nyb2xsVmFsdWUgPSBjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsKTtcblxuICAgIC8vIFRPRE86IGlzIHRoaXMgdGhlIGJlc3Qgd2F5IG9mIGRvaW5nIGl0PyBhcyB3ZSBkb24ndCBoYXZlIGFjY2VzcyB0byBib2R5IGZyb20gdGhlbWUgc3R5bGVzXG4gICAgLy8gVE9ETzogYWRkIGUyZSB0ZXN0XG4gICAgY29uc3QgYm9keSA9IHRoaXMuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXTtcbiAgICBpZiAodGhpcy53aXRoU2Nyb2xsVmFsdWUpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoYm9keSwgJ292ZXJmbG93JywgJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJvZHksICdvdmVyZmxvdycsICdpbml0aWFsJyk7XG4gICAgfVxuICB9XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV93aXRoU2Nyb2xsOiBOYkJvb2xlYW5JbnB1dDtcblxuICAvKipcbiAgICogUmVzdG9yZXMgc2Nyb2xsIHRvIHRoZSB0b3Agb2YgdGhlIHBhZ2UgYWZ0ZXIgbmF2aWdhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbFxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHJlc3RvcmVTY3JvbGxUb3AodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5yZXN0b3JlU2Nyb2xsVG9wVmFsdWUgPSBjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsKTtcbiAgfVxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVzdG9yZVNjcm9sbFRvcDogTmJCb29sZWFuSW5wdXQ7XG5cbiAgLy8gVE9ETyByZW1vdmUgYXMgb2YgNS4wLjBcbiAgQFZpZXdDaGlsZCgnbGF5b3V0VG9wRHluYW1pY0FyZWEnLCB7IHJlYWQ6IFZpZXdDb250YWluZXJSZWYgfSkgdmVyeVRvcFJlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICBAVmlld0NoaWxkKCdzY3JvbGxhYmxlQ29udGFpbmVyJywgeyByZWFkOiBFbGVtZW50UmVmLCBzdGF0aWM6IHRydWUgfSlcbiAgc2Nyb2xsYWJsZUNvbnRhaW5lclJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG5cbiAgQFZpZXdDaGlsZCgnbGF5b3V0Q29udGFpbmVyJywgeyByZWFkOiBFbGVtZW50UmVmIH0pXG4gIGxheW91dENvbnRhaW5lclJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG5cbiAgcHJvdGVjdGVkIGFmdGVyVmlld0luaXQkID0gbmV3IEJlaGF2aW9yU3ViamVjdChudWxsKTtcblxuICBwcml2YXRlIGRlc3Ryb3kkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgdGhlbWVTZXJ2aWNlOiBOYlRoZW1lU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgc3Bpbm5lclNlcnZpY2U6IE5iU3Bpbm5lclNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgQEluamVjdChOQl9XSU5ET1cpIHByb3RlY3RlZCB3aW5kb3csXG4gICAgQEluamVjdChOQl9ET0NVTUVOVCkgcHJvdGVjdGVkIGRvY3VtZW50LFxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByb3RlY3RlZCBwbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgcHJvdGVjdGVkIGxheW91dERpcmVjdGlvblNlcnZpY2U6IE5iTGF5b3V0RGlyZWN0aW9uU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgc2Nyb2xsU2VydmljZTogTmJMYXlvdXRTY3JvbGxTZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBydWxlclNlcnZpY2U6IE5iTGF5b3V0UnVsZXJTZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBzY3JvbGxUb3A6IE5iUmVzdG9yZVNjcm9sbFRvcEhlbHBlcixcbiAgICBwcm90ZWN0ZWQgb3ZlcmxheUNvbnRhaW5lcjogTmJPdmVybGF5Q29udGFpbmVyQWRhcHRlcixcbiAgKSB7XG4gICAgdGhpcy5yZWdpc3RlckFzT3ZlcmxheUNvbnRhaW5lcigpO1xuXG4gICAgdGhpcy50aGVtZVNlcnZpY2VcbiAgICAgIC5vblRoZW1lQ2hhbmdlKClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSlcbiAgICAgIC5zdWJzY3JpYmUoKHRoZW1lOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgYm9keSA9IHRoaXMuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXTtcbiAgICAgICAgaWYgKHRoZW1lLnByZXZpb3VzKSB7XG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyhib2R5LCBgbmItdGhlbWUtJHt0aGVtZS5wcmV2aW91c31gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKGJvZHksIGBuYi10aGVtZS0ke3RoZW1lLm5hbWV9YCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMudGhlbWVTZXJ2aWNlXG4gICAgICAub25BcHBlbmRMYXlvdXRDbGFzcygpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpXG4gICAgICAuc3Vic2NyaWJlKChjbGFzc05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCBjbGFzc05hbWUpO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLnRoZW1lU2VydmljZVxuICAgICAgLm9uUmVtb3ZlTGF5b3V0Q2xhc3MoKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKVxuICAgICAgLnN1YnNjcmliZSgoY2xhc3NOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgY2xhc3NOYW1lKTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5zcGlubmVyU2VydmljZS5yZWdpc3RlckxvYWRlcihcbiAgICAgIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuYWZ0ZXJWaWV3SW5pdCQucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpLnN1YnNjcmliZSgoXykgPT4gcmVzb2x2ZSgpKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5zcGlubmVyU2VydmljZS5sb2FkKCk7XG5cbiAgICB0aGlzLnJ1bGVyU2VydmljZVxuICAgICAgLm9uR2V0RGltZW5zaW9ucygpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpXG4gICAgICAuc3Vic2NyaWJlKCh7IGxpc3RlbmVyIH0pID0+IHtcbiAgICAgICAgbGlzdGVuZXIubmV4dCh0aGlzLmdldERpbWVuc2lvbnMoKSk7XG4gICAgICAgIGxpc3RlbmVyLmNvbXBsZXRlKCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuc2Nyb2xsU2VydmljZVxuICAgICAgLm9uR2V0UG9zaXRpb24oKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKVxuICAgICAgLnN1YnNjcmliZSgoeyBsaXN0ZW5lciB9KSA9PiB7XG4gICAgICAgIGxpc3RlbmVyLm5leHQodGhpcy5nZXRTY3JvbGxQb3NpdGlvbigpKTtcbiAgICAgICAgbGlzdGVuZXIuY29tcGxldGUoKTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5zY3JvbGxUb3BcbiAgICAgIC5zaG91bGRSZXN0b3JlKClcbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIoKCkgPT4gdGhpcy5yZXN0b3JlU2Nyb2xsVG9wVmFsdWUpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95JCksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5zY3JvbGwoMCwgMCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuc2Nyb2xsU2VydmljZVxuICAgICAgLm9uU2Nyb2xsYWJsZUNoYW5nZSgpXG4gICAgICAucGlwZShmaWx0ZXIoKCkgPT4gdGhpcy53aXRoU2Nyb2xsVmFsdWUpLCB0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpXG4gICAgICAuc3Vic2NyaWJlKChzY3JvbGxhYmxlOiBib29sZWFuKSA9PiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbiBjYXNlIHdoZW4gTmVidWxhciBMYXlvdXQgY3VzdG9tIHNjcm9sbCBgd2l0aFNjcm9sbGAgbW9kZSBpcyBlbmFibGVkXG4gICAgICAgICAqIHdlIG5lZWQgdG8gZGlzYWJsZSBkZWZhdWx0IENESyBzY3JvbGwgYmxvY2tlciAoQGxpbmsgTmJCbG9ja1Njcm9sbFN0cmF0ZWd5QWRhcHRlcikgb24gSFRNTCBlbGVtZW50XG4gICAgICAgICAqIHNvIHRoYXQgaXQgd29uJ3QgYWRkIGFkZGl0aW9uYWwgcG9zaXRpb25pbmcuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoc2Nyb2xsYWJsZSkge1xuICAgICAgICAgIHRoaXMuZW5hYmxlU2Nyb2xsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ibG9ja1Njcm9sbCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIGlmIChpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLnBsYXRmb3JtSWQpKSB7XG4gICAgICAvLyB0cmlnZ2VyIGZpcnN0IHRpbWUgc28gdGhhdCBhZnRlciB0aGUgY2hhbmdlIHdlIGhhdmUgdGhlIGluaXRpYWwgdmFsdWVcbiAgICAgIHRoaXMudGhlbWVTZXJ2aWNlLmNoYW5nZVdpbmRvd1dpZHRoKHRoaXMud2luZG93LmlubmVyV2lkdGgpO1xuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLmxheW91dERpcmVjdGlvblNlcnZpY2VcbiAgICAgIC5vbkRpcmVjdGlvbkNoYW5nZSgpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpXG4gICAgICAuc3Vic2NyaWJlKChkaXJlY3Rpb24pID0+ICh0aGlzLmRvY3VtZW50LmRpciA9IGRpcmVjdGlvbikpO1xuXG4gICAgdGhpcy5zY3JvbGxTZXJ2aWNlXG4gICAgICAub25NYW51YWxTY3JvbGwoKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKVxuICAgICAgLnN1YnNjcmliZSgoeyB4LCB5IH06IE5iU2Nyb2xsUG9zaXRpb24pID0+IHRoaXMuc2Nyb2xsKHgsIHkpKTtcblxuICAgIHRoaXMuYWZ0ZXJWaWV3SW5pdCQubmV4dCh0cnVlKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveSQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveSQuY29tcGxldGUoKTtcbiAgICB0aGlzLnVucmVnaXN0ZXJBc092ZXJsYXlDb250YWluZXIoKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzpzY3JvbGwnLCBbJyRldmVudCddKVxuICBvblNjcm9sbCgkZXZlbnQpIHtcbiAgICB0aGlzLnNjcm9sbFNlcnZpY2UuZmlyZVNjcm9sbENoYW5nZSgkZXZlbnQpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignd2luZG93OnJlc2l6ZScsIFsnJGV2ZW50J10pXG4gIG9uUmVzaXplKGV2ZW50KSB7XG4gICAgdGhpcy50aGVtZVNlcnZpY2UuY2hhbmdlV2luZG93V2lkdGgoZXZlbnQudGFyZ2V0LmlubmVyV2lkdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc2Nyb2xsIGFuZCBjbGllbnQgaGVpZ2h0L3dpZHRoXG4gICAqXG4gICAqIERlcGVuZGluZyBvbiB0aGUgY3VycmVudCBzY3JvbGwgbW9kZSAoYHdpdGhTY3JvbGw9dHJ1ZWApIHJldHVybnMgc2l6ZXMgZnJvbSB0aGUgYm9keSBlbGVtZW50XG4gICAqIG9yIGZyb20gdGhlIGAuc2Nyb2xsYWJsZS1jb250YWluZXJgXG4gICAqIEByZXR1cm5zIHtOYkxheW91dERpbWVuc2lvbnN9XG4gICAqL1xuICBnZXREaW1lbnNpb25zKCk6IE5iTGF5b3V0RGltZW5zaW9ucyB7XG4gICAgbGV0IGNsaWVudFdpZHRoLFxuICAgICAgY2xpZW50SGVpZ2h0LFxuICAgICAgc2Nyb2xsV2lkdGgsXG4gICAgICBzY3JvbGxIZWlnaHQgPSAwO1xuICAgIGlmICh0aGlzLndpdGhTY3JvbGxWYWx1ZSkge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5zY3JvbGxhYmxlQ29udGFpbmVyUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICBjbGllbnRXaWR0aCA9IGNvbnRhaW5lci5jbGllbnRXaWR0aDtcbiAgICAgIGNsaWVudEhlaWdodCA9IGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICBzY3JvbGxXaWR0aCA9IGNvbnRhaW5lci5zY3JvbGxXaWR0aDtcbiAgICAgIHNjcm9sbEhlaWdodCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHsgZG9jdW1lbnRFbGVtZW50LCBib2R5IH0gPSB0aGlzLmRvY3VtZW50O1xuICAgICAgY2xpZW50V2lkdGggPSBkb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgYm9keS5jbGllbnRXaWR0aDtcbiAgICAgIGNsaWVudEhlaWdodCA9IGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgYm9keS5jbGllbnRIZWlnaHQ7XG4gICAgICBzY3JvbGxXaWR0aCA9IGRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCB8fCBib2R5LnNjcm9sbFdpZHRoO1xuICAgICAgc2Nyb2xsSGVpZ2h0ID0gZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCB8fCBib2R5LnNjcm9sbEhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2xpZW50V2lkdGgsXG4gICAgICBjbGllbnRIZWlnaHQsXG4gICAgICBzY3JvbGxXaWR0aCxcbiAgICAgIHNjcm9sbEhlaWdodCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc2Nyb2xsIHBvc2l0aW9uIG9mIGN1cnJlbnQgc2Nyb2xsIGNvbnRhaW5lci5cbiAgICpcbiAgICogSWYgYHdpdGhTY3JvbGxgID0gdHJ1ZSwgcmV0dXJucyBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIGAuc2Nyb2xsYWJsZS1jb250YWluZXJgIGVsZW1lbnQsXG4gICAqIG90aGVyd2lzZSAtIG9mIHRoZSBzY3JvbGxhYmxlIGVsZW1lbnQgb2YgdGhlIHdpbmRvdyAod2hpY2ggbWF5IGJlIGRpZmZlcmVudCBkZXBlbmRpbmcgb2YgYSBicm93c2VyKVxuICAgKlxuICAgKiBAcmV0dXJucyB7TmJTY3JvbGxQb3NpdGlvbn1cbiAgICovXG4gIGdldFNjcm9sbFBvc2l0aW9uKCk6IE5iU2Nyb2xsUG9zaXRpb24ge1xuICAgIGlmICghaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xuICAgICAgcmV0dXJuIHsgeDogMCwgeTogMCB9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLndpdGhTY3JvbGxWYWx1ZSkge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5zY3JvbGxhYmxlQ29udGFpbmVyUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICByZXR1cm4geyB4OiBjb250YWluZXIuc2Nyb2xsTGVmdCwgeTogY29udGFpbmVyLnNjcm9sbFRvcCB9O1xuICAgIH1cblxuICAgIGNvbnN0IGRvY3VtZW50UmVjdCA9IHRoaXMuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgY29uc3QgeCA9XG4gICAgICAtZG9jdW1lbnRSZWN0LmxlZnQgfHxcbiAgICAgIHRoaXMuZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0IHx8XG4gICAgICB0aGlzLndpbmRvdy5zY3JvbGxYIHx8XG4gICAgICB0aGlzLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8XG4gICAgICAwO1xuXG4gICAgY29uc3QgeSA9XG4gICAgICAtZG9jdW1lbnRSZWN0LnRvcCB8fFxuICAgICAgdGhpcy5kb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fFxuICAgICAgdGhpcy53aW5kb3cuc2Nyb2xsWSB8fFxuICAgICAgdGhpcy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8XG4gICAgICAwO1xuXG4gICAgcmV0dXJuIHsgeCwgeSB9O1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyQXNPdmVybGF5Q29udGFpbmVyKCkge1xuICAgIGlmICh0aGlzLm92ZXJsYXlDb250YWluZXIuc2V0Q29udGFpbmVyKSB7XG4gICAgICB0aGlzLm92ZXJsYXlDb250YWluZXIuc2V0Q29udGFpbmVyKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgdW5yZWdpc3RlckFzT3ZlcmxheUNvbnRhaW5lcigpIHtcbiAgICBpZiAodGhpcy5vdmVybGF5Q29udGFpbmVyLmNsZWFyQ29udGFpbmVyKSB7XG4gICAgICB0aGlzLm92ZXJsYXlDb250YWluZXIuY2xlYXJDb250YWluZXIoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNjcm9sbCh4OiBudW1iZXIgPSBudWxsLCB5OiBudW1iZXIgPSBudWxsKSB7XG4gICAgY29uc3QgeyB4OiBjdXJyZW50WCwgeTogY3VycmVudFkgfSA9IHRoaXMuZ2V0U2Nyb2xsUG9zaXRpb24oKTtcbiAgICB4ID0geCA9PSBudWxsID8gY3VycmVudFggOiB4O1xuICAgIHkgPSB5ID09IG51bGwgPyBjdXJyZW50WSA6IHk7XG5cbiAgICBpZiAoIWlzUGxhdGZvcm1Ccm93c2VyKHRoaXMucGxhdGZvcm1JZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMud2l0aFNjcm9sbFZhbHVlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5zY3JvbGxhYmxlQ29udGFpbmVyUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICBpZiAoc2Nyb2xsYWJsZS5zY3JvbGxUbykge1xuICAgICAgICBzY3JvbGxhYmxlLnNjcm9sbFRvKHgsIHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Nyb2xsYWJsZS5zY3JvbGxMZWZ0ID0geDtcbiAgICAgICAgc2Nyb2xsYWJsZS5zY3JvbGxUb3AgPSB5O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndpbmRvdy5zY3JvbGxUbyh4LCB5KTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPOiBFeHRyYWN0IGludG8gYmxvY2sgc2Nyb2xsIHN0cmF0ZWd5XG4gIHByb3RlY3RlZCBibG9ja1Njcm9sbCgpIHtcbiAgICBpZiAodGhpcy5pc1Njcm9sbEJsb2NrZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmlzU2Nyb2xsQmxvY2tlZCA9IHRydWU7XG5cbiAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB0aGlzLnNjcm9sbEJsb2NrQ2xhc3MpO1xuXG4gICAgY29uc3Qgc2Nyb2xsYWJsZUNvbnRhaW5lckVsZW1lbnQgPSB0aGlzLnNjcm9sbGFibGVDb250YWluZXJSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCBsYXlvdXRFbGVtZW50ID0gdGhpcy5sYXlvdXRDb250YWluZXJSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIGNvbnN0IGxheW91dFdpdGhTY3JvbGxXaWR0aCA9IGxheW91dEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgdGhpcy5zY3JvbGxhYmxlQ29udGFpbmVyT3ZlcmZsb3dPbGRWYWx1ZSA9IHNjcm9sbGFibGVDb250YWluZXJFbGVtZW50LnN0eWxlLm92ZXJmbG93O1xuICAgIHNjcm9sbGFibGVDb250YWluZXJFbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgY29uc3QgbGF5b3V0V2l0aG91dFNjcm9sbFdpZHRoID0gbGF5b3V0RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICBjb25zdCBzY3JvbGxXaWR0aCA9IGxheW91dFdpdGhvdXRTY3JvbGxXaWR0aCAtIGxheW91dFdpdGhTY3JvbGxXaWR0aDtcblxuICAgIGlmICghc2Nyb2xsV2lkdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmxheW91dFBhZGRpbmdPbGRWYWx1ZSA9IHtcbiAgICAgIGxlZnQ6IGxheW91dEVsZW1lbnQuc3R5bGUucGFkZGluZ0xlZnQsXG4gICAgICByaWdodDogbGF5b3V0RWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQsXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmxheW91dERpcmVjdGlvblNlcnZpY2UuaXNMdHIoKSkge1xuICAgICAgbGF5b3V0RWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSBgJHtzY3JvbGxXaWR0aH1weGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxheW91dEVsZW1lbnQuc3R5bGUucGFkZGluZ0xlZnQgPSBgJHtzY3JvbGxXaWR0aH1weGA7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBlbmFibGVTY3JvbGwoKSB7XG4gICAgaWYgKHRoaXMuaXNTY3JvbGxCbG9ja2VkKSB7XG4gICAgICB0aGlzLmlzU2Nyb2xsQmxvY2tlZCA9IGZhbHNlO1xuXG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB0aGlzLnNjcm9sbEJsb2NrQ2xhc3MpO1xuICAgICAgdGhpcy5zY3JvbGxhYmxlQ29udGFpbmVyUmVmLm5hdGl2ZUVsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSB0aGlzLnNjcm9sbGFibGVDb250YWluZXJPdmVyZmxvd09sZFZhbHVlO1xuXG4gICAgICBpZiAodGhpcy5sYXlvdXRQYWRkaW5nT2xkVmFsdWUpIHtcbiAgICAgICAgY29uc3QgbGF5b3V0RWxlbWVudCA9IHRoaXMubGF5b3V0Q29udGFpbmVyUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGxheW91dEVsZW1lbnQuc3R5bGUucGFkZGluZ0xlZnQgPSB0aGlzLmxheW91dFBhZGRpbmdPbGRWYWx1ZS5sZWZ0O1xuICAgICAgICBsYXlvdXRFbGVtZW50LnN0eWxlLnBhZGRpbmdSaWdodCA9IHRoaXMubGF5b3V0UGFkZGluZ09sZFZhbHVlLnJpZ2h0O1xuICAgICAgICB0aGlzLmxheW91dFBhZGRpbmdPbGRWYWx1ZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSBjb250YWluZXIgY29tcG9uZW50IHdoaWNoIGRldGVybWluZXMgYSBjb250ZW50IHBvc2l0aW9uIGluc2lkZSBvZiB0aGUgbGF5b3V0LlxuICogVGhlIGxheW91dCBjb3VsZCBjb250YWluIHVubGltaXRlZCBjb2x1bW5zIChub3QgaW5jbHVkaW5nIHRoZSBzaWRlYmFycykuXG4gKlxuICogQnkgZGVmYXVsdCB0aGUgY29sdW1ucyBhcmUgb3JkZXJlZCBmcm9tIHRoZSBsZWZ0IHRvIHRoZSByaWdodCxcbiAqIGJ1dCBpdCdzIGFsc28gcG9zc2libGUgdG8gb3ZlcndyaXRlIHRoaXMgYmVoYXZpb3IgYnkgc2V0dGluZyBhIGBsZWZ0YCBhdHRyaWJ1dGUgdG8gdGhlIGNvbHVtbixcbiAqIG1vdmluZyBpdCB0byB0aGUgdmVyeSBmaXJzdCBwb3NpdGlvbjpcbiAqXG4gKiBAc3RhY2tlZC1leGFtcGxlKENvbHVtbiBMZWZ0LCBsYXlvdXQvbGF5b3V0LWNvbHVtbi1sZWZ0LmNvbXBvbmVudClcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmItbGF5b3V0LWNvbHVtbicsXG4gIHRlbXBsYXRlOiBgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PmAsXG59KVxuZXhwb3J0IGNsYXNzIE5iTGF5b3V0Q29sdW1uQ29tcG9uZW50IHtcbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5sZWZ0JykgbGVmdFZhbHVlOiBib29sZWFuO1xuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnN0YXJ0Jykgc3RhcnRWYWx1ZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogTW92ZSB0aGUgY29sdW1uIHRvIHRoZSB2ZXJ5IGxlZnQgcG9zaXRpb24gaW4gdGhlIGxheW91dC5cbiAgICogQHBhcmFtIHtib29sZWFufSB2YWxcbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBsZWZ0KHZhbDogYm9vbGVhbikge1xuICAgIHRoaXMubGVmdFZhbHVlID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbCk7XG4gICAgdGhpcy5zdGFydFZhbHVlID0gZmFsc2U7XG4gIH1cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xlZnQ6IE5iQm9vbGVhbklucHV0O1xuXG4gIC8qKlxuICAgKiBNYWtlIGNvbHVtbiBmaXJzdCBpbiB0aGUgbGF5b3V0LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbFxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHN0YXJ0KHZhbDogYm9vbGVhbikge1xuICAgIHRoaXMuc3RhcnRWYWx1ZSA9IGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSh2YWwpO1xuICAgIHRoaXMubGVmdFZhbHVlID0gZmFsc2U7XG4gIH1cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0YXJ0OiBOYkJvb2xlYW5JbnB1dDtcbn1cblxuLyoqXG4gKiBQYWdlIGhlYWRlciBjb21wb25lbnQuXG4gKiBMb2NhdGVkIG9uIHRvcCBvZiB0aGUgcGFnZSBhYm92ZSB0aGUgbGF5b3V0IGNvbHVtbnMgYW5kIHNpZGViYXJzLlxuICogQ291bGQgYmUgbWFkZSBgZml4ZWRgIGJ5IHNldHRpbmcgdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkuIEluIHRoZSBmaXhlZCBtb2RlIHRoZSBoZWFkZXIgYmVjb21lc1xuICogc3RpY2t5IHRvIHRoZSB0b3Agb2YgdGhlIG5iLWxheW91dCAodG8gb2YgdGhlIHBhZ2UpLiBIZXJlJ3MgYW4gZXhhbXBsZTpcbiAqXG4gKiBAc3RhY2tlZC1leGFtcGxlKEZpeGVkIEhlYWRlciwgbGF5b3V0L2xheW91dC1maXhlZC1oZWFkZXIuY29tcG9uZW50KVxuICpcbiAqIEluIGEgcGFpciB3aXRoIHNpZGViYXIgaXQgaXMgcG9zc2libGUgdG8gc2V0dXAgYSBjb25maWd1cmF0aW9uIHdoZW4gaGVhZGVyIGlzIHBsYWNlZCBvbiBhIHNpZGUgb2YgdGhlIHNpZGViYXJcbiAqIGFuZCBub3Qgb24gdG9wIG9mIGl0LiBUbyBhY2hpZXZlIHRoaXMgc2ltcGx5IHB1dCBhIGBzdWJoZWFkZXJgIHByb3BlcnR5IHRvIHRoZSBoZWFkZXIgbGlrZSB0aGlzOlxuICogYGBgaHRtbFxuICogPG5iLWxheW91dC1oZWFkZXIgc3ViaGVhZGVyPjwvbmItbGF5b3V0LWhlYWRlcj5cbiAqIGBgYFxuICogQHN0YWNrZWQtZXhhbXBsZShTdWJoZWFkZXIsIGxheW91dC9sYXlvdXQtc2lkZWJhci1zdWJoZWFkZXIuY29tcG9uZW50KVxuICogTm90ZSB0aGF0IGluIHN1Y2ggY29uZmlndXJhdGlvbiBzaWRlYmFyIHNoYWRvdyBpcyByZW1vdmVkIGFuZCBoZWFkZXIgY2Fubm90IGJlIG1ha2UgYGZpeGVkYC5cbiAqXG4gKiBTYW1lIHdheSB5b3UgY2FuIHB1dCBib3RoIGBmaXhlZGAgYW5kIGBjbGlwcGVkYCBoZWFkZXJzIGFkZGluZyBjcmVhdGluZyBhIHN1Yi1oZWFkZXIgZm9yIHlvdXIgYXBwOlxuICpcbiAqIEBzdGFja2VkLWV4YW1wbGUoU3ViaGVhZGVyLCBsYXlvdXQvbGF5b3V0LXN1YmhlYWRlci5jb21wb25lbnQpXG4gKlxuICogQHN0eWxlc1xuICpcbiAqIGhlYWRlci1iYWNrZ3JvdW5kLWNvbG9yOlxuICogaGVhZGVyLXRleHQtY29sb3I6XG4gKiBoZWFkZXItdGV4dC1mb250LWZhbWlseTpcbiAqIGhlYWRlci10ZXh0LWZvbnQtc2l6ZTpcbiAqIGhlYWRlci10ZXh0LWZvbnQtd2VpZ2h0OlxuICogaGVhZGVyLXRleHQtbGluZS1oZWlnaHQ6XG4gKiBoZWFkZXItaGVpZ2h0OlxuICogaGVhZGVyLXBhZGRpbmc6XG4gKiBoZWFkZXItc2hhZG93OlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduYi1sYXlvdXQtaGVhZGVyJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmF2IFtjbGFzcy5maXhlZF09XCJmaXhlZFZhbHVlXCI+XG4gICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgPC9uYXY+XG4gIGAsXG59KVxuZXhwb3J0IGNsYXNzIE5iTGF5b3V0SGVhZGVyQ29tcG9uZW50IHtcbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5maXhlZCcpIGZpeGVkVmFsdWU6IGJvb2xlYW47XG4gIEBIb3N0QmluZGluZygnY2xhc3Muc3ViaGVhZGVyJykgc3ViaGVhZGVyVmFsdWU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBsYXlvdXQ6IE5iTGF5b3V0Q29tcG9uZW50KSB7fVxuXG4gIC8qKlxuICAgKiBNYWtlcyB0aGUgaGVhZGVyIHN0aWNreSB0byB0aGUgdG9wIG9mIHRoZSBuYi1sYXlvdXQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgZml4ZWQodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5maXhlZFZhbHVlID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbCk7XG4gIH1cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ZpeGVkOiBOYkJvb2xlYW5JbnB1dDtcblxuICAvKipcbiAgICogUGxhY2VzIGhlYWRlciBvbiBhIHNpZGUgb2YgdGhlIHNpZGViYXIsIGFuZCBub3QgYWJvdmUuXG4gICAqIERpc2FibGVzIGZpeGVkIG1vZGUgZm9yIHRoaXMgaGVhZGVyIGFuZCByZW1vdmUgYSBzaGFkb3cgZnJvbSB0aGUgc2lkZWJhci5cbiAgICogQHBhcmFtIHtib29sZWFufSB2YWxcbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBzdWJoZWFkZXIodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5zdWJoZWFkZXJWYWx1ZSA9IGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSh2YWwpO1xuICAgIHRoaXMuZml4ZWRWYWx1ZSA9IGZhbHNlO1xuICAgIHRoaXMubGF5b3V0LndpdGhTdWJoZWFkZXIgPSB0aGlzLnN1YmhlYWRlclZhbHVlO1xuICB9XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdWJoZWFkZXI6IE5iQm9vbGVhbklucHV0O1xufVxuXG4vKipcbiAqIFBhZ2UgZm9vdGVyLlxuICogTG9jYXRlZCB1bmRlciB0aGUgbmItbGF5b3V0IGNvbnRlbnQgKHNwZWNpZmljYWxseSwgdW5kZXIgdGhlIGNvbHVtbnMpLlxuICogQ291bGQgYmUgbWFkZSBgZml4ZWRgLCBiZWNvbWluZyBzdGlja3kgdG8gdGhlIGJvdHRvbSBvZiB0aGUgdmlldyBwb3J0ICh3aW5kb3cpLlxuICpcbiAqIEBzdHlsZXNcbiAqXG4gKiBmb290ZXItYmFja2dyb3VuZC1jb2xvcjpcbiAqIGZvb3Rlci10ZXh0LWNvbG9yOlxuICogZm9vdGVyLXRleHQtZm9udC1mYW1pbHk6XG4gKiBmb290ZXItdGV4dC1mb250LXNpemU6XG4gKiBmb290ZXItdGV4dC1mb250LXdlaWdodDpcbiAqIGZvb3Rlci10ZXh0LWxpbmUtaGVpZ2h0OlxuICogZm9vdGVyLXRleHQtaGlnaGxpZ2h0LWNvbG9yOlxuICogZm9vdGVyLWhlaWdodDpcbiAqIGZvb3Rlci1wYWRkaW5nOlxuICogZm9vdGVyLWRpdmlkZXItY29sb3I6XG4gKiBmb290ZXItZGl2aWRlci1zdHlsZTpcbiAqIGZvb3Rlci1kaXZpZGVyLXdpZHRoOlxuICogZm9vdGVyLXNoYWRvdzpcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmItbGF5b3V0LWZvb3RlcicsXG4gIHRlbXBsYXRlOiBgXG4gICAgPG5hdiBbY2xhc3MuZml4ZWRdPVwiZml4ZWRWYWx1ZVwiPlxuICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgIDwvbmF2PlxuICBgLFxufSlcbmV4cG9ydCBjbGFzcyBOYkxheW91dEZvb3RlckNvbXBvbmVudCB7XG4gIEBIb3N0QmluZGluZygnY2xhc3MuZml4ZWQnKSBmaXhlZFZhbHVlOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBNYWtlcyB0aGUgZm9vdGVyIHN0aWNreSB0byB0aGUgYm90dG9tIG9mIHRoZSB3aW5kb3cuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgZml4ZWQodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5maXhlZFZhbHVlID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbCk7XG4gIH1cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ZpeGVkOiBOYkJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==