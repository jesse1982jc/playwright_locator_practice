import { Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NbAuthService } from '../auth.service';
import * as i0 from "@angular/core";
export declare class NbAuthJWTInterceptor implements HttpInterceptor {
    private injector;
    protected filter: any;
    constructor(injector: Injector, filter: any);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    protected get authService(): NbAuthService;
    static ɵfac: i0.ɵɵFactoryDeclaration<NbAuthJWTInterceptor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NbAuthJWTInterceptor>;
}
