/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, ChangeDetectionStrategy, Host, HostBinding, HostListener, } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "./accordion-item.component";
import * as i2 from "@angular/common";
import * as i3 from "../icon/icon.component";
/**
 * Component intended to be used within `<nb-accordion-item>` component
 */
export class NbAccordionItemHeaderComponent {
    constructor(accordionItem, cd) {
        this.accordionItem = accordionItem;
        this.cd = cd;
        this.destroy$ = new Subject();
    }
    get isCollapsed() {
        return this.accordionItem.collapsed;
    }
    get expanded() {
        return !this.accordionItem.collapsed;
    }
    // issue #794
    get tabbable() {
        return this.accordionItem.disabled ? '-1' : '0';
    }
    get disabled() {
        return this.accordionItem.disabled;
    }
    toggle() {
        this.accordionItem.toggle();
    }
    get state() {
        if (this.isCollapsed) {
            return 'collapsed';
        }
        return 'expanded';
    }
    ngOnInit() {
        this.accordionItem.accordionItemInvalidate
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.cd.markForCheck());
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
NbAccordionItemHeaderComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbAccordionItemHeaderComponent, deps: [{ token: i1.NbAccordionItemComponent, host: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
NbAccordionItemHeaderComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbAccordionItemHeaderComponent, selector: "nb-accordion-item-header", host: { listeners: { "click": "toggle()", "keydown.space": "toggle()", "keydown.enter": "toggle()" }, properties: { "class.accordion-item-header-collapsed": "this.isCollapsed", "class.accordion-item-header-expanded": "this.expanded", "attr.aria-expanded": "this.expanded", "attr.tabindex": "this.tabbable", "attr.aria-disabled": "this.disabled" } }, ngImport: i0, template: `
    <ng-content select="nb-accordion-item-title"></ng-content>
    <ng-content select="nb-accordion-item-description"></ng-content>
    <ng-content></ng-content>
    <nb-icon icon="chevron-down-outline"
             pack="nebular-essentials"
             [@expansionIndicator]="state"
             *ngIf="!disabled"
             class="expansion-indicator">
    </nb-icon>
  `, isInline: true, styles: ["/**\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n */:host{display:flex;align-items:center;cursor:pointer}:host:focus{outline:0}\n"], dependencies: [{ kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i3.NbIconComponent, selector: "nb-icon", inputs: ["icon", "pack", "options", "status", "config"] }], animations: [
        trigger('expansionIndicator', [
            state('expanded', style({
                transform: 'rotate(180deg)',
            })),
            transition('collapsed => expanded', animate('100ms ease-in')),
            transition('expanded => collapsed', animate('100ms ease-out')),
        ]),
    ], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbAccordionItemHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nb-accordion-item-header', template: `
    <ng-content select="nb-accordion-item-title"></ng-content>
    <ng-content select="nb-accordion-item-description"></ng-content>
    <ng-content></ng-content>
    <nb-icon icon="chevron-down-outline"
             pack="nebular-essentials"
             [@expansionIndicator]="state"
             *ngIf="!disabled"
             class="expansion-indicator">
    </nb-icon>
  `, animations: [
                        trigger('expansionIndicator', [
                            state('expanded', style({
                                transform: 'rotate(180deg)',
                            })),
                            transition('collapsed => expanded', animate('100ms ease-in')),
                            transition('expanded => collapsed', animate('100ms ease-out')),
                        ]),
                    ], changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/**\n * @license\n * Copyright Akveo. All Rights Reserved.\n * Licensed under the MIT License. See License.txt in the project root for license information.\n */:host{display:flex;align-items:center;cursor:pointer}:host:focus{outline:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.NbAccordionItemComponent, decorators: [{
                    type: Host
                }] }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { isCollapsed: [{
                type: HostBinding,
                args: ['class.accordion-item-header-collapsed']
            }], expanded: [{
                type: HostBinding,
                args: ['class.accordion-item-header-expanded']
            }, {
                type: HostBinding,
                args: ['attr.aria-expanded']
            }], tabbable: [{
                type: HostBinding,
                args: ['attr.tabindex']
            }], disabled: [{
                type: HostBinding,
                args: ['attr.aria-disabled']
            }], toggle: [{
                type: HostListener,
                args: ['click']
            }, {
                type: HostListener,
                args: ['keydown.space']
            }, {
                type: HostListener,
                args: ['keydown.enter']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLWl0ZW0taGVhZGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvdGhlbWUvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLWl0ZW0taGVhZGVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCx1QkFBdUIsRUFDdkIsSUFBSSxFQUNKLFdBQVcsRUFDWCxZQUFZLEdBSWIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7Ozs7QUFJL0I7O0dBRUc7QUE2QkgsTUFBTSxPQUFPLDhCQUE4QjtJQXVDekMsWUFBNEIsYUFBdUMsRUFBVSxFQUFxQjtRQUF0RSxrQkFBYSxHQUFiLGFBQWEsQ0FBMEI7UUFBVSxPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQUQxRixhQUFRLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQUV2QyxDQUFDO0lBdENELElBQ0ksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUM7SUFDdEMsQ0FBQztJQUVELElBRUksUUFBUTtRQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsYUFBYTtJQUNiLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUNJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFLRCxNQUFNO1FBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ1AsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLE9BQU8sV0FBVyxDQUFDO1NBQ3BCO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQU1ELFFBQVE7UUFDTixJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QjthQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5QixTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLENBQUM7OzRIQW5EVSw4QkFBOEI7Z0hBQTlCLDhCQUE4Qiw4WkF6Qi9COzs7Ozs7Ozs7O0dBVVQsNGdCQUNXO1FBQ1YsT0FBTyxDQUFDLG9CQUFvQixFQUFFO1lBQzVCLEtBQUssQ0FDSCxVQUFVLEVBQ1YsS0FBSyxDQUFDO2dCQUNKLFNBQVMsRUFBRSxnQkFBZ0I7YUFDNUIsQ0FBQyxDQUNIO1lBQ0QsVUFBVSxDQUFDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3RCxVQUFVLENBQUMsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDL0QsQ0FBQztLQUNIOzRGQUdVLDhCQUE4QjtrQkE1QjFDLFNBQVM7K0JBQ0UsMEJBQTBCLFlBRTFCOzs7Ozs7Ozs7O0dBVVQsY0FDVzt3QkFDVixPQUFPLENBQUMsb0JBQW9CLEVBQUU7NEJBQzVCLEtBQUssQ0FDSCxVQUFVLEVBQ1YsS0FBSyxDQUFDO2dDQUNKLFNBQVMsRUFBRSxnQkFBZ0I7NkJBQzVCLENBQUMsQ0FDSDs0QkFDRCxVQUFVLENBQUMsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzRCQUM3RCxVQUFVLENBQUMsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7eUJBQy9ELENBQUM7cUJBQ0gsbUJBQ2dCLHVCQUF1QixDQUFDLE1BQU07OzBCQXlDbEMsSUFBSTs0RUFwQ2IsV0FBVztzQkFEZCxXQUFXO3VCQUFDLHVDQUF1QztnQkFPaEQsUUFBUTtzQkFGWCxXQUFXO3VCQUFDLHNDQUFzQzs7c0JBQ2xELFdBQVc7dUJBQUMsb0JBQW9CO2dCQU83QixRQUFRO3NCQURYLFdBQVc7dUJBQUMsZUFBZTtnQkFNeEIsUUFBUTtzQkFEWCxXQUFXO3VCQUFDLG9CQUFvQjtnQkFRakMsTUFBTTtzQkFITCxZQUFZO3VCQUFDLE9BQU87O3NCQUNwQixZQUFZO3VCQUFDLGVBQWU7O3NCQUM1QixZQUFZO3VCQUFDLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgQWt2ZW8uIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxuICovXG5cbmltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIEhvc3QsXG4gIEhvc3RCaW5kaW5nLFxuICBIb3N0TGlzdGVuZXIsXG4gIE9uSW5pdCxcbiAgT25EZXN0cm95LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyB0cmlnZ2VyLCBzdGF0ZSwgc3R5bGUsIGFuaW1hdGUsIHRyYW5zaXRpb24gfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7IHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgTmJBY2NvcmRpb25JdGVtQ29tcG9uZW50IH0gZnJvbSAnLi9hY2NvcmRpb24taXRlbS5jb21wb25lbnQnO1xuXG4vKipcbiAqIENvbXBvbmVudCBpbnRlbmRlZCB0byBiZSB1c2VkIHdpdGhpbiBgPG5iLWFjY29yZGlvbi1pdGVtPmAgY29tcG9uZW50XG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25iLWFjY29yZGlvbi1pdGVtLWhlYWRlcicsXG4gIHN0eWxlVXJsczogWycuL2FjY29yZGlvbi1pdGVtLWhlYWRlci5jb21wb25lbnQuc2NzcyddLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuZy1jb250ZW50IHNlbGVjdD1cIm5iLWFjY29yZGlvbi1pdGVtLXRpdGxlXCI+PC9uZy1jb250ZW50PlxuICAgIDxuZy1jb250ZW50IHNlbGVjdD1cIm5iLWFjY29yZGlvbi1pdGVtLWRlc2NyaXB0aW9uXCI+PC9uZy1jb250ZW50PlxuICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICA8bmItaWNvbiBpY29uPVwiY2hldnJvbi1kb3duLW91dGxpbmVcIlxuICAgICAgICAgICAgIHBhY2s9XCJuZWJ1bGFyLWVzc2VudGlhbHNcIlxuICAgICAgICAgICAgIFtAZXhwYW5zaW9uSW5kaWNhdG9yXT1cInN0YXRlXCJcbiAgICAgICAgICAgICAqbmdJZj1cIiFkaXNhYmxlZFwiXG4gICAgICAgICAgICAgY2xhc3M9XCJleHBhbnNpb24taW5kaWNhdG9yXCI+XG4gICAgPC9uYi1pY29uPlxuICBgLFxuICBhbmltYXRpb25zOiBbXG4gICAgdHJpZ2dlcignZXhwYW5zaW9uSW5kaWNhdG9yJywgW1xuICAgICAgc3RhdGUoXG4gICAgICAgICdleHBhbmRlZCcsXG4gICAgICAgIHN0eWxlKHtcbiAgICAgICAgICB0cmFuc2Zvcm06ICdyb3RhdGUoMTgwZGVnKScsXG4gICAgICAgIH0pLFxuICAgICAgKSxcbiAgICAgIHRyYW5zaXRpb24oJ2NvbGxhcHNlZCA9PiBleHBhbmRlZCcsIGFuaW1hdGUoJzEwMG1zIGVhc2UtaW4nKSksXG4gICAgICB0cmFuc2l0aW9uKCdleHBhbmRlZCA9PiBjb2xsYXBzZWQnLCBhbmltYXRlKCcxMDBtcyBlYXNlLW91dCcpKSxcbiAgICBdKSxcbiAgXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIE5iQWNjb3JkaW9uSXRlbUhlYWRlckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcblxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLmFjY29yZGlvbi1pdGVtLWhlYWRlci1jb2xsYXBzZWQnKVxuICBnZXQgaXNDb2xsYXBzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWNjb3JkaW9uSXRlbS5jb2xsYXBzZWQ7XG4gIH1cblxuICBASG9zdEJpbmRpbmcoJ2NsYXNzLmFjY29yZGlvbi1pdGVtLWhlYWRlci1leHBhbmRlZCcpXG4gIEBIb3N0QmluZGluZygnYXR0ci5hcmlhLWV4cGFuZGVkJylcbiAgZ2V0IGV4cGFuZGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5hY2NvcmRpb25JdGVtLmNvbGxhcHNlZDtcbiAgfVxuXG4gIC8vIGlzc3VlICM3OTRcbiAgQEhvc3RCaW5kaW5nKCdhdHRyLnRhYmluZGV4JylcbiAgZ2V0IHRhYmJhYmxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuYWNjb3JkaW9uSXRlbS5kaXNhYmxlZCA/ICctMScgOiAnMCc7XG4gIH1cblxuICBASG9zdEJpbmRpbmcoJ2F0dHIuYXJpYS1kaXNhYmxlZCcpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hY2NvcmRpb25JdGVtLmRpc2FibGVkO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKVxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duLnNwYWNlJylcbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bi5lbnRlcicpXG4gIHRvZ2dsZSgpIHtcbiAgICB0aGlzLmFjY29yZGlvbkl0ZW0udG9nZ2xlKCk7XG4gIH1cblxuICBnZXQgc3RhdGUoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5pc0NvbGxhcHNlZCkge1xuICAgICAgcmV0dXJuICdjb2xsYXBzZWQnO1xuICAgIH1cbiAgICByZXR1cm4gJ2V4cGFuZGVkJztcbiAgfVxuXG4gIHByaXZhdGUgZGVzdHJveSQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBjb25zdHJ1Y3RvcihASG9zdCgpIHByaXZhdGUgYWNjb3JkaW9uSXRlbTogTmJBY2NvcmRpb25JdGVtQ29tcG9uZW50LCBwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5hY2NvcmRpb25JdGVtLmFjY29yZGlvbkl0ZW1JbnZhbGlkYXRlXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuY2QubWFya0ZvckNoZWNrKCkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95JC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95JC5jb21wbGV0ZSgpO1xuICB9XG59XG4iXX0=