import { Injector, ModuleWithProviders } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { NbAuthTokenClass } from './services/token/token';
import { NbAuthStrategy } from './strategies/auth-strategy';
import { NbAuthOptions } from './auth.options';
import * as i0 from "@angular/core";
import * as i1 from "./components/auth.component";
import * as i2 from "./components/auth-block/auth-block.component";
import * as i3 from "./components/login/login.component";
import * as i4 from "./components/register/register.component";
import * as i5 from "./components/request-password/request-password.component";
import * as i6 from "./components/reset-password/reset-password.component";
import * as i7 from "./components/logout/logout.component";
import * as i8 from "@angular/common";
import * as i9 from "@nebular/theme";
import * as i10 from "@angular/router";
import * as i11 from "@angular/forms";
export declare function nbStrategiesFactory(options: NbAuthOptions, injector: Injector): NbAuthStrategy[];
export declare function nbTokensFactory(strategies: NbAuthStrategy[]): NbAuthTokenClass[];
export declare function nbOptionsFactory(options: any): any;
export declare function nbNoOpInterceptorFilter(req: HttpRequest<any>): boolean;
export declare class NbAuthModule {
    static forRoot(nbAuthOptions?: NbAuthOptions): ModuleWithProviders<NbAuthModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NbAuthModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NbAuthModule, [typeof i1.NbAuthComponent, typeof i2.NbAuthBlockComponent, typeof i3.NbLoginComponent, typeof i4.NbRegisterComponent, typeof i5.NbRequestPasswordComponent, typeof i6.NbResetPasswordComponent, typeof i7.NbLogoutComponent], [typeof i8.CommonModule, typeof i9.NbLayoutModule, typeof i9.NbCardModule, typeof i9.NbCheckboxModule, typeof i9.NbAlertModule, typeof i9.NbInputModule, typeof i9.NbButtonModule, typeof i10.RouterModule, typeof i11.FormsModule, typeof i9.NbIconModule], [typeof i1.NbAuthComponent, typeof i2.NbAuthBlockComponent, typeof i3.NbLoginComponent, typeof i4.NbRegisterComponent, typeof i5.NbRequestPasswordComponent, typeof i6.NbResetPasswordComponent, typeof i7.NbLogoutComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NbAuthModule>;
}
