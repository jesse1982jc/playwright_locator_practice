/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, ContentChild, Directive, EventEmitter, HostBinding, HostListener, Inject, Input, Output, TemplateRef, } from '@angular/core';
import { convertToBoolProperty } from '../helpers';
import { NB_SORT_HEADER_COLUMN_DEF } from '../cdk/table/cell';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "../icon/icon.component";
export var NbSortDirection;
(function (NbSortDirection) {
    NbSortDirection["ASCENDING"] = "asc";
    NbSortDirection["DESCENDING"] = "desc";
    NbSortDirection["NONE"] = "";
})(NbSortDirection || (NbSortDirection = {}));
const sortDirections = [
    NbSortDirection.ASCENDING,
    NbSortDirection.DESCENDING,
    NbSortDirection.NONE,
];
/**
 * Directive triggers sort method of passed object when sort header changes direction
 */
export class NbSortDirective {
    constructor() {
        this.sort = new EventEmitter();
    }
    emitSort(sortRequest) {
        if (this.sortable && this.sortable.sort) {
            this.sortable.sort(sortRequest);
        }
        this.sort.emit(sortRequest);
    }
}
NbSortDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSortDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NbSortDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.12", type: NbSortDirective, selector: "[nbSort]", inputs: { sortable: ["nbSort", "sortable"] }, outputs: { sort: "sort" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSortDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[nbSort]' }]
        }], propDecorators: { sortable: [{
                type: Input,
                args: ['nbSort']
            }], sort: [{
                type: Output
            }] } });
/**
 * Directive for headers sort icons. Mark you icon implementation with this structural directive and
 * it'll set template's implicit context with current direction. Context also has `isAscending`,
 * `isDescending` and `isNone` properties.
 */
export class NbSortHeaderIconDirective {
}
NbSortHeaderIconDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSortHeaderIconDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NbSortHeaderIconDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.12", type: NbSortHeaderIconDirective, selector: "[nbSortHeaderIcon]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSortHeaderIconDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[nbSortHeaderIcon]' }]
        }] });
export class NbSortIconComponent {
    constructor() {
        this.direction = NbSortDirection.NONE;
    }
    isAscending() {
        return this.direction === NbSortDirection.ASCENDING;
    }
    isDescending() {
        return this.direction === NbSortDirection.DESCENDING;
    }
    isDirectionSet() {
        return this.isAscending() || this.isDescending();
    }
}
NbSortIconComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSortIconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
NbSortIconComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbSortIconComponent, selector: "nb-sort-icon", inputs: { direction: "direction" }, ngImport: i0, template: `
    <ng-container *ngIf="isDirectionSet()">
      <nb-icon *ngIf="isAscending()" icon="chevron-down-outline" pack="nebular-essentials" aria-hidden="true"></nb-icon>
      <nb-icon *ngIf="isDescending()" icon="chevron-up-outline" pack="nebular-essentials" aria-hidden="true"></nb-icon>
    </ng-container>
  `, isInline: true, dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i2.NbIconComponent, selector: "nb-icon", inputs: ["icon", "pack", "options", "status", "config"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSortIconComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nb-sort-icon',
                    template: `
    <ng-container *ngIf="isDirectionSet()">
      <nb-icon *ngIf="isAscending()" icon="chevron-down-outline" pack="nebular-essentials" aria-hidden="true"></nb-icon>
      <nb-icon *ngIf="isDescending()" icon="chevron-up-outline" pack="nebular-essentials" aria-hidden="true"></nb-icon>
    </ng-container>
  `,
                }]
        }], propDecorators: { direction: [{
                type: Input
            }] } });
/**
 * Marks header as sort header so it emitting sort event when clicked.
 */
export class NbSortHeaderComponent {
    constructor(sort, columnDef) {
        this.sort = sort;
        this.columnDef = columnDef;
        this.disabledValue = false;
    }
    /**
     * Disable sort header
     */
    set disabled(value) {
        this.disabledValue = convertToBoolProperty(value);
    }
    get disabled() {
        return this.disabledValue;
    }
    sortIfEnabled() {
        if (!this.disabled) {
            this.sortData();
        }
    }
    isAscending() {
        return this.direction === NbSortDirection.ASCENDING;
    }
    isDescending() {
        return this.direction === NbSortDirection.DESCENDING;
    }
    sortData() {
        const sortRequest = this.createSortRequest();
        this.sort.emitSort(sortRequest);
    }
    getIconContext() {
        return {
            $implicit: this.direction,
            isAscending: this.isAscending(),
            isDescending: this.isDescending(),
            isNone: !this.isAscending() && !this.isDescending(),
        };
    }
    getDisabledAttributeValue() {
        return this.disabled ? '' : null;
    }
    createSortRequest() {
        this.direction = this.getNextDirection();
        return { direction: this.direction, column: this.columnDef.name };
    }
    getNextDirection() {
        const sortDirectionCycle = sortDirections;
        let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
        if (nextDirectionIndex >= sortDirectionCycle.length) {
            nextDirectionIndex = 0;
        }
        return sortDirectionCycle[nextDirectionIndex];
    }
}
NbSortHeaderComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSortHeaderComponent, deps: [{ token: NbSortDirective }, { token: NB_SORT_HEADER_COLUMN_DEF }], target: i0.ɵɵFactoryTarget.Component });
NbSortHeaderComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbSortHeaderComponent, selector: "[nbSortHeader]", inputs: { direction: ["nbSortHeader", "direction"], disabled: "disabled" }, host: { listeners: { "click": "sortIfEnabled()" }, properties: { "class.disabled": "this.disabled" } }, queries: [{ propertyName: "sortIcon", first: true, predicate: NbSortHeaderIconDirective, descendants: true, read: TemplateRef }], ngImport: i0, template: `
    <button
      class="nb-tree-grid-header-change-sort-button"
      type="button"
      [attr.disabled]="getDisabledAttributeValue()"
      (click)="sortData()">
      <ng-content></ng-content>
    </button>
    <nb-sort-icon *ngIf="!sortIcon; else customIcon" [direction]="direction"></nb-sort-icon>
    <ng-template #customIcon [ngTemplateOutlet]="sortIcon" [ngTemplateOutletContext]="getIconContext()"></ng-template>
  `, isInline: true, dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NbSortIconComponent, selector: "nb-sort-icon", inputs: ["direction"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbSortHeaderComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nbSortHeader]',
                    template: `
    <button
      class="nb-tree-grid-header-change-sort-button"
      type="button"
      [attr.disabled]="getDisabledAttributeValue()"
      (click)="sortData()">
      <ng-content></ng-content>
    </button>
    <nb-sort-icon *ngIf="!sortIcon; else customIcon" [direction]="direction"></nb-sort-icon>
    <ng-template #customIcon [ngTemplateOutlet]="sortIcon" [ngTemplateOutletContext]="getIconContext()"></ng-template>
  `,
                }]
        }], ctorParameters: function () { return [{ type: NbSortDirective }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_SORT_HEADER_COLUMN_DEF]
                }] }]; }, propDecorators: { sortIcon: [{
                type: ContentChild,
                args: [NbSortHeaderIconDirective, { read: TemplateRef }]
            }], direction: [{
                type: Input,
                args: ['nbSortHeader']
            }], disabled: [{
                type: Input
            }, {
                type: HostBinding,
                args: ['class.disabled']
            }], sortIfEnabled: [{
                type: HostListener,
                args: ['click']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1ncmlkLXNvcnQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay90aGVtZS9jb21wb25lbnRzL3RyZWUtZ3JpZC90cmVlLWdyaWQtc29ydC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLFNBQVMsRUFDVCxZQUFZLEVBQ1osV0FBVyxFQUNYLFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFDTixXQUFXLEdBQ1osTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLHFCQUFxQixFQUFtQyxNQUFNLFlBQVksQ0FBQztBQUNwRixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQzs7OztBQWlCOUQsTUFBTSxDQUFOLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN6QixvQ0FBaUIsQ0FBQTtJQUNqQixzQ0FBbUIsQ0FBQTtJQUNuQiw0QkFBUyxDQUFBO0FBQ1gsQ0FBQyxFQUpXLGVBQWUsS0FBZixlQUFlLFFBSTFCO0FBQ0QsTUFBTSxjQUFjLEdBQXNCO0lBQ3hDLGVBQWUsQ0FBQyxTQUFTO0lBQ3pCLGVBQWUsQ0FBQyxVQUFVO0lBQzFCLGVBQWUsQ0FBQyxJQUFJO0NBQ3JCLENBQUM7QUFFRjs7R0FFRztBQUVILE1BQU0sT0FBTyxlQUFlO0lBRDVCO1FBS1ksU0FBSSxHQUFnQyxJQUFJLFlBQVksRUFBaUIsQ0FBQztLQVFqRjtJQU5DLFFBQVEsQ0FBQyxXQUEwQjtRQUNqQyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDakM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FB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QUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEUsQ0FBQztJQUVPLGdCQUFnQjtRQUN0QixNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQztRQUMxQyxJQUFJLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hFLElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO1lBQ25ELGtCQUFrQixHQUFHLENBQUMsQ0FBQztTQUN4QjtRQUNELE9BQU8sa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNoRCxDQUFDOzttSEE3RVUscUJBQXFCLDhDQW9DdEIseUJBQXlCO3VHQXBDeEIscUJBQXFCLGdSQUVsQix5QkFBeUIsMkJBQVUsV0FBVyw2QkFkbEQ7Ozs7Ozs7Ozs7R0FVVCx1VUEvQlUsbUJBQW1COzRGQWlDbkIscUJBQXFCO2tCQWRqQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFFBQVEsRUFBRTs7Ozs7Ozs7OztHQVVUO2lCQUNGOzswQkFxQ0ksTUFBTTsyQkFBQyx5QkFBeUI7NENBakNuQyxRQUFRO3NCQURQLFlBQVk7dUJBQUMseUJBQXlCLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2dCQU92QyxTQUFTO3NCQUEvQixLQUFLO3VCQUFDLGNBQWM7Z0JBVWpCLFFBQVE7c0JBRlgsS0FBSzs7c0JBQ0wsV0FBVzt1QkFBQyxnQkFBZ0I7Z0JBVTdCLGFBQWE7c0JBRFosWUFBWTt1QkFBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgQWt2ZW8uIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxuICovXG5cbmltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkLFxuICBEaXJlY3RpdmUsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdEJpbmRpbmcsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBUZW1wbGF0ZVJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGNvbnZlcnRUb0Jvb2xQcm9wZXJ0eSwgTmJCb29sZWFuSW5wdXQsIE5iTnVsbGFibGVJbnB1dCB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IHsgTkJfU09SVF9IRUFERVJfQ09MVU1OX0RFRiB9IGZyb20gJy4uL2Nkay90YWJsZS9jZWxsJztcblxuLyoqIENvbHVtbiBkZWZpbml0aW9uIGFzc29jaWF0ZWQgd2l0aCBhIGBOYlNvcnRIZWFkZXJEaXJlY3RpdmVgLiAqL1xuaW50ZXJmYWNlIE5iU29ydEhlYWRlckNvbHVtbkRlZiB7XG4gIG5hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOYlNvcnRSZXF1ZXN0IHtcbiAgY29sdW1uOiBzdHJpbmc7XG4gIGRpcmVjdGlvbjogTmJTb3J0RGlyZWN0aW9uO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5iU29ydGFibGUge1xuICBzb3J0KHNvcnRSZXF1ZXN0OiBOYlNvcnRSZXF1ZXN0KTtcbn1cblxuZXhwb3J0IHR5cGUgTmJTb3J0RGlyZWN0aW9uVmFsdWVzID0gJ2FzYycgfCAnZGVzYycgfCAnJztcbmV4cG9ydCBlbnVtIE5iU29ydERpcmVjdGlvbiB7XG4gIEFTQ0VORElORyA9ICdhc2MnLFxuICBERVNDRU5ESU5HID0gJ2Rlc2MnLFxuICBOT05FID0gJycsXG59XG5jb25zdCBzb3J0RGlyZWN0aW9uczogTmJTb3J0RGlyZWN0aW9uW10gPSBbXG4gIE5iU29ydERpcmVjdGlvbi5BU0NFTkRJTkcsXG4gIE5iU29ydERpcmVjdGlvbi5ERVNDRU5ESU5HLFxuICBOYlNvcnREaXJlY3Rpb24uTk9ORSxcbl07XG5cbi8qKlxuICogRGlyZWN0aXZlIHRyaWdnZXJzIHNvcnQgbWV0aG9kIG9mIHBhc3NlZCBvYmplY3Qgd2hlbiBzb3J0IGhlYWRlciBjaGFuZ2VzIGRpcmVjdGlvblxuICovXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbmJTb3J0XScgfSlcbmV4cG9ydCBjbGFzcyBOYlNvcnREaXJlY3RpdmUge1xuICBASW5wdXQoJ25iU29ydCcpIHNvcnRhYmxlOiBOYlNvcnRhYmxlO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc29ydGFibGU6IE5iU29ydGFibGUgfCBOYk51bGxhYmxlSW5wdXQ7XG5cbiAgQE91dHB1dCgpIHNvcnQ6IEV2ZW50RW1pdHRlcjxOYlNvcnRSZXF1ZXN0PiA9IG5ldyBFdmVudEVtaXR0ZXI8TmJTb3J0UmVxdWVzdD4oKTtcblxuICBlbWl0U29ydChzb3J0UmVxdWVzdDogTmJTb3J0UmVxdWVzdCkge1xuICAgIGlmICh0aGlzLnNvcnRhYmxlICYmIHRoaXMuc29ydGFibGUuc29ydCkge1xuICAgICAgdGhpcy5zb3J0YWJsZS5zb3J0KHNvcnRSZXF1ZXN0KTtcbiAgICB9XG4gICAgdGhpcy5zb3J0LmVtaXQoc29ydFJlcXVlc3QpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmJTb3J0SGVhZGVySWNvbkRpcmVjdGl2ZUNvbnRleHQge1xuICAkaW1wbGljaXQ6IE5iU29ydERpcmVjdGlvbjtcbiAgaXNBc2NlbmRpbmc6IGJvb2xlYW47XG4gIGlzRGVzY2VuZGluZzogYm9vbGVhbjtcbiAgaXNOb25lOiBib29sZWFuO1xufVxuXG4vKipcbiAqIERpcmVjdGl2ZSBmb3IgaGVhZGVycyBzb3J0IGljb25zLiBNYXJrIHlvdSBpY29uIGltcGxlbWVudGF0aW9uIHdpdGggdGhpcyBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBhbmRcbiAqIGl0J2xsIHNldCB0ZW1wbGF0ZSdzIGltcGxpY2l0IGNvbnRleHQgd2l0aCBjdXJyZW50IGRpcmVjdGlvbi4gQ29udGV4dCBhbHNvIGhhcyBgaXNBc2NlbmRpbmdgLFxuICogYGlzRGVzY2VuZGluZ2AgYW5kIGBpc05vbmVgIHByb3BlcnRpZXMuXG4gKi9cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tuYlNvcnRIZWFkZXJJY29uXScgfSlcbmV4cG9ydCBjbGFzcyBOYlNvcnRIZWFkZXJJY29uRGlyZWN0aXZlIHt9XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25iLXNvcnQtaWNvbicsXG4gIHRlbXBsYXRlOiBgXG4gICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cImlzRGlyZWN0aW9uU2V0KClcIj5cbiAgICAgIDxuYi1pY29uICpuZ0lmPVwiaXNBc2NlbmRpbmcoKVwiIGljb249XCJjaGV2cm9uLWRvd24tb3V0bGluZVwiIHBhY2s9XCJuZWJ1bGFyLWVzc2VudGlhbHNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L25iLWljb24+XG4gICAgICA8bmItaWNvbiAqbmdJZj1cImlzRGVzY2VuZGluZygpXCIgaWNvbj1cImNoZXZyb24tdXAtb3V0bGluZVwiIHBhY2s9XCJuZWJ1bGFyLWVzc2VudGlhbHNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L25iLWljb24+XG4gICAgPC9uZy1jb250YWluZXI+XG4gIGAsXG59KVxuZXhwb3J0IGNsYXNzIE5iU29ydEljb25Db21wb25lbnQge1xuICBASW5wdXQoKSBkaXJlY3Rpb246IE5iU29ydERpcmVjdGlvbiA9IE5iU29ydERpcmVjdGlvbi5OT05FO1xuXG4gIGlzQXNjZW5kaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gTmJTb3J0RGlyZWN0aW9uLkFTQ0VORElORztcbiAgfVxuXG4gIGlzRGVzY2VuZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09IE5iU29ydERpcmVjdGlvbi5ERVNDRU5ESU5HO1xuICB9XG5cbiAgaXNEaXJlY3Rpb25TZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNBc2NlbmRpbmcoKSB8fCB0aGlzLmlzRGVzY2VuZGluZygpO1xuICB9XG59XG5cbi8qKlxuICogTWFya3MgaGVhZGVyIGFzIHNvcnQgaGVhZGVyIHNvIGl0IGVtaXR0aW5nIHNvcnQgZXZlbnQgd2hlbiBjbGlja2VkLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdbbmJTb3J0SGVhZGVyXScsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGJ1dHRvblxuICAgICAgY2xhc3M9XCJuYi10cmVlLWdyaWQtaGVhZGVyLWNoYW5nZS1zb3J0LWJ1dHRvblwiXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIFthdHRyLmRpc2FibGVkXT1cImdldERpc2FibGVkQXR0cmlidXRlVmFsdWUoKVwiXG4gICAgICAoY2xpY2spPVwic29ydERhdGEoKVwiPlxuICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgIDwvYnV0dG9uPlxuICAgIDxuYi1zb3J0LWljb24gKm5nSWY9XCIhc29ydEljb247IGVsc2UgY3VzdG9tSWNvblwiIFtkaXJlY3Rpb25dPVwiZGlyZWN0aW9uXCI+PC9uYi1zb3J0LWljb24+XG4gICAgPG5nLXRlbXBsYXRlICNjdXN0b21JY29uIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInNvcnRJY29uXCIgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cImdldEljb25Db250ZXh0KClcIj48L25nLXRlbXBsYXRlPlxuICBgLFxufSlcbmV4cG9ydCBjbGFzcyBOYlNvcnRIZWFkZXJDb21wb25lbnQge1xuXG4gIEBDb250ZW50Q2hpbGQoTmJTb3J0SGVhZGVySWNvbkRpcmVjdGl2ZSwgeyByZWFkOiBUZW1wbGF0ZVJlZiB9KVxuICBzb3J0SWNvbjogVGVtcGxhdGVSZWY8TmJTb3J0SGVhZGVySWNvbkRpcmVjdGl2ZUNvbnRleHQ+O1xuXG4gIC8qKlxuICAgKiBDdXJyZW50IHNvcnQgZGlyZWN0aW9uLiBQb3NzaWJsZSB2YWx1ZXM6IGBhc2NgLCBgZGVzY2AsIGBgKG5vbmUpXG4gICAqIEB0eXBlIHtOYlNvcnREaXJlY3Rpb259XG4gICAqL1xuICBASW5wdXQoJ25iU29ydEhlYWRlcicpIGRpcmVjdGlvbjogTmJTb3J0RGlyZWN0aW9uO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlyZWN0aW9uOiBOYlNvcnREaXJlY3Rpb25WYWx1ZXM7XG5cbiAgcHJpdmF0ZSBkaXNhYmxlZFZhbHVlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIERpc2FibGUgc29ydCBoZWFkZXJcbiAgICovXG4gIEBJbnB1dCgpXG4gIEBIb3N0QmluZGluZygnY2xhc3MuZGlzYWJsZWQnKVxuICBzZXQgZGlzYWJsZWQodmFsdWUpIHtcbiAgICB0aGlzLmRpc2FibGVkVmFsdWUgPSBjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZFZhbHVlO1xuICB9XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogTmJCb29sZWFuSW5wdXQ7XG5cbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKVxuICBzb3J0SWZFbmFibGVkKCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5zb3J0RGF0YSgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgc29ydDogTmJTb3J0RGlyZWN0aXZlLFxuICAgIEBJbmplY3QoTkJfU09SVF9IRUFERVJfQ09MVU1OX0RFRikgcHJpdmF0ZSBjb2x1bW5EZWY6IE5iU29ydEhlYWRlckNvbHVtbkRlZixcbiAgKSB7fVxuXG4gIGlzQXNjZW5kaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gTmJTb3J0RGlyZWN0aW9uLkFTQ0VORElORztcbiAgfVxuXG4gIGlzRGVzY2VuZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09IE5iU29ydERpcmVjdGlvbi5ERVNDRU5ESU5HO1xuICB9XG5cbiAgc29ydERhdGEoKTogdm9pZCB7XG4gICAgY29uc3Qgc29ydFJlcXVlc3QgPSB0aGlzLmNyZWF0ZVNvcnRSZXF1ZXN0KCk7XG4gICAgdGhpcy5zb3J0LmVtaXRTb3J0KHNvcnRSZXF1ZXN0KTtcbiAgfVxuXG4gIGdldEljb25Db250ZXh0KCk6IE5iU29ydEhlYWRlckljb25EaXJlY3RpdmVDb250ZXh0IHtcbiAgICByZXR1cm4ge1xuICAgICAgJGltcGxpY2l0OiB0aGlzLmRpcmVjdGlvbixcbiAgICAgIGlzQXNjZW5kaW5nOiB0aGlzLmlzQXNjZW5kaW5nKCksXG4gICAgICBpc0Rlc2NlbmRpbmc6IHRoaXMuaXNEZXNjZW5kaW5nKCksXG4gICAgICBpc05vbmU6ICF0aGlzLmlzQXNjZW5kaW5nKCkgJiYgIXRoaXMuaXNEZXNjZW5kaW5nKCksXG4gICAgfTtcbiAgfVxuXG4gIGdldERpc2FibGVkQXR0cmlidXRlVmFsdWUoKTogJycgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/ICcnIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlU29ydFJlcXVlc3QoKTogTmJTb3J0UmVxdWVzdCB7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSB0aGlzLmdldE5leHREaXJlY3Rpb24oKTtcbiAgICByZXR1cm4geyBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLCBjb2x1bW46IHRoaXMuY29sdW1uRGVmLm5hbWUgfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TmV4dERpcmVjdGlvbigpOiBOYlNvcnREaXJlY3Rpb24ge1xuICAgIGNvbnN0IHNvcnREaXJlY3Rpb25DeWNsZSA9IHNvcnREaXJlY3Rpb25zO1xuICAgIGxldCBuZXh0RGlyZWN0aW9uSW5kZXggPSBzb3J0RGlyZWN0aW9uQ3ljbGUuaW5kZXhPZih0aGlzLmRpcmVjdGlvbikgKyAxO1xuICAgIGlmIChuZXh0RGlyZWN0aW9uSW5kZXggPj0gc29ydERpcmVjdGlvbkN5Y2xlLmxlbmd0aCkge1xuICAgICAgbmV4dERpcmVjdGlvbkluZGV4ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHNvcnREaXJlY3Rpb25DeWNsZVtuZXh0RGlyZWN0aW9uSW5kZXhdO1xuICB9XG59XG4iXX0=