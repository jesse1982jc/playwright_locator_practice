import { Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NbAuthService } from '../auth.service';
import * as i0 from "@angular/core";
export declare class NbAuthSimpleInterceptor implements HttpInterceptor {
    private injector;
    protected headerName: string;
    constructor(injector: Injector, headerName?: string);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    protected get authService(): NbAuthService;
    static ɵfac: i0.ɵɵFactoryDeclaration<NbAuthSimpleInterceptor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NbAuthSimpleInterceptor>;
}
