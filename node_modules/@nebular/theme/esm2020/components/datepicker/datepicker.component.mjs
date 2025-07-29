/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, Inject, Input, Output, Optional, } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';
import { NbComponentPortal } from '../cdk/overlay/mapping';
import { NbAdjustment, NbPosition, } from '../cdk/overlay/overlay-position';
import { patch } from '../cdk/overlay/overlay-service';
import { NbTrigger } from '../cdk/overlay/overlay-trigger';
import { NbDatepickerContainerComponent } from './datepicker-container.component';
import { NB_DOCUMENT } from '../../theme.options';
import { NbCalendarRangeComponent } from '../calendar/calendar-range.component';
import { NbCalendarComponent } from '../calendar/calendar.component';
import { NbCalendarSize, NbCalendarViewMode, } from '../calendar-kit/model';
import { NB_DATE_SERVICE_OPTIONS, NbDatepicker } from './datepicker.directive';
import { convertToBoolProperty } from '../helpers';
import * as i0 from "@angular/core";
import * as i1 from "../cdk/overlay/overlay-position";
import * as i2 from "../cdk/overlay/overlay-trigger";
import * as i3 from "../cdk/overlay/overlay-service";
import * as i4 from "../calendar-kit/services/date.service";
/**
 * The `NbBasePicker` component concentrates overlay manipulation logic.
 * */
export class NbBasePicker extends NbDatepicker {
    constructor(overlay, positionBuilder, triggerStrategyBuilder, cfr, dateService, dateServiceOptions) {
        super();
        this.overlay = overlay;
        this.positionBuilder = positionBuilder;
        this.triggerStrategyBuilder = triggerStrategyBuilder;
        this.cfr = cfr;
        this.dateService = dateService;
        this.dateServiceOptions = dateServiceOptions;
        this.formatChanged$ = new Subject();
        this.init$ = new ReplaySubject();
        /**
         * Stream of picker changes. Required to be the subject because picker hides and shows and picker
         * change stream becomes recreated.
         * */
        this.onChange$ = new Subject();
        this.overlayOffset = 8;
        this.adjustment = NbAdjustment.COUNTERCLOCKWISE;
        this.destroy$ = new Subject();
        this.blur$ = new Subject();
    }
    /**
     * Returns picker instance.
     * */
    get picker() {
        return this.pickerRef && this.pickerRef.instance;
    }
    /**
     * Stream of picker value changes.
     * */
    get valueChange() {
        return this.onChange$.asObservable();
    }
    get isShown() {
        return this.ref && this.ref.hasAttached();
    }
    get init() {
        return this.init$.asObservable();
    }
    /**
     * Emits when datepicker looses focus.
     */
    get blur() {
        return this.blur$.asObservable();
    }
    /**
     * Datepicker knows nothing about host html input element.
     * So, attach method attaches datepicker to the host input element.
     * */
    attach(hostRef) {
        this.hostRef = hostRef;
        this.subscribeOnTriggers();
    }
    getValidatorConfig() {
        return { min: this.min, max: this.max, filter: this.filter };
    }
    show() {
        if (!this.ref) {
            this.createOverlay();
        }
        this.openDatepicker();
    }
    shouldHide() {
        return this.hideOnSelect && !!this.value;
    }
    hide() {
        if (this.ref) {
            this.ref.detach();
        }
        // save current value if picker was rendered
        if (this.picker) {
            this.queue = this.value;
            this.pickerRef.destroy();
            this.pickerRef = null;
            this.container = null;
        }
    }
    createOverlay() {
        this.positionStrategy = this.createPositionStrategy();
        this.ref = this.overlay.create({
            positionStrategy: this.positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
        });
        this.subscribeOnPositionChange();
    }
    openDatepicker() {
        this.container = this.ref.attach(new NbComponentPortal(NbDatepickerContainerComponent, null, null, this.cfr));
        this.instantiatePicker();
        this.subscribeOnValueChange();
        this.writeQueue();
        this.patchWithInputs();
        this.pickerRef.changeDetectorRef.markForCheck();
    }
    createPositionStrategy() {
        return this.positionBuilder
            .connectedTo(this.hostRef)
            .position(NbPosition.BOTTOM)
            .offset(this.overlayOffset)
            .adjustment(this.adjustment);
    }
    subscribeOnPositionChange() {
        this.positionStrategy.positionChange
            .pipe(takeUntil(this.destroy$))
            .subscribe((position) => patch(this.container, { position }));
    }
    createTriggerStrategy() {
        return this.triggerStrategyBuilder
            .trigger(NbTrigger.FOCUS)
            .host(this.hostRef.nativeElement)
            .container(() => this.container)
            .build();
    }
    subscribeOnTriggers() {
        this.triggerStrategy = this.createTriggerStrategy();
        this.triggerStrategy.show$.subscribe(() => this.show());
        this.triggerStrategy.hide$.subscribe(() => {
            this.blur$.next();
            this.hide();
        });
    }
    instantiatePicker() {
        this.pickerRef = this.container.instance.attach(new NbComponentPortal(this.pickerClass, null, null, this.cfr));
    }
    /**
     * Subscribes on picker value changes and emit data through this.onChange$ subject.
     * */
    subscribeOnValueChange() {
        this.pickerValueChange.subscribe((date) => {
            this.onChange$.next(date);
        });
    }
    patchWithInputs() {
        this.picker.boundingMonth = this.boundingMonth;
        this.picker.startView = this.startView;
        this.picker.min = this.min;
        this.picker.max = this.max;
        this.picker.filter = this.filter;
        this.picker._cellComponent = this.dayCellComponent;
        this.picker._monthCellComponent = this.monthCellComponent;
        this.picker._yearCellComponent = this.yearCellComponent;
        this.picker.size = this.size;
        this.picker.showNavigation = this.showNavigation;
        this.picker.visibleDate = this.visibleDate;
        this.picker.showWeekNumber = this.showWeekNumber;
        this.picker.weekNumberSymbol = this.weekNumberSymbol;
    }
    checkFormat() {
        if (this.dateService.getId() === 'native' && this.format) {
            throw new Error("Can't format native date. To use custom formatting you have to install @nebular/moment or " +
                '@nebular/date-fns package and import NbMomentDateModule or NbDateFnsDateModule accordingly.' +
                'More information at "Formatting issue" ' +
                'https://akveo.github.io/nebular/docs/components/datepicker/overview#nbdatepickercomponent');
        }
        const isFormatSet = this.format || (this.dateServiceOptions && this.dateServiceOptions.format);
        if (this.dateService.getId() === 'date-fns' && !isFormatSet) {
            throw new Error('format is required when using NbDateFnsDateModule');
        }
    }
}
export class NbBasePickerComponent extends NbBasePicker {
    constructor(document, positionBuilder, triggerStrategyBuilder, overlay, cfr, dateService, dateServiceOptions) {
        super(overlay, positionBuilder, triggerStrategyBuilder, cfr, dateService, dateServiceOptions);
        /**
         * Defines if we should render previous and next months
         * in the current month view.
         * */
        this.boundingMonth = true;
        /**
         * Defines starting view for calendar.
         * */
        this.startView = NbCalendarViewMode.DATE;
        /**
         * Size of the calendar and entire components.
         * Can be 'medium' which is default or 'large'.
         * */
        this.size = NbCalendarSize.MEDIUM;
        /**
         * Hide picker when a date or a range is selected, `true` by default
         * @type {boolean}
         */
        this.hideOnSelect = true;
        /**
         * Determines should we show calendars navigation or not.
         * @type {boolean}
         */
        this.showNavigation = true;
        /**
         * Sets symbol used as a header for week numbers column
         * */
        this.weekNumberSymbol = '#';
        this._showWeekNumber = false;
        /**
         * Determines picker overlay offset (in pixels).
         * */
        this.overlayOffset = 8;
        this.adjustment = NbAdjustment.COUNTERCLOCKWISE;
    }
    /**
     * Determines should we show week numbers column.
     * False by default.
     * */
    get showWeekNumber() {
        return this._showWeekNumber;
    }
    set showWeekNumber(value) {
        this._showWeekNumber = convertToBoolProperty(value);
    }
    ngOnInit() {
        this.checkFormat();
        this.init$.next();
    }
    ngOnChanges(changes) {
        if (changes.format) {
            if (!changes.format.isFirstChange()) {
                this.checkFormat();
            }
            this.formatChanged$.next();
        }
        if (this.picker) {
            this.patchWithInputs();
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.hide();
        this.init$.complete();
        if (this.ref) {
            this.ref.dispose();
        }
        if (this.triggerStrategy) {
            this.triggerStrategy.destroy();
        }
    }
    get pickerValueChange() {
        return undefined;
    }
    get value() {
        return undefined;
    }
    set value(value) { }
    writeQueue() { }
}
NbBasePickerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbBasePickerComponent, deps: [{ token: NB_DOCUMENT }, { token: i1.NbPositionBuilderService }, { token: i2.NbTriggerStrategyBuilderService }, { token: i3.NbOverlayService }, { token: i0.ComponentFactoryResolver }, { token: i4.NbDateService }, { token: NB_DATE_SERVICE_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component });
NbBasePickerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbBasePickerComponent, selector: "ng-component", inputs: { format: "format", boundingMonth: "boundingMonth", startView: "startView", min: "min", max: "max", filter: "filter", dayCellComponent: "dayCellComponent", monthCellComponent: "monthCellComponent", yearCellComponent: "yearCellComponent", size: "size", visibleDate: "visibleDate", hideOnSelect: "hideOnSelect", showNavigation: "showNavigation", weekNumberSymbol: "weekNumberSymbol", showWeekNumber: "showWeekNumber", overlayOffset: "overlayOffset", adjustment: "adjustment" }, usesInheritance: true, usesOnChanges: true, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbBasePickerComponent, decorators: [{
            type: Component,
            args: [{
                    template: '',
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_DOCUMENT]
                }] }, { type: i1.NbPositionBuilderService }, { type: i2.NbTriggerStrategyBuilderService }, { type: i3.NbOverlayService }, { type: i0.ComponentFactoryResolver }, { type: i4.NbDateService }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NB_DATE_SERVICE_OPTIONS]
                }] }]; }, propDecorators: { format: [{
                type: Input
            }], boundingMonth: [{
                type: Input
            }], startView: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], filter: [{
                type: Input
            }], dayCellComponent: [{
                type: Input
            }], monthCellComponent: [{
                type: Input
            }], yearCellComponent: [{
                type: Input
            }], size: [{
                type: Input
            }], visibleDate: [{
                type: Input
            }], hideOnSelect: [{
                type: Input
            }], showNavigation: [{
                type: Input
            }], weekNumberSymbol: [{
                type: Input
            }], showWeekNumber: [{
                type: Input
            }], overlayOffset: [{
                type: Input
            }], adjustment: [{
                type: Input
            }] } });
/**
 * The DatePicker components itself.
 * Provides a proxy to `NbCalendar` options as well as custom picker options.
 */
export class NbDatepickerComponent extends NbBasePickerComponent {
    constructor() {
        super(...arguments);
        this.pickerClass = NbCalendarComponent;
    }
    /**
     * Date which will be rendered as selected.
     * */
    set date(date) {
        this.value = date;
    }
    /**
     * Emits date when selected.
     * */
    get dateChange() {
        return this.valueChange;
    }
    get value() {
        return this.picker ? this.picker.date : undefined;
    }
    set value(date) {
        if (!this.picker) {
            this.queue = date;
            return;
        }
        if (date) {
            this.visibleDate = date;
            this.picker.visibleDate = date;
            this.picker.date = date;
        }
    }
    get pickerValueChange() {
        return this.picker.dateChange;
    }
    writeQueue() {
        if (this.queue) {
            const date = this.queue;
            this.queue = null;
            this.value = date;
        }
    }
}
NbDatepickerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbDatepickerComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
NbDatepickerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbDatepickerComponent, selector: "nb-datepicker", inputs: { date: "date" }, outputs: { dateChange: "dateChange" }, usesInheritance: true, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbDatepickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nb-datepicker',
                    template: '',
                }]
        }], propDecorators: { date: [{
                type: Input
            }], dateChange: [{
                type: Output
            }] } });
/**
 * The RangeDatePicker components itself.
 * Provides a proxy to `NbCalendarRange` options as well as custom picker options.
 */
export class NbRangepickerComponent extends NbBasePickerComponent {
    constructor() {
        super(...arguments);
        this.pickerClass = NbCalendarRangeComponent;
    }
    /**
     * Range which will be rendered as selected.
     * */
    set range(range) {
        this.value = range;
    }
    /**
     * Emits range when start selected and emits again when end selected.
     * */
    get rangeChange() {
        return this.valueChange;
    }
    get value() {
        return this.picker ? this.picker.range : undefined;
    }
    set value(range) {
        if (!this.picker) {
            this.queue = range;
            return;
        }
        if (range) {
            const visibleDate = range && range.start;
            this.visibleDate = visibleDate;
            this.picker.visibleDate = visibleDate;
            this.picker.range = range;
        }
    }
    get pickerValueChange() {
        return this.picker.rangeChange;
    }
    shouldHide() {
        return super.shouldHide() && !!(this.value && this.value.start && this.value.end);
    }
    writeQueue() {
        if (this.queue) {
            const range = this.queue;
            this.queue = null;
            this.value = range;
        }
    }
}
NbRangepickerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbRangepickerComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
NbRangepickerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbRangepickerComponent, selector: "nb-rangepicker", inputs: { range: "range" }, outputs: { rangeChange: "rangeChange" }, usesInheritance: true, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbRangepickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nb-rangepicker',
                    template: '',
                }]
        }], propDecorators: { range: [{
                type: Input
            }], rangeChange: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL3RoZW1lL2NvbXBvbmVudHMvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFNVCxNQUFNLEVBQ04sS0FBSyxFQUVMLE1BQU0sRUFJTixRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzNDLE9BQU8sRUFBYyxhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTFELE9BQU8sRUFBRSxpQkFBaUIsRUFBZ0IsTUFBTSx3QkFBd0IsQ0FBQztBQUN6RSxPQUFPLEVBRUwsWUFBWSxFQUVaLFVBQVUsR0FFWCxNQUFNLGlDQUFpQyxDQUFDO0FBQ3pDLE9BQU8sRUFBb0IsS0FBSyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDekUsT0FBTyxFQUFFLFNBQVMsRUFBc0QsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMvRyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNsRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFtQix3QkFBd0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JFLE9BQU8sRUFFTCxjQUFjLEVBQ2Qsa0JBQWtCLEdBR25CLE1BQU0sdUJBQXVCLENBQUM7QUFFL0IsT0FBTyxFQUFFLHVCQUF1QixFQUFFLFlBQVksRUFBMkIsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RyxPQUFPLEVBQUUscUJBQXFCLEVBQWtCLE1BQU0sWUFBWSxDQUFDOzs7Ozs7QUFFbkU7O0tBRUs7QUFDTCxNQUFNLE9BQWdCLFlBQXNCLFNBQVEsWUFBa0I7SUE2SXBFLFlBQ1ksT0FBeUIsRUFDekIsZUFBeUMsRUFDekMsc0JBQXVELEVBQ3ZELEdBQTZCLEVBQzdCLFdBQTZCLEVBQzdCLGtCQUFrQjtRQUU1QixLQUFLLEVBQUUsQ0FBQztRQVBFLFlBQU8sR0FBUCxPQUFPLENBQWtCO1FBQ3pCLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtRQUN6QywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQWlDO1FBQ3ZELFFBQUcsR0FBSCxHQUFHLENBQTBCO1FBQzdCLGdCQUFXLEdBQVgsV0FBVyxDQUFrQjtRQUM3Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQUE7UUFqRXJCLG1CQUFjLEdBQWtCLElBQUksT0FBTyxFQUFFLENBQUM7UUFnQzdDLFVBQUssR0FBd0IsSUFBSSxhQUFhLEVBQVEsQ0FBQztRQUVqRTs7O2FBR0s7UUFDSyxjQUFTLEdBQWUsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQU90QyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUVsQixlQUFVLEdBQWlCLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztRQUV6RCxhQUFRLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQVEvQixVQUFLLEdBQWtCLElBQUksT0FBTyxFQUFRLENBQUM7SUFXckQsQ0FBQztJQUVEOztTQUVLO0lBQ0wsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO0lBQ25ELENBQUM7SUFFRDs7U0FFSztJQUNMLElBQUksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUlEOzs7U0FHSztJQUNMLE1BQU0sQ0FBQyxPQUFtQjtRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQy9ELENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDYixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDdEI7UUFFRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDM0MsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ25CO1FBRUQsNENBQTRDO1FBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQztJQUlTLGFBQWE7UUFDckIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDN0IsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtZQUN2QyxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7U0FDM0QsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVTLGNBQWM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixDQUFDLDhCQUE4QixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDOUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2xELENBQUM7SUFFUyxzQkFBc0I7UUFDOUIsT0FBTyxJQUFJLENBQUMsZUFBZTthQUN4QixXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUN6QixRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQzthQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQzthQUMxQixVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFUyx5QkFBeUI7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWM7YUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUIsU0FBUyxDQUFDLENBQUMsUUFBb0IsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVTLHFCQUFxQjtRQUM3QixPQUFPLElBQUksQ0FBQyxzQkFBc0I7YUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7YUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO2FBQ2hDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2FBQy9CLEtBQUssRUFBRSxDQUFDO0lBQ2IsQ0FBQztJQUVTLG1CQUFtQjtRQUMzQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRVMsaUJBQWlCO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pILENBQUM7SUFFRDs7U0FFSztJQUNLLHNCQUFzQjtRQUM5QixJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRVMsZUFBZTtRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDdkQsQ0FBQztJQUVTLFdBQVc7UUFDbkIsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3hELE1BQU0sSUFBSSxLQUFLLENBQ2IsNEZBQTRGO2dCQUMxRiw2RkFBNkY7Z0JBQzdGLHlDQUF5QztnQkFDekMsMkZBQTJGLENBQzlGLENBQUM7U0FDSDtRQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9GLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxVQUFVLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDM0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1NBQ3RFO0lBQ0gsQ0FBQztDQUNGO0FBS0QsTUFBTSxPQUFPLHFCQUErQixTQUFRLFlBQXFCO0lBb0d2RSxZQUN1QixRQUFRLEVBQzdCLGVBQXlDLEVBQ3pDLHNCQUF1RCxFQUN2RCxPQUF5QixFQUN6QixHQUE2QixFQUM3QixXQUE2QixFQUNnQixrQkFBa0I7UUFFL0QsS0FBSyxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsc0JBQXNCLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBdEdoRzs7O2FBR0s7UUFDSSxrQkFBYSxHQUFZLElBQUksQ0FBQztRQUV2Qzs7YUFFSztRQUNJLGNBQVMsR0FBdUIsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1FBaUNqRTs7O2FBR0s7UUFDSSxTQUFJLEdBQW1CLGNBQWMsQ0FBQyxNQUFNLENBQUM7UUFRdEQ7OztXQUdHO1FBQ00saUJBQVksR0FBWSxJQUFJLENBQUM7UUFFdEM7OztXQUdHO1FBQ00sbUJBQWMsR0FBWSxJQUFJLENBQUM7UUFFeEM7O2FBRUs7UUFDSSxxQkFBZ0IsR0FBVyxHQUFHLENBQUM7UUFhOUIsb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFHM0M7O2FBRUs7UUFDSSxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUVsQixlQUFVLEdBQWlCLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztJQWFsRSxDQUFDO0lBaENEOzs7U0FHSztJQUNMLElBQ0ksY0FBYztRQUNoQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDOUIsQ0FBQztJQUNELElBQUksY0FBYyxDQUFDLEtBQWM7UUFDL0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBd0JELFFBQVE7UUFDTixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ3BCO1lBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUM1QjtRQUNELElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUN4QjtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFdEIsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNwQjtRQUVELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQztJQUlELElBQWMsaUJBQWlCO1FBQzdCLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsS0FBUSxJQUFHLENBQUM7SUFFWixVQUFVLEtBQUksQ0FBQzs7bUhBM0pkLHFCQUFxQixrQkFxR3RCLFdBQVcseU1BTUMsdUJBQXVCO3VHQTNHbEMscUJBQXFCLG9rQkFGdEIsRUFBRTs0RkFFRCxxQkFBcUI7a0JBSGpDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLEVBQUU7aUJBQ2I7OzBCQXNHSSxNQUFNOzJCQUFDLFdBQVc7OzBCQU1sQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLHVCQUF1Qjs0Q0F0R3BDLE1BQU07c0JBQWQsS0FBSztnQkFNRyxhQUFhO3NCQUFyQixLQUFLO2dCQUtHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBTUcsR0FBRztzQkFBWCxLQUFLO2dCQUtHLEdBQUc7c0JBQVgsS0FBSztnQkFLRyxNQUFNO3NCQUFkLEtBQUs7Z0JBS0csZ0JBQWdCO3NCQUF4QixLQUFLO2dCQUtHLGtCQUFrQjtzQkFBMUIsS0FBSztnQkFLRyxpQkFBaUI7c0JBQXpCLEtBQUs7Z0JBTUcsSUFBSTtzQkFBWixLQUFLO2dCQU1HLFdBQVc7c0JBQW5CLEtBQUs7Z0JBTUcsWUFBWTtzQkFBcEIsS0FBSztnQkFNRyxjQUFjO3NCQUF0QixLQUFLO2dCQUtHLGdCQUFnQjtzQkFBeEIsS0FBSztnQkFPRixjQUFjO3NCQURqQixLQUFLO2dCQWFHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBRUcsVUFBVTtzQkFBbEIsS0FBSzs7QUE2RFI7OztHQUdHO0FBS0gsTUFBTSxPQUFPLHFCQUF5QixTQUFRLHFCQUFtRDtJQUpqRzs7UUFLWSxnQkFBVyxHQUFpQyxtQkFBbUIsQ0FBQztLQTRDM0U7SUExQ0M7O1NBRUs7SUFDTCxJQUFhLElBQUksQ0FBQyxJQUFPO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7U0FFSztJQUNMLElBQWMsVUFBVTtRQUN0QixPQUFPLElBQUksQ0FBQyxXQUE4QixDQUFDO0lBQzdDLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDcEQsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLElBQU87UUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixPQUFPO1NBQ1I7UUFFRCxJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBRUQsSUFBYyxpQkFBaUI7UUFDN0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUNoQyxDQUFDO0lBRVMsVUFBVTtRQUNsQixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ25CO0lBQ0gsQ0FBQzs7bUhBNUNVLHFCQUFxQjt1R0FBckIscUJBQXFCLDZJQUZ0QixFQUFFOzRGQUVELHFCQUFxQjtrQkFKakMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZUFBZTtvQkFDekIsUUFBUSxFQUFFLEVBQUU7aUJBQ2I7OEJBT2MsSUFBSTtzQkFBaEIsS0FBSztnQkFPUSxVQUFVO3NCQUF2QixNQUFNOztBQWtDVDs7O0dBR0c7QUFLSCxNQUFNLE9BQU8sc0JBQTBCLFNBQVEscUJBSTlDO0lBUkQ7O1FBU1ksZ0JBQVcsR0FBc0Msd0JBQXdCLENBQUM7S0FpRHJGO0lBL0NDOztTQUVLO0lBQ0wsSUFBYSxLQUFLLENBQUMsS0FBeUI7UUFDMUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUVEOztTQUVLO0lBQ0wsSUFBYyxXQUFXO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFdBQStDLENBQUM7SUFDOUQsQ0FBQztJQUVELElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsS0FBeUI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsT0FBTztTQUNSO1FBRUQsSUFBSSxLQUFLLEVBQUU7WUFDVCxNQUFNLFdBQVcsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQztZQUN6QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQzNCO0lBQ0gsQ0FBQztJQUVELElBQWMsaUJBQWlCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDakMsQ0FBQztJQUVELFVBQVU7UUFDUixPQUFPLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVTLFVBQVU7UUFDbEIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztTQUNwQjtJQUNILENBQUM7O29IQXJEVSxzQkFBc0I7d0dBQXRCLHNCQUFzQixrSkFGdkIsRUFBRTs0RkFFRCxzQkFBc0I7a0JBSmxDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGdCQUFnQjtvQkFDMUIsUUFBUSxFQUFFLEVBQUU7aUJBQ2I7OEJBV2MsS0FBSztzQkFBakIsS0FBSztnQkFPUSxXQUFXO3NCQUF4QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgQWt2ZW8uIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxuICovXG5cbmltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICBDb21wb25lbnRSZWYsXG4gIE9uQ2hhbmdlcyxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgVHlwZSxcbiAgT25Jbml0LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBSZXBsYXlTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IE5iQ29tcG9uZW50UG9ydGFsLCBOYk92ZXJsYXlSZWYgfSBmcm9tICcuLi9jZGsvb3ZlcmxheS9tYXBwaW5nJztcbmltcG9ydCB7XG4gIE5iQWRqdXN0YWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE5iQWRqdXN0bWVudCxcbiAgTmJBZGp1c3RtZW50VmFsdWVzLFxuICBOYlBvc2l0aW9uLFxuICBOYlBvc2l0aW9uQnVpbGRlclNlcnZpY2UsXG59IGZyb20gJy4uL2Nkay9vdmVybGF5L292ZXJsYXktcG9zaXRpb24nO1xuaW1wb3J0IHsgTmJPdmVybGF5U2VydmljZSwgcGF0Y2ggfSBmcm9tICcuLi9jZGsvb3ZlcmxheS9vdmVybGF5LXNlcnZpY2UnO1xuaW1wb3J0IHsgTmJUcmlnZ2VyLCBOYlRyaWdnZXJTdHJhdGVneSwgTmJUcmlnZ2VyU3RyYXRlZ3lCdWlsZGVyU2VydmljZSB9IGZyb20gJy4uL2Nkay9vdmVybGF5L292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBOYkRhdGVwaWNrZXJDb250YWluZXJDb21wb25lbnQgfSBmcm9tICcuL2RhdGVwaWNrZXItY29udGFpbmVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOQl9ET0NVTUVOVCB9IGZyb20gJy4uLy4uL3RoZW1lLm9wdGlvbnMnO1xuaW1wb3J0IHsgTmJDYWxlbmRhclJhbmdlLCBOYkNhbGVuZGFyUmFuZ2VDb21wb25lbnQgfSBmcm9tICcuLi9jYWxlbmRhci9jYWxlbmRhci1yYW5nZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmJDYWxlbmRhckNvbXBvbmVudCB9IGZyb20gJy4uL2NhbGVuZGFyL2NhbGVuZGFyLmNvbXBvbmVudCc7XG5pbXBvcnQge1xuICBOYkNhbGVuZGFyQ2VsbCxcbiAgTmJDYWxlbmRhclNpemUsXG4gIE5iQ2FsZW5kYXJWaWV3TW9kZSxcbiAgTmJDYWxlbmRhclNpemVWYWx1ZXMsXG4gIE5iQ2FsZW5kYXJWaWV3TW9kZVZhbHVlcyxcbn0gZnJvbSAnLi4vY2FsZW5kYXIta2l0L21vZGVsJztcbmltcG9ydCB7IE5iRGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9jYWxlbmRhci1raXQvc2VydmljZXMvZGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IE5CX0RBVEVfU0VSVklDRV9PUFRJT05TLCBOYkRhdGVwaWNrZXIsIE5iUGlja2VyVmFsaWRhdG9yQ29uZmlnIH0gZnJvbSAnLi9kYXRlcGlja2VyLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBjb252ZXJ0VG9Cb29sUHJvcGVydHksIE5iQm9vbGVhbklucHV0IH0gZnJvbSAnLi4vaGVscGVycyc7XG5cbi8qKlxuICogVGhlIGBOYkJhc2VQaWNrZXJgIGNvbXBvbmVudCBjb25jZW50cmF0ZXMgb3ZlcmxheSBtYW5pcHVsYXRpb24gbG9naWMuXG4gKiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5iQmFzZVBpY2tlcjxELCBULCBQPiBleHRlbmRzIE5iRGF0ZXBpY2tlcjxULCBEPiB7XG4gIC8qKlxuICAgKiBEYXRlcGlja2VyIGRhdGUgZm9ybWF0LiBDYW4gYmUgdXNlZCBvbmx5IHdpdGggZGF0ZSBhZGFwdGVycyAobW9tZW50LCBkYXRlLWZucykgc2luY2UgbmF0aXZlIGRhdGVcbiAgICogb2JqZWN0IGRvZXNuJ3Qgc3VwcG9ydCBmb3JtYXR0aW5nLlxuICAgKiAqL1xuICBhYnN0cmFjdCBmb3JtYXQ6IHN0cmluZztcblxuICAvKipcbiAgICogRGVmaW5lcyBpZiB3ZSBzaG91bGQgcmVuZGVyIHByZXZpb3VzIGFuZCBuZXh0IG1vbnRoc1xuICAgKiBpbiB0aGUgY3VycmVudCBtb250aCB2aWV3LlxuICAgKiAqL1xuICBhYnN0cmFjdCBib3VuZGluZ01vbnRoOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHN0YXJ0aW5nIHZpZXcgZm9yIGNhbGVuZGFyLlxuICAgKiAqL1xuICBhYnN0cmFjdCBzdGFydFZpZXc6IE5iQ2FsZW5kYXJWaWV3TW9kZTtcblxuICAvKipcbiAgICogTWluaW11bSBhdmFpbGFibGUgZGF0ZSBmb3Igc2VsZWN0aW9uLlxuICAgKiAqL1xuICBhYnN0cmFjdCBtaW46IEQ7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gYXZhaWxhYmxlIGRhdGUgZm9yIHNlbGVjdGlvbi5cbiAgICogKi9cbiAgYWJzdHJhY3QgbWF4OiBEO1xuXG4gIC8qKlxuICAgKiBQcmVkaWNhdGUgdGhhdCBkZWNpZGVzIHdoaWNoIGNlbGxzIHdpbGwgYmUgZGlzYWJsZWQuXG4gICAqICovXG4gIGFic3RyYWN0IGZpbHRlcjogKEQpID0+IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEN1c3RvbSBkYXkgY2VsbCBjb21wb25lbnQuIEhhdmUgdG8gaW1wbGVtZW50IGBOYkNhbGVuZGFyQ2VsbGAgaW50ZXJmYWNlLlxuICAgKiAqL1xuICBhYnN0cmFjdCBkYXlDZWxsQ29tcG9uZW50OiBUeXBlPE5iQ2FsZW5kYXJDZWxsPEQsIFQ+PjtcblxuICAvKipcbiAgICogQ3VzdG9tIG1vbnRoIGNlbGwgY29tcG9uZW50LiBIYXZlIHRvIGltcGxlbWVudCBgTmJDYWxlbmRhckNlbGxgIGludGVyZmFjZS5cbiAgICogKi9cbiAgYWJzdHJhY3QgbW9udGhDZWxsQ29tcG9uZW50OiBUeXBlPE5iQ2FsZW5kYXJDZWxsPEQsIFQ+PjtcblxuICAvKipcbiAgICogQ3VzdG9tIHllYXIgY2VsbCBjb21wb25lbnQuIEhhdmUgdG8gaW1wbGVtZW50IGBOYkNhbGVuZGFyQ2VsbGAgaW50ZXJmYWNlLlxuICAgKiAqL1xuICBhYnN0cmFjdCB5ZWFyQ2VsbENvbXBvbmVudDogVHlwZTxOYkNhbGVuZGFyQ2VsbDxELCBUPj47XG5cbiAgLyoqXG4gICAqIFNpemUgb2YgdGhlIGNhbGVuZGFyIGFuZCBlbnRpcmUgY29tcG9uZW50cy5cbiAgICogQ2FuIGJlICdtZWRpdW0nIHdoaWNoIGlzIGRlZmF1bHQgb3IgJ2xhcmdlJy5cbiAgICogKi9cbiAgYWJzdHJhY3Qgc2l6ZTogTmJDYWxlbmRhclNpemU7XG5cbiAgLyoqXG4gICAqIERlcGVuZGluZyBvbiB0aGlzIGRhdGUgYSBwYXJ0aWN1bGFyIG1vbnRoIGlzIHNlbGVjdGVkIGluIHRoZSBjYWxlbmRhclxuICAgKi9cbiAgYWJzdHJhY3QgdmlzaWJsZURhdGU6IEQ7XG5cbiAgLyoqXG4gICAqIEhpZGUgcGlja2VyIHdoZW4gYSBkYXRlIG9yIGEgcmFuZ2UgaXMgc2VsZWN0ZWQsIGB0cnVlYCBieSBkZWZhdWx0XG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKi9cbiAgYWJzdHJhY3QgaGlkZU9uU2VsZWN0OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHNob3VsZCB3ZSBzaG93IGNhbGVuZGFyIG5hdmlnYXRpb24gb3Igbm90LlxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICovXG4gIGFic3RyYWN0IHNob3dOYXZpZ2F0aW9uOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBTZXRzIHN5bWJvbCB1c2VkIGFzIGEgaGVhZGVyIGZvciB3ZWVrIG51bWJlcnMgY29sdW1uXG4gICAqICovXG4gIGFic3RyYWN0IHdlZWtOdW1iZXJTeW1ib2w6IHN0cmluZztcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBzaG91bGQgd2Ugc2hvdyB3ZWVrIG51bWJlcnMgY29sdW1uLlxuICAgKiBGYWxzZSBieSBkZWZhdWx0LlxuICAgKiAqL1xuICBhYnN0cmFjdCBzaG93V2Vla051bWJlcjogYm9vbGVhbjtcblxuICByZWFkb25seSBmb3JtYXRDaGFuZ2VkJDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqXG4gICAqIENhbGVuZGFyIGNvbXBvbmVudCBjbGFzcyB0aGF0IGhhcyB0byBiZSBpbnN0YW50aWF0ZWQgaW5zaWRlIG92ZXJsYXkuXG4gICAqICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBwaWNrZXJDbGFzczogVHlwZTxQPjtcblxuICAvKipcbiAgICogT3ZlcmxheSByZWZlcmVuY2Ugb2JqZWN0LlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgcmVmOiBOYk92ZXJsYXlSZWY7XG5cbiAgLyoqXG4gICAqIERhdGVwaWNrZXIgY29udGFpbmVyIHRoYXQgY29udGFpbnMgaW5zdGFudGlhdGVkIHBpY2tlci5cbiAgICogKi9cbiAgcHJvdGVjdGVkIGNvbnRhaW5lcjogQ29tcG9uZW50UmVmPE5iRGF0ZXBpY2tlckNvbnRhaW5lckNvbXBvbmVudD47XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9uaW5nIHN0cmF0ZWd5IHVzZWQgYnkgb3ZlcmxheS5cbiAgICogKi9cbiAgcHJvdGVjdGVkIHBvc2l0aW9uU3RyYXRlZ3k6IE5iQWRqdXN0YWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3k7XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgc3RyYXRlZ3kgdXNlZCBieSBvdmVybGF5XG4gICAqICovXG4gIHByb3RlY3RlZCB0cmlnZ2VyU3RyYXRlZ3k6IE5iVHJpZ2dlclN0cmF0ZWd5O1xuXG4gIC8qKlxuICAgKiBIVE1MIGlucHV0IHJlZmVyZW5jZSB0byB3aGljaCBkYXRlcGlja2VyIGNvbm5lY3RlZC5cbiAgICogKi9cbiAgcHJvdGVjdGVkIGhvc3RSZWY6IEVsZW1lbnRSZWY7XG5cbiAgcHJvdGVjdGVkIGluaXQkOiBSZXBsYXlTdWJqZWN0PHZvaWQ+ID0gbmV3IFJlcGxheVN1YmplY3Q8dm9pZD4oKTtcblxuICAvKipcbiAgICogU3RyZWFtIG9mIHBpY2tlciBjaGFuZ2VzLiBSZXF1aXJlZCB0byBiZSB0aGUgc3ViamVjdCBiZWNhdXNlIHBpY2tlciBoaWRlcyBhbmQgc2hvd3MgYW5kIHBpY2tlclxuICAgKiBjaGFuZ2Ugc3RyZWFtIGJlY29tZXMgcmVjcmVhdGVkLlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgb25DaGFuZ2UkOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBwaWNrZXIgaW5zdGFuY2UgaXRzZWxmLlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgcGlja2VyUmVmOiBDb21wb25lbnRSZWY8YW55PjtcblxuICBwcm90ZWN0ZWQgb3ZlcmxheU9mZnNldCA9IDg7XG5cbiAgcHJvdGVjdGVkIGFkanVzdG1lbnQ6IE5iQWRqdXN0bWVudCA9IE5iQWRqdXN0bWVudC5DT1VOVEVSQ0xPQ0tXSVNFO1xuXG4gIHByb3RlY3RlZCBkZXN0cm95JCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFF1ZXVlIGNvbnRhaW5zIHRoZSBsYXN0IHZhbHVlIHRoYXQgd2FzIGFwcGxpZWQgdG8gdGhlIHBpY2tlciB3aGVuIGl0IHdhcyBoaWRkZW4uXG4gICAqIFRoaXMgdmFsdWUgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHBpY2tlciBhcyBzb29uIGFzIGl0IHNob3duLlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgcXVldWU6IFQgfCB1bmRlZmluZWQ7XG5cbiAgcHJvdGVjdGVkIGJsdXIkOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIG92ZXJsYXk6IE5iT3ZlcmxheVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIHBvc2l0aW9uQnVpbGRlcjogTmJQb3NpdGlvbkJ1aWxkZXJTZXJ2aWNlLFxuICAgIHByb3RlY3RlZCB0cmlnZ2VyU3RyYXRlZ3lCdWlsZGVyOiBOYlRyaWdnZXJTdHJhdGVneUJ1aWxkZXJTZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBjZnI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBwcm90ZWN0ZWQgZGF0ZVNlcnZpY2U6IE5iRGF0ZVNlcnZpY2U8RD4sXG4gICAgcHJvdGVjdGVkIGRhdGVTZXJ2aWNlT3B0aW9ucyxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHBpY2tlciBpbnN0YW5jZS5cbiAgICogKi9cbiAgZ2V0IHBpY2tlcigpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnBpY2tlclJlZiAmJiB0aGlzLnBpY2tlclJlZi5pbnN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdHJlYW0gb2YgcGlja2VyIHZhbHVlIGNoYW5nZXMuXG4gICAqICovXG4gIGdldCB2YWx1ZUNoYW5nZSgpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5vbkNoYW5nZSQuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBnZXQgaXNTaG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5yZWYgJiYgdGhpcy5yZWYuaGFzQXR0YWNoZWQoKTtcbiAgfVxuXG4gIGdldCBpbml0KCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmluaXQkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gZGF0ZXBpY2tlciBsb29zZXMgZm9jdXMuXG4gICAqL1xuICBnZXQgYmx1cigpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5ibHVyJC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXQgcGlja2VyVmFsdWVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxUPjtcblxuICAvKipcbiAgICogRGF0ZXBpY2tlciBrbm93cyBub3RoaW5nIGFib3V0IGhvc3QgaHRtbCBpbnB1dCBlbGVtZW50LlxuICAgKiBTbywgYXR0YWNoIG1ldGhvZCBhdHRhY2hlcyBkYXRlcGlja2VyIHRvIHRoZSBob3N0IGlucHV0IGVsZW1lbnQuXG4gICAqICovXG4gIGF0dGFjaChob3N0UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgdGhpcy5ob3N0UmVmID0gaG9zdFJlZjtcbiAgICB0aGlzLnN1YnNjcmliZU9uVHJpZ2dlcnMoKTtcbiAgfVxuXG4gIGdldFZhbGlkYXRvckNvbmZpZygpOiBOYlBpY2tlclZhbGlkYXRvckNvbmZpZzxEPiB7XG4gICAgcmV0dXJuIHsgbWluOiB0aGlzLm1pbiwgbWF4OiB0aGlzLm1heCwgZmlsdGVyOiB0aGlzLmZpbHRlciB9O1xuICB9XG5cbiAgc2hvdygpIHtcbiAgICBpZiAoIXRoaXMucmVmKSB7XG4gICAgICB0aGlzLmNyZWF0ZU92ZXJsYXkoKTtcbiAgICB9XG5cbiAgICB0aGlzLm9wZW5EYXRlcGlja2VyKCk7XG4gIH1cblxuICBzaG91bGRIaWRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmhpZGVPblNlbGVjdCAmJiAhIXRoaXMudmFsdWU7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIGlmICh0aGlzLnJlZikge1xuICAgICAgdGhpcy5yZWYuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgLy8gc2F2ZSBjdXJyZW50IHZhbHVlIGlmIHBpY2tlciB3YXMgcmVuZGVyZWRcbiAgICBpZiAodGhpcy5waWNrZXIpIHtcbiAgICAgIHRoaXMucXVldWUgPSB0aGlzLnZhbHVlO1xuICAgICAgdGhpcy5waWNrZXJSZWYuZGVzdHJveSgpO1xuICAgICAgdGhpcy5waWNrZXJSZWYgPSBudWxsO1xuICAgICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCB3cml0ZVF1ZXVlKCk7XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZU92ZXJsYXkoKSB7XG4gICAgdGhpcy5wb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5jcmVhdGVQb3NpdGlvblN0cmF0ZWd5KCk7XG4gICAgdGhpcy5yZWYgPSB0aGlzLm92ZXJsYXkuY3JlYXRlKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMucG9zaXRpb25TdHJhdGVneSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgfSk7XG4gICAgdGhpcy5zdWJzY3JpYmVPblBvc2l0aW9uQ2hhbmdlKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3BlbkRhdGVwaWNrZXIoKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSB0aGlzLnJlZi5hdHRhY2gobmV3IE5iQ29tcG9uZW50UG9ydGFsKE5iRGF0ZXBpY2tlckNvbnRhaW5lckNvbXBvbmVudCwgbnVsbCwgbnVsbCwgdGhpcy5jZnIpKTtcbiAgICB0aGlzLmluc3RhbnRpYXRlUGlja2VyKCk7XG4gICAgdGhpcy5zdWJzY3JpYmVPblZhbHVlQ2hhbmdlKCk7XG4gICAgdGhpcy53cml0ZVF1ZXVlKCk7XG4gICAgdGhpcy5wYXRjaFdpdGhJbnB1dHMoKTtcbiAgICB0aGlzLnBpY2tlclJlZi5jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVQb3NpdGlvblN0cmF0ZWd5KCk6IE5iQWRqdXN0YWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uQnVpbGRlclxuICAgICAgLmNvbm5lY3RlZFRvKHRoaXMuaG9zdFJlZilcbiAgICAgIC5wb3NpdGlvbihOYlBvc2l0aW9uLkJPVFRPTSlcbiAgICAgIC5vZmZzZXQodGhpcy5vdmVybGF5T2Zmc2V0KVxuICAgICAgLmFkanVzdG1lbnQodGhpcy5hZGp1c3RtZW50KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzdWJzY3JpYmVPblBvc2l0aW9uQ2hhbmdlKCkge1xuICAgIHRoaXMucG9zaXRpb25TdHJhdGVneS5wb3NpdGlvbkNoYW5nZVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKVxuICAgICAgLnN1YnNjcmliZSgocG9zaXRpb246IE5iUG9zaXRpb24pID0+IHBhdGNoKHRoaXMuY29udGFpbmVyLCB7IHBvc2l0aW9uIH0pKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVUcmlnZ2VyU3RyYXRlZ3koKTogTmJUcmlnZ2VyU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLnRyaWdnZXJTdHJhdGVneUJ1aWxkZXJcbiAgICAgIC50cmlnZ2VyKE5iVHJpZ2dlci5GT0NVUylcbiAgICAgIC5ob3N0KHRoaXMuaG9zdFJlZi5uYXRpdmVFbGVtZW50KVxuICAgICAgLmNvbnRhaW5lcigoKSA9PiB0aGlzLmNvbnRhaW5lcilcbiAgICAgIC5idWlsZCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN1YnNjcmliZU9uVHJpZ2dlcnMoKSB7XG4gICAgdGhpcy50cmlnZ2VyU3RyYXRlZ3kgPSB0aGlzLmNyZWF0ZVRyaWdnZXJTdHJhdGVneSgpO1xuICAgIHRoaXMudHJpZ2dlclN0cmF0ZWd5LnNob3ckLnN1YnNjcmliZSgoKSA9PiB0aGlzLnNob3coKSk7XG4gICAgdGhpcy50cmlnZ2VyU3RyYXRlZ3kuaGlkZSQuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuYmx1ciQubmV4dCgpO1xuICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5zdGFudGlhdGVQaWNrZXIoKSB7XG4gICAgdGhpcy5waWNrZXJSZWYgPSB0aGlzLmNvbnRhaW5lci5pbnN0YW5jZS5hdHRhY2gobmV3IE5iQ29tcG9uZW50UG9ydGFsKHRoaXMucGlja2VyQ2xhc3MsIG51bGwsIG51bGwsIHRoaXMuY2ZyKSk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlcyBvbiBwaWNrZXIgdmFsdWUgY2hhbmdlcyBhbmQgZW1pdCBkYXRhIHRocm91Z2ggdGhpcy5vbkNoYW5nZSQgc3ViamVjdC5cbiAgICogKi9cbiAgcHJvdGVjdGVkIHN1YnNjcmliZU9uVmFsdWVDaGFuZ2UoKSB7XG4gICAgdGhpcy5waWNrZXJWYWx1ZUNoYW5nZS5zdWJzY3JpYmUoKGRhdGUpID0+IHtcbiAgICAgIHRoaXMub25DaGFuZ2UkLm5leHQoZGF0ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGF0Y2hXaXRoSW5wdXRzKCkge1xuICAgIHRoaXMucGlja2VyLmJvdW5kaW5nTW9udGggPSB0aGlzLmJvdW5kaW5nTW9udGg7XG4gICAgdGhpcy5waWNrZXIuc3RhcnRWaWV3ID0gdGhpcy5zdGFydFZpZXc7XG4gICAgdGhpcy5waWNrZXIubWluID0gdGhpcy5taW47XG4gICAgdGhpcy5waWNrZXIubWF4ID0gdGhpcy5tYXg7XG4gICAgdGhpcy5waWNrZXIuZmlsdGVyID0gdGhpcy5maWx0ZXI7XG4gICAgdGhpcy5waWNrZXIuX2NlbGxDb21wb25lbnQgPSB0aGlzLmRheUNlbGxDb21wb25lbnQ7XG4gICAgdGhpcy5waWNrZXIuX21vbnRoQ2VsbENvbXBvbmVudCA9IHRoaXMubW9udGhDZWxsQ29tcG9uZW50O1xuICAgIHRoaXMucGlja2VyLl95ZWFyQ2VsbENvbXBvbmVudCA9IHRoaXMueWVhckNlbGxDb21wb25lbnQ7XG4gICAgdGhpcy5waWNrZXIuc2l6ZSA9IHRoaXMuc2l6ZTtcbiAgICB0aGlzLnBpY2tlci5zaG93TmF2aWdhdGlvbiA9IHRoaXMuc2hvd05hdmlnYXRpb247XG4gICAgdGhpcy5waWNrZXIudmlzaWJsZURhdGUgPSB0aGlzLnZpc2libGVEYXRlO1xuICAgIHRoaXMucGlja2VyLnNob3dXZWVrTnVtYmVyID0gdGhpcy5zaG93V2Vla051bWJlcjtcbiAgICB0aGlzLnBpY2tlci53ZWVrTnVtYmVyU3ltYm9sID0gdGhpcy53ZWVrTnVtYmVyU3ltYm9sO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNoZWNrRm9ybWF0KCkge1xuICAgIGlmICh0aGlzLmRhdGVTZXJ2aWNlLmdldElkKCkgPT09ICduYXRpdmUnICYmIHRoaXMuZm9ybWF0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiQ2FuJ3QgZm9ybWF0IG5hdGl2ZSBkYXRlLiBUbyB1c2UgY3VzdG9tIGZvcm1hdHRpbmcgeW91IGhhdmUgdG8gaW5zdGFsbCBAbmVidWxhci9tb21lbnQgb3IgXCIgK1xuICAgICAgICAgICdAbmVidWxhci9kYXRlLWZucyBwYWNrYWdlIGFuZCBpbXBvcnQgTmJNb21lbnREYXRlTW9kdWxlIG9yIE5iRGF0ZUZuc0RhdGVNb2R1bGUgYWNjb3JkaW5nbHkuJyArXG4gICAgICAgICAgJ01vcmUgaW5mb3JtYXRpb24gYXQgXCJGb3JtYXR0aW5nIGlzc3VlXCIgJyArXG4gICAgICAgICAgJ2h0dHBzOi8vYWt2ZW8uZ2l0aHViLmlvL25lYnVsYXIvZG9jcy9jb21wb25lbnRzL2RhdGVwaWNrZXIvb3ZlcnZpZXcjbmJkYXRlcGlja2VyY29tcG9uZW50JyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgaXNGb3JtYXRTZXQgPSB0aGlzLmZvcm1hdCB8fCAodGhpcy5kYXRlU2VydmljZU9wdGlvbnMgJiYgdGhpcy5kYXRlU2VydmljZU9wdGlvbnMuZm9ybWF0KTtcbiAgICBpZiAodGhpcy5kYXRlU2VydmljZS5nZXRJZCgpID09PSAnZGF0ZS1mbnMnICYmICFpc0Zvcm1hdFNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdmb3JtYXQgaXMgcmVxdWlyZWQgd2hlbiB1c2luZyBOYkRhdGVGbnNEYXRlTW9kdWxlJyk7XG4gICAgfVxuICB9XG59XG5cbkBDb21wb25lbnQoe1xuICB0ZW1wbGF0ZTogJycsXG59KVxuZXhwb3J0IGNsYXNzIE5iQmFzZVBpY2tlckNvbXBvbmVudDxELCBULCBQPiBleHRlbmRzIE5iQmFzZVBpY2tlcjxELCBULCBQPiBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogRGF0ZXBpY2tlciBkYXRlIGZvcm1hdC4gQ2FuIGJlIHVzZWQgb25seSB3aXRoIGRhdGUgYWRhcHRlcnMgKG1vbWVudCwgZGF0ZS1mbnMpIHNpbmNlIG5hdGl2ZSBkYXRlXG4gICAqIG9iamVjdCBkb2Vzbid0IHN1cHBvcnQgZm9ybWF0dGluZy5cbiAgICogKi9cbiAgQElucHV0KCkgZm9ybWF0OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIERlZmluZXMgaWYgd2Ugc2hvdWxkIHJlbmRlciBwcmV2aW91cyBhbmQgbmV4dCBtb250aHNcbiAgICogaW4gdGhlIGN1cnJlbnQgbW9udGggdmlldy5cbiAgICogKi9cbiAgQElucHV0KCkgYm91bmRpbmdNb250aDogYm9vbGVhbiA9IHRydWU7XG5cbiAgLyoqXG4gICAqIERlZmluZXMgc3RhcnRpbmcgdmlldyBmb3IgY2FsZW5kYXIuXG4gICAqICovXG4gIEBJbnB1dCgpIHN0YXJ0VmlldzogTmJDYWxlbmRhclZpZXdNb2RlID0gTmJDYWxlbmRhclZpZXdNb2RlLkRBVEU7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdGFydFZpZXc6IE5iQ2FsZW5kYXJWaWV3TW9kZVZhbHVlcztcblxuICAvKipcbiAgICogTWluaW11bSBhdmFpbGFibGUgZGF0ZSBmb3Igc2VsZWN0aW9uLlxuICAgKiAqL1xuICBASW5wdXQoKSBtaW46IEQ7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gYXZhaWxhYmxlIGRhdGUgZm9yIHNlbGVjdGlvbi5cbiAgICogKi9cbiAgQElucHV0KCkgbWF4OiBEO1xuXG4gIC8qKlxuICAgKiBQcmVkaWNhdGUgdGhhdCBkZWNpZGVzIHdoaWNoIGNlbGxzIHdpbGwgYmUgZGlzYWJsZWQuXG4gICAqICovXG4gIEBJbnB1dCgpIGZpbHRlcjogKEQpID0+IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEN1c3RvbSBkYXkgY2VsbCBjb21wb25lbnQuIEhhdmUgdG8gaW1wbGVtZW50IGBOYkNhbGVuZGFyQ2VsbGAgaW50ZXJmYWNlLlxuICAgKiAqL1xuICBASW5wdXQoKSBkYXlDZWxsQ29tcG9uZW50OiBUeXBlPE5iQ2FsZW5kYXJDZWxsPEQsIFQ+PjtcblxuICAvKipcbiAgICogQ3VzdG9tIG1vbnRoIGNlbGwgY29tcG9uZW50LiBIYXZlIHRvIGltcGxlbWVudCBgTmJDYWxlbmRhckNlbGxgIGludGVyZmFjZS5cbiAgICogKi9cbiAgQElucHV0KCkgbW9udGhDZWxsQ29tcG9uZW50OiBUeXBlPE5iQ2FsZW5kYXJDZWxsPEQsIFQ+PjtcblxuICAvKipcbiAgICogQ3VzdG9tIHllYXIgY2VsbCBjb21wb25lbnQuIEhhdmUgdG8gaW1wbGVtZW50IGBOYkNhbGVuZGFyQ2VsbGAgaW50ZXJmYWNlLlxuICAgKiAqL1xuICBASW5wdXQoKSB5ZWFyQ2VsbENvbXBvbmVudDogVHlwZTxOYkNhbGVuZGFyQ2VsbDxELCBUPj47XG5cbiAgLyoqXG4gICAqIFNpemUgb2YgdGhlIGNhbGVuZGFyIGFuZCBlbnRpcmUgY29tcG9uZW50cy5cbiAgICogQ2FuIGJlICdtZWRpdW0nIHdoaWNoIGlzIGRlZmF1bHQgb3IgJ2xhcmdlJy5cbiAgICogKi9cbiAgQElucHV0KCkgc2l6ZTogTmJDYWxlbmRhclNpemUgPSBOYkNhbGVuZGFyU2l6ZS5NRURJVU07XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaXplOiBOYkNhbGVuZGFyU2l6ZVZhbHVlcztcblxuICAvKipcbiAgICogRGVwZW5kaW5nIG9uIHRoaXMgZGF0ZSBhIHBhcnRpY3VsYXIgbW9udGggaXMgc2VsZWN0ZWQgaW4gdGhlIGNhbGVuZGFyXG4gICAqL1xuICBASW5wdXQoKSB2aXNpYmxlRGF0ZTogRDtcblxuICAvKipcbiAgICogSGlkZSBwaWNrZXIgd2hlbiBhIGRhdGUgb3IgYSByYW5nZSBpcyBzZWxlY3RlZCwgYHRydWVgIGJ5IGRlZmF1bHRcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqL1xuICBASW5wdXQoKSBoaWRlT25TZWxlY3Q6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHNob3VsZCB3ZSBzaG93IGNhbGVuZGFycyBuYXZpZ2F0aW9uIG9yIG5vdC5cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqL1xuICBASW5wdXQoKSBzaG93TmF2aWdhdGlvbjogYm9vbGVhbiA9IHRydWU7XG5cbiAgLyoqXG4gICAqIFNldHMgc3ltYm9sIHVzZWQgYXMgYSBoZWFkZXIgZm9yIHdlZWsgbnVtYmVycyBjb2x1bW5cbiAgICogKi9cbiAgQElucHV0KCkgd2Vla051bWJlclN5bWJvbDogc3RyaW5nID0gJyMnO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHNob3VsZCB3ZSBzaG93IHdlZWsgbnVtYmVycyBjb2x1bW4uXG4gICAqIEZhbHNlIGJ5IGRlZmF1bHQuXG4gICAqICovXG4gIEBJbnB1dCgpXG4gIGdldCBzaG93V2Vla051bWJlcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc2hvd1dlZWtOdW1iZXI7XG4gIH1cbiAgc2V0IHNob3dXZWVrTnVtYmVyKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2hvd1dlZWtOdW1iZXIgPSBjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByb3RlY3RlZCBfc2hvd1dlZWtOdW1iZXI6IGJvb2xlYW4gPSBmYWxzZTtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dXZWVrTnVtYmVyOiBOYkJvb2xlYW5JbnB1dDtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBwaWNrZXIgb3ZlcmxheSBvZmZzZXQgKGluIHBpeGVscykuXG4gICAqICovXG4gIEBJbnB1dCgpIG92ZXJsYXlPZmZzZXQgPSA4O1xuXG4gIEBJbnB1dCgpIGFkanVzdG1lbnQ6IE5iQWRqdXN0bWVudCA9IE5iQWRqdXN0bWVudC5DT1VOVEVSQ0xPQ0tXSVNFO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWRqdXN0bWVudDogTmJBZGp1c3RtZW50VmFsdWVzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTkJfRE9DVU1FTlQpIGRvY3VtZW50LFxuICAgIHBvc2l0aW9uQnVpbGRlcjogTmJQb3NpdGlvbkJ1aWxkZXJTZXJ2aWNlLFxuICAgIHRyaWdnZXJTdHJhdGVneUJ1aWxkZXI6IE5iVHJpZ2dlclN0cmF0ZWd5QnVpbGRlclNlcnZpY2UsXG4gICAgb3ZlcmxheTogTmJPdmVybGF5U2VydmljZSxcbiAgICBjZnI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBkYXRlU2VydmljZTogTmJEYXRlU2VydmljZTxEPixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE5CX0RBVEVfU0VSVklDRV9PUFRJT05TKSBkYXRlU2VydmljZU9wdGlvbnMsXG4gICkge1xuICAgIHN1cGVyKG92ZXJsYXksIHBvc2l0aW9uQnVpbGRlciwgdHJpZ2dlclN0cmF0ZWd5QnVpbGRlciwgY2ZyLCBkYXRlU2VydmljZSwgZGF0ZVNlcnZpY2VPcHRpb25zKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuY2hlY2tGb3JtYXQoKTtcbiAgICB0aGlzLmluaXQkLm5leHQoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoY2hhbmdlcy5mb3JtYXQpIHtcbiAgICAgIGlmICghY2hhbmdlcy5mb3JtYXQuaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICAgIHRoaXMuY2hlY2tGb3JtYXQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZm9ybWF0Q2hhbmdlZCQubmV4dCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5waWNrZXIpIHtcbiAgICAgIHRoaXMucGF0Y2hXaXRoSW5wdXRzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95JC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95JC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuaGlkZSgpO1xuICAgIHRoaXMuaW5pdCQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLnJlZikge1xuICAgICAgdGhpcy5yZWYuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRyaWdnZXJTdHJhdGVneSkge1xuICAgICAgdGhpcy50cmlnZ2VyU3RyYXRlZ3kuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBwaWNrZXJDbGFzczogVHlwZTxQPjtcblxuICBwcm90ZWN0ZWQgZ2V0IHBpY2tlclZhbHVlQ2hhbmdlKCk6IE9ic2VydmFibGU8VD4ge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBzZXQgdmFsdWUodmFsdWU6IFQpIHt9XG5cbiAgcHJvdGVjdGVkIHdyaXRlUXVldWUoKSB7fVxufVxuXG4vKipcbiAqIFRoZSBEYXRlUGlja2VyIGNvbXBvbmVudHMgaXRzZWxmLlxuICogUHJvdmlkZXMgYSBwcm94eSB0byBgTmJDYWxlbmRhcmAgb3B0aW9ucyBhcyB3ZWxsIGFzIGN1c3RvbSBwaWNrZXIgb3B0aW9ucy5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmItZGF0ZXBpY2tlcicsXG4gIHRlbXBsYXRlOiAnJyxcbn0pXG5leHBvcnQgY2xhc3MgTmJEYXRlcGlja2VyQ29tcG9uZW50PEQ+IGV4dGVuZHMgTmJCYXNlUGlja2VyQ29tcG9uZW50PEQsIEQsIE5iQ2FsZW5kYXJDb21wb25lbnQ8RD4+IHtcbiAgcHJvdGVjdGVkIHBpY2tlckNsYXNzOiBUeXBlPE5iQ2FsZW5kYXJDb21wb25lbnQ8RD4+ID0gTmJDYWxlbmRhckNvbXBvbmVudDtcblxuICAvKipcbiAgICogRGF0ZSB3aGljaCB3aWxsIGJlIHJlbmRlcmVkIGFzIHNlbGVjdGVkLlxuICAgKiAqL1xuICBASW5wdXQoKSBzZXQgZGF0ZShkYXRlOiBEKSB7XG4gICAgdGhpcy52YWx1ZSA9IGRhdGU7XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgZGF0ZSB3aGVuIHNlbGVjdGVkLlxuICAgKiAqL1xuICBAT3V0cHV0KCkgZ2V0IGRhdGVDaGFuZ2UoKTogRXZlbnRFbWl0dGVyPEQ+IHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZUNoYW5nZSBhcyBFdmVudEVtaXR0ZXI8RD47XG4gIH1cblxuICBnZXQgdmFsdWUoKTogRCB7XG4gICAgcmV0dXJuIHRoaXMucGlja2VyID8gdGhpcy5waWNrZXIuZGF0ZSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHNldCB2YWx1ZShkYXRlOiBEKSB7XG4gICAgaWYgKCF0aGlzLnBpY2tlcikge1xuICAgICAgdGhpcy5xdWV1ZSA9IGRhdGU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGRhdGUpIHtcbiAgICAgIHRoaXMudmlzaWJsZURhdGUgPSBkYXRlO1xuICAgICAgdGhpcy5waWNrZXIudmlzaWJsZURhdGUgPSBkYXRlO1xuICAgICAgdGhpcy5waWNrZXIuZGF0ZSA9IGRhdGU7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldCBwaWNrZXJWYWx1ZUNoYW5nZSgpOiBPYnNlcnZhYmxlPEQ+IHtcbiAgICByZXR1cm4gdGhpcy5waWNrZXIuZGF0ZUNoYW5nZTtcbiAgfVxuXG4gIHByb3RlY3RlZCB3cml0ZVF1ZXVlKCkge1xuICAgIGlmICh0aGlzLnF1ZXVlKSB7XG4gICAgICBjb25zdCBkYXRlID0gdGhpcy5xdWV1ZTtcbiAgICAgIHRoaXMucXVldWUgPSBudWxsO1xuICAgICAgdGhpcy52YWx1ZSA9IGRhdGU7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGhlIFJhbmdlRGF0ZVBpY2tlciBjb21wb25lbnRzIGl0c2VsZi5cbiAqIFByb3ZpZGVzIGEgcHJveHkgdG8gYE5iQ2FsZW5kYXJSYW5nZWAgb3B0aW9ucyBhcyB3ZWxsIGFzIGN1c3RvbSBwaWNrZXIgb3B0aW9ucy5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmItcmFuZ2VwaWNrZXInLFxuICB0ZW1wbGF0ZTogJycsXG59KVxuZXhwb3J0IGNsYXNzIE5iUmFuZ2VwaWNrZXJDb21wb25lbnQ8RD4gZXh0ZW5kcyBOYkJhc2VQaWNrZXJDb21wb25lbnQ8XG4gIEQsXG4gIE5iQ2FsZW5kYXJSYW5nZTxEPixcbiAgTmJDYWxlbmRhclJhbmdlQ29tcG9uZW50PEQ+XG4+IHtcbiAgcHJvdGVjdGVkIHBpY2tlckNsYXNzOiBUeXBlPE5iQ2FsZW5kYXJSYW5nZUNvbXBvbmVudDxEPj4gPSBOYkNhbGVuZGFyUmFuZ2VDb21wb25lbnQ7XG5cbiAgLyoqXG4gICAqIFJhbmdlIHdoaWNoIHdpbGwgYmUgcmVuZGVyZWQgYXMgc2VsZWN0ZWQuXG4gICAqICovXG4gIEBJbnB1dCgpIHNldCByYW5nZShyYW5nZTogTmJDYWxlbmRhclJhbmdlPEQ+KSB7XG4gICAgdGhpcy52YWx1ZSA9IHJhbmdlO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIHJhbmdlIHdoZW4gc3RhcnQgc2VsZWN0ZWQgYW5kIGVtaXRzIGFnYWluIHdoZW4gZW5kIHNlbGVjdGVkLlxuICAgKiAqL1xuICBAT3V0cHV0KCkgZ2V0IHJhbmdlQ2hhbmdlKCk6IEV2ZW50RW1pdHRlcjxOYkNhbGVuZGFyUmFuZ2U8RD4+IHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZUNoYW5nZSBhcyBFdmVudEVtaXR0ZXI8TmJDYWxlbmRhclJhbmdlPEQ+PjtcbiAgfVxuXG4gIGdldCB2YWx1ZSgpOiBOYkNhbGVuZGFyUmFuZ2U8RD4ge1xuICAgIHJldHVybiB0aGlzLnBpY2tlciA/IHRoaXMucGlja2VyLnJhbmdlIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgc2V0IHZhbHVlKHJhbmdlOiBOYkNhbGVuZGFyUmFuZ2U8RD4pIHtcbiAgICBpZiAoIXRoaXMucGlja2VyKSB7XG4gICAgICB0aGlzLnF1ZXVlID0gcmFuZ2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICBjb25zdCB2aXNpYmxlRGF0ZSA9IHJhbmdlICYmIHJhbmdlLnN0YXJ0O1xuICAgICAgdGhpcy52aXNpYmxlRGF0ZSA9IHZpc2libGVEYXRlO1xuICAgICAgdGhpcy5waWNrZXIudmlzaWJsZURhdGUgPSB2aXNpYmxlRGF0ZTtcbiAgICAgIHRoaXMucGlja2VyLnJhbmdlID0gcmFuZ2U7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldCBwaWNrZXJWYWx1ZUNoYW5nZSgpOiBPYnNlcnZhYmxlPE5iQ2FsZW5kYXJSYW5nZTxEPj4ge1xuICAgIHJldHVybiB0aGlzLnBpY2tlci5yYW5nZUNoYW5nZTtcbiAgfVxuXG4gIHNob3VsZEhpZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHN1cGVyLnNob3VsZEhpZGUoKSAmJiAhISh0aGlzLnZhbHVlICYmIHRoaXMudmFsdWUuc3RhcnQgJiYgdGhpcy52YWx1ZS5lbmQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHdyaXRlUXVldWUoKSB7XG4gICAgaWYgKHRoaXMucXVldWUpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5xdWV1ZTtcbiAgICAgIHRoaXMucXVldWUgPSBudWxsO1xuICAgICAgdGhpcy52YWx1ZSA9IHJhbmdlO1xuICAgIH1cbiAgfVxufVxuIl19