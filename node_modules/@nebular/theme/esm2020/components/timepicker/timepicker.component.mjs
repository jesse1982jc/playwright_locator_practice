import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, LOCALE_ID, Output, ViewChild, } from '@angular/core';
import { Subject } from 'rxjs';
import { convertToBoolProperty } from '../helpers';
import { NbPortalDirective } from '../cdk/overlay/mapping';
import { range, rangeFromTo } from '../calendar-kit/helpers';
import { NB_DEFAULT_TIMEPICKER_LOCALIZATION_CONFIG, NB_TIME_PICKER_CONFIG, } from './model';
import * as i0 from "@angular/core";
import * as i1 from "../cdk/platform/platform-service";
import * as i2 from "../calendar-kit/services/calendar-time-model.service";
import * as i3 from "../calendar-kit/services/date.service";
import * as i4 from "@angular/common";
import * as i5 from "../cdk/overlay/mapping";
import * as i6 from "../list/list.component";
import * as i7 from "../card/card.component";
import * as i8 from "../calendar-kit/components/calendar-actions/calendar-actions.component";
import * as i9 from "./timepicker-cell.component";
/**
 * The TimePicker components itself.
 * Provides a proxy to `TimePicker` options as well as custom picker options.
 */
export class NbTimePickerComponent {
    constructor(config, platformService, locale, cd, calendarTimeModelService, dateService) {
        this.config = config;
        this.platformService = platformService;
        this.cd = cd;
        this.calendarTimeModelService = calendarTimeModelService;
        this.dateService = dateService;
        this.blur$ = new Subject();
        this.dayPeriodColumnOptions = ["AM" /* NbDayPeriod.AM */, "PM" /* NbDayPeriod.PM */];
        this.isAM = true;
        this.timepickerFormatChange$ = new Subject();
        this.computedTimeFormat = this.setupTimeFormat();
        this._showAmPmLabel = true;
        /**
         * In timepicker value should be always true
         * In calendar-with-time.component  should set to false
         * @docs-private
         */
        this.showFooter = true;
        /**
         * Emits date when selected.
         * */
        this.onSelectTime = new EventEmitter();
        this.initFromConfig(this.config);
    }
    /**
     * Emits when timepicker looses focus.
     */
    get blur() {
        return this.blur$.asObservable();
    }
    /**
     * Defines time format string.
     * */
    get timeFormat() {
        return this._timeFormat;
    }
    set timeFormat(timeFormat) {
        this._timeFormat = timeFormat;
    }
    /**
     * Defines 12 hours format .
     * */
    get twelveHoursFormat() {
        return this._twelveHoursFormat;
    }
    set twelveHoursFormat(value) {
        this._twelveHoursFormat = convertToBoolProperty(value);
    }
    /**
     * Defines should show am/pm label if twelveHoursFormat enabled.
     * */
    get showAmPmLabel() {
        return this._showAmPmLabel;
    }
    set showAmPmLabel(value) {
        this._showAmPmLabel = convertToBoolProperty(value);
    }
    /**
     * Show seconds in timepicker.
     * Ignored when singleColumn is true
     * */
    get withSeconds() {
        return this._withSeconds;
    }
    set withSeconds(value) {
        this._withSeconds = convertToBoolProperty(value);
    }
    /**
     * Show timepicker values in one column with 60 minutes step by default.
     * */
    get singleColumn() {
        return this._singleColumn;
    }
    set singleColumn(value) {
        this._singleColumn = convertToBoolProperty(value);
    }
    /**
     * Defines minutes offset for options, when timepicker is in single column mode.
     * By default it’s 60 minutes: '12:00, 13:00: 14:00, 15:00...'
     * */
    set step(step) {
        this._step = step;
    }
    get step() {
        return this._step;
    }
    /**
     * Date which will be rendered as selected.
     * */
    set date(date) {
        this._date = date;
        this.isAM = this.dateService.getDayPeriod(this.date) === "AM" /* NbDayPeriod.AM */;
        this.buildColumnOptions();
        this.cd.markForCheck();
    }
    get date() {
        return this._date;
    }
    ngOnChanges({ step, twelveHoursFormat, withSeconds, singleColumn }) {
        const nextTimeFormat = this.setupTimeFormat();
        if (nextTimeFormat !== this.computedTimeFormat) {
            this.computedTimeFormat = nextTimeFormat;
            this.timepickerFormatChange$.next();
        }
        const isConfigChanged = step || twelveHoursFormat || withSeconds || singleColumn;
        if (isConfigChanged || !this.fullTimeOptions) {
            this.buildColumnOptions();
        }
    }
    setHost(hostRef) {
        this.hostRef = hostRef;
    }
    attach(hostRef) {
        this.hostRef = hostRef;
    }
    setCurrentTime() {
        this.date = this.dateService.today();
        this.onSelectTime.emit({
            time: this.date,
            save: true,
        });
    }
    setHour(value) {
        this.updateValue(this.dateService.setHours(this.date, value));
    }
    setMinute(value) {
        this.updateValue(this.dateService.setMinutes(this.date, value));
    }
    setSecond(value) {
        this.updateValue(this.dateService.setSeconds(this.date, value));
    }
    selectFullTime(value) {
        this.updateValue(value);
    }
    changeDayPeriod(dayPeriodToSet) {
        if (this.dateService.getDayPeriod(this.date) === dayPeriodToSet) {
            return;
        }
        // Subtract hours when switching to AM (before midday, 0-11 in 24-hour) from PM (after midday, 12-24 in 24-hour),
        // otherwise add hours because switching to PM from AM.
        const direction = dayPeriodToSet === "AM" /* NbDayPeriod.AM */ ? -1 : 1;
        const increment = direction * this.dateService.HOURS_IN_DAY_PERIOD;
        this.updateValue(this.dateService.addHours(this.date, increment));
    }
    updateValue(date) {
        this.onSelectTime.emit({ time: date });
    }
    saveValue() {
        this.onSelectTime.emit({
            time: this.date,
            save: true,
        });
    }
    trackByTimeValues(index, item) {
        return item.value;
    }
    trackBySingleColumnValue(index, item) {
        return this.dateService.valueOf(item);
    }
    trackByDayPeriod(index, item) {
        return item;
    }
    showSeconds() {
        return this.withSeconds && !this.singleColumn;
    }
    isSelectedHour(val) {
        if (this.date) {
            return this.dateService.getHours(this.date) === val;
        }
        return false;
    }
    isSelectedMinute(val) {
        if (this.date) {
            return this.dateService.getMinutes(this.date) === val;
        }
        return false;
    }
    isSelectedSecond(val) {
        if (this.date) {
            return this.dateService.getSeconds(this.date) === val;
        }
        return false;
    }
    isSelectedDayPeriod(dayPeriod) {
        if (this.date) {
            return dayPeriod === this.dateService.getDayPeriod(this.date);
        }
        return false;
    }
    getFullTimeString(item) {
        return this.dateService.format(item, this.computedTimeFormat).toUpperCase();
    }
    isSelectedFullTimeValue(value) {
        if (this.date) {
            return this.dateService.isSameHourAndMinute(value, this.date);
        }
        return false;
    }
    buildColumnOptions() {
        this.fullTimeOptions = this.singleColumn ? this.calendarTimeModelService.getHoursRange(this.step) : [];
        this.hoursColumnOptions = this.generateHours();
        this.minutesColumnOptions = this.generateMinutesOrSeconds();
        this.secondsColumnOptions = this.showSeconds() ? this.generateMinutesOrSeconds() : [];
    }
    /**
     * @docs-private
     */
    isFirefox() {
        return this.platformService.FIREFOX;
    }
    generateHours() {
        if (!this.twelveHoursFormat) {
            return range(24, (v) => {
                return { value: v, text: this.calendarTimeModelService.paddToTwoSymbols(v) };
            });
        }
        if (this.isAM) {
            return range(12, (v) => {
                const text = v === 0 ? 12 : v;
                return { value: v, text: this.calendarTimeModelService.paddToTwoSymbols(text) };
            });
        }
        return rangeFromTo(12, 24, (v) => {
            const text = v === 12 ? 12 : v - 12;
            return { value: v, text: this.calendarTimeModelService.paddToTwoSymbols(text) };
        });
    }
    generateMinutesOrSeconds() {
        return range(60, (v) => {
            return { value: v, text: this.calendarTimeModelService.paddToTwoSymbols(v) };
        });
    }
    setupTimeFormat() {
        if (!this.timeFormat) {
            return this.config.format || this.buildTimeFormat();
        }
        return this.timeFormat;
    }
    /**
     * @docs-private
     */
    buildTimeFormat() {
        if (this.twelveHoursFormat) {
            return `${this.withSeconds && !this.singleColumn
                ? this.dateService.getTwelveHoursFormatWithSeconds()
                : this.dateService.getTwelveHoursFormat()}`;
        }
        else {
            return `${this.withSeconds && !this.singleColumn
                ? this.dateService.getTwentyFourHoursFormatWithSeconds()
                : this.dateService.getTwentyFourHoursFormat()}`;
        }
    }
    initFromConfig(config) {
        if (config) {
            this.twelveHoursFormat = config.twelveHoursFormat;
        }
        else {
            this.twelveHoursFormat = this.dateService.getLocaleTimeFormat().includes('h');
        }
        const localeConfig = { ...NB_DEFAULT_TIMEPICKER_LOCALIZATION_CONFIG, ...(config?.localization ?? {}) };
        this.hoursText = localeConfig.hoursText;
        this.minutesText = localeConfig.minutesText;
        this.secondsText = localeConfig.secondsText;
        this.ampmText = localeConfig.ampmText;
    }
}
NbTimePickerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbTimePickerComponent, deps: [{ token: NB_TIME_PICKER_CONFIG }, { token: i1.NbPlatform }, { token: LOCALE_ID }, { token: i0.ChangeDetectorRef }, { token: i2.NbCalendarTimeModelService }, { token: i3.NbDateService }], target: i0.ɵɵFactoryTarget.Component });
NbTimePickerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbTimePickerComponent, selector: "nb-timepicker", inputs: { timeFormat: "timeFormat", twelveHoursFormat: "twelveHoursFormat", showAmPmLabel: "showAmPmLabel", withSeconds: "withSeconds", singleColumn: "singleColumn", step: "step", date: "date", showFooter: "showFooter", applyButtonText: "applyButtonText", hoursText: "hoursText", minutesText: "minutesText", secondsText: "secondsText", ampmText: "ampmText", currentTimeButtonText: "currentTimeButtonText" }, outputs: { onSelectTime: "onSelectTime" }, viewQueries: [{ propertyName: "portal", first: true, predicate: NbPortalDirective, descendants: true, static: true }], exportAs: ["nbTimepicker"], usesOnChanges: true, ngImport: i0, template: "<nb-card *nbPortal [class.supports-scrollbar-theming]=\"!isFirefox()\" class=\"nb-timepicker-container\">\n  <nb-card-header class=\"column-header\">\n    <ng-container *ngIf=\"singleColumn; else fullTimeHeadersBlock\">\n      <div class=\"header-cell\">Time</div>\n    </ng-container>\n    <ng-template #fullTimeHeadersBlock>\n      <div class=\"header-cell\">{{ hoursText }}</div>\n      <div class=\"header-cell\">{{ minutesText }}</div>\n      <div *ngIf=\"withSeconds\" class=\"header-cell\">{{ secondsText }}</div>\n      <div *ngIf=\"twelveHoursFormat\" class=\"header-cell\">\n        <ng-template [ngIf]=\"showAmPmLabel\">{{ ampmText }}</ng-template>\n      </div>\n    </ng-template>\n  </nb-card-header>\n\n  <div class=\"picker-body\">\n    <ng-container *ngIf=\"singleColumn; else fullTimeColumnBlock\">\n      <nb-list class=\"values-list\">\n        <nb-list-item\n          class=\"list-item\"\n          [class.selected]=\"isSelectedFullTimeValue(item)\"\n          *ngFor=\"let item of fullTimeOptions; trackBy: trackBySingleColumnValue.bind(this)\"\n        >\n          <nb-timepicker-cell\n            [value]=\"getFullTimeString(item)\"\n            [selected]=\"isSelectedFullTimeValue(item)\"\n            (select)=\"selectFullTime(item)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n    </ng-container>\n\n    <ng-template #fullTimeColumnBlock>\n      <nb-list class=\"values-list\">\n        <nb-list-item\n          class=\"list-item\"\n          [class.selected]=\"isSelectedHour(item.value)\"\n          *ngFor=\"let item of hoursColumnOptions; trackBy: trackByTimeValues\"\n        >\n          <nb-timepicker-cell\n            [value]=\"item.text\"\n            [selected]=\"isSelectedHour(item.value)\"\n            (select)=\"setHour(item.value)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n      <nb-list class=\"values-list\">\n        <nb-list-item\n          class=\"list-item\"\n          [class.selected]=\"isSelectedMinute(item.value)\"\n          *ngFor=\"let item of minutesColumnOptions; trackBy: trackByTimeValues\"\n        >\n          <nb-timepicker-cell\n            [value]=\"item.text\"\n            [selected]=\"isSelectedMinute(item.value)\"\n            (select)=\"setMinute(item.value)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n      <nb-list *ngIf=\"showSeconds()\" class=\"values-list\">\n        <nb-list-item\n          class=\"list-item\"\n          [class.selected]=\"isSelectedSecond(item.value)\"\n          *ngFor=\"let item of secondsColumnOptions; trackBy: trackByTimeValues\"\n        >\n          <nb-timepicker-cell\n            [value]=\"item.text\"\n            [selected]=\"isSelectedSecond(item.value)\"\n            (select)=\"setSecond(item.value)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n      <nb-list *ngIf=\"twelveHoursFormat\" class=\"values-list\">\n        <nb-list-item\n          class=\"list-item am-pm-item\"\n          [class.selected]=\"isSelectedDayPeriod(dayPeriod)\"\n          *ngFor=\"let dayPeriod of dayPeriodColumnOptions; trackBy: trackByDayPeriod\"\n        >\n          <nb-timepicker-cell\n            [value]=\"dayPeriod\"\n            [selected]=\"isSelectedDayPeriod(dayPeriod)\"\n            (select)=\"changeDayPeriod(dayPeriod)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n    </ng-template>\n  </div>\n\n  <nb-card-footer *ngIf=\"showFooter\" class=\"actions-footer\">\n    <nb-calendar-actions\n      [applyButtonText]=\"applyButtonText\"\n      [currentTimeButtonText]=\"currentTimeButtonText\"\n      (setCurrentTime)=\"setCurrentTime()\"\n      (saveValue)=\"saveValue()\"\n    ></nb-calendar-actions>\n  </nb-card-footer>\n</nb-card>\n", styles: ["/**\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n */.nb-timepicker-container{overflow:hidden;margin-bottom:0}.values-list{width:100%;overflow:hidden;-ms-scroll-snap-type:y proximity;scroll-snap-type:y proximity}.values-list:hover{overflow-y:auto}.list-item{border:0;padding:0;cursor:pointer}.picker-body{display:flex;width:100%;flex:1 0 0;overflow:hidden}.column-header{width:100%;display:flex;justify-content:space-between;padding:0}.header-cell{width:100%;display:flex;align-items:center;justify-content:center}.actions-footer{width:100%}nb-card-header,nb-card-footer{flex:0 0 auto}\n"], dependencies: [{ kind: "directive", type: i4.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i4.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i5.NbPortalDirective, selector: "[nbPortal]" }, { kind: "component", type: i6.NbListComponent, selector: "nb-list", inputs: ["role"] }, { kind: "component", type: i6.NbListItemComponent, selector: "nb-list-item", inputs: ["role"] }, { kind: "component", type: i7.NbCardComponent, selector: "nb-card", inputs: ["size", "status", "accent"] }, { kind: "component", type: i7.NbCardFooterComponent, selector: "nb-card-footer" }, { kind: "component", type: i7.NbCardHeaderComponent, selector: "nb-card-header" }, { kind: "component", type: i8.NbCalendarActionsComponent, selector: "nb-calendar-actions", inputs: ["applyButtonText", "currentTimeButtonText", "showCurrentTimeButton"], outputs: ["setCurrentTime", "saveValue"] }, { kind: "component", type: i9.NbTimePickerCellComponent, selector: "nb-timepicker-cell", inputs: ["selected", "value"], outputs: ["select"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbTimePickerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nb-timepicker', exportAs: 'nbTimepicker', changeDetection: ChangeDetectionStrategy.OnPush, template: "<nb-card *nbPortal [class.supports-scrollbar-theming]=\"!isFirefox()\" class=\"nb-timepicker-container\">\n  <nb-card-header class=\"column-header\">\n    <ng-container *ngIf=\"singleColumn; else fullTimeHeadersBlock\">\n      <div class=\"header-cell\">Time</div>\n    </ng-container>\n    <ng-template #fullTimeHeadersBlock>\n      <div class=\"header-cell\">{{ hoursText }}</div>\n      <div class=\"header-cell\">{{ minutesText }}</div>\n      <div *ngIf=\"withSeconds\" class=\"header-cell\">{{ secondsText }}</div>\n      <div *ngIf=\"twelveHoursFormat\" class=\"header-cell\">\n        <ng-template [ngIf]=\"showAmPmLabel\">{{ ampmText }}</ng-template>\n      </div>\n    </ng-template>\n  </nb-card-header>\n\n  <div class=\"picker-body\">\n    <ng-container *ngIf=\"singleColumn; else fullTimeColumnBlock\">\n      <nb-list class=\"values-list\">\n        <nb-list-item\n          class=\"list-item\"\n          [class.selected]=\"isSelectedFullTimeValue(item)\"\n          *ngFor=\"let item of fullTimeOptions; trackBy: trackBySingleColumnValue.bind(this)\"\n        >\n          <nb-timepicker-cell\n            [value]=\"getFullTimeString(item)\"\n            [selected]=\"isSelectedFullTimeValue(item)\"\n            (select)=\"selectFullTime(item)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n    </ng-container>\n\n    <ng-template #fullTimeColumnBlock>\n      <nb-list class=\"values-list\">\n        <nb-list-item\n          class=\"list-item\"\n          [class.selected]=\"isSelectedHour(item.value)\"\n          *ngFor=\"let item of hoursColumnOptions; trackBy: trackByTimeValues\"\n        >\n          <nb-timepicker-cell\n            [value]=\"item.text\"\n            [selected]=\"isSelectedHour(item.value)\"\n            (select)=\"setHour(item.value)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n      <nb-list class=\"values-list\">\n        <nb-list-item\n          class=\"list-item\"\n          [class.selected]=\"isSelectedMinute(item.value)\"\n          *ngFor=\"let item of minutesColumnOptions; trackBy: trackByTimeValues\"\n        >\n          <nb-timepicker-cell\n            [value]=\"item.text\"\n            [selected]=\"isSelectedMinute(item.value)\"\n            (select)=\"setMinute(item.value)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n      <nb-list *ngIf=\"showSeconds()\" class=\"values-list\">\n        <nb-list-item\n          class=\"list-item\"\n          [class.selected]=\"isSelectedSecond(item.value)\"\n          *ngFor=\"let item of secondsColumnOptions; trackBy: trackByTimeValues\"\n        >\n          <nb-timepicker-cell\n            [value]=\"item.text\"\n            [selected]=\"isSelectedSecond(item.value)\"\n            (select)=\"setSecond(item.value)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n      <nb-list *ngIf=\"twelveHoursFormat\" class=\"values-list\">\n        <nb-list-item\n          class=\"list-item am-pm-item\"\n          [class.selected]=\"isSelectedDayPeriod(dayPeriod)\"\n          *ngFor=\"let dayPeriod of dayPeriodColumnOptions; trackBy: trackByDayPeriod\"\n        >\n          <nb-timepicker-cell\n            [value]=\"dayPeriod\"\n            [selected]=\"isSelectedDayPeriod(dayPeriod)\"\n            (select)=\"changeDayPeriod(dayPeriod)\"\n          >\n          </nb-timepicker-cell>\n        </nb-list-item>\n      </nb-list>\n    </ng-template>\n  </div>\n\n  <nb-card-footer *ngIf=\"showFooter\" class=\"actions-footer\">\n    <nb-calendar-actions\n      [applyButtonText]=\"applyButtonText\"\n      [currentTimeButtonText]=\"currentTimeButtonText\"\n      (setCurrentTime)=\"setCurrentTime()\"\n      (saveValue)=\"saveValue()\"\n    ></nb-calendar-actions>\n  </nb-card-footer>\n</nb-card>\n", styles: ["/**\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n */.nb-timepicker-container{overflow:hidden;margin-bottom:0}.values-list{width:100%;overflow:hidden;-ms-scroll-snap-type:y proximity;scroll-snap-type:y proximity}.values-list:hover{overflow-y:auto}.list-item{border:0;padding:0;cursor:pointer}.picker-body{display:flex;width:100%;flex:1 0 0;overflow:hidden}.column-header{width:100%;display:flex;justify-content:space-between;padding:0}.header-cell{width:100%;display:flex;align-items:center;justify-content:center}.actions-footer{width:100%}nb-card-header,nb-card-footer{flex:0 0 auto}\n"] }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_TIME_PICKER_CONFIG]
                }] }, { type: i1.NbPlatform }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }, { type: i0.ChangeDetectorRef }, { type: i2.NbCalendarTimeModelService }, { type: i3.NbDateService }]; }, propDecorators: { timeFormat: [{
                type: Input
            }], twelveHoursFormat: [{
                type: Input
            }], showAmPmLabel: [{
                type: Input
            }], withSeconds: [{
                type: Input
            }], singleColumn: [{
                type: Input
            }], step: [{
                type: Input
            }], date: [{
                type: Input
            }], showFooter: [{
                type: Input
            }], applyButtonText: [{
                type: Input
            }], hoursText: [{
                type: Input
            }], minutesText: [{
                type: Input
            }], secondsText: [{
                type: Input
            }], ampmText: [{
                type: Input
            }], currentTimeButtonText: [{
                type: Input
            }], onSelectTime: [{
                type: Output
            }], portal: [{
                type: ViewChild,
                args: [NbPortalDirective, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXBpY2tlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL3RoZW1lL2NvbXBvbmVudHMvdGltZXBpY2tlci90aW1lcGlja2VyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvdGhlbWUvY29tcG9uZW50cy90aW1lcGlja2VyL3RpbWVwaWNrZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUV2QixTQUFTLEVBRVQsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUdULE1BQU0sRUFFTixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUzQyxPQUFPLEVBQUUscUJBQXFCLEVBQWtCLE1BQU0sWUFBWSxDQUFDO0FBQ25FLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRzNELE9BQU8sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFN0QsT0FBTyxFQUNMLHlDQUF5QyxFQUN6QyxxQkFBcUIsR0FHdEIsTUFBTSxTQUFTLENBQUM7Ozs7Ozs7Ozs7O0FBT2pCOzs7R0FHRztBQVFILE1BQU0sT0FBTyxxQkFBcUI7SUF3SWhDLFlBQzJDLE1BQTBCLEVBQ3pELGVBQTJCLEVBQ2xCLE1BQWMsRUFDMUIsRUFBcUIsRUFDbEIsd0JBQXVELEVBQ3ZELFdBQTZCO1FBTEUsV0FBTSxHQUFOLE1BQU0sQ0FBb0I7UUFDekQsb0JBQWUsR0FBZixlQUFlLENBQVk7UUFFOUIsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFDbEIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUErQjtRQUN2RCxnQkFBVyxHQUFYLFdBQVcsQ0FBa0I7UUE3SS9CLFVBQUssR0FBa0Is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QixTQUFTO3VHQTNJUixxQkFBcUIsZ2lCQXNJckIsaUJBQWlCLCtHQ3BMOUIsaXpIQXNHQTs0RkR4RGEscUJBQXFCO2tCQVBqQyxTQUFTOytCQUNFLGVBQWUsWUFHZixjQUFjLG1CQUNQLHVCQUF1QixDQUFDLE1BQU07OzBCQTJJNUMsTUFBTTsyQkFBQyxxQkFBcUI7OzBCQUU1QixNQUFNOzJCQUFDLFNBQVM7aUpBbkhmLFVBQVU7c0JBRGIsS0FBSztnQkFlRixpQkFBaUI7c0JBRHBCLEtBQUs7Z0JBY0YsYUFBYTtzQkFEaEIsS0FBSztnQkFlRixXQUFXO3NCQURkLEtBQUs7Z0JBY0YsWUFBWTtzQkFEZixLQUFLO2dCQWVGLElBQUk7c0JBRFAsS0FBSztnQkFhRixJQUFJO3NCQURQLEtBQUs7Z0JBbUJHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csZUFBZTtzQkFBdkIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLHFCQUFxQjtzQkFBN0IsS0FBSztnQkFLSSxZQUFZO3NCQUFyQixNQUFNO2dCQUN5QyxNQUFNO3NCQUFyRCxTQUFTO3VCQUFDLGlCQUFpQixFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIExPQ0FMRV9JRCxcbiAgT25DaGFuZ2VzLFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0NoaWxkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgY29udmVydFRvQm9vbFByb3BlcnR5LCBOYkJvb2xlYW5JbnB1dCB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IHsgTmJQb3J0YWxEaXJlY3RpdmUgfSBmcm9tICcuLi9jZGsvb3ZlcmxheS9tYXBwaW5nJztcbmltcG9ydCB7IE5iUGxhdGZvcm0gfSBmcm9tICcuLi9jZGsvcGxhdGZvcm0vcGxhdGZvcm0tc2VydmljZSc7XG5pbXBvcnQgeyBOYkRhdGVTZXJ2aWNlLCBOYkRheVBlcmlvZCB9IGZyb20gJy4uL2NhbGVuZGFyLWtpdC9zZXJ2aWNlcy9kYXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgcmFuZ2UsIHJhbmdlRnJvbVRvIH0gZnJvbSAnLi4vY2FsZW5kYXIta2l0L2hlbHBlcnMnO1xuaW1wb3J0IHsgTmJDYWxlbmRhclRpbWVNb2RlbFNlcnZpY2UgfSBmcm9tICcuLi9jYWxlbmRhci1raXQvc2VydmljZXMvY2FsZW5kYXItdGltZS1tb2RlbC5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIE5CX0RFRkFVTFRfVElNRVBJQ0tFUl9MT0NBTElaQVRJT05fQ09ORklHLFxuICBOQl9USU1FX1BJQ0tFUl9DT05GSUcsXG4gIE5iU2VsZWN0ZWRUaW1lUGF5bG9hZCxcbiAgTmJUaW1lUGlja2VyQ29uZmlnLFxufSBmcm9tICcuL21vZGVsJztcblxuaW50ZXJmYWNlIE5iVGltZVBhcnRPcHRpb24ge1xuICB2YWx1ZTogbnVtYmVyO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogVGhlIFRpbWVQaWNrZXIgY29tcG9uZW50cyBpdHNlbGYuXG4gKiBQcm92aWRlcyBhIHByb3h5IHRvIGBUaW1lUGlja2VyYCBvcHRpb25zIGFzIHdlbGwgYXMgY3VzdG9tIHBpY2tlciBvcHRpb25zLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduYi10aW1lcGlja2VyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3RpbWVwaWNrZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi90aW1lcGlja2VyLmNvbXBvbmVudC5zY3NzJ10sXG4gIGV4cG9ydEFzOiAnbmJUaW1lcGlja2VyJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIE5iVGltZVBpY2tlckNvbXBvbmVudDxEPiBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIHByb3RlY3RlZCBibHVyJDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgZnVsbFRpbWVPcHRpb25zOiBEW107XG4gIGhvdXJzQ29sdW1uT3B0aW9uczogTmJUaW1lUGFydE9wdGlvbltdO1xuICBtaW51dGVzQ29sdW1uT3B0aW9uczogTmJUaW1lUGFydE9wdGlvbltdO1xuICBzZWNvbmRzQ29sdW1uT3B0aW9uczogTmJUaW1lUGFydE9wdGlvbltdO1xuICByZWFkb25seSBkYXlQZXJpb2RDb2x1bW5PcHRpb25zID0gW05iRGF5UGVyaW9kLkFNLCBOYkRheVBlcmlvZC5QTV07XG4gIGhvc3RSZWY6IEVsZW1lbnRSZWY7XG4gIGlzQU0gPSB0cnVlO1xuXG4gIHRpbWVwaWNrZXJGb3JtYXRDaGFuZ2UkOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbiB0aW1lcGlja2VyIGxvb3NlcyBmb2N1cy5cbiAgICovXG4gIGdldCBibHVyKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmJsdXIkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGltZSBmb3JtYXQgc3RyaW5nLlxuICAgKiAqL1xuICBASW5wdXQoKVxuICBnZXQgdGltZUZvcm1hdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl90aW1lRm9ybWF0O1xuICB9XG4gIHNldCB0aW1lRm9ybWF0KHRpbWVGb3JtYXQ6IHN0cmluZykge1xuICAgIHRoaXMuX3RpbWVGb3JtYXQgPSB0aW1lRm9ybWF0O1xuICB9XG4gIHByb3RlY3RlZCBfdGltZUZvcm1hdDogc3RyaW5nO1xuXG4gIGNvbXB1dGVkVGltZUZvcm1hdDogc3RyaW5nID0gdGhpcy5zZXR1cFRpbWVGb3JtYXQoKTtcblxuICAvKipcbiAgICogRGVmaW5lcyAxMiBob3VycyBmb3JtYXQgLlxuICAgKiAqL1xuICBASW5wdXQoKVxuICBnZXQgdHdlbHZlSG91cnNGb3JtYXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3R3ZWx2ZUhvdXJzRm9ybWF0O1xuICB9XG4gIHNldCB0d2VsdmVIb3Vyc0Zvcm1hdCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3R3ZWx2ZUhvdXJzRm9ybWF0ID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcm90ZWN0ZWQgX3R3ZWx2ZUhvdXJzRm9ybWF0OiBib29sZWFuO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdHdlbHZlSG91cnNGb3JtYXQ6IE5iQm9vbGVhbklucHV0O1xuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHNob3VsZCBzaG93IGFtL3BtIGxhYmVsIGlmIHR3ZWx2ZUhvdXJzRm9ybWF0IGVuYWJsZWQuXG4gICAqICovXG4gIEBJbnB1dCgpXG4gIGdldCBzaG93QW1QbUxhYmVsKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zaG93QW1QbUxhYmVsO1xuICB9XG4gIHNldCBzaG93QW1QbUxhYmVsKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2hvd0FtUG1MYWJlbCA9IGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJvdGVjdGVkIF9zaG93QW1QbUxhYmVsOiBib29sZWFuID0gdHJ1ZTtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dBbVBtTGFiZWw6IE5iQm9vbGVhbklucHV0O1xuXG4gIC8qKlxuICAgKiBTaG93IHNlY29uZHMgaW4gdGltZXBpY2tlci5cbiAgICogSWdub3JlZCB3aGVuIHNpbmdsZUNvbHVtbiBpcyB0cnVlXG4gICAqICovXG4gIEBJbnB1dCgpXG4gIGdldCB3aXRoU2Vjb25kcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fd2l0aFNlY29uZHM7XG4gIH1cbiAgc2V0IHdpdGhTZWNvbmRzKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fd2l0aFNlY29uZHMgPSBjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByb3RlY3RlZCBfd2l0aFNlY29uZHM6IGJvb2xlYW47XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV93aXRoU2Vjb25kczogTmJCb29sZWFuSW5wdXQ7XG5cbiAgLyoqXG4gICAqIFNob3cgdGltZXBpY2tlciB2YWx1ZXMgaW4gb25lIGNvbHVtbiB3aXRoIDYwIG1pbnV0ZXMgc3RlcCBieSBkZWZhdWx0LlxuICAgKiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2luZ2xlQ29sdW1uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zaW5nbGVDb2x1bW47XG4gIH1cbiAgc2V0IHNpbmdsZUNvbHVtbih2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3NpbmdsZUNvbHVtbiA9IGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgX3NpbmdsZUNvbHVtbjogYm9vbGVhbjtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NpbmdsZUNvbHVtbjogTmJCb29sZWFuSW5wdXQ7XG5cbiAgLyoqXG4gICAqIERlZmluZXMgbWludXRlcyBvZmZzZXQgZm9yIG9wdGlvbnMsIHdoZW4gdGltZXBpY2tlciBpcyBpbiBzaW5nbGUgY29sdW1uIG1vZGUuXG4gICAqIEJ5IGRlZmF1bHQgaXTigJlzIDYwIG1pbnV0ZXM6ICcxMjowMCwgMTM6MDA6IDE0OjAwLCAxNTowMC4uLidcbiAgICogKi9cbiAgQElucHV0KClcbiAgc2V0IHN0ZXAoc3RlcDogbnVtYmVyKSB7XG4gICAgdGhpcy5fc3RlcCA9IHN0ZXA7XG4gIH1cbiAgZ2V0IHN0ZXAoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fc3RlcDtcbiAgfVxuICBwcm90ZWN0ZWQgX3N0ZXA6IG51bWJlcjtcblxuICAvKipcbiAgICogRGF0ZSB3aGljaCB3aWxsIGJlIHJlbmRlcmVkIGFzIHNlbGVjdGVkLlxuICAgKiAqL1xuICBASW5wdXQoKVxuICBzZXQgZGF0ZShkYXRlOiBEKSB7XG4gICAgdGhpcy5fZGF0ZSA9IGRhdGU7XG4gICAgdGhpcy5pc0FNID0gdGhpcy5kYXRlU2VydmljZS5nZXREYXlQZXJpb2QodGhpcy5kYXRlKSA9PT0gTmJEYXlQZXJpb2QuQU07XG4gICAgdGhpcy5idWlsZENvbHVtbk9wdGlvbnMoKTtcbiAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgZ2V0IGRhdGUoKTogRCB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGU7XG4gIH1cblxuICBfZGF0ZTogRDtcblxuICAvKipcbiAgICogSW4gdGltZXBpY2tlciB2YWx1ZSBzaG91bGQgYmUgYWx3YXlzIHRydWVcbiAgICogSW4gY2FsZW5kYXItd2l0aC10aW1lLmNvbXBvbmVudCAgc2hvdWxkIHNldCB0byBmYWxzZVxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBASW5wdXQoKSBzaG93Rm9vdGVyOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgYXBwbHlCdXR0b25UZXh0OiBzdHJpbmc7XG4gIEBJbnB1dCgpIGhvdXJzVGV4dDogc3RyaW5nO1xuICBASW5wdXQoKSBtaW51dGVzVGV4dDogc3RyaW5nO1xuICBASW5wdXQoKSBzZWNvbmRzVGV4dDogc3RyaW5nO1xuICBASW5wdXQoKSBhbXBtVGV4dDogc3RyaW5nO1xuICBASW5wdXQoKSBjdXJyZW50VGltZUJ1dHRvblRleHQ6IHN0cmluZztcblxuICAvKipcbiAgICogRW1pdHMgZGF0ZSB3aGVuIHNlbGVjdGVkLlxuICAgKiAqL1xuICBAT3V0cHV0KCkgb25TZWxlY3RUaW1lOiBFdmVudEVtaXR0ZXI8TmJTZWxlY3RlZFRpbWVQYXlsb2FkPEQ+PiA9IG5ldyBFdmVudEVtaXR0ZXI8TmJTZWxlY3RlZFRpbWVQYXlsb2FkPEQ+PigpO1xuICBAVmlld0NoaWxkKE5iUG9ydGFsRGlyZWN0aXZlLCB7IHN0YXRpYzogdHJ1ZSB9KSBwb3J0YWw6IE5iUG9ydGFsRGlyZWN0aXZlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTkJfVElNRV9QSUNLRVJfQ09ORklHKSBwcm90ZWN0ZWQgY29uZmlnOiBOYlRpbWVQaWNrZXJDb25maWcsXG4gICAgcHJvdGVjdGVkIHBsYXRmb3JtU2VydmljZTogTmJQbGF0Zm9ybSxcbiAgICBASW5qZWN0KExPQ0FMRV9JRCkgbG9jYWxlOiBzdHJpbmcsXG4gICAgcHVibGljIGNkOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcm90ZWN0ZWQgY2FsZW5kYXJUaW1lTW9kZWxTZXJ2aWNlOiBOYkNhbGVuZGFyVGltZU1vZGVsU2VydmljZTxEPixcbiAgICBwcm90ZWN0ZWQgZGF0ZVNlcnZpY2U6IE5iRGF0ZVNlcnZpY2U8RD4sXG4gICkge1xuICAgIHRoaXMuaW5pdEZyb21Db25maWcodGhpcy5jb25maWcpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoeyBzdGVwLCB0d2VsdmVIb3Vyc0Zvcm1hdCwgd2l0aFNlY29uZHMsIHNpbmdsZUNvbHVtbiB9OiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgY29uc3QgbmV4dFRpbWVGb3JtYXQgPSB0aGlzLnNldHVwVGltZUZvcm1hdCgpO1xuICAgIGlmIChuZXh0VGltZUZvcm1hdCAhPT0gdGhpcy5jb21wdXRlZFRpbWVGb3JtYXQpIHtcbiAgICAgIHRoaXMuY29tcHV0ZWRUaW1lRm9ybWF0ID0gbmV4dFRpbWVGb3JtYXQ7XG4gICAgICB0aGlzLnRpbWVwaWNrZXJGb3JtYXRDaGFuZ2UkLm5leHQoKTtcbiAgICB9XG5cbiAgICBjb25zdCBpc0NvbmZpZ0NoYW5nZWQgPSBzdGVwIHx8IHR3ZWx2ZUhvdXJzRm9ybWF0IHx8IHdpdGhTZWNvbmRzIHx8IHNpbmdsZUNvbHVtbjtcblxuICAgIGlmIChpc0NvbmZpZ0NoYW5nZWQgfHwgIXRoaXMuZnVsbFRpbWVPcHRpb25zKSB7XG4gICAgICB0aGlzLmJ1aWxkQ29sdW1uT3B0aW9ucygpO1xuICAgIH1cbiAgfVxuXG4gIHNldEhvc3QoaG9zdFJlZjogRWxlbWVudFJlZik6IHZvaWQge1xuICAgIHRoaXMuaG9zdFJlZiA9IGhvc3RSZWY7XG4gIH1cblxuICBhdHRhY2goaG9zdFJlZjogRWxlbWVudFJlZik6IHZvaWQge1xuICAgIHRoaXMuaG9zdFJlZiA9IGhvc3RSZWY7XG4gIH1cblxuICBzZXRDdXJyZW50VGltZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRhdGUgPSB0aGlzLmRhdGVTZXJ2aWNlLnRvZGF5KCk7XG4gICAgdGhpcy5vblNlbGVjdFRpbWUuZW1pdCh7XG4gICAgICB0aW1lOiB0aGlzLmRhdGUsXG4gICAgICBzYXZlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0SG91cih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGVWYWx1ZSh0aGlzLmRhdGVTZXJ2aWNlLnNldEhvdXJzKHRoaXMuZGF0ZSwgdmFsdWUpKTtcbiAgfVxuXG4gIHNldE1pbnV0ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGVWYWx1ZSh0aGlzLmRhdGVTZXJ2aWNlLnNldE1pbnV0ZXModGhpcy5kYXRlLCB2YWx1ZSkpO1xuICB9XG5cbiAgc2V0U2Vjb25kKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlKHRoaXMuZGF0ZVNlcnZpY2Uuc2V0U2Vjb25kcyh0aGlzLmRhdGUsIHZhbHVlKSk7XG4gIH1cblxuICBzZWxlY3RGdWxsVGltZSh2YWx1ZTogRCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgY2hhbmdlRGF5UGVyaW9kKGRheVBlcmlvZFRvU2V0OiBOYkRheVBlcmlvZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRhdGVTZXJ2aWNlLmdldERheVBlcmlvZCh0aGlzLmRhdGUpID09PSBkYXlQZXJpb2RUb1NldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFN1YnRyYWN0IGhvdXJzIHdoZW4gc3dpdGNoaW5nIHRvIEFNIChiZWZvcmUgbWlkZGF5LCAwLTExIGluIDI0LWhvdXIpIGZyb20gUE0gKGFmdGVyIG1pZGRheSwgMTItMjQgaW4gMjQtaG91ciksXG4gICAgLy8gb3RoZXJ3aXNlIGFkZCBob3VycyBiZWNhdXNlIHN3aXRjaGluZyB0byBQTSBmcm9tIEFNLlxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IGRheVBlcmlvZFRvU2V0ID09PSBOYkRheVBlcmlvZC5BTSA/IC0xIDogMTtcbiAgICBjb25zdCBpbmNyZW1lbnQgPSBkaXJlY3Rpb24gKiB0aGlzLmRhdGVTZXJ2aWNlLkhPVVJTX0lOX0RBWV9QRVJJT0Q7XG4gICAgdGhpcy51cGRhdGVWYWx1ZSh0aGlzLmRhdGVTZXJ2aWNlLmFkZEhvdXJzKHRoaXMuZGF0ZSwgaW5jcmVtZW50KSk7XG4gIH1cblxuICB1cGRhdGVWYWx1ZShkYXRlOiBEKTogdm9pZCB7XG4gICAgdGhpcy5vblNlbGVjdFRpbWUuZW1pdCh7IHRpbWU6IGRhdGUgfSk7XG4gIH1cblxuICBzYXZlVmFsdWUoKTogdm9pZCB7XG4gICAgdGhpcy5vblNlbGVjdFRpbWUuZW1pdCh7XG4gICAgICB0aW1lOiB0aGlzLmRhdGUsXG4gICAgICBzYXZlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgdHJhY2tCeVRpbWVWYWx1ZXMoaW5kZXgsIGl0ZW06IE5iVGltZVBhcnRPcHRpb24pOiBudW1iZXIge1xuICAgIHJldHVybiBpdGVtLnZhbHVlO1xuICB9XG5cbiAgdHJhY2tCeVNpbmdsZUNvbHVtblZhbHVlKGluZGV4LCBpdGVtOiBEKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0ZVNlcnZpY2UudmFsdWVPZihpdGVtKTtcbiAgfVxuXG4gIHRyYWNrQnlEYXlQZXJpb2QoaW5kZXgsIGl0ZW06IE5iRGF5UGVyaW9kKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIHNob3dTZWNvbmRzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLndpdGhTZWNvbmRzICYmICF0aGlzLnNpbmdsZUNvbHVtbjtcbiAgfVxuXG4gIGlzU2VsZWN0ZWRIb3VyKHZhbDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuZGF0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0ZVNlcnZpY2UuZ2V0SG91cnModGhpcy5kYXRlKSA9PT0gdmFsO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzU2VsZWN0ZWRNaW51dGUodmFsOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5kYXRlKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRlU2VydmljZS5nZXRNaW51dGVzKHRoaXMuZGF0ZSkgPT09IHZhbDtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc1NlbGVjdGVkU2Vjb25kKHZhbDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuZGF0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0ZVNlcnZpY2UuZ2V0U2Vjb25kcyh0aGlzLmRhdGUpID09PSB2YWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaXNTZWxlY3RlZERheVBlcmlvZChkYXlQZXJpb2Q6IE5iRGF5UGVyaW9kKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuZGF0ZSkge1xuICAgICAgcmV0dXJuIGRheVBlcmlvZCA9PT0gdGhpcy5kYXRlU2VydmljZS5nZXREYXlQZXJpb2QodGhpcy5kYXRlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXRGdWxsVGltZVN0cmluZyhpdGVtOiBEKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5kYXRlU2VydmljZS5mb3JtYXQoaXRlbSwgdGhpcy5jb21wdXRlZFRpbWVGb3JtYXQpLnRvVXBwZXJDYXNlKCk7XG4gIH1cblxuICBpc1NlbGVjdGVkRnVsbFRpbWVWYWx1ZSh2YWx1ZTogRCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmRhdGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGVTZXJ2aWNlLmlzU2FtZUhvdXJBbmRNaW51dGUodmFsdWUsIHRoaXMuZGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIGJ1aWxkQ29sdW1uT3B0aW9ucygpOiB2b2lkIHtcbiAgICB0aGlzLmZ1bGxUaW1lT3B0aW9ucyA9IHRoaXMuc2luZ2xlQ29sdW1uID8gdGhpcy5jYWxlbmRhclRpbWVNb2RlbFNlcnZpY2UuZ2V0SG91cnNSYW5nZSh0aGlzLnN0ZXApIDogW107XG5cbiAgICB0aGlzLmhvdXJzQ29sdW1uT3B0aW9ucyA9IHRoaXMuZ2VuZXJhdGVIb3VycygpO1xuICAgIHRoaXMubWludXRlc0NvbHVtbk9wdGlvbnMgPSB0aGlzLmdlbmVyYXRlTWludXRlc09yU2Vjb25kcygpO1xuICAgIHRoaXMuc2Vjb25kc0NvbHVtbk9wdGlvbnMgPSB0aGlzLnNob3dTZWNvbmRzKCkgPyB0aGlzLmdlbmVyYXRlTWludXRlc09yU2Vjb25kcygpIDogW107XG4gIH1cblxuICAvKipcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgaXNGaXJlZm94KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtU2VydmljZS5GSVJFRk9YO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdlbmVyYXRlSG91cnMoKTogTmJUaW1lUGFydE9wdGlvbltdIHtcbiAgICBpZiAoIXRoaXMudHdlbHZlSG91cnNGb3JtYXQpIHtcbiAgICAgIHJldHVybiByYW5nZSgyNCwgKHY6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogdiwgdGV4dDogdGhpcy5jYWxlbmRhclRpbWVNb2RlbFNlcnZpY2UucGFkZFRvVHdvU3ltYm9scyh2KSB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNBTSkge1xuICAgICAgcmV0dXJuIHJhbmdlKDEyLCAodjogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB2ID09PSAwID8gMTIgOiB2O1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogdiwgdGV4dDogdGhpcy5jYWxlbmRhclRpbWVNb2RlbFNlcnZpY2UucGFkZFRvVHdvU3ltYm9scyh0ZXh0KSB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlRnJvbVRvKDEyLCAyNCwgKHY6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdGV4dCA9IHYgPT09IDEyID8gMTIgOiB2IC0gMTI7XG4gICAgICByZXR1cm4geyB2YWx1ZTogdiwgdGV4dDogdGhpcy5jYWxlbmRhclRpbWVNb2RlbFNlcnZpY2UucGFkZFRvVHdvU3ltYm9scyh0ZXh0KSB9O1xuICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdlbmVyYXRlTWludXRlc09yU2Vjb25kcygpOiBOYlRpbWVQYXJ0T3B0aW9uW10ge1xuICAgIHJldHVybiByYW5nZSg2MCwgKHY6IG51bWJlcikgPT4ge1xuICAgICAgcmV0dXJuIHsgdmFsdWU6IHYsIHRleHQ6IHRoaXMuY2FsZW5kYXJUaW1lTW9kZWxTZXJ2aWNlLnBhZGRUb1R3b1N5bWJvbHModikgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzZXR1cFRpbWVGb3JtYXQoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMudGltZUZvcm1hdCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmZvcm1hdCB8fCB0aGlzLmJ1aWxkVGltZUZvcm1hdCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRpbWVGb3JtYXQ7XG4gIH1cblxuICAvKipcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgYnVpbGRUaW1lRm9ybWF0KCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMudHdlbHZlSG91cnNGb3JtYXQpIHtcbiAgICAgIHJldHVybiBgJHtcbiAgICAgICAgdGhpcy53aXRoU2Vjb25kcyAmJiAhdGhpcy5zaW5nbGVDb2x1bW5cbiAgICAgICAgICA/IHRoaXMuZGF0ZVNlcnZpY2UuZ2V0VHdlbHZlSG91cnNGb3JtYXRXaXRoU2Vjb25kcygpXG4gICAgICAgICAgOiB0aGlzLmRhdGVTZXJ2aWNlLmdldFR3ZWx2ZUhvdXJzRm9ybWF0KClcbiAgICAgIH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYCR7XG4gICAgICAgIHRoaXMud2l0aFNlY29uZHMgJiYgIXRoaXMuc2luZ2xlQ29sdW1uXG4gICAgICAgICAgPyB0aGlzLmRhdGVTZXJ2aWNlLmdldFR3ZW50eUZvdXJIb3Vyc0Zvcm1hdFdpdGhTZWNvbmRzKClcbiAgICAgICAgICA6IHRoaXMuZGF0ZVNlcnZpY2UuZ2V0VHdlbnR5Rm91ckhvdXJzRm9ybWF0KClcbiAgICAgIH1gO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0RnJvbUNvbmZpZyhjb25maWc6IE5iVGltZVBpY2tlckNvbmZpZykge1xuICAgIGlmIChjb25maWcpIHtcbiAgICAgIHRoaXMudHdlbHZlSG91cnNGb3JtYXQgPSBjb25maWcudHdlbHZlSG91cnNGb3JtYXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudHdlbHZlSG91cnNGb3JtYXQgPSB0aGlzLmRhdGVTZXJ2aWNlLmdldExvY2FsZVRpbWVGb3JtYXQoKS5pbmNsdWRlcygnaCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsZUNvbmZpZyA9IHsgLi4uTkJfREVGQVVMVF9USU1FUElDS0VSX0xPQ0FMSVpBVElPTl9DT05GSUcsIC4uLihjb25maWc/LmxvY2FsaXphdGlvbiA/PyB7fSkgfTtcbiAgICB0aGlzLmhvdXJzVGV4dCA9IGxvY2FsZUNvbmZpZy5ob3Vyc1RleHQ7XG4gICAgdGhpcy5taW51dGVzVGV4dCA9IGxvY2FsZUNvbmZpZy5taW51dGVzVGV4dDtcbiAgICB0aGlzLnNlY29uZHNUZXh0ID0gbG9jYWxlQ29uZmlnLnNlY29uZHNUZXh0O1xuICAgIHRoaXMuYW1wbVRleHQgPSBsb2NhbGVDb25maWcuYW1wbVRleHQ7XG4gIH1cbn1cbiIsIjxuYi1jYXJkICpuYlBvcnRhbCBbY2xhc3Muc3VwcG9ydHMtc2Nyb2xsYmFyLXRoZW1pbmddPVwiIWlzRmlyZWZveCgpXCIgY2xhc3M9XCJuYi10aW1lcGlja2VyLWNvbnRhaW5lclwiPlxuICA8bmItY2FyZC1oZWFkZXIgY2xhc3M9XCJjb2x1bW4taGVhZGVyXCI+XG4gICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cInNpbmdsZUNvbHVtbjsgZWxzZSBmdWxsVGltZUhlYWRlcnNCbG9ja1wiPlxuICAgICAgPGRpdiBjbGFzcz1cImhlYWRlci1jZWxsXCI+VGltZTwvZGl2PlxuICAgIDwvbmctY29udGFpbmVyPlxuICAgIDxuZy10ZW1wbGF0ZSAjZnVsbFRpbWVIZWFkZXJzQmxvY2s+XG4gICAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyLWNlbGxcIj57eyBob3Vyc1RleHQgfX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXItY2VsbFwiPnt7IG1pbnV0ZXNUZXh0IH19PC9kaXY+XG4gICAgICA8ZGl2ICpuZ0lmPVwid2l0aFNlY29uZHNcIiBjbGFzcz1cImhlYWRlci1jZWxsXCI+e3sgc2Vjb25kc1RleHQgfX08L2Rpdj5cbiAgICAgIDxkaXYgKm5nSWY9XCJ0d2VsdmVIb3Vyc0Zvcm1hdFwiIGNsYXNzPVwiaGVhZGVyLWNlbGxcIj5cbiAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ0lmXT1cInNob3dBbVBtTGFiZWxcIj57eyBhbXBtVGV4dCB9fTwvbmctdGVtcGxhdGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L25nLXRlbXBsYXRlPlxuICA8L25iLWNhcmQtaGVhZGVyPlxuXG4gIDxkaXYgY2xhc3M9XCJwaWNrZXItYm9keVwiPlxuICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCJzaW5nbGVDb2x1bW47IGVsc2UgZnVsbFRpbWVDb2x1bW5CbG9ja1wiPlxuICAgICAgPG5iLWxpc3QgY2xhc3M9XCJ2YWx1ZXMtbGlzdFwiPlxuICAgICAgICA8bmItbGlzdC1pdGVtXG4gICAgICAgICAgY2xhc3M9XCJsaXN0LWl0ZW1cIlxuICAgICAgICAgIFtjbGFzcy5zZWxlY3RlZF09XCJpc1NlbGVjdGVkRnVsbFRpbWVWYWx1ZShpdGVtKVwiXG4gICAgICAgICAgKm5nRm9yPVwibGV0IGl0ZW0gb2YgZnVsbFRpbWVPcHRpb25zOyB0cmFja0J5OiB0cmFja0J5U2luZ2xlQ29sdW1uVmFsdWUuYmluZCh0aGlzKVwiXG4gICAgICAgID5cbiAgICAgICAgICA8bmItdGltZXBpY2tlci1jZWxsXG4gICAgICAgICAgICBbdmFsdWVdPVwiZ2V0RnVsbFRpbWVTdHJpbmcoaXRlbSlcIlxuICAgICAgICAgICAgW3NlbGVjdGVkXT1cImlzU2VsZWN0ZWRGdWxsVGltZVZhbHVlKGl0ZW0pXCJcbiAgICAgICAgICAgIChzZWxlY3QpPVwic2VsZWN0RnVsbFRpbWUoaXRlbSlcIlxuICAgICAgICAgID5cbiAgICAgICAgICA8L25iLXRpbWVwaWNrZXItY2VsbD5cbiAgICAgICAgPC9uYi1saXN0LWl0ZW0+XG4gICAgICA8L25iLWxpc3Q+XG4gICAgPC9uZy1jb250YWluZXI+XG5cbiAgICA8bmctdGVtcGxhdGUgI2Z1bGxUaW1lQ29sdW1uQmxvY2s+XG4gICAgICA8bmItbGlzdCBjbGFzcz1cInZhbHVlcy1saXN0XCI+XG4gICAgICAgIDxuYi1saXN0LWl0ZW1cbiAgICAgICAgICBjbGFzcz1cImxpc3QtaXRlbVwiXG4gICAgICAgICAgW2NsYXNzLnNlbGVjdGVkXT1cImlzU2VsZWN0ZWRIb3VyKGl0ZW0udmFsdWUpXCJcbiAgICAgICAgICAqbmdGb3I9XCJsZXQgaXRlbSBvZiBob3Vyc0NvbHVtbk9wdGlvbnM7IHRyYWNrQnk6IHRyYWNrQnlUaW1lVmFsdWVzXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxuYi10aW1lcGlja2VyLWNlbGxcbiAgICAgICAgICAgIFt2YWx1ZV09XCJpdGVtLnRleHRcIlxuICAgICAgICAgICAgW3NlbGVjdGVkXT1cImlzU2VsZWN0ZWRIb3VyKGl0ZW0udmFsdWUpXCJcbiAgICAgICAgICAgIChzZWxlY3QpPVwic2V0SG91cihpdGVtLnZhbHVlKVwiXG4gICAgICAgICAgPlxuICAgICAgICAgIDwvbmItdGltZXBpY2tlci1jZWxsPlxuICAgICAgICA8L25iLWxpc3QtaXRlbT5cbiAgICAgIDwvbmItbGlzdD5cbiAgICAgIDxuYi1saXN0IGNsYXNzPVwidmFsdWVzLWxpc3RcIj5cbiAgICAgICAgPG5iLWxpc3QtaXRlbVxuICAgICAgICAgIGNsYXNzPVwibGlzdC1pdGVtXCJcbiAgICAgICAgICBbY2xhc3Muc2VsZWN0ZWRdPVwiaXNTZWxlY3RlZE1pbnV0ZShpdGVtLnZhbHVlKVwiXG4gICAgICAgICAgKm5nRm9yPVwibGV0IGl0ZW0gb2YgbWludXRlc0NvbHVtbk9wdGlvbnM7IHRyYWNrQnk6IHRyYWNrQnlUaW1lVmFsdWVzXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxuYi10aW1lcGlja2VyLWNlbGxcbiAgICAgICAgICAgIFt2YWx1ZV09XCJpdGVtLnRleHRcIlxuICAgICAgICAgICAgW3NlbGVjdGVkXT1cImlzU2VsZWN0ZWRNaW51dGUoaXRlbS52YWx1ZSlcIlxuICAgICAgICAgICAgKHNlbGVjdCk9XCJzZXRNaW51dGUoaXRlbS52YWx1ZSlcIlxuICAgICAgICAgID5cbiAgICAgICAgICA8L25iLXRpbWVwaWNrZXItY2VsbD5cbiAgICAgICAgPC9uYi1saXN0LWl0ZW0+XG4gICAgICA8L25iLWxpc3Q+XG4gICAgICA8bmItbGlzdCAqbmdJZj1cInNob3dTZWNvbmRzKClcIiBjbGFzcz1cInZhbHVlcy1saXN0XCI+XG4gICAgICAgIDxuYi1saXN0LWl0ZW1cbiAgICAgICAgICBjbGFzcz1cImxpc3QtaXRlbVwiXG4gICAgICAgICAgW2NsYXNzLnNlbGVjdGVkXT1cImlzU2VsZWN0ZWRTZWNvbmQoaXRlbS52YWx1ZSlcIlxuICAgICAgICAgICpuZ0Zvcj1cImxldCBpdGVtIG9mIHNlY29uZHNDb2x1bW5PcHRpb25zOyB0cmFja0J5OiB0cmFja0J5VGltZVZhbHVlc1wiXG4gICAgICAgID5cbiAgICAgICAgICA8bmItdGltZXBpY2tlci1jZWxsXG4gICAgICAgICAgICBbdmFsdWVdPVwiaXRlbS50ZXh0XCJcbiAgICAgICAgICAgIFtzZWxlY3RlZF09XCJpc1NlbGVjdGVkU2Vjb25kKGl0ZW0udmFsdWUpXCJcbiAgICAgICAgICAgIChzZWxlY3QpPVwic2V0U2Vjb25kKGl0ZW0udmFsdWUpXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgPC9uYi10aW1lcGlja2VyLWNlbGw+XG4gICAgICAgIDwvbmItbGlzdC1pdGVtPlxuICAgICAgPC9uYi1saXN0PlxuICAgICAgPG5iLWxpc3QgKm5nSWY9XCJ0d2VsdmVIb3Vyc0Zvcm1hdFwiIGNsYXNzPVwidmFsdWVzLWxpc3RcIj5cbiAgICAgICAgPG5iLWxpc3QtaXRlbVxuICAgICAgICAgIGNsYXNzPVwibGlzdC1pdGVtIGFtLXBtLWl0ZW1cIlxuICAgICAgICAgIFtjbGFzcy5zZWxlY3RlZF09XCJpc1NlbGVjdGVkRGF5UGVyaW9kKGRheVBlcmlvZClcIlxuICAgICAgICAgICpuZ0Zvcj1cImxldCBkYXlQZXJpb2Qgb2YgZGF5UGVyaW9kQ29sdW1uT3B0aW9uczsgdHJhY2tCeTogdHJhY2tCeURheVBlcmlvZFwiXG4gICAgICAgID5cbiAgICAgICAgICA8bmItdGltZXBpY2tlci1jZWxsXG4gICAgICAgICAgICBbdmFsdWVdPVwiZGF5UGVyaW9kXCJcbiAgICAgICAgICAgIFtzZWxlY3RlZF09XCJpc1NlbGVjdGVkRGF5UGVyaW9kKGRheVBlcmlvZClcIlxuICAgICAgICAgICAgKHNlbGVjdCk9XCJjaGFuZ2VEYXlQZXJpb2QoZGF5UGVyaW9kKVwiXG4gICAgICAgICAgPlxuICAgICAgICAgIDwvbmItdGltZXBpY2tlci1jZWxsPlxuICAgICAgICA8L25iLWxpc3QtaXRlbT5cbiAgICAgIDwvbmItbGlzdD5cbiAgICA8L25nLXRlbXBsYXRlPlxuICA8L2Rpdj5cblxuICA8bmItY2FyZC1mb290ZXIgKm5nSWY9XCJzaG93Rm9vdGVyXCIgY2xhc3M9XCJhY3Rpb25zLWZvb3RlclwiPlxuICAgIDxuYi1jYWxlbmRhci1hY3Rpb25zXG4gICAgICBbYXBwbHlCdXR0b25UZXh0XT1cImFwcGx5QnV0dG9uVGV4dFwiXG4gICAgICBbY3VycmVudFRpbWVCdXR0b25UZXh0XT1cImN1cnJlbnRUaW1lQnV0dG9uVGV4dFwiXG4gICAgICAoc2V0Q3VycmVudFRpbWUpPVwic2V0Q3VycmVudFRpbWUoKVwiXG4gICAgICAoc2F2ZVZhbHVlKT1cInNhdmVWYWx1ZSgpXCJcbiAgICA+PC9uYi1jYWxlbmRhci1hY3Rpb25zPlxuICA8L25iLWNhcmQtZm9vdGVyPlxuPC9uYi1jYXJkPlxuIl19