/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { ChangeDetectionStrategy, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, forwardRef, HostBinding, Inject, Input, Output, ViewChild, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject, BehaviorSubject, from, combineLatest, animationFrameScheduler, EMPTY } from 'rxjs';
import { startWith, switchMap, takeUntil, filter, map, finalize, take, observeOn } from 'rxjs/operators';
import { NbAdjustment, NbPosition, } from '../cdk/overlay/overlay-position';
import { NbPortalDirective } from '../cdk/overlay/mapping';
import { NbTrigger } from '../cdk/overlay/overlay-trigger';
import { ENTER, ESCAPE } from '../cdk/keycodes/keycodes';
import { NB_DOCUMENT } from '../../theme.options';
import { NbOptionComponent } from '../option/option.component';
import { convertToBoolProperty } from '../helpers';
import { NB_SELECT_INJECTION_TOKEN } from '../select/select-injection-tokens';
import { NbFormFieldControl, NbFormFieldControlConfig } from '../form-field/form-field-control';
import { nbSelectFormFieldControlConfigFactory, NbSelectLabelComponent, } from '../select/select.component';
import * as i0 from "@angular/core";
import * as i1 from "../cdk/overlay/overlay-service";
import * as i2 from "../cdk/overlay/overlay-position";
import * as i3 from "../cdk/overlay/overlay-trigger";
import * as i4 from "../cdk/a11y/focus-key-manager";
import * as i5 from "../cdk/a11y/a11y.module";
import * as i6 from "../../services/status.service";
import * as i7 from "../cdk/a11y/descendant-key-manager";
import * as i8 from "@angular/common";
import * as i9 from "../cdk/overlay/mapping";
import * as i10 from "../input/input.directive";
import * as i11 from "../icon/icon.component";
import * as i12 from "../option/option-list.component";
import * as i13 from "../form-field/form-field.component";
import * as i14 from "../form-field/suffix.directive";
/**
 * Experimental component with autocomplete possibility.
 * Could be changed without any prior notice.
 * Use at your own risk.
 *
 * Style variables is fully inherited.
 * Component's public API (`@Input()` and `@Output()`) works in a same way as NbSelectComponent.
 */
export class NbSelectWithAutocompleteComponent {
    constructor(document, overlay, hostRef, positionBuilder, triggerStrategyBuilder, cd, focusKeyManagerFactoryService, focusMonitor, renderer, zone, statusService, activeDescendantKeyManagerFactoryService) {
        this.document = document;
        this.overlay = overlay;
        this.hostRef = hostRef;
        this.positionBuilder = positionBuilder;
        this.triggerStrategyBuilder = triggerStrategyBuilder;
        this.cd = cd;
        this.focusKeyManagerFactoryService = focusKeyManagerFactoryService;
        this.focusMonitor = focusMonitor;
        this.renderer = renderer;
        this.zone = zone;
        this.statusService = statusService;
        this.activeDescendantKeyManagerFactoryService = activeDescendantKeyManagerFactoryService;
        /**
         * Select size, available sizes:
         * `tiny`, `small`, `medium` (default), `large`, `giant`
         */
        this.size = 'medium';
        /**
         * Select status (adds specific styles):
         * `basic`, `primary`, `info`, `success`, `warning`, `danger`, `control`
         */
        this.status = 'basic';
        /**
         * Select shapes: `rectangle` (default), `round`, `semi-round`
         */
        this.shape = 'rectangle';
        /**
         * Select appearances: `outline` (default), `filled`, `hero`
         */
        this.appearance = 'outline';
        this._fullWidth = false;
        /**
         * Renders select placeholder if nothing selected.
         * */
        this.placeholder = '';
        this._compareWith = (v1, v2) => v1 === v2;
        this._multiple = false;
        /**
         * Determines options overlay offset (in pixels).
         **/
        this.optionsOverlayOffset = 8;
        /**
         * Determines options overlay scroll strategy.
         **/
        this.scrollStrategy = 'block';
        this._withOptionsAutocomplete = false;
        /**
         * Will be emitted when selected value changes.
         * */
        this.selectedChange = new EventEmitter();
        this.selectOpen = new EventEmitter();
        this.selectClose = new EventEmitter();
        this.optionsAutocompleteInputChange = new EventEmitter();
        /**
         * List of selected options.
         * */
        this.selectionModel = [];
        this.positionStrategy$ = new BehaviorSubject(undefined);
        /**
         * Current overlay position because of we have to toggle overlayPosition
         * in [ngClass] direction and this directive can use only string.
         */
        this.overlayPosition = '';
        this.alive = true;
        this.destroy$ = new Subject();
        /**
         * Function passed through control value accessor to propagate changes.
         * */
        this.onChange = () => { };
        this.onTouched = () => { };
        /*
         * @docs-private
         **/
        this.status$ = new BehaviorSubject(this.status);
        /*
         * @docs-private
         **/
        this.size$ = new BehaviorSubject(this.size);
        /*
         * @docs-private
         **/
        this.focused$ = new BehaviorSubject(false);
        /*
         * @docs-private
         **/
        this.disabled$ = new BehaviorSubject(this.disabled);
        /*
         * @docs-private
         **/
        this.fullWidth$ = new BehaviorSubject(this.fullWidth);
        this.lastShownButtonWidth = undefined;
    }
    /**
     * Specifies width (in pixels) to be set on `nb-option`s container (`nb-option-list`)
     * */
    get optionsWidth() {
        return this._optionsWidth ?? this.hostWidth;
    }
    set optionsWidth(value) {
        this._optionsWidth = value;
    }
    /**
     * Adds `outline` styles
     */
    get outline() {
        return this.appearance === 'outline';
    }
    set outline(value) {
        if (convertToBoolProperty(value)) {
            this.appearance = 'outline';
        }
    }
    /**
     * Adds `filled` styles
     */
    get filled() {
        return this.appearance === 'filled';
    }
    set filled(value) {
        if (convertToBoolProperty(value)) {
            this.appearance = 'filled';
        }
    }
    /**
     * Adds `hero` styles
     */
    get hero() {
        return this.appearance === 'hero';
    }
    set hero(value) {
        if (convertToBoolProperty(value)) {
            this.appearance = 'hero';
        }
    }
    /**
     * Disables the select
     */
    get disabled() {
        return !!this._disabled;
    }
    set disabled(value) {
        this._disabled = convertToBoolProperty(value);
    }
    /**
     * If set element will fill its container
     */
    get fullWidth() {
        return this._fullWidth;
    }
    set fullWidth(value) {
        this._fullWidth = convertToBoolProperty(value);
    }
    /**
     * A function to compare option value with selected value.
     * By default, values are compared with strict equality (`===`).
     */
    get compareWith() {
        return this._compareWith;
    }
    set compareWith(fn) {
        if (typeof fn !== 'function') {
            return;
        }
        this._compareWith = fn;
        if (this.selectionModel.length && this.canSelectValue()) {
            this.setSelection(this.selected);
        }
    }
    /**
     * Accepts selected item or array of selected items.
     * */
    set selected(value) {
        this.writeValue(value);
    }
    get selected() {
        return this.multiple ? this.selectionModel.map((o) => o.value) : this.selectionModel[0].value;
    }
    /**
     * Gives capability just write `multiple` over the element.
     * */
    get multiple() {
        return this._multiple;
    }
    set multiple(value) {
        this._multiple = convertToBoolProperty(value);
        this.updatePositionStrategy();
        this.updateCurrentKeyManager();
    }
    /**
     * Experimental input.
     * Could be changed without any prior notice.
     * Use at your own risk.
     *
     * It replaces the button with input when the select is opened.
     * That replacement provides a very basic API to implement options filtering functionality.
     * Filtering itself isn't implemented inside select.
     * So it should be implemented by the user.
     */
    set withOptionsAutocomplete(value) {
        this._withOptionsAutocomplete = convertToBoolProperty(value);
        this.updatePositionStrategy();
        this.updateCurrentKeyManager();
        if (!value) {
            this.resetAutocompleteInput();
        }
    }
    get withOptionsAutocomplete() {
        return this._withOptionsAutocomplete;
    }
    get additionalClasses() {
        if (this.statusService.isCustomStatus(this.status)) {
            return [this.statusService.getStatusClass(this.status)];
        }
        return [];
    }
    /**
     * Determines is select opened.
     * */
    get isOpen() {
        return this.ref && this.ref.hasAttached();
    }
    get isOptionsAutocompleteAllowed() {
        return this.withOptionsAutocomplete && !this.multiple;
    }
    get isOptionsAutocompleteInputShown() {
        return this.isOptionsAutocompleteAllowed && this.isOpen;
    }
    /**
     * Determines is select hidden.
     * */
    get isHidden() {
        return !this.isOpen;
    }
    /**
     * Returns width of the select button.
     * */
    get hostWidth() {
        if (this.isOptionsAutocompleteInputShown) {
            return this.optionsAutocompleteInput.nativeElement.getBoundingClientRect().width;
        }
        return this.button.nativeElement.getBoundingClientRect().width;
    }
    get selectButtonClasses() {
        const classes = [];
        if (!this.selectionModel.length) {
            classes.push('placeholder');
        }
        if (!this.selectionModel.length && !this.placeholder) {
            classes.push('empty');
        }
        if (this.isOpen) {
            classes.push(this.overlayPosition);
        }
        return classes;
    }
    /**
     * Content rendered in the label.
     * */
    get selectionView() {
        if (this.selectionModel.length > 1) {
            return this.selectionModel.map((option) => option.content).join(', ');
        }
        return this.selectionModel[0]?.content?.trim() ?? '';
    }
    ngOnChanges({ disabled, status, size, fullWidth }) {
        if (disabled) {
            this.disabled$.next(disabled.currentValue);
        }
        if (status) {
            this.status$.next(status.currentValue);
        }
        if (size) {
            this.size$.next(size.currentValue);
        }
        if (fullWidth) {
            this.fullWidth$.next(this.fullWidth);
        }
    }
    ngAfterContentInit() {
        this.options.changes
            .pipe(startWith(this.options), filter(() => this.queue != null && this.canSelectValue()), 
        // Call 'writeValue' when current change detection run is finished.
        // When writing is finished, change detection starts again, since
        // microtasks queue is empty.
        // Prevents ExpressionChangedAfterItHasBeenCheckedError.
        switchMap((options) => from(Promise.resolve(options))), takeUntil(this.destroy$))
            .subscribe(() => this.writeValue(this.queue));
    }
    ngAfterViewInit() {
        this.triggerStrategy = this.createTriggerStrategy();
        this.subscribeOnButtonFocus();
        this.subscribeOnTriggers();
        this.subscribeOnOptionClick();
        // TODO: #2254
        this.zone.runOutsideAngular(() => setTimeout(() => {
            this.renderer.addClass(this.hostRef.nativeElement, 'nb-transition');
        }));
    }
    ngOnDestroy() {
        this.alive = false;
        this.destroy$.next();
        this.destroy$.complete();
        if (this.ref) {
            this.ref.dispose();
        }
        if (this.triggerStrategy) {
            this.triggerStrategy.destroy();
        }
    }
    onAutocompleteInputChange(event) {
        this.optionsAutocompleteInputChange.emit(event.target.value);
    }
    show() {
        if (this.shouldShow()) {
            this.lastShownButtonWidth = this.hostWidth;
            this.attachToOverlay();
            this.positionStrategy$
                .pipe(switchMap((positionStrategy) => positionStrategy.positionChange ?? EMPTY), take(1), takeUntil(this.destroy$))
                .subscribe(() => {
                if (this.isOptionsAutocompleteInputShown) {
                    this.optionsAutocompleteInput.nativeElement.focus();
                }
                this.setActiveOption();
            });
            this.selectOpen.emit();
            this.cd.markForCheck();
        }
    }
    hide() {
        if (this.isOpen) {
            this.ref.detach();
            this.cd.markForCheck();
            this.selectClose.emit();
            this.resetAutocompleteInput();
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        this.cd.markForCheck();
    }
    writeValue(value) {
        if (!this.alive) {
            return;
        }
        if (this.canSelectValue()) {
            this.setSelection(value);
            if (this.selectionModel.length) {
                this.queue = null;
            }
        }
        else {
            this.queue = value;
        }
    }
    /**
     * Selects option or clear all selected options if value is null.
     * */
    handleOptionClick(option) {
        this.queue = null;
        if (option.value == null) {
            this.reset();
        }
        else {
            this.selectOption(option);
        }
        this.cd.markForCheck();
    }
    /**
     * Deselect all selected options.
     * */
    reset() {
        this.selectionModel.forEach((option) => option.deselect());
        this.selectionModel = [];
        this.hide();
        this.focusButton();
        this.emitSelected(this.multiple ? [] : null);
    }
    /**
     * Determines how to select option as multiple or single.
     * */
    selectOption(option) {
        if (this.multiple) {
            this.handleMultipleSelect(option);
        }
        else {
            this.handleSingleSelect(option);
        }
    }
    /**
     * Select single option.
     * */
    handleSingleSelect(option) {
        const selected = this.selectionModel.pop();
        if (selected && !this._compareWith(selected.value, option.value)) {
            selected.deselect();
        }
        this.selectionModel = [option];
        option.select();
        this.hide();
        this.focusButton();
        this.emitSelected(option.value);
    }
    /**
     * Select for multiple options.
     * */
    handleMultipleSelect(option) {
        if (option.selected) {
            this.selectionModel = this.selectionModel.filter((s) => !this._compareWith(s.value, option.value));
            option.deselect();
        }
        else {
            this.selectionModel.push(option);
            option.select();
        }
        this.emitSelected(this.selectionModel.map((opt) => opt.value));
    }
    attachToOverlay() {
        if (!this.ref) {
            this.createOverlay();
            this.subscribeOnPositionChange();
            this.createKeyManager();
            this.subscribeOnOverlayKeys();
            this.subscribeOnOptionsAutocompleteChange();
        }
        this.ref.attach(this.portal);
    }
    setActiveOption() {
        if (this.selectionModel.length && !this.selectionModel[0].hidden) {
            this.currentKeyManager?.setActiveItem(this.selectionModel[0]);
        }
        else {
            this.currentKeyManager?.setFirstItemActive();
        }
    }
    createOverlay() {
        const scrollStrategy = this.createScrollStrategy();
        this.positionStrategy$.next(this.createPositionStrategy());
        this.ref = this.overlay.create({
            positionStrategy: this.positionStrategy$.value,
            scrollStrategy,
            panelClass: this.optionsPanelClass,
        });
    }
    createKeyManager() {
        this.activeDescendantKeyManager = this.activeDescendantKeyManagerFactoryService
            .create(this.options)
            .skipPredicate((option) => {
            return this.isOptionHidden(option);
        });
        this.focusKeyManager = this.focusKeyManagerFactoryService
            .create(this.options)
            .withTypeAhead(200)
            .skipPredicate((option) => {
            return this.isOptionHidden(option);
        });
        this.updateCurrentKeyManager();
    }
    updateCurrentKeyManager() {
        this.currentKeyManager?.setActiveItem(-1);
        if (this.isOptionsAutocompleteAllowed) {
            this.currentKeyManager = this.activeDescendantKeyManager;
        }
        else {
            this.currentKeyManager = this.focusKeyManager;
        }
        this.setActiveOption();
    }
    resetAutocompleteInput() {
        if (this.optionsAutocompleteInput?.nativeElement) {
            this.optionsAutocompleteInput.nativeElement.value = this.selectionView;
            this.optionsAutocompleteInputChange.emit('');
        }
    }
    createPositionStrategy() {
        const element = this.isOptionsAutocompleteAllowed
            ? this.optionsAutocompleteInput
            : this.button;
        return this.positionBuilder
            .connectedTo(element)
            .position(NbPosition.BOTTOM)
            .offset(this.optionsOverlayOffset)
            .adjustment(NbAdjustment.VERTICAL);
    }
    updatePositionStrategy() {
        if (this.ref) {
            this.positionStrategy$.next(this.createPositionStrategy());
            this.ref.updatePositionStrategy(this.positionStrategy$.value);
            if (this.isOpen) {
                this.ref.updatePosition();
            }
        }
    }
    createScrollStrategy() {
        return this.overlay.scrollStrategies[this.scrollStrategy]();
    }
    createTriggerStrategy() {
        return this.triggerStrategyBuilder
            .trigger(NbTrigger.CLICK)
            .host(this.hostRef.nativeElement)
            .container(() => this.getContainer())
            .build();
    }
    subscribeOnTriggers() {
        this.triggerStrategy.show$.subscribe(() => this.show());
        this.triggerStrategy.hide$.pipe(filter(() => this.isOpen)).subscribe(($event) => {
            this.hide();
            if (!this.isClickedWithinComponent($event)) {
                this.onTouched();
            }
        });
    }
    subscribeOnPositionChange() {
        this.positionStrategy$
            .pipe(switchMap((positionStrategy) => positionStrategy.positionChange ?? EMPTY), takeUntil(this.destroy$))
            .subscribe((position) => {
            this.overlayPosition = position;
            this.cd.detectChanges();
        });
    }
    subscribeOnOptionClick() {
        /**
         * If the user changes provided options list in the runtime we have to handle this
         * and resubscribe on options selection changes event.
         * Otherwise, the user will not be able to select new options.
         * */
        this.options.changes
            .pipe(startWith(this.options), switchMap((options) => {
            return merge(...options.map((option) => option.click));
        }), takeUntil(this.destroy$))
            .subscribe((clickedOption) => this.handleOptionClick(clickedOption));
    }
    subscribeOnOverlayKeys() {
        this.ref
            .keydownEvents()
            .pipe(filter(() => this.isOpen), takeUntil(this.destroy$))
            .subscribe((event) => {
            if (event.keyCode === ESCAPE) {
                this.hide();
                this.focusButton();
            }
            else if (event.keyCode === ENTER && this.isOptionsAutocompleteInputShown) {
                event.preventDefault();
                const activeItem = this.currentKeyManager.activeItem;
                if (activeItem) {
                    this.selectOption(activeItem);
                }
            }
            else {
                this.currentKeyManager.onKeydown(event);
            }
        });
        merge(this.focusKeyManager.tabOut.pipe(filter(() => !this.isOptionsAutocompleteInputShown)), this.activeDescendantKeyManager.tabOut.pipe(filter(() => this.isOptionsAutocompleteInputShown)))
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.hide();
            this.onTouched();
        });
    }
    subscribeOnOptionsAutocompleteChange() {
        this.optionsAutocompleteInputChange
            .pipe(observeOn(animationFrameScheduler), filter(() => this.isOptionsAutocompleteInputShown), takeUntil(this.destroy$))
            .subscribe(() => {
            if (this.isOptionHidden(this.currentKeyManager.activeItem)) {
                this.currentKeyManager.setFirstItemActive();
            }
        });
    }
    subscribeOnButtonFocus() {
        const buttonFocus$ = this.focusMonitor.monitor(this.button).pipe(map((origin) => !!origin), startWith(false), finalize(() => this.focusMonitor.stopMonitoring(this.button)));
        const filterInputFocus$ = this.focusMonitor.monitor(this.optionsAutocompleteInput).pipe(map((origin) => !!origin), startWith(false), finalize(() => this.focusMonitor.stopMonitoring(this.button)));
        combineLatest([buttonFocus$, filterInputFocus$])
            .pipe(map(([buttonFocus, filterInputFocus]) => buttonFocus || filterInputFocus), takeUntil(this.destroy$))
            .subscribe(this.focused$);
    }
    getContainer() {
        return (this.ref &&
            this.ref.hasAttached() &&
            {
                location: {
                    nativeElement: this.ref.overlayElement,
                },
            });
    }
    focusButton() {
        /**
         * Need to wrap with setTimeout
         * because otherwise focus could be called
         * when the component hasn't rerendered the button
         * which was hidden by `isOptionsAutocompleteInputShown` property.
         */
        setTimeout(() => {
            this.button?.nativeElement?.focus();
        });
    }
    /**
     * Propagate selected value.
     * */
    emitSelected(selected) {
        this.onChange(selected);
        this.selectedChange.emit(selected);
    }
    /**
     * Set selected value in model.
     * */
    setSelection(value) {
        const isResetValue = value == null;
        let safeValue = value;
        if (this.multiple) {
            safeValue = value ?? [];
        }
        const isArray = Array.isArray(safeValue);
        if (this.multiple && !isArray && !isResetValue) {
            throw new Error("Can't assign single value if select is marked as multiple");
        }
        if (!this.multiple && isArray) {
            throw new Error("Can't assign array if select is not marked as multiple");
        }
        const previouslySelectedOptions = this.selectionModel;
        this.selectionModel = [];
        if (this.multiple) {
            safeValue.forEach((option) => this.selectValue(option));
        }
        else {
            this.selectValue(safeValue);
        }
        // find options which were selected before and trigger deselect
        previouslySelectedOptions
            .filter((option) => !this.selectionModel.includes(option))
            .forEach((option) => option.deselect());
        this.cd.markForCheck();
    }
    /**
     * Selects value.
     * */
    selectValue(value) {
        if (value == null) {
            return;
        }
        const corresponding = this.options.find((option) => this._compareWith(option.value, value));
        if (corresponding) {
            corresponding.select();
            this.selectionModel.push(corresponding);
        }
    }
    shouldShow() {
        return this.isHidden && this.options?.length > 0;
    }
    /**
     * Sets touched if focus moved outside of button and overlay,
     * ignoring the case when focus moved to options overlay.
     */
    trySetTouched() {
        if (this.isHidden) {
            this.onTouched();
        }
    }
    isClickedWithinComponent($event) {
        return this.hostRef.nativeElement === $event.target || this.hostRef.nativeElement.contains($event.target);
    }
    canSelectValue() {
        return !!(this.options && this.options.length);
    }
    isOptionHidden(option) {
        return option.hidden;
    }
    get tiny() {
        return this.size === 'tiny';
    }
    get small() {
        return this.size === 'small';
    }
    get medium() {
        return this.size === 'medium';
    }
    get large() {
        return this.size === 'large';
    }
    get giant() {
        return this.size === 'giant';
    }
    get primary() {
        return this.status === 'primary';
    }
    get info() {
        return this.status === 'info';
    }
    get success() {
        return this.status === 'success';
    }
    get warning() {
        return this.status === 'warning';
    }
    get danger() {
        return this.status === 'danger';
    }
    get basic() {
        return this.status === 'basic';
    }
    get control() {
        return this.status === 'control';
    }
    get rectangle() {
        return this.shape === 'rectangle';
    }
    get round() {
        return this.shape === 'round';
    }
    get semiRound() {
        return this.shape === 'semi-round';
    }
}
NbSelectWithAutocompleteComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSelectWithAutocompleteComponent, deps: [{ token: NB_DOCUMENT }, { token: i1.NbOverlayService }, { token: i0.ElementRef }, { token: i2.NbPositionBuilderService }, { token: i3.NbTriggerStrategyBuilderService }, { token: i0.ChangeDetectorRef }, { token: i4.NbFocusKeyManagerFactoryService }, { token: i5.NbFocusMonitor }, { token: i0.Renderer2 }, { token: i0.NgZone }, { token: i6.NbStatusService }, { token: i7.NbActiveDescendantKeyManagerFactoryService }], target: i0.ɵɵFactoryTarget.Component });
NbSelectWithAutocompleteComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbSelectWithAutocompleteComponent, selector: "nb-select-with-autocomplete", inputs: { size: "size", status: "status", shape: "shape", appearance: "appearance", optionsListClass: "optionsListClass", optionsPanelClass: "optionsPanelClass", optionsWidth: "optionsWidth", outline: "outline", filled: "filled", hero: "hero", disabled: "disabled", fullWidth: "fullWidth", placeholder: "placeholder", compareWith: "compareWith", selected: "selected", multiple: "multiple", optionsOverlayOffset: "optionsOverlayOffset", scrollStrategy: "scrollStrategy", withOptionsAutocomplete: "withOptionsAutocomplete" }, outputs: { selectedChange: "selectedChange", selectOpen: "selectOpen", selectClose: "selectClose", optionsAutocompleteInputChange: "optionsAutocompleteInputChange" }, host: { properties: { "class.appearance-outline": "this.outline", "class.appearance-filled": "this.filled", "class.appearance-hero": "this.hero", "class.full-width": "this.fullWidth", "class": "this.additionalClasses", "class.open": "this.isOpen", "class.size-tiny": "this.tiny", "class.size-small": "this.small", "class.size-medium": "this.medium", "class.size-large": "this.large", "class.size-giant": "this.giant", "class.status-primary": "this.primary", "class.status-info": "this.info", "class.status-success": "this.success", "class.status-warning": "this.warning", "class.status-danger": "this.danger", "class.status-basic": "this.basic", "class.status-control": "this.control", "class.shape-rectangle": "this.rectangle", "class.shape-round": "this.round", "class.shape-semi-round": "this.semiRound" } }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NbSelectWithAutocompleteComponent),
            multi: true,
        },
        { provide: NB_SELECT_INJECTION_TOKEN, useExisting: NbSelectWithAutocompleteComponent },
        { provide: NbFormFieldControl, useExisting: NbSelectWithAutocompleteComponent },
        { provide: NbFormFieldControlConfig, useFactory: nbSelectFormFieldControlConfigFactory },
    ], queries: [{ propertyName: "customLabel", first: true, predicate: NbSelectLabelComponent, descendants: true }, { propertyName: "options", predicate: NbOptionComponent, descendants: true }], viewQueries: [{ propertyName: "portal", first: true, predicate: NbPortalDirective, descendants: true }, { propertyName: "button", first: true, predicate: ["selectButton"], descendants: true, read: ElementRef }, { propertyName: "optionsAutocompleteInput", first: true, predicate: ["optionsAutocompleteInput"], descendants: true, read: ElementRef }], usesOnChanges: true, ngImport: i0, template: "<button\n  [hidden]=\"isOptionsAutocompleteInputShown\"\n  [disabled]=\"disabled\"\n  [ngClass]=\"selectButtonClasses\"\n  (blur)=\"trySetTouched()\"\n  (keydown.arrowDown)=\"show()\"\n  (keydown.arrowUp)=\"show()\"\n  class=\"select-button\"\n  type=\"button\"\n  #selectButton\n>\n  <span (click)=\"disabled && $event.stopPropagation()\">\n    <ng-container *ngIf=\"selectionModel.length; else placeholderTemplate\">\n      <ng-container *ngIf=\"customLabel; else defaultSelectionTemplate\">\n        <ng-content select=\"nb-select-label\"></ng-content>\n      </ng-container>\n\n      <ng-template #defaultSelectionTemplate>{{ selectionView }}</ng-template>\n    </ng-container>\n\n    <ng-template #placeholderTemplate>{{ placeholder }}</ng-template>\n  </span>\n\n  <nb-icon\n    icon=\"chevron-down-outline\"\n    pack=\"nebular-essentials\"\n    (click)=\"disabled && $event.stopPropagation()\"\n    aria-hidden=\"true\"\n  >\n  </nb-icon>\n</button>\n\n<nb-form-field [hidden]=\"!isOptionsAutocompleteInputShown\">\n  <input\n    nbInput\n    fullWidth\n    [style.max-width.px]=\"lastShownButtonWidth\"\n    #optionsAutocompleteInput\n    [value]=\"selectionView\"\n    [placeholder]=\"placeholder\"\n    [status]=\"status\"\n    [shape]=\"shape\"\n    [fieldSize]=\"size\"\n    (blur)=\"trySetTouched()\"\n    (click)=\"$event.stopPropagation()\"\n    (dblclick)=\"$event.stopPropagation()\"\n    (input)=\"onAutocompleteInputChange($event)\"\n  />\n  <nb-icon nbSuffix icon=\"chevron-up-outline\" pack=\"nebular-essentials\" aria-hidden=\"true\"> </nb-icon>\n</nb-form-field>\n\n<nb-option-list\n  *nbPortal\n  [size]=\"size\"\n  [position]=\"overlayPosition\"\n  [style.width.px]=\"optionsWidth\"\n  [ngClass]=\"optionsListClass\"\n>\n  <ng-content select=\"nb-option, nb-option-group\"></ng-content>\n</nb-option-list>\n", styles: ["/**\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n *//*!\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n */:host{display:inline-block;max-width:100%}[dir=ltr] :host .select-button{text-align:left}[dir=ltr] :host .select-button nb-icon{right:.2em}[dir=rtl] :host .select-button{text-align:right}[dir=rtl] :host .select-button nb-icon{left:.2em}:host(.full-width){width:100%}:host(.nb-transition) .select-button{transition-duration:.15s;transition-property:background-color,border-color,border-radius,box-shadow,color;transition-timing-function:ease-in}.select-button,nb-form-field{position:relative;width:100%;overflow:hidden;text-overflow:ellipsis;text-transform:none;white-space:nowrap}nb-icon:not([nbSuffix]){font-size:1.5em;position:absolute;top:50%;transform:translateY(-50%);transition-duration:.15s;transition-property:transform;transition-timing-function:ease-in}[dir=ltr] nb-icon:not([nbSuffix]){right:.5rem}[dir=rtl] nb-icon:not([nbSuffix]){left:.5rem}:host(.open) nb-icon:not([nbSuffix]){transform:translateY(-50%) rotate(180deg)}\n"], dependencies: [{ kind: "directive", type: i8.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i8.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i9.NbPortalDirective, selector: "[nbPortal]" }, { kind: "directive", type: i10.NbInputDirective, selector: "input[nbInput],textarea[nbInput]", inputs: ["fieldSize", "status", "shape", "fullWidth"] }, { kind: "component", type: i11.NbIconComponent, selector: "nb-icon", inputs: ["icon", "pack", "options", "status", "config"] }, { kind: "component", type: i12.NbOptionListComponent, selector: "nb-option-list", inputs: ["size", "position"] }, { kind: "component", type: i13.NbFormFieldComponent, selector: "nb-form-field" }, { kind: "directive", type: i14.NbSuffixDirective, selector: "[nbSuffix]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSelectWithAutocompleteComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nb-select-with-autocomplete', changeDetection: ChangeDetectionStrategy.OnPush, providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NbSelectWithAutocompleteComponent),
                            multi: true,
                        },
                        { provide: NB_SELECT_INJECTION_TOKEN, useExisting: NbSelectWithAutocompleteComponent },
                        { provide: NbFormFieldControl, useExisting: NbSelectWithAutocompleteComponent },
                        { provide: NbFormFieldControlConfig, useFactory: nbSelectFormFieldControlConfigFactory },
                    ], template: "<button\n  [hidden]=\"isOptionsAutocompleteInputShown\"\n  [disabled]=\"disabled\"\n  [ngClass]=\"selectButtonClasses\"\n  (blur)=\"trySetTouched()\"\n  (keydown.arrowDown)=\"show()\"\n  (keydown.arrowUp)=\"show()\"\n  class=\"select-button\"\n  type=\"button\"\n  #selectButton\n>\n  <span (click)=\"disabled && $event.stopPropagation()\">\n    <ng-container *ngIf=\"selectionModel.length; else placeholderTemplate\">\n      <ng-container *ngIf=\"customLabel; else defaultSelectionTemplate\">\n        <ng-content select=\"nb-select-label\"></ng-content>\n      </ng-container>\n\n      <ng-template #defaultSelectionTemplate>{{ selectionView }}</ng-template>\n    </ng-container>\n\n    <ng-template #placeholderTemplate>{{ placeholder }}</ng-template>\n  </span>\n\n  <nb-icon\n    icon=\"chevron-down-outline\"\n    pack=\"nebular-essentials\"\n    (click)=\"disabled && $event.stopPropagation()\"\n    aria-hidden=\"true\"\n  >\n  </nb-icon>\n</button>\n\n<nb-form-field [hidden]=\"!isOptionsAutocompleteInputShown\">\n  <input\n    nbInput\n    fullWidth\n    [style.max-width.px]=\"lastShownButtonWidth\"\n    #optionsAutocompleteInput\n    [value]=\"selectionView\"\n    [placeholder]=\"placeholder\"\n    [status]=\"status\"\n    [shape]=\"shape\"\n    [fieldSize]=\"size\"\n    (blur)=\"trySetTouched()\"\n    (click)=\"$event.stopPropagation()\"\n    (dblclick)=\"$event.stopPropagation()\"\n    (input)=\"onAutocompleteInputChange($event)\"\n  />\n  <nb-icon nbSuffix icon=\"chevron-up-outline\" pack=\"nebular-essentials\" aria-hidden=\"true\"> </nb-icon>\n</nb-form-field>\n\n<nb-option-list\n  *nbPortal\n  [size]=\"size\"\n  [position]=\"overlayPosition\"\n  [style.width.px]=\"optionsWidth\"\n  [ngClass]=\"optionsListClass\"\n>\n  <ng-content select=\"nb-option, nb-option-group\"></ng-content>\n</nb-option-list>\n", styles: ["/**\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n *//*!\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n */:host{display:inline-block;max-width:100%}[dir=ltr] :host .select-button{text-align:left}[dir=ltr] :host .select-button nb-icon{right:.2em}[dir=rtl] :host .select-button{text-align:right}[dir=rtl] :host .select-button nb-icon{left:.2em}:host(.full-width){width:100%}:host(.nb-transition) .select-button{transition-duration:.15s;transition-property:background-color,border-color,border-radius,box-shadow,color;transition-timing-function:ease-in}.select-button,nb-form-field{position:relative;width:100%;overflow:hidden;text-overflow:ellipsis;text-transform:none;white-space:nowrap}nb-icon:not([nbSuffix]){font-size:1.5em;position:absolute;top:50%;transform:translateY(-50%);transition-duration:.15s;transition-property:transform;transition-timing-function:ease-in}[dir=ltr] nb-icon:not([nbSuffix]){right:.5rem}[dir=rtl] nb-icon:not([nbSuffix]){left:.5rem}:host(.open) nb-icon:not([nbSuffix]){transform:translateY(-50%) rotate(180deg)}\n"] }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_DOCUMENT]
                }] }, { type: i1.NbOverlayService }, { type: i0.ElementRef }, { type: i2.NbPositionBuilderService }, { type: i3.NbTriggerStrategyBuilderService }, { type: i0.ChangeDetectorRef }, { type: i4.NbFocusKeyManagerFactoryService }, { type: i5.NbFocusMonitor }, { type: i0.Renderer2 }, { type: i0.NgZone }, { type: i6.NbStatusService }, { type: i7.NbActiveDescendantKeyManagerFactoryService }]; }, propDecorators: { size: [{
                type: Input
            }], status: [{
                type: Input
            }], shape: [{
                type: Input
            }], appearance: [{
                type: Input
            }], optionsListClass: [{
                type: Input
            }], optionsPanelClass: [{
                type: Input
            }], optionsWidth: [{
                type: Input
            }], outline: [{
                type: Input
            }, {
                type: HostBinding,
                args: ['class.appearance-outline']
            }], filled: [{
                type: Input
            }, {
                type: HostBinding,
                args: ['class.appearance-filled']
            }], hero: [{
                type: Input
            }, {
                type: HostBinding,
                args: ['class.appearance-hero']
            }], disabled: [{
                type: Input
            }], fullWidth: [{
                type: Input
            }, {
                type: HostBinding,
                args: ['class.full-width']
            }], placeholder: [{
                type: Input
            }], compareWith: [{
                type: Input
            }], selected: [{
                type: Input
            }], multiple: [{
                type: Input
            }], optionsOverlayOffset: [{
                type: Input
            }], scrollStrategy: [{
                type: Input
            }], withOptionsAutocomplete: [{
                type: Input
            }], additionalClasses: [{
                type: HostBinding,
                args: ['class']
            }], selectedChange: [{
                type: Output
            }], selectOpen: [{
                type: Output
            }], selectClose: [{
                type: Output
            }], optionsAutocompleteInputChange: [{
                type: Output
            }], options: [{
                type: ContentChildren,
                args: [NbOptionComponent, { descendants: true }]
            }], customLabel: [{
                type: ContentChild,
                args: [NbSelectLabelComponent]
            }], portal: [{
                type: ViewChild,
                args: [NbPortalDirective]
            }], button: [{
                type: ViewChild,
                args: ['selectButton', { read: ElementRef }]
            }], optionsAutocompleteInput: [{
                type: ViewChild,
                args: ['optionsAutocompleteInput', { read: ElementRef }]
            }], isOpen: [{
                type: HostBinding,
                args: ['class.open']
            }], tiny: [{
                type: HostBinding,
                args: ['class.size-tiny']
            }], small: [{
                type: HostBinding,
                args: ['class.size-small']
            }], medium: [{
                type: HostBinding,
                args: ['class.size-medium']
            }], large: [{
                type: HostBinding,
                args: ['class.size-large']
            }], giant: [{
                type: HostBinding,
                args: ['class.size-giant']
            }], primary: [{
                type: HostBinding,
                args: ['class.status-primary']
            }], info: [{
                type: HostBinding,
                args: ['class.status-info']
            }], success: [{
                type: HostBinding,
                args: ['class.status-success']
            }], warning: [{
                type: HostBinding,
                args: ['class.status-warning']
            }], danger: [{
                type: HostBinding,
                args: ['class.status-danger']
            }], basic: [{
                type: HostBinding,
                args: ['class.status-basic']
            }], control: [{
                type: HostBinding,
                args: ['class.status-control']
            }], rectangle: [{
                type: HostBinding,
                args: ['class.shape-rectangle']
            }], round: [{
                type: HostBinding,
                args: ['class.shape-round']
            }], semiRound: [{
                type: HostBinding,
                args: ['class.shape-semi-round']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LXdpdGgtYXV0b2NvbXBsZXRlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvdGhlbWUvY29tcG9uZW50cy9zZWxlY3Qtd2l0aC1hdXRvY29tcGxldGUvc2VsZWN0LXdpdGgtYXV0b2NvbXBsZXRlLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvdGhlbWUvY29tcG9uZW50cy9zZWxlY3Qtd2l0aC1hdXRvY29tcGxldGUvc2VsZWN0LXdpdGgtYXV0b2NvbXBsZXRlLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxPQUFPLEVBR0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFFVCxZQUFZLEVBQ1osZUFBZSxFQUNmLFVBQVUsRUFDVixZQUFZLEVBQ1osVUFBVSxFQUNWLFdBQVcsRUFDWCxNQUFNLEVBQ04sS0FBSyxFQUVMLE1BQU0sRUFFTixTQUFTLEdBS1YsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUF3QixpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXpFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLHVCQUF1QixFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RyxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3pHLE9BQU8sRUFFTCxZQUFZLEVBQ1osVUFBVSxHQUVYLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFnQixpQkFBaUIsRUFBb0IsTUFBTSx3QkFBd0IsQ0FBQztBQUUzRixPQUFPLEVBQUUsU0FBUyxFQUFzRCxNQUFNLGdDQUFn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QUFXO3VCQUFDLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEFrdmVvLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29tcG9uZW50UmVmLFxuICBDb250ZW50Q2hpbGQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBmb3J3YXJkUmVmLFxuICBIb3N0QmluZGluZyxcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbiAgVmlld0NoaWxkLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBPbkNoYW5nZXMsXG4gIFJlbmRlcmVyMixcbiAgTmdab25lLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgTGlzdEtleU1hbmFnZXIgfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQgeyBtZXJnZSwgU3ViamVjdCwgQmVoYXZpb3JTdWJqZWN0LCBmcm9tLCBjb21iaW5lTGF0ZXN0LCBhbmltYXRpb25GcmFtZVNjaGVkdWxlciwgRU1QVFkgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHN0YXJ0V2l0aCwgc3dpdGNoTWFwLCB0YWtlVW50aWwsIGZpbHRlciwgbWFwLCBmaW5hbGl6ZSwgdGFrZSwgb2JzZXJ2ZU9uIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBOYlN0YXR1c1NlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9zdGF0dXMuc2VydmljZSc7XG5pbXBvcnQge1xuICBOYkFkanVzdGFibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICBOYkFkanVzdG1lbnQsXG4gIE5iUG9zaXRpb24sXG4gIE5iUG9zaXRpb25CdWlsZGVyU2VydmljZSxcbn0gZnJvbSAnLi4vY2RrL292ZXJsYXkvb3ZlcmxheS1wb3NpdGlvbic7XG5pbXBvcnQgeyBOYk92ZXJsYXlSZWYsIE5iUG9ydGFsRGlyZWN0aXZlLCBOYlNjcm9sbFN0cmF0ZWd5IH0gZnJvbSAnLi4vY2RrL292ZXJsYXkvbWFwcGluZyc7XG5pbXBvcnQgeyBOYk92ZXJsYXlTZXJ2aWNlIH0gZnJvbSAnLi4vY2RrL292ZXJsYXkvb3ZlcmxheS1zZXJ2aWNlJztcbmltcG9ydCB7IE5iVHJpZ2dlciwgTmJUcmlnZ2VyU3RyYXRlZ3ksIE5iVHJpZ2dlclN0cmF0ZWd5QnVpbGRlclNlcnZpY2UgfSBmcm9tICcuLi9jZGsvb3ZlcmxheS9vdmVybGF5LXRyaWdnZXInO1xuaW1wb3J0IHsgTmJGb2N1c0tleU1hbmFnZXIsIE5iRm9jdXNLZXlNYW5hZ2VyRmFjdG9yeVNlcnZpY2UgfSBmcm9tICcuLi9jZGsvYTExeS9mb2N1cy1rZXktbWFuYWdlcic7XG5pbXBvcnQgeyBFTlRFUiwgRVNDQVBFIH0gZnJvbSAnLi4vY2RrL2tleWNvZGVzL2tleWNvZGVzJztcbmltcG9ydCB7IE5iQ29tcG9uZW50U2l6ZSB9IGZyb20gJy4uL2NvbXBvbmVudC1zaXplJztcbmltcG9ydCB7IE5iQ29tcG9uZW50U2hhcGUgfSBmcm9tICcuLi9jb21wb25lbnQtc2hhcGUnO1xuaW1wb3J0IHsgTmJDb21wb25lbnRPckN1c3RvbVN0YXR1cyB9IGZyb20gJy4uL2NvbXBvbmVudC1zdGF0dXMnO1xuaW1wb3J0IHsgTkJfRE9DVU1FTlQgfSBmcm9tICcuLi8uLi90aGVtZS5vcHRpb25zJztcbmltcG9ydCB7IE5iT3B0aW9uQ29tcG9uZW50IH0gZnJvbSAnLi4vb3B0aW9uL29wdGlvbi5jb21wb25lbnQnO1xuaW1wb3J0IHsgY29udmVydFRvQm9vbFByb3BlcnR5LCBOYkJvb2xlYW5JbnB1dCB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IHsgTkJfU0VMRUNUX0lOSkVDVElPTl9UT0tFTiB9IGZyb20gJy4uL3NlbGVjdC9zZWxlY3QtaW5qZWN0aW9uLXRva2Vucyc7XG5pbXBvcnQgeyBOYkZvcm1GaWVsZENvbnRyb2wsIE5iRm9ybUZpZWxkQ29udHJvbENvbmZpZyB9IGZyb20gJy4uL2Zvcm0tZmllbGQvZm9ybS1maWVsZC1jb250cm9sJztcbmltcG9ydCB7IE5iRm9jdXNNb25pdG9yIH0gZnJvbSAnLi4vY2RrL2ExMXkvYTExeS5tb2R1bGUnO1xuaW1wb3J0IHsgTmJTY3JvbGxTdHJhdGVnaWVzIH0gZnJvbSAnLi4vY2RrL2FkYXB0ZXIvYmxvY2stc2Nyb2xsLXN0cmF0ZWd5LWFkYXB0ZXInO1xuaW1wb3J0IHtcbiAgTmJBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcixcbiAgTmJBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlckZhY3RvcnlTZXJ2aWNlLFxufSBmcm9tICcuLi9jZGsvYTExeS9kZXNjZW5kYW50LWtleS1tYW5hZ2VyJztcbmltcG9ydCB7XG4gIE5iU2VsZWN0QXBwZWFyYW5jZSxcbiAgTmJTZWxlY3RDb21wYXJlRnVuY3Rpb24sXG4gIG5iU2VsZWN0Rm9ybUZpZWxkQ29udHJvbENvbmZpZ0ZhY3RvcnksXG4gIE5iU2VsZWN0TGFiZWxDb21wb25lbnQsXG59IGZyb20gJy4uL3NlbGVjdC9zZWxlY3QuY29tcG9uZW50JztcblxuLyoqXG4gKiBFeHBlcmltZW50YWwgY29tcG9uZW50IHdpdGggYXV0b2NvbXBsZXRlIHBvc3NpYmlsaXR5LlxuICogQ291bGQgYmUgY2hhbmdlZCB3aXRob3V0IGFueSBwcmlvciBub3RpY2UuXG4gKiBVc2UgYXQgeW91ciBvd24gcmlzay5cbiAqXG4gKiBTdHlsZSB2YXJpYWJsZXMgaXMgZnVsbHkgaW5oZXJpdGVkLlxuICogQ29tcG9uZW50J3MgcHVibGljIEFQSSAoYEBJbnB1dCgpYCBhbmQgYEBPdXRwdXQoKWApIHdvcmtzIGluIGEgc2FtZSB3YXkgYXMgTmJTZWxlY3RDb21wb25lbnQuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25iLXNlbGVjdC13aXRoLWF1dG9jb21wbGV0ZScsXG4gIHRlbXBsYXRlVXJsOiAnLi9zZWxlY3Qtd2l0aC1hdXRvY29tcGxldGUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9zZWxlY3Qtd2l0aC1hdXRvY29tcGxldGUuY29tcG9uZW50LnNjc3MnXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmJTZWxlY3RXaXRoQXV0b2NvbXBsZXRlQ29tcG9uZW50KSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gICAgeyBwcm92aWRlOiBOQl9TRUxFQ1RfSU5KRUNUSU9OX1RPS0VOLCB1c2VFeGlzdGluZzogTmJTZWxlY3RXaXRoQXV0b2NvbXBsZXRlQ29tcG9uZW50IH0sXG4gICAgeyBwcm92aWRlOiBOYkZvcm1GaWVsZENvbnRyb2wsIHVzZUV4aXN0aW5nOiBOYlNlbGVjdFdpdGhBdXRvY29tcGxldGVDb21wb25lbnQgfSxcbiAgICB7IHByb3ZpZGU6IE5iRm9ybUZpZWxkQ29udHJvbENvbmZpZywgdXNlRmFjdG9yeTogbmJTZWxlY3RGb3JtRmllbGRDb250cm9sQ29uZmlnRmFjdG9yeSB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBOYlNlbGVjdFdpdGhBdXRvY29tcGxldGVDb21wb25lbnRcbiAgaW1wbGVtZW50cyBPbkNoYW5nZXMsIEFmdGVyVmlld0luaXQsIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5iRm9ybUZpZWxkQ29udHJvbFxue1xuICAvKipcbiAgICogU2VsZWN0IHNpemUsIGF2YWlsYWJsZSBzaXplczpcbiAgICogYHRpbnlgLCBgc21hbGxgLCBgbWVkaXVtYCAoZGVmYXVsdCksIGBsYXJnZWAsIGBnaWFudGBcbiAgICovXG4gIEBJbnB1dCgpIHNpemU6IE5iQ29tcG9uZW50U2l6ZSA9ICdtZWRpdW0nO1xuXG4gIC8qKlxuICAgKiBTZWxlY3Qgc3RhdHVzIChhZGRzIHNwZWNpZmljIHN0eWxlcyk6XG4gICAqIGBiYXNpY2AsIGBwcmltYXJ5YCwgYGluZm9gLCBgc3VjY2Vzc2AsIGB3YXJuaW5nYCwgYGRhbmdlcmAsIGBjb250cm9sYFxuICAgKi9cbiAgQElucHV0KCkgc3RhdHVzOiBOYkNvbXBvbmVudE9yQ3VzdG9tU3RhdHVzID0gJ2Jhc2ljJztcblxuICAvKipcbiAgICogU2VsZWN0IHNoYXBlczogYHJlY3RhbmdsZWAgKGRlZmF1bHQpLCBgcm91bmRgLCBgc2VtaS1yb3VuZGBcbiAgICovXG4gIEBJbnB1dCgpIHNoYXBlOiBOYkNvbXBvbmVudFNoYXBlID0gJ3JlY3RhbmdsZSc7XG5cbiAgLyoqXG4gICAqIFNlbGVjdCBhcHBlYXJhbmNlczogYG91dGxpbmVgIChkZWZhdWx0KSwgYGZpbGxlZGAsIGBoZXJvYFxuICAgKi9cbiAgQElucHV0KCkgYXBwZWFyYW5jZTogTmJTZWxlY3RBcHBlYXJhbmNlID0gJ291dGxpbmUnO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgY2xhc3MgdG8gYmUgc2V0IG9uIGBuYi1vcHRpb25gcyBjb250YWluZXIgKGBuYi1vcHRpb24tbGlzdGApXG4gICAqICovXG4gIEBJbnB1dCgpIG9wdGlvbnNMaXN0Q2xhc3M6IE5nQ2xhc3NbJ25nQ2xhc3MnXTtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGNsYXNzIGZvciB0aGUgb3ZlcmxheSBwYW5lbCB3aXRoIG9wdGlvbnNcbiAgICogKi9cbiAgQElucHV0KCkgb3B0aW9uc1BhbmVsQ2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgd2lkdGggKGluIHBpeGVscykgdG8gYmUgc2V0IG9uIGBuYi1vcHRpb25gcyBjb250YWluZXIgKGBuYi1vcHRpb24tbGlzdGApXG4gICAqICovXG4gIEBJbnB1dCgpXG4gIGdldCBvcHRpb25zV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9uc1dpZHRoID8/IHRoaXMuaG9zdFdpZHRoO1xuICB9XG4gIHNldCBvcHRpb25zV2lkdGgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX29wdGlvbnNXaWR0aCA9IHZhbHVlO1xuICB9XG4gIHByb3RlY3RlZCBfb3B0aW9uc1dpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEFkZHMgYG91dGxpbmVgIHN0eWxlc1xuICAgKi9cbiAgQElucHV0KClcbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5hcHBlYXJhbmNlLW91dGxpbmUnKVxuICBnZXQgb3V0bGluZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlYXJhbmNlID09PSAnb3V0bGluZSc7XG4gIH1cbiAgc2V0IG91dGxpbmUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAoY29udmVydFRvQm9vbFByb3BlcnR5KHZhbHVlKSkge1xuICAgICAgdGhpcy5hcHBlYXJhbmNlID0gJ291dGxpbmUnO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3V0bGluZTogTmJCb29sZWFuSW5wdXQ7XG5cbiAgLyoqXG4gICAqIEFkZHMgYGZpbGxlZGAgc3R5bGVzXG4gICAqL1xuICBASW5wdXQoKVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLmFwcGVhcmFuY2UtZmlsbGVkJylcbiAgZ2V0IGZpbGxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlYXJhbmNlID09PSAnZmlsbGVkJztcbiAgfVxuICBzZXQgZmlsbGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuYXBwZWFyYW5jZSA9ICdmaWxsZWQnO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZmlsbGVkOiBOYkJvb2xlYW5JbnB1dDtcblxuICAvKipcbiAgICogQWRkcyBgaGVyb2Agc3R5bGVzXG4gICAqL1xuICBASW5wdXQoKVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLmFwcGVhcmFuY2UtaGVybycpXG4gIGdldCBoZXJvKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFwcGVhcmFuY2UgPT09ICdoZXJvJztcbiAgfVxuICBzZXQgaGVybyh2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmIChjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsdWUpKSB7XG4gICAgICB0aGlzLmFwcGVhcmFuY2UgPSAnaGVybyc7XG4gICAgfVxuICB9XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oZXJvOiBOYkJvb2xlYW5JbnB1dDtcblxuICAvKipcbiAgICogRGlzYWJsZXMgdGhlIHNlbGVjdFxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcm90ZWN0ZWQgX2Rpc2FibGVkOiBib29sZWFuO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IE5iQm9vbGVhbklucHV0O1xuXG4gIC8qKlxuICAgKiBJZiBzZXQgZWxlbWVudCB3aWxsIGZpbGwgaXRzIGNvbnRhaW5lclxuICAgKi9cbiAgQElucHV0KClcbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5mdWxsLXdpZHRoJylcbiAgZ2V0IGZ1bGxXaWR0aCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZnVsbFdpZHRoO1xuICB9XG4gIHNldCBmdWxsV2lkdGgodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9mdWxsV2lkdGggPSBjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByb3RlY3RlZCBfZnVsbFdpZHRoOiBib29sZWFuID0gZmFsc2U7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mdWxsV2lkdGg6IE5iQm9vbGVhbklucHV0O1xuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHNlbGVjdCBwbGFjZWhvbGRlciBpZiBub3RoaW5nIHNlbGVjdGVkLlxuICAgKiAqL1xuICBASW5wdXQoKSBwbGFjZWhvbGRlcjogc3RyaW5nID0gJyc7XG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gdG8gY29tcGFyZSBvcHRpb24gdmFsdWUgd2l0aCBzZWxlY3RlZCB2YWx1ZS5cbiAgICogQnkgZGVmYXVsdCwgdmFsdWVzIGFyZSBjb21wYXJlZCB3aXRoIHN0cmljdCBlcXVhbGl0eSAoYD09PWApLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IGNvbXBhcmVXaXRoKCk6IE5iU2VsZWN0Q29tcGFyZUZ1bmN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGFyZVdpdGg7XG4gIH1cbiAgc2V0IGNvbXBhcmVXaXRoKGZuOiBOYlNlbGVjdENvbXBhcmVGdW5jdGlvbikge1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9jb21wYXJlV2l0aCA9IGZuO1xuXG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uTW9kZWwubGVuZ3RoICYmIHRoaXMuY2FuU2VsZWN0VmFsdWUoKSkge1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24odGhpcy5zZWxlY3RlZCk7XG4gICAgfVxuICB9XG4gIHByb3RlY3RlZCBfY29tcGFyZVdpdGg6IE5iU2VsZWN0Q29tcGFyZUZ1bmN0aW9uID0gKHYxOiBhbnksIHYyOiBhbnkpID0+IHYxID09PSB2MjtcblxuICAvKipcbiAgICogQWNjZXB0cyBzZWxlY3RlZCBpdGVtIG9yIGFycmF5IG9mIHNlbGVjdGVkIGl0ZW1zLlxuICAgKiAqL1xuICBASW5wdXQoKVxuICBzZXQgc2VsZWN0ZWQodmFsdWUpIHtcbiAgICB0aGlzLndyaXRlVmFsdWUodmFsdWUpO1xuICB9XG4gIGdldCBzZWxlY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBsZSA/IHRoaXMuc2VsZWN0aW9uTW9kZWwubWFwKChvKSA9PiBvLnZhbHVlKSA6IHRoaXMuc2VsZWN0aW9uTW9kZWxbMF0udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZXMgY2FwYWJpbGl0eSBqdXN0IHdyaXRlIGBtdWx0aXBsZWAgb3ZlciB0aGUgZWxlbWVudC5cbiAgICogKi9cbiAgQElucHV0KClcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9tdWx0aXBsZTtcbiAgfVxuICBzZXQgbXVsdGlwbGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9tdWx0aXBsZSA9IGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSh2YWx1ZSk7XG5cbiAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uU3RyYXRlZ3koKTtcbiAgICB0aGlzLnVwZGF0ZUN1cnJlbnRLZXlNYW5hZ2VyKCk7XG4gIH1cbiAgcHJvdGVjdGVkIF9tdWx0aXBsZTogYm9vbGVhbiA9IGZhbHNlO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbXVsdGlwbGU6IE5iQm9vbGVhbklucHV0O1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIG9wdGlvbnMgb3ZlcmxheSBvZmZzZXQgKGluIHBpeGVscykuXG4gICAqKi9cbiAgQElucHV0KCkgb3B0aW9uc092ZXJsYXlPZmZzZXQgPSA4O1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIG9wdGlvbnMgb3ZlcmxheSBzY3JvbGwgc3RyYXRlZ3kuXG4gICAqKi9cbiAgQElucHV0KCkgc2Nyb2xsU3RyYXRlZ3k6IE5iU2Nyb2xsU3RyYXRlZ2llcyA9ICdibG9jayc7XG5cbiAgLyoqXG4gICAqIEV4cGVyaW1lbnRhbCBpbnB1dC5cbiAgICogQ291bGQgYmUgY2hhbmdlZCB3aXRob3V0IGFueSBwcmlvciBub3RpY2UuXG4gICAqIFVzZSBhdCB5b3VyIG93biByaXNrLlxuICAgKlxuICAgKiBJdCByZXBsYWNlcyB0aGUgYnV0dG9uIHdpdGggaW5wdXQgd2hlbiB0aGUgc2VsZWN0IGlzIG9wZW5lZC5cbiAgICogVGhhdCByZXBsYWNlbWVudCBwcm92aWRlcyBhIHZlcnkgYmFzaWMgQVBJIHRvIGltcGxlbWVudCBvcHRpb25zIGZpbHRlcmluZyBmdW5jdGlvbmFsaXR5LlxuICAgKiBGaWx0ZXJpbmcgaXRzZWxmIGlzbid0IGltcGxlbWVudGVkIGluc2lkZSBzZWxlY3QuXG4gICAqIFNvIGl0IHNob3VsZCBiZSBpbXBsZW1lbnRlZCBieSB0aGUgdXNlci5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCB3aXRoT3B0aW9uc0F1dG9jb21wbGV0ZSh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3dpdGhPcHRpb25zQXV0b2NvbXBsZXRlID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbHVlKTtcbiAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uU3RyYXRlZ3koKTtcbiAgICB0aGlzLnVwZGF0ZUN1cnJlbnRLZXlNYW5hZ2VyKCk7XG5cbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB0aGlzLnJlc2V0QXV0b2NvbXBsZXRlSW5wdXQoKTtcbiAgICB9XG4gIH1cbiAgZ2V0IHdpdGhPcHRpb25zQXV0b2NvbXBsZXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl93aXRoT3B0aW9uc0F1dG9jb21wbGV0ZTtcbiAgfVxuICBwcm90ZWN0ZWQgX3dpdGhPcHRpb25zQXV0b2NvbXBsZXRlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgQEhvc3RCaW5kaW5nKCdjbGFzcycpXG4gIGdldCBhZGRpdGlvbmFsQ2xhc3NlcygpOiBzdHJpbmdbXSB7XG4gICAgaWYgKHRoaXMuc3RhdHVzU2VydmljZS5pc0N1c3RvbVN0YXR1cyh0aGlzLnN0YXR1cykpIHtcbiAgICAgIHJldHVybiBbdGhpcy5zdGF0dXNTZXJ2aWNlLmdldFN0YXR1c0NsYXNzKHRoaXMuc3RhdHVzKV07XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaWxsIGJlIGVtaXR0ZWQgd2hlbiBzZWxlY3RlZCB2YWx1ZSBjaGFuZ2VzLlxuICAgKiAqL1xuICBAT3V0cHV0KCkgc2VsZWN0ZWRDaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgc2VsZWN0T3BlbjogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgc2VsZWN0Q2xvc2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIG9wdGlvbnNBdXRvY29tcGxldGVJbnB1dENoYW5nZTogRXZlbnRFbWl0dGVyPHN0cmluZz4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgYE5iT3B0aW9uQ29tcG9uZW50YCdzIGNvbXBvbmVudHMgcGFzc2VkIGFzIGNvbnRlbnQuXG4gICAqIFRPRE8gbWF5YmUgaXQgd291bGQgYmUgYmV0dGVyIHByb3ZpZGUgd3JhcHBlclxuICAgKiAqL1xuICBAQ29udGVudENoaWxkcmVuKE5iT3B0aW9uQ29tcG9uZW50LCB7IGRlc2NlbmRhbnRzOiB0cnVlIH0pIG9wdGlvbnM6IFF1ZXJ5TGlzdDxOYk9wdGlvbkNvbXBvbmVudD47XG5cbiAgLyoqXG4gICAqIEN1c3RvbSBzZWxlY3QgbGFiZWwsIHdpbGwgYmUgcmVuZGVyZWQgaW5zdGVhZCBvZiBkZWZhdWx0IGVudW1lcmF0aW9uIHdpdGggY29tYS5cbiAgICogKi9cbiAgQENvbnRlbnRDaGlsZChOYlNlbGVjdExhYmVsQ29tcG9uZW50KSBjdXN0b21MYWJlbDtcblxuICAvKipcbiAgICogTmJDYXJkIHdpdGggb3B0aW9ucyBjb250ZW50LlxuICAgKiAqL1xuICBAVmlld0NoaWxkKE5iUG9ydGFsRGlyZWN0aXZlKSBwb3J0YWw6IE5iUG9ydGFsRGlyZWN0aXZlO1xuXG4gIEBWaWV3Q2hpbGQoJ3NlbGVjdEJ1dHRvbicsIHsgcmVhZDogRWxlbWVudFJlZiB9KSBidXR0b246IEVsZW1lbnRSZWY8SFRNTEJ1dHRvbkVsZW1lbnQ+IHwgdW5kZWZpbmVkO1xuICBAVmlld0NoaWxkKCdvcHRpb25zQXV0b2NvbXBsZXRlSW5wdXQnLCB7IHJlYWQ6IEVsZW1lbnRSZWYgfSkgb3B0aW9uc0F1dG9jb21wbGV0ZUlucHV0OlxuICAgIHwgRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50PlxuICAgIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlzIHNlbGVjdCBvcGVuZWQuXG4gICAqICovXG4gIEBIb3N0QmluZGluZygnY2xhc3Mub3BlbicpXG4gIGdldCBpc09wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVmICYmIHRoaXMucmVmLmhhc0F0dGFjaGVkKCk7XG4gIH1cblxuICBnZXQgaXNPcHRpb25zQXV0b2NvbXBsZXRlQWxsb3dlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy53aXRoT3B0aW9uc0F1dG9jb21wbGV0ZSAmJiAhdGhpcy5tdWx0aXBsZTtcbiAgfVxuXG4gIGdldCBpc09wdGlvbnNBdXRvY29tcGxldGVJbnB1dFNob3duKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzT3B0aW9uc0F1dG9jb21wbGV0ZUFsbG93ZWQgJiYgdGhpcy5pc09wZW47XG4gIH1cblxuICAvKipcbiAgICogTGlzdCBvZiBzZWxlY3RlZCBvcHRpb25zLlxuICAgKiAqL1xuICBzZWxlY3Rpb25Nb2RlbDogTmJPcHRpb25Db21wb25lbnRbXSA9IFtdO1xuXG4gIHBvc2l0aW9uU3RyYXRlZ3kkOiBCZWhhdmlvclN1YmplY3Q8TmJBZGp1c3RhYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB8IHVuZGVmaW5lZD4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFxuICAgIHVuZGVmaW5lZCxcbiAgKTtcblxuICAvKipcbiAgICogQ3VycmVudCBvdmVybGF5IHBvc2l0aW9uIGJlY2F1c2Ugb2Ygd2UgaGF2ZSB0byB0b2dnbGUgb3ZlcmxheVBvc2l0aW9uXG4gICAqIGluIFtuZ0NsYXNzXSBkaXJlY3Rpb24gYW5kIHRoaXMgZGlyZWN0aXZlIGNhbiB1c2Ugb25seSBzdHJpbmcuXG4gICAqL1xuICBvdmVybGF5UG9zaXRpb246IE5iUG9zaXRpb24gPSAnJyBhcyBOYlBvc2l0aW9uO1xuXG4gIHByb3RlY3RlZCByZWY6IE5iT3ZlcmxheVJlZjtcblxuICBwcm90ZWN0ZWQgdHJpZ2dlclN0cmF0ZWd5OiBOYlRyaWdnZXJTdHJhdGVneTtcblxuICBwcm90ZWN0ZWQgYWxpdmU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIHByb3RlY3RlZCBkZXN0cm95JCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgcHJvdGVjdGVkIGN1cnJlbnRLZXlNYW5hZ2VyOiBMaXN0S2V5TWFuYWdlcjxOYk9wdGlvbkNvbXBvbmVudD47XG4gIHByb3RlY3RlZCBmb2N1c0tleU1hbmFnZXI6IE5iRm9jdXNLZXlNYW5hZ2VyPE5iT3B0aW9uQ29tcG9uZW50PjtcbiAgcHJvdGVjdGVkIGFjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyOiBOYkFjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyPE5iT3B0aW9uQ29tcG9uZW50PjtcblxuICAvKipcbiAgICogSWYgYSB1c2VyIGFzc2lnbnMgdmFsdWUgYmVmb3JlIGNvbnRlbnQgbmItb3B0aW9ucydzIHJlbmRlcmVkIHRoZSB2YWx1ZSB3aWxsIGJlIHB1dHRlZCBpbiB0aGlzIHZhcmlhYmxlLlxuICAgKiBBbmQgdGhlbiBhcHBsaWVkIGFmdGVyIGNvbnRlbnQgcmVuZGVyZWQuXG4gICAqIE9ubHkgdGhlIGxhc3QgdmFsdWUgd2lsbCBiZSBhcHBsaWVkLlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgcXVldWU7XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHBhc3NlZCB0aHJvdWdoIGNvbnRyb2wgdmFsdWUgYWNjZXNzb3IgdG8gcHJvcGFnYXRlIGNoYW5nZXMuXG4gICAqICovXG4gIHByb3RlY3RlZCBvbkNoYW5nZTogRnVuY3Rpb24gPSAoKSA9PiB7fTtcbiAgcHJvdGVjdGVkIG9uVG91Y2hlZDogRnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuICAvKlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqKi9cbiAgc3RhdHVzJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8TmJDb21wb25lbnRPckN1c3RvbVN0YXR1cz4odGhpcy5zdGF0dXMpO1xuXG4gIC8qXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICoqL1xuICBzaXplJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8TmJDb21wb25lbnRTaXplPih0aGlzLnNpemUpO1xuXG4gIC8qXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICoqL1xuICBmb2N1c2VkJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuXG4gIC8qXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICoqL1xuICBkaXNhYmxlZCQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KHRoaXMuZGlzYWJsZWQpO1xuXG4gIC8qXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICoqL1xuICBmdWxsV2lkdGgkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPih0aGlzLmZ1bGxXaWR0aCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChOQl9ET0NVTUVOVCkgcHJvdGVjdGVkIGRvY3VtZW50LFxuICAgIHByb3RlY3RlZCBvdmVybGF5OiBOYk92ZXJsYXlTZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBob3N0UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcm90ZWN0ZWQgcG9zaXRpb25CdWlsZGVyOiBOYlBvc2l0aW9uQnVpbGRlclNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIHRyaWdnZXJTdHJhdGVneUJ1aWxkZXI6IE5iVHJpZ2dlclN0cmF0ZWd5QnVpbGRlclNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIGNkOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcm90ZWN0ZWQgZm9jdXNLZXlNYW5hZ2VyRmFjdG9yeVNlcnZpY2U6IE5iRm9jdXNLZXlNYW5hZ2VyRmFjdG9yeVNlcnZpY2U8TmJPcHRpb25Db21wb25lbnQ+LFxuICAgIHByb3RlY3RlZCBmb2N1c01vbml0b3I6IE5iRm9jdXNNb25pdG9yLFxuICAgIHByb3RlY3RlZCByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIHByb3RlY3RlZCB6b25lOiBOZ1pvbmUsXG4gICAgcHJvdGVjdGVkIHN0YXR1c1NlcnZpY2U6IE5iU3RhdHVzU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgYWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXJGYWN0b3J5U2VydmljZTogTmJBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlckZhY3RvcnlTZXJ2aWNlPE5iT3B0aW9uQ29tcG9uZW50PixcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlzIHNlbGVjdCBoaWRkZW4uXG4gICAqICovXG4gIGdldCBpc0hpZGRlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuaXNPcGVuO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2lkdGggb2YgdGhlIHNlbGVjdCBidXR0b24uXG4gICAqICovXG4gIGdldCBob3N0V2lkdGgoKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy5pc09wdGlvbnNBdXRvY29tcGxldGVJbnB1dFNob3duKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zQXV0b2NvbXBsZXRlSW5wdXQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYnV0dG9uLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gIH1cblxuICBsYXN0U2hvd25CdXR0b25XaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIGdldCBzZWxlY3RCdXR0b25DbGFzc2VzKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBjbGFzc2VzID0gW107XG5cbiAgICBpZiAoIXRoaXMuc2VsZWN0aW9uTW9kZWwubGVuZ3RoKSB7XG4gICAgICBjbGFzc2VzLnB1c2goJ3BsYWNlaG9sZGVyJyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5zZWxlY3Rpb25Nb2RlbC5sZW5ndGggJiYgIXRoaXMucGxhY2Vob2xkZXIpIHtcbiAgICAgIGNsYXNzZXMucHVzaCgnZW1wdHknKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICBjbGFzc2VzLnB1c2godGhpcy5vdmVybGF5UG9zaXRpb24pO1xuICAgIH1cblxuICAgIHJldHVybiBjbGFzc2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnRlbnQgcmVuZGVyZWQgaW4gdGhlIGxhYmVsLlxuICAgKiAqL1xuICBnZXQgc2VsZWN0aW9uVmlldygpIHtcbiAgICBpZiAodGhpcy5zZWxlY3Rpb25Nb2RlbC5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb25Nb2RlbC5tYXAoKG9wdGlvbjogTmJPcHRpb25Db21wb25lbnQpID0+IG9wdGlvbi5jb250ZW50KS5qb2luKCcsICcpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsWzBdPy5jb250ZW50Py50cmltKCkgPz8gJyc7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyh7IGRpc2FibGVkLCBzdGF0dXMsIHNpemUsIGZ1bGxXaWR0aCB9OiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGRpc2FibGVkKSB7XG4gICAgICB0aGlzLmRpc2FibGVkJC5uZXh0KGRpc2FibGVkLmN1cnJlbnRWYWx1ZSk7XG4gICAgfVxuICAgIGlmIChzdGF0dXMpIHtcbiAgICAgIHRoaXMuc3RhdHVzJC5uZXh0KHN0YXR1cy5jdXJyZW50VmFsdWUpO1xuICAgIH1cbiAgICBpZiAoc2l6ZSkge1xuICAgICAgdGhpcy5zaXplJC5uZXh0KHNpemUuY3VycmVudFZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGZ1bGxXaWR0aCkge1xuICAgICAgdGhpcy5mdWxsV2lkdGgkLm5leHQodGhpcy5mdWxsV2lkdGgpO1xuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLm9wdGlvbnMuY2hhbmdlc1xuICAgICAgLnBpcGUoXG4gICAgICAgIHN0YXJ0V2l0aCh0aGlzLm9wdGlvbnMpLFxuICAgICAgICBmaWx0ZXIoKCkgPT4gdGhpcy5xdWV1ZSAhPSBudWxsICYmIHRoaXMuY2FuU2VsZWN0VmFsdWUoKSksXG4gICAgICAgIC8vIENhbGwgJ3dyaXRlVmFsdWUnIHdoZW4gY3VycmVudCBjaGFuZ2UgZGV0ZWN0aW9uIHJ1biBpcyBmaW5pc2hlZC5cbiAgICAgICAgLy8gV2hlbiB3cml0aW5nIGlzIGZpbmlzaGVkLCBjaGFuZ2UgZGV0ZWN0aW9uIHN0YXJ0cyBhZ2Fpbiwgc2luY2VcbiAgICAgICAgLy8gbWljcm90YXNrcyBxdWV1ZSBpcyBlbXB0eS5cbiAgICAgICAgLy8gUHJldmVudHMgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFcnJvci5cbiAgICAgICAgc3dpdGNoTWFwKChvcHRpb25zOiBRdWVyeUxpc3Q8TmJPcHRpb25Db21wb25lbnQ+KSA9PiBmcm9tKFByb21pc2UucmVzb2x2ZShvcHRpb25zKSkpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95JCksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMud3JpdGVWYWx1ZSh0aGlzLnF1ZXVlKSk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy50cmlnZ2VyU3RyYXRlZ3kgPSB0aGlzLmNyZWF0ZVRyaWdnZXJTdHJhdGVneSgpO1xuXG4gICAgdGhpcy5zdWJzY3JpYmVPbkJ1dHRvbkZvY3VzKCk7XG4gICAgdGhpcy5zdWJzY3JpYmVPblRyaWdnZXJzKCk7XG4gICAgdGhpcy5zdWJzY3JpYmVPbk9wdGlvbkNsaWNrKCk7XG5cbiAgICAvLyBUT0RPOiAjMjI1NFxuICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5ob3N0UmVmLm5hdGl2ZUVsZW1lbnQsICduYi10cmFuc2l0aW9uJyk7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5kZXN0cm95JC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95JC5jb21wbGV0ZSgpO1xuXG4gICAgaWYgKHRoaXMucmVmKSB7XG4gICAgICB0aGlzLnJlZi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRyaWdnZXJTdHJhdGVneSkge1xuICAgICAgdGhpcy50cmlnZ2VyU3RyYXRlZ3kuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIG9uQXV0b2NvbXBsZXRlSW5wdXRDaGFuZ2UoZXZlbnQ6IEV2ZW50KSB7XG4gICAgdGhpcy5vcHRpb25zQXV0b2NvbXBsZXRlSW5wdXRDaGFuZ2UuZW1pdCgoZXZlbnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKTtcbiAgfVxuXG4gIHNob3coKSB7XG4gICAgaWYgKHRoaXMuc2hvdWxkU2hvdygpKSB7XG4gICAgICB0aGlzLmxhc3RTaG93bkJ1dHRvbldpZHRoID0gdGhpcy5ob3N0V2lkdGg7XG5cbiAgICAgIHRoaXMuYXR0YWNoVG9PdmVybGF5KCk7XG5cbiAgICAgIHRoaXMucG9zaXRpb25TdHJhdGVneSRcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgc3dpdGNoTWFwKChwb3NpdGlvblN0cmF0ZWd5KSA9PiBwb3NpdGlvblN0cmF0ZWd5LnBvc2l0aW9uQ2hhbmdlID8/IEVNUFRZKSxcbiAgICAgICAgICB0YWtlKDEpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5pc09wdGlvbnNBdXRvY29tcGxldGVJbnB1dFNob3duKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNBdXRvY29tcGxldGVJbnB1dC5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0QWN0aXZlT3B0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlbGVjdE9wZW4uZW1pdCgpO1xuXG4gICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICB0aGlzLnJlZi5kZXRhY2goKTtcbiAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICB0aGlzLnNlbGVjdENsb3NlLmVtaXQoKTtcblxuICAgICAgdGhpcy5yZXNldEF1dG9jb21wbGV0ZUlucHV0KCk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5hbGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNhblNlbGVjdFZhbHVlKCkpIHtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKHZhbHVlKTtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGlvbk1vZGVsLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnF1ZXVlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5xdWV1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIG9wdGlvbiBvciBjbGVhciBhbGwgc2VsZWN0ZWQgb3B0aW9ucyBpZiB2YWx1ZSBpcyBudWxsLlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgaGFuZGxlT3B0aW9uQ2xpY2sob3B0aW9uOiBOYk9wdGlvbkNvbXBvbmVudCkge1xuICAgIHRoaXMucXVldWUgPSBudWxsO1xuICAgIGlmIChvcHRpb24udmFsdWUgPT0gbnVsbCkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdE9wdGlvbihvcHRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzZWxlY3QgYWxsIHNlbGVjdGVkIG9wdGlvbnMuXG4gICAqICovXG4gIHByb3RlY3RlZCByZXNldCgpIHtcbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmZvckVhY2goKG9wdGlvbjogTmJPcHRpb25Db21wb25lbnQpID0+IG9wdGlvbi5kZXNlbGVjdCgpKTtcbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsID0gW107XG4gICAgdGhpcy5oaWRlKCk7XG4gICAgdGhpcy5mb2N1c0J1dHRvbigpO1xuICAgIHRoaXMuZW1pdFNlbGVjdGVkKHRoaXMubXVsdGlwbGUgPyBbXSA6IG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaG93IHRvIHNlbGVjdCBvcHRpb24gYXMgbXVsdGlwbGUgb3Igc2luZ2xlLlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgc2VsZWN0T3B0aW9uKG9wdGlvbjogTmJPcHRpb25Db21wb25lbnQpIHtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgdGhpcy5oYW5kbGVNdWx0aXBsZVNlbGVjdChvcHRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhbmRsZVNpbmdsZVNlbGVjdChvcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3Qgc2luZ2xlIG9wdGlvbi5cbiAgICogKi9cbiAgcHJvdGVjdGVkIGhhbmRsZVNpbmdsZVNlbGVjdChvcHRpb246IE5iT3B0aW9uQ29tcG9uZW50KSB7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGlvbk1vZGVsLnBvcCgpO1xuXG4gICAgaWYgKHNlbGVjdGVkICYmICF0aGlzLl9jb21wYXJlV2l0aChzZWxlY3RlZC52YWx1ZSwgb3B0aW9uLnZhbHVlKSkge1xuICAgICAgc2VsZWN0ZWQuZGVzZWxlY3QoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsID0gW29wdGlvbl07XG4gICAgb3B0aW9uLnNlbGVjdCgpO1xuICAgIHRoaXMuaGlkZSgpO1xuICAgIHRoaXMuZm9jdXNCdXR0b24oKTtcbiAgICB0aGlzLmVtaXRTZWxlY3RlZChvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCBmb3IgbXVsdGlwbGUgb3B0aW9ucy5cbiAgICogKi9cbiAgcHJvdGVjdGVkIGhhbmRsZU11bHRpcGxlU2VsZWN0KG9wdGlvbjogTmJPcHRpb25Db21wb25lbnQpIHtcbiAgICBpZiAob3B0aW9uLnNlbGVjdGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsID0gdGhpcy5zZWxlY3Rpb25Nb2RlbC5maWx0ZXIoKHMpID0+ICF0aGlzLl9jb21wYXJlV2l0aChzLnZhbHVlLCBvcHRpb24udmFsdWUpKTtcbiAgICAgIG9wdGlvbi5kZXNlbGVjdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLnB1c2gob3B0aW9uKTtcbiAgICAgIG9wdGlvbi5zZWxlY3QoKTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXRTZWxlY3RlZCh0aGlzLnNlbGVjdGlvbk1vZGVsLm1hcCgob3B0OiBOYk9wdGlvbkNvbXBvbmVudCkgPT4gb3B0LnZhbHVlKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXR0YWNoVG9PdmVybGF5KCkge1xuICAgIGlmICghdGhpcy5yZWYpIHtcbiAgICAgIHRoaXMuY3JlYXRlT3ZlcmxheSgpO1xuICAgICAgdGhpcy5zdWJzY3JpYmVPblBvc2l0aW9uQ2hhbmdlKCk7XG4gICAgICB0aGlzLmNyZWF0ZUtleU1hbmFnZXIoKTtcbiAgICAgIHRoaXMuc3Vic2NyaWJlT25PdmVybGF5S2V5cygpO1xuICAgICAgdGhpcy5zdWJzY3JpYmVPbk9wdGlvbnNBdXRvY29tcGxldGVDaGFuZ2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlZi5hdHRhY2godGhpcy5wb3J0YWwpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHNldEFjdGl2ZU9wdGlvbigpIHtcbiAgICBpZiAodGhpcy5zZWxlY3Rpb25Nb2RlbC5sZW5ndGggJiYgIXRoaXMuc2VsZWN0aW9uTW9kZWxbMF0uaGlkZGVuKSB7XG4gICAgICB0aGlzLmN1cnJlbnRLZXlNYW5hZ2VyPy5zZXRBY3RpdmVJdGVtKHRoaXMuc2VsZWN0aW9uTW9kZWxbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnRLZXlNYW5hZ2VyPy5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlT3ZlcmxheSgpIHtcbiAgICBjb25zdCBzY3JvbGxTdHJhdGVneSA9IHRoaXMuY3JlYXRlU2Nyb2xsU3RyYXRlZ3koKTtcbiAgICB0aGlzLnBvc2l0aW9uU3RyYXRlZ3kkLm5leHQodGhpcy5jcmVhdGVQb3NpdGlvblN0cmF0ZWd5KCkpO1xuICAgIHRoaXMucmVmID0gdGhpcy5vdmVybGF5LmNyZWF0ZSh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLnBvc2l0aW9uU3RyYXRlZ3kkLnZhbHVlLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3ksXG4gICAgICBwYW5lbENsYXNzOiB0aGlzLm9wdGlvbnNQYW5lbENsYXNzLFxuICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZUtleU1hbmFnZXIoKTogdm9pZCB7XG4gICAgdGhpcy5hY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlciA9IHRoaXMuYWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXJGYWN0b3J5U2VydmljZVxuICAgICAgLmNyZWF0ZSh0aGlzLm9wdGlvbnMpXG4gICAgICAuc2tpcFByZWRpY2F0ZSgob3B0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzT3B0aW9uSGlkZGVuKG9wdGlvbik7XG4gICAgICB9KTtcblxuICAgIHRoaXMuZm9jdXNLZXlNYW5hZ2VyID0gdGhpcy5mb2N1c0tleU1hbmFnZXJGYWN0b3J5U2VydmljZVxuICAgICAgLmNyZWF0ZSh0aGlzLm9wdGlvbnMpXG4gICAgICAud2l0aFR5cGVBaGVhZCgyMDApXG4gICAgICAuc2tpcFByZWRpY2F0ZSgob3B0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzT3B0aW9uSGlkZGVuKG9wdGlvbik7XG4gICAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlQ3VycmVudEtleU1hbmFnZXIoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCB1cGRhdGVDdXJyZW50S2V5TWFuYWdlcigpIHtcbiAgICB0aGlzLmN1cnJlbnRLZXlNYW5hZ2VyPy5zZXRBY3RpdmVJdGVtKC0xKTtcbiAgICBpZiAodGhpcy5pc09wdGlvbnNBdXRvY29tcGxldGVBbGxvd2VkKSB7XG4gICAgICB0aGlzLmN1cnJlbnRLZXlNYW5hZ2VyID0gdGhpcy5hY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50S2V5TWFuYWdlciA9IHRoaXMuZm9jdXNLZXlNYW5hZ2VyO1xuICAgIH1cbiAgICB0aGlzLnNldEFjdGl2ZU9wdGlvbigpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlc2V0QXV0b2NvbXBsZXRlSW5wdXQoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9uc0F1dG9jb21wbGV0ZUlucHV0Py5uYXRpdmVFbGVtZW50KSB7XG4gICAgICB0aGlzLm9wdGlvbnNBdXRvY29tcGxldGVJbnB1dC5uYXRpdmVFbGVtZW50LnZhbHVlID0gdGhpcy5zZWxlY3Rpb25WaWV3O1xuICAgICAgdGhpcy5vcHRpb25zQXV0b2NvbXBsZXRlSW5wdXRDaGFuZ2UuZW1pdCgnJyk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZVBvc2l0aW9uU3RyYXRlZ3koKTogTmJBZGp1c3RhYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgY29uc3QgZWxlbWVudDogRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50IHwgSFRNTEJ1dHRvbkVsZW1lbnQ+ID0gdGhpcy5pc09wdGlvbnNBdXRvY29tcGxldGVBbGxvd2VkXG4gICAgICA/IHRoaXMub3B0aW9uc0F1dG9jb21wbGV0ZUlucHV0XG4gICAgICA6IHRoaXMuYnV0dG9uO1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uQnVpbGRlclxuICAgICAgLmNvbm5lY3RlZFRvKGVsZW1lbnQpXG4gICAgICAucG9zaXRpb24oTmJQb3NpdGlvbi5CT1RUT00pXG4gICAgICAub2Zmc2V0KHRoaXMub3B0aW9uc092ZXJsYXlPZmZzZXQpXG4gICAgICAuYWRqdXN0bWVudChOYkFkanVzdG1lbnQuVkVSVElDQUwpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHVwZGF0ZVBvc2l0aW9uU3RyYXRlZ3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucmVmKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uU3RyYXRlZ3kkLm5leHQodGhpcy5jcmVhdGVQb3NpdGlvblN0cmF0ZWd5KCkpO1xuICAgICAgdGhpcy5yZWYudXBkYXRlUG9zaXRpb25TdHJhdGVneSh0aGlzLnBvc2l0aW9uU3RyYXRlZ3kkLnZhbHVlKTtcbiAgICAgIGlmICh0aGlzLmlzT3Blbikge1xuICAgICAgICB0aGlzLnJlZi51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVTY3JvbGxTdHJhdGVneSgpOiBOYlNjcm9sbFN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXNbdGhpcy5zY3JvbGxTdHJhdGVneV0oKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVUcmlnZ2VyU3RyYXRlZ3koKTogTmJUcmlnZ2VyU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLnRyaWdnZXJTdHJhdGVneUJ1aWxkZXJcbiAgICAgIC50cmlnZ2VyKE5iVHJpZ2dlci5DTElDSylcbiAgICAgIC5ob3N0KHRoaXMuaG9zdFJlZi5uYXRpdmVFbGVtZW50KVxuICAgICAgLmNvbnRhaW5lcigoKSA9PiB0aGlzLmdldENvbnRhaW5lcigpKVxuICAgICAgLmJ1aWxkKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3Vic2NyaWJlT25UcmlnZ2VycygpIHtcbiAgICB0aGlzLnRyaWdnZXJTdHJhdGVneS5zaG93JC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5zaG93KCkpO1xuICAgIHRoaXMudHJpZ2dlclN0cmF0ZWd5LmhpZGUkLnBpcGUoZmlsdGVyKCgpID0+IHRoaXMuaXNPcGVuKSkuc3Vic2NyaWJlKCgkZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICB0aGlzLmhpZGUoKTtcbiAgICAgIGlmICghdGhpcy5pc0NsaWNrZWRXaXRoaW5Db21wb25lbnQoJGV2ZW50KSkge1xuICAgICAgICB0aGlzLm9uVG91Y2hlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN1YnNjcmliZU9uUG9zaXRpb25DaGFuZ2UoKSB7XG4gICAgdGhpcy5wb3NpdGlvblN0cmF0ZWd5JFxuICAgICAgLnBpcGUoXG4gICAgICAgIHN3aXRjaE1hcCgocG9zaXRpb25TdHJhdGVneSkgPT4gcG9zaXRpb25TdHJhdGVneS5wb3NpdGlvbkNoYW5nZSA/PyBFTVBUWSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKHBvc2l0aW9uOiBOYlBvc2l0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMub3ZlcmxheVBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3Vic2NyaWJlT25PcHRpb25DbGljaygpIHtcbiAgICAvKipcbiAgICAgKiBJZiB0aGUgdXNlciBjaGFuZ2VzIHByb3ZpZGVkIG9wdGlvbnMgbGlzdCBpbiB0aGUgcnVudGltZSB3ZSBoYXZlIHRvIGhhbmRsZSB0aGlzXG4gICAgICogYW5kIHJlc3Vic2NyaWJlIG9uIG9wdGlvbnMgc2VsZWN0aW9uIGNoYW5nZXMgZXZlbnQuXG4gICAgICogT3RoZXJ3aXNlLCB0aGUgdXNlciB3aWxsIG5vdCBiZSBhYmxlIHRvIHNlbGVjdCBuZXcgb3B0aW9ucy5cbiAgICAgKiAqL1xuICAgIHRoaXMub3B0aW9ucy5jaGFuZ2VzXG4gICAgICAucGlwZShcbiAgICAgICAgc3RhcnRXaXRoKHRoaXMub3B0aW9ucyksXG4gICAgICAgIHN3aXRjaE1hcCgob3B0aW9uczogUXVlcnlMaXN0PE5iT3B0aW9uQ29tcG9uZW50PikgPT4ge1xuICAgICAgICAgIHJldHVybiBtZXJnZSguLi5vcHRpb25zLm1hcCgob3B0aW9uKSA9PiBvcHRpb24uY2xpY2spKTtcbiAgICAgICAgfSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKGNsaWNrZWRPcHRpb246IE5iT3B0aW9uQ29tcG9uZW50KSA9PiB0aGlzLmhhbmRsZU9wdGlvbkNsaWNrKGNsaWNrZWRPcHRpb24pKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzdWJzY3JpYmVPbk92ZXJsYXlLZXlzKCk6IHZvaWQge1xuICAgIHRoaXMucmVmXG4gICAgICAua2V5ZG93bkV2ZW50cygpXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKCgpID0+IHRoaXMuaXNPcGVuKSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveSQpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSkge1xuICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgIHRoaXMuZm9jdXNCdXR0b24oKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSBFTlRFUiAmJiB0aGlzLmlzT3B0aW9uc0F1dG9jb21wbGV0ZUlucHV0U2hvd24pIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGNvbnN0IGFjdGl2ZUl0ZW0gPSB0aGlzLmN1cnJlbnRLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gICAgICAgICAgaWYgKGFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0T3B0aW9uKGFjdGl2ZUl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmN1cnJlbnRLZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgbWVyZ2UoXG4gICAgICB0aGlzLmZvY3VzS2V5TWFuYWdlci50YWJPdXQucGlwZShmaWx0ZXIoKCkgPT4gIXRoaXMuaXNPcHRpb25zQXV0b2NvbXBsZXRlSW5wdXRTaG93bikpLFxuICAgICAgdGhpcy5hY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlci50YWJPdXQucGlwZShmaWx0ZXIoKCkgPT4gdGhpcy5pc09wdGlvbnNBdXRvY29tcGxldGVJbnB1dFNob3duKSksXG4gICAgKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB0aGlzLm9uVG91Y2hlZCgpO1xuICAgICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3Vic2NyaWJlT25PcHRpb25zQXV0b2NvbXBsZXRlQ2hhbmdlKCkge1xuICAgIHRoaXMub3B0aW9uc0F1dG9jb21wbGV0ZUlucHV0Q2hhbmdlXG4gICAgICAucGlwZShcbiAgICAgICAgb2JzZXJ2ZU9uKGFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyKSxcbiAgICAgICAgZmlsdGVyKCgpID0+IHRoaXMuaXNPcHRpb25zQXV0b2NvbXBsZXRlSW5wdXRTaG93biksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pc09wdGlvbkhpZGRlbih0aGlzLmN1cnJlbnRLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pKSB7XG4gICAgICAgICAgdGhpcy5jdXJyZW50S2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3Vic2NyaWJlT25CdXR0b25Gb2N1cygpIHtcbiAgICBjb25zdCBidXR0b25Gb2N1cyQgPSB0aGlzLmZvY3VzTW9uaXRvci5tb25pdG9yKHRoaXMuYnV0dG9uKS5waXBlKFxuICAgICAgbWFwKChvcmlnaW4pID0+ICEhb3JpZ2luKSxcbiAgICAgIHN0YXJ0V2l0aChmYWxzZSksXG4gICAgICBmaW5hbGl6ZSgoKSA9PiB0aGlzLmZvY3VzTW9uaXRvci5zdG9wTW9uaXRvcmluZyh0aGlzLmJ1dHRvbikpLFxuICAgICk7XG5cbiAgICBjb25zdCBmaWx0ZXJJbnB1dEZvY3VzJCA9IHRoaXMuZm9jdXNNb25pdG9yLm1vbml0b3IodGhpcy5vcHRpb25zQXV0b2NvbXBsZXRlSW5wdXQpLnBpcGUoXG4gICAgICBtYXAoKG9yaWdpbikgPT4gISFvcmlnaW4pLFxuICAgICAgc3RhcnRXaXRoKGZhbHNlKSxcbiAgICAgIGZpbmFsaXplKCgpID0+IHRoaXMuZm9jdXNNb25pdG9yLnN0b3BNb25pdG9yaW5nKHRoaXMuYnV0dG9uKSksXG4gICAgKTtcblxuICAgIGNvbWJpbmVMYXRlc3QoW2J1dHRvbkZvY3VzJCwgZmlsdGVySW5wdXRGb2N1cyRdKVxuICAgICAgLnBpcGUoXG4gICAgICAgIG1hcCgoW2J1dHRvbkZvY3VzLCBmaWx0ZXJJbnB1dEZvY3VzXSkgPT4gYnV0dG9uRm9jdXMgfHwgZmlsdGVySW5wdXRGb2N1cyksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5mb2N1c2VkJCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q29udGFpbmVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnJlZiAmJlxuICAgICAgdGhpcy5yZWYuaGFzQXR0YWNoZWQoKSAmJlxuICAgICAgPENvbXBvbmVudFJlZjxhbnk+PntcbiAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICBuYXRpdmVFbGVtZW50OiB0aGlzLnJlZi5vdmVybGF5RWxlbWVudCxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGZvY3VzQnV0dG9uKCkge1xuICAgIC8qKlxuICAgICAqIE5lZWQgdG8gd3JhcCB3aXRoIHNldFRpbWVvdXRcbiAgICAgKiBiZWNhdXNlIG90aGVyd2lzZSBmb2N1cyBjb3VsZCBiZSBjYWxsZWRcbiAgICAgKiB3aGVuIHRoZSBjb21wb25lbnQgaGFzbid0IHJlcmVuZGVyZWQgdGhlIGJ1dHRvblxuICAgICAqIHdoaWNoIHdhcyBoaWRkZW4gYnkgYGlzT3B0aW9uc0F1dG9jb21wbGV0ZUlucHV0U2hvd25gIHByb3BlcnR5LlxuICAgICAqL1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5idXR0b24/Lm5hdGl2ZUVsZW1lbnQ/LmZvY3VzKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvcGFnYXRlIHNlbGVjdGVkIHZhbHVlLlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgZW1pdFNlbGVjdGVkKHNlbGVjdGVkKSB7XG4gICAgdGhpcy5vbkNoYW5nZShzZWxlY3RlZCk7XG4gICAgdGhpcy5zZWxlY3RlZENoYW5nZS5lbWl0KHNlbGVjdGVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgc2VsZWN0ZWQgdmFsdWUgaW4gbW9kZWwuXG4gICAqICovXG4gIHByb3RlY3RlZCBzZXRTZWxlY3Rpb24odmFsdWUpIHtcbiAgICBjb25zdCBpc1Jlc2V0VmFsdWUgPSB2YWx1ZSA9PSBudWxsO1xuICAgIGxldCBzYWZlVmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLm11bHRpcGxlKSB7XG4gICAgICBzYWZlVmFsdWUgPSB2YWx1ZSA/PyBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBpc0FycmF5OiBib29sZWFuID0gQXJyYXkuaXNBcnJheShzYWZlVmFsdWUpO1xuXG4gICAgaWYgKHRoaXMubXVsdGlwbGUgJiYgIWlzQXJyYXkgJiYgIWlzUmVzZXRWYWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYXNzaWduIHNpbmdsZSB2YWx1ZSBpZiBzZWxlY3QgaXMgbWFya2VkIGFzIG11bHRpcGxlXCIpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgaXNBcnJheSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYXNzaWduIGFycmF5IGlmIHNlbGVjdCBpcyBub3QgbWFya2VkIGFzIG11bHRpcGxlXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZE9wdGlvbnMgPSB0aGlzLnNlbGVjdGlvbk1vZGVsO1xuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwgPSBbXTtcblxuICAgIGlmICh0aGlzLm11bHRpcGxlKSB7XG4gICAgICBzYWZlVmFsdWUuZm9yRWFjaCgob3B0aW9uKSA9PiB0aGlzLnNlbGVjdFZhbHVlKG9wdGlvbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdFZhbHVlKHNhZmVWYWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gZmluZCBvcHRpb25zIHdoaWNoIHdlcmUgc2VsZWN0ZWQgYmVmb3JlIGFuZCB0cmlnZ2VyIGRlc2VsZWN0XG4gICAgcHJldmlvdXNseVNlbGVjdGVkT3B0aW9uc1xuICAgICAgLmZpbHRlcigob3B0aW9uOiBOYk9wdGlvbkNvbXBvbmVudCkgPT4gIXRoaXMuc2VsZWN0aW9uTW9kZWwuaW5jbHVkZXMob3B0aW9uKSlcbiAgICAgIC5mb3JFYWNoKChvcHRpb246IE5iT3B0aW9uQ29tcG9uZW50KSA9PiBvcHRpb24uZGVzZWxlY3QoKSk7XG5cbiAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgdmFsdWUuXG4gICAqICovXG4gIHByb3RlY3RlZCBzZWxlY3RWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29ycmVzcG9uZGluZyA9IHRoaXMub3B0aW9ucy5maW5kKChvcHRpb246IE5iT3B0aW9uQ29tcG9uZW50KSA9PiB0aGlzLl9jb21wYXJlV2l0aChvcHRpb24udmFsdWUsIHZhbHVlKSk7XG5cbiAgICBpZiAoY29ycmVzcG9uZGluZykge1xuICAgICAgY29ycmVzcG9uZGluZy5zZWxlY3QoKTtcbiAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwucHVzaChjb3JyZXNwb25kaW5nKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgc2hvdWxkU2hvdygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0hpZGRlbiAmJiB0aGlzLm9wdGlvbnM/Lmxlbmd0aCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0b3VjaGVkIGlmIGZvY3VzIG1vdmVkIG91dHNpZGUgb2YgYnV0dG9uIGFuZCBvdmVybGF5LFxuICAgKiBpZ25vcmluZyB0aGUgY2FzZSB3aGVuIGZvY3VzIG1vdmVkIHRvIG9wdGlvbnMgb3ZlcmxheS5cbiAgICovXG4gIHRyeVNldFRvdWNoZWQoKSB7XG4gICAgaWYgKHRoaXMuaXNIaWRkZW4pIHtcbiAgICAgIHRoaXMub25Ub3VjaGVkKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGlzQ2xpY2tlZFdpdGhpbkNvbXBvbmVudCgkZXZlbnQ6IEV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdFJlZi5uYXRpdmVFbGVtZW50ID09PSAkZXZlbnQudGFyZ2V0IHx8IHRoaXMuaG9zdFJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKCRldmVudC50YXJnZXQgYXMgTm9kZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2FuU2VsZWN0VmFsdWUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMubGVuZ3RoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBpc09wdGlvbkhpZGRlbihvcHRpb246IE5iT3B0aW9uQ29tcG9uZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG9wdGlvbi5oaWRkZW47XG4gIH1cblxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnNpemUtdGlueScpXG4gIGdldCB0aW55KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNpemUgPT09ICd0aW55JztcbiAgfVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnNpemUtc21hbGwnKVxuICBnZXQgc21hbGwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZSA9PT0gJ3NtYWxsJztcbiAgfVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnNpemUtbWVkaXVtJylcbiAgZ2V0IG1lZGl1bSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zaXplID09PSAnbWVkaXVtJztcbiAgfVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnNpemUtbGFyZ2UnKVxuICBnZXQgbGFyZ2UoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZSA9PT0gJ2xhcmdlJztcbiAgfVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnNpemUtZ2lhbnQnKVxuICBnZXQgZ2lhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZSA9PT0gJ2dpYW50JztcbiAgfVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnN0YXR1cy1wcmltYXJ5JylcbiAgZ2V0IHByaW1hcnkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdHVzID09PSAncHJpbWFyeSc7XG4gIH1cbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5zdGF0dXMtaW5mbycpXG4gIGdldCBpbmZvKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YXR1cyA9PT0gJ2luZm8nO1xuICB9XG4gIEBIb3N0QmluZGluZygnY2xhc3Muc3RhdHVzLXN1Y2Nlc3MnKVxuICBnZXQgc3VjY2VzcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0dXMgPT09ICdzdWNjZXNzJztcbiAgfVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnN0YXR1cy13YXJuaW5nJylcbiAgZ2V0IHdhcm5pbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdHVzID09PSAnd2FybmluZyc7XG4gIH1cbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5zdGF0dXMtZGFuZ2VyJylcbiAgZ2V0IGRhbmdlcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0dXMgPT09ICdkYW5nZXInO1xuICB9XG4gIEBIb3N0QmluZGluZygnY2xhc3Muc3RhdHVzLWJhc2ljJylcbiAgZ2V0IGJhc2ljKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YXR1cyA9PT0gJ2Jhc2ljJztcbiAgfVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnN0YXR1cy1jb250cm9sJylcbiAgZ2V0IGNvbnRyb2woKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdHVzID09PSAnY29udHJvbCc7XG4gIH1cbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5zaGFwZS1yZWN0YW5nbGUnKVxuICBnZXQgcmVjdGFuZ2xlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNoYXBlID09PSAncmVjdGFuZ2xlJztcbiAgfVxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnNoYXBlLXJvdW5kJylcbiAgZ2V0IHJvdW5kKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNoYXBlID09PSAncm91bmQnO1xuICB9XG4gIEBIb3N0QmluZGluZygnY2xhc3Muc2hhcGUtc2VtaS1yb3VuZCcpXG4gIGdldCBzZW1pUm91bmQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2hhcGUgPT09ICdzZW1pLXJvdW5kJztcbiAgfVxufVxuIiwiPGJ1dHRvblxuICBbaGlkZGVuXT1cImlzT3B0aW9uc0F1dG9jb21wbGV0ZUlucHV0U2hvd25cIlxuICBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIlxuICBbbmdDbGFzc109XCJzZWxlY3RCdXR0b25DbGFzc2VzXCJcbiAgKGJsdXIpPVwidHJ5U2V0VG91Y2hlZCgpXCJcbiAgKGtleWRvd24uYXJyb3dEb3duKT1cInNob3coKVwiXG4gIChrZXlkb3duLmFycm93VXApPVwic2hvdygpXCJcbiAgY2xhc3M9XCJzZWxlY3QtYnV0dG9uXCJcbiAgdHlwZT1cImJ1dHRvblwiXG4gICNzZWxlY3RCdXR0b25cbj5cbiAgPHNwYW4gKGNsaWNrKT1cImRpc2FibGVkICYmICRldmVudC5zdG9wUHJvcGFnYXRpb24oKVwiPlxuICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCJzZWxlY3Rpb25Nb2RlbC5sZW5ndGg7IGVsc2UgcGxhY2Vob2xkZXJUZW1wbGF0ZVwiPlxuICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cImN1c3RvbUxhYmVsOyBlbHNlIGRlZmF1bHRTZWxlY3Rpb25UZW1wbGF0ZVwiPlxuICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJuYi1zZWxlY3QtbGFiZWxcIj48L25nLWNvbnRlbnQ+XG4gICAgICA8L25nLWNvbnRhaW5lcj5cblxuICAgICAgPG5nLXRlbXBsYXRlICNkZWZhdWx0U2VsZWN0aW9uVGVtcGxhdGU+e3sgc2VsZWN0aW9uVmlldyB9fTwvbmctdGVtcGxhdGU+XG4gICAgPC9uZy1jb250YWluZXI+XG5cbiAgICA8bmctdGVtcGxhdGUgI3BsYWNlaG9sZGVyVGVtcGxhdGU+e3sgcGxhY2Vob2xkZXIgfX08L25nLXRlbXBsYXRlPlxuICA8L3NwYW4+XG5cbiAgPG5iLWljb25cbiAgICBpY29uPVwiY2hldnJvbi1kb3duLW91dGxpbmVcIlxuICAgIHBhY2s9XCJuZWJ1bGFyLWVzc2VudGlhbHNcIlxuICAgIChjbGljayk9XCJkaXNhYmxlZCAmJiAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcIlxuICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gID5cbiAgPC9uYi1pY29uPlxuPC9idXR0b24+XG5cbjxuYi1mb3JtLWZpZWxkIFtoaWRkZW5dPVwiIWlzT3B0aW9uc0F1dG9jb21wbGV0ZUlucHV0U2hvd25cIj5cbiAgPGlucHV0XG4gICAgbmJJbnB1dFxuICAgIGZ1bGxXaWR0aFxuICAgIFtzdHlsZS5tYXgtd2lkdGgucHhdPVwibGFzdFNob3duQnV0dG9uV2lkdGhcIlxuICAgICNvcHRpb25zQXV0b2NvbXBsZXRlSW5wdXRcbiAgICBbdmFsdWVdPVwic2VsZWN0aW9uVmlld1wiXG4gICAgW3BsYWNlaG9sZGVyXT1cInBsYWNlaG9sZGVyXCJcbiAgICBbc3RhdHVzXT1cInN0YXR1c1wiXG4gICAgW3NoYXBlXT1cInNoYXBlXCJcbiAgICBbZmllbGRTaXplXT1cInNpemVcIlxuICAgIChibHVyKT1cInRyeVNldFRvdWNoZWQoKVwiXG4gICAgKGNsaWNrKT1cIiRldmVudC5zdG9wUHJvcGFnYXRpb24oKVwiXG4gICAgKGRibGNsaWNrKT1cIiRldmVudC5zdG9wUHJvcGFnYXRpb24oKVwiXG4gICAgKGlucHV0KT1cIm9uQXV0b2NvbXBsZXRlSW5wdXRDaGFuZ2UoJGV2ZW50KVwiXG4gIC8+XG4gIDxuYi1pY29uIG5iU3VmZml4IGljb249XCJjaGV2cm9uLXVwLW91dGxpbmVcIiBwYWNrPVwibmVidWxhci1lc3NlbnRpYWxzXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+IDwvbmItaWNvbj5cbjwvbmItZm9ybS1maWVsZD5cblxuPG5iLW9wdGlvbi1saXN0XG4gICpuYlBvcnRhbFxuICBbc2l6ZV09XCJzaXplXCJcbiAgW3Bvc2l0aW9uXT1cIm92ZXJsYXlQb3NpdGlvblwiXG4gIFtzdHlsZS53aWR0aC5weF09XCJvcHRpb25zV2lkdGhcIlxuICBbbmdDbGFzc109XCJvcHRpb25zTGlzdENsYXNzXCJcbj5cbiAgPG5nLWNvbnRlbnQgc2VsZWN0PVwibmItb3B0aW9uLCBuYi1vcHRpb24tZ3JvdXBcIj48L25nLWNvbnRlbnQ+XG48L25iLW9wdGlvbi1saXN0PlxuIl19