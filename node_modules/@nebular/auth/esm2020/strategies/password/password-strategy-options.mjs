/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { NbAuthSimpleToken } from '../../services/token/token';
import { NbAuthStrategyOptions } from '../auth-strategy-options';
import { getDeepFromObject } from '../../helpers';
export class NbPasswordAuthStrategyOptions extends NbAuthStrategyOptions {
    constructor() {
        super(...arguments);
        this.baseEndpoint = '/api/auth/';
        this.login = {
            alwaysFail: false,
            endpoint: 'login',
            method: 'post',
            requireValidToken: true,
            redirect: {
                success: '/',
                failure: null,
            },
            defaultErrors: ['Login/Email combination is not correct, please try again.'],
            defaultMessages: ['You have been successfully logged in.'],
        };
        this.register = {
            alwaysFail: false,
            endpoint: 'register',
            method: 'post',
            requireValidToken: true,
            redirect: {
                success: '/',
                failure: null,
            },
            defaultErrors: ['Something went wrong, please try again.'],
            defaultMessages: ['You have been successfully registered.'],
        };
        this.requestPass = {
            endpoint: 'request-pass',
            method: 'post',
            redirect: {
                success: '/',
                failure: null,
            },
            defaultErrors: ['Something went wrong, please try again.'],
            defaultMessages: ['Reset password instructions have been sent to your email.'],
        };
        this.resetPass = {
            endpoint: 'reset-pass',
            method: 'put',
            redirect: {
                success: '/',
                failure: null,
            },
            resetPasswordTokenKey: 'reset_password_token',
            defaultErrors: ['Something went wrong, please try again.'],
            defaultMessages: ['Your password has been successfully changed.'],
        };
        this.logout = {
            alwaysFail: false,
            endpoint: 'logout',
            method: 'delete',
            redirect: {
                success: '/',
                failure: null,
            },
            defaultErrors: ['Something went wrong, please try again.'],
            defaultMessages: ['You have been successfully logged out.'],
        };
        this.refreshToken = {
            endpoint: 'refresh-token',
            method: 'post',
            requireValidToken: true,
            redirect: {
                success: null,
                failure: null,
            },
            defaultErrors: ['Something went wrong, please try again.'],
            defaultMessages: ['Your token has been successfully refreshed.'],
        };
        this.token = {
            class: NbAuthSimpleToken,
            key: 'data.token',
            getter: (module, res, options) => getDeepFromObject(res.body, options.token.key),
        };
        this.errors = {
            key: 'data.errors',
            getter: (module, res, options) => getDeepFromObject(res.error, options.errors.key, options[module].defaultErrors),
        };
        this.messages = {
            key: 'data.messages',
            getter: (module, res, options) => getDeepFromObject(res.body, options.messages.key, options[module].defaultMessages),
        };
    }
}
export const passwordStrategyOptions = new NbPasswordAuthStrategyOptions();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFzc3dvcmQtc3RyYXRlZ3ktb3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvYXV0aC9zdHJhdGVnaWVzL3Bhc3N3b3JkL3Bhc3N3b3JkLXN0cmF0ZWd5LW9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sRUFBRSxpQkFBaUIsRUFBb0IsTUFBTSw0QkFBNEIsQ0FBQztBQUNqRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUErQmxELE1BQU0sT0FBTyw2QkFBOEIsU0FBUSxxQkFBcUI7SUFBeEU7O1FBQ0UsaUJBQVksR0FBWSxZQUFZLENBQUM7UUFDckMsVUFBSyxHQUF3QztZQUMzQyxVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsT0FBTztZQUNqQixNQUFNLEVBQUUsTUFBTTtZQUNkLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxHQUFHO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2Q7WUFDRCxhQUFhLEVBQUUsQ0FBQywyREFBMkQsQ0FBQztZQUM1RSxlQUFlLEVBQUUsQ0FBQyx1Q0FBdUMsQ0FBQztTQUMzRCxDQUFDO1FBQ0YsYUFBUSxHQUF3QztZQUM5QyxVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsVUFBVTtZQUNwQixNQUFNLEVBQUUsTUFBTTtZQUNkLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxHQUFHO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2Q7WUFDRCxhQUFhLEVBQUUsQ0FBQyx5Q0FBeUMsQ0FBQztZQUMxRCxlQUFlLEVBQUUsQ0FBQyx3Q0FBd0MsQ0FBQztTQUM1RCxDQUFDO1FBQ0YsZ0JBQVcsR0FBd0M7WUFDakQsUUFBUSxFQUFFLGNBQWM7WUFDeEIsTUFBTSxFQUFFLE1BQU07WUFDZCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLEdBQUc7Z0JBQ1osT0FBTyxFQUFFLElBQUk7YUFDZDtZQUNELGFBQWEsRUFBRSxDQUFDLHlDQUF5QyxDQUFDO1lBQzFELGVBQWUsRUFBRSxDQUFDLDJEQUEyRCxDQUFDO1NBQy9FLENBQUM7UUFDRixjQUFTLEdBQXVDO1lBQzlDLFFBQVEsRUFBRSxZQUFZO1lBQ3RCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxHQUFHO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2Q7WUFDRCxxQkFBcUIsRUFBRSxzQkFBc0I7WUFDN0MsYUFBYSxFQUFFLENBQUMseUNBQXlDLENBQUM7WUFDMUQsZUFBZSxFQUFFLENBQUMsOENBQThDLENBQUM7U0FDbEUsQ0FBQztRQUNGLFdBQU0sR0FBdUM7WUFDM0MsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsTUFBTSxFQUFFLFFBQVE7WUFDaEIsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxHQUFHO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2Q7WUFDRCxhQUFhLEVBQUUsQ0FBQyx5Q0FBeUMsQ0FBQztZQUMxRCxlQUFlLEVBQUUsQ0FBQyx3Q0FBd0MsQ0FBQztTQUM1RCxDQUFDO1FBQ0YsaUJBQVksR0FBd0M7WUFDbEQsUUFBUSxFQUFFLGVBQWU7WUFDekIsTUFBTSxFQUFFLE1BQU07WUFDZCxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLFFBQVEsRUFBRTtnQkFDUixPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPLEVBQUUsSUFBSTthQUNkO1lBQ0QsYUFBYSxFQUFFLENBQUMseUNBQXlDLENBQUM7WUFDMUQsZUFBZSxFQUFFLENBQUMsNkNBQTZDLENBQUM7U0FDakUsQ0FBQztRQUNGLFVBQUssR0FBNkI7WUFDaEMsS0FBSyxFQUFFLGlCQUFpQjtZQUN4QixHQUFHLEVBQUUsWUFBWTtZQUNqQixNQUFNLEVBQUUsQ0FBQyxNQUFjLEVBQUUsR0FBeUIsRUFBRSxPQUFzQyxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FDOUcsR0FBRyxDQUFDLElBQUksRUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FDbEI7U0FDRixDQUFDO1FBQ0YsV0FBTSxHQUErQjtZQUNuQyxHQUFHLEVBQUUsYUFBYTtZQUNsQixNQUFNLEVBQUUsQ0FBQyxNQUFjLEVBQUUsR0FBc0IsRUFBRSxPQUFzQyxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FDM0csR0FBRyxDQUFDLEtBQUssRUFDVCxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFDbEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FDOUI7U0FDRixDQUFDO1FBQ0YsYUFBUSxHQUErQjtZQUNyQyxHQUFHLEVBQUUsZUFBZTtZQUNwQixNQUFNLEVBQUUsQ0FBQyxNQUFjLEVBQUUsR0FBeUIsRUFBRSxPQUFzQyxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FDOUcsR0FBRyxDQUFDLElBQUksRUFDUixPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFDcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FDaEM7U0FDRixDQUFDO0lBbUJKLENBQUM7Q0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFrQyxJQUFJLDZCQUE2QixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgQWt2ZW8uIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxuICovXG5cbmltcG9ydCB7IE5iQXV0aFNpbXBsZVRva2VuLCBOYkF1dGhUb2tlbkNsYXNzIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvdG9rZW4vdG9rZW4nO1xuaW1wb3J0IHsgTmJBdXRoU3RyYXRlZ3lPcHRpb25zIH0gZnJvbSAnLi4vYXV0aC1zdHJhdGVneS1vcHRpb25zJztcbmltcG9ydCB7IGdldERlZXBGcm9tT2JqZWN0IH0gZnJvbSAnLi4vLi4vaGVscGVycyc7XG5pbXBvcnQgeyBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cFJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5iUGFzc3dvcmRTdHJhdGVneU1vZHVsZSB7XG4gIGFsd2F5c0ZhaWw/OiBib29sZWFuO1xuICBlbmRwb2ludD86IHN0cmluZztcbiAgbWV0aG9kPzogc3RyaW5nO1xuICByZWRpcmVjdD86IHtcbiAgICBzdWNjZXNzPzogc3RyaW5nIHwgbnVsbDtcbiAgICBmYWlsdXJlPzogc3RyaW5nIHwgbnVsbDtcbiAgfTtcbiAgcmVxdWlyZVZhbGlkVG9rZW4/OiBib29sZWFuO1xuICBkZWZhdWx0RXJyb3JzPzogc3RyaW5nW107XG4gIGRlZmF1bHRNZXNzYWdlcz86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5iUGFzc3dvcmRTdHJhdGVneVJlc2V0IGV4dGVuZHMgTmJQYXNzd29yZFN0cmF0ZWd5TW9kdWxlIHtcbiAgcmVzZXRQYXNzd29yZFRva2VuS2V5Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5iUGFzc3dvcmRTdHJhdGVneVRva2VuIHtcbiAgY2xhc3M/OiBOYkF1dGhUb2tlbkNsYXNzLFxuICBrZXk/OiBzdHJpbmcsXG4gIGdldHRlcj86IEZ1bmN0aW9uLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5iUGFzc3dvcmRTdHJhdGVneU1lc3NhZ2Uge1xuICBrZXk/OiBzdHJpbmcsXG4gIGdldHRlcj86IEZ1bmN0aW9uLFxufVxuXG5leHBvcnQgY2xhc3MgTmJQYXNzd29yZEF1dGhTdHJhdGVneU9wdGlvbnMgZXh0ZW5kcyBOYkF1dGhTdHJhdGVneU9wdGlvbnMge1xuICBiYXNlRW5kcG9pbnQ/OiBzdHJpbmcgPSAnL2FwaS9hdXRoLyc7XG4gIGxvZ2luPzogYm9vbGVhbiB8IE5iUGFzc3dvcmRTdHJhdGVneU1vZHVsZSA9IHtcbiAgICBhbHdheXNGYWlsOiBmYWxzZSxcbiAgICBlbmRwb2ludDogJ2xvZ2luJyxcbiAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICByZXF1aXJlVmFsaWRUb2tlbjogdHJ1ZSxcbiAgICByZWRpcmVjdDoge1xuICAgICAgc3VjY2VzczogJy8nLFxuICAgICAgZmFpbHVyZTogbnVsbCxcbiAgICB9LFxuICAgIGRlZmF1bHRFcnJvcnM6IFsnTG9naW4vRW1haWwgY29tYmluYXRpb24gaXMgbm90IGNvcnJlY3QsIHBsZWFzZSB0cnkgYWdhaW4uJ10sXG4gICAgZGVmYXVsdE1lc3NhZ2VzOiBbJ1lvdSBoYXZlIGJlZW4gc3VjY2Vzc2Z1bGx5IGxvZ2dlZCBpbi4nXSxcbiAgfTtcbiAgcmVnaXN0ZXI/OiBib29sZWFuIHwgTmJQYXNzd29yZFN0cmF0ZWd5TW9kdWxlID0ge1xuICAgIGFsd2F5c0ZhaWw6IGZhbHNlLFxuICAgIGVuZHBvaW50OiAncmVnaXN0ZXInLFxuICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgIHJlcXVpcmVWYWxpZFRva2VuOiB0cnVlLFxuICAgIHJlZGlyZWN0OiB7XG4gICAgICBzdWNjZXNzOiAnLycsXG4gICAgICBmYWlsdXJlOiBudWxsLFxuICAgIH0sXG4gICAgZGVmYXVsdEVycm9yczogWydTb21ldGhpbmcgd2VudCB3cm9uZywgcGxlYXNlIHRyeSBhZ2Fpbi4nXSxcbiAgICBkZWZhdWx0TWVzc2FnZXM6IFsnWW91IGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgcmVnaXN0ZXJlZC4nXSxcbiAgfTtcbiAgcmVxdWVzdFBhc3M/OiBib29sZWFuIHwgTmJQYXNzd29yZFN0cmF0ZWd5TW9kdWxlID0ge1xuICAgIGVuZHBvaW50OiAncmVxdWVzdC1wYXNzJyxcbiAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICByZWRpcmVjdDoge1xuICAgICAgc3VjY2VzczogJy8nLFxuICAgICAgZmFpbHVyZTogbnVsbCxcbiAgICB9LFxuICAgIGRlZmF1bHRFcnJvcnM6IFsnU29tZXRoaW5nIHdlbnQgd3JvbmcsIHBsZWFzZSB0cnkgYWdhaW4uJ10sXG4gICAgZGVmYXVsdE1lc3NhZ2VzOiBbJ1Jlc2V0IHBhc3N3b3JkIGluc3RydWN0aW9ucyBoYXZlIGJlZW4gc2VudCB0byB5b3VyIGVtYWlsLiddLFxuICB9O1xuICByZXNldFBhc3M/OiBib29sZWFuIHwgTmJQYXNzd29yZFN0cmF0ZWd5UmVzZXQgPSB7XG4gICAgZW5kcG9pbnQ6ICdyZXNldC1wYXNzJyxcbiAgICBtZXRob2Q6ICdwdXQnLFxuICAgIHJlZGlyZWN0OiB7XG4gICAgICBzdWNjZXNzOiAnLycsXG4gICAgICBmYWlsdXJlOiBudWxsLFxuICAgIH0sXG4gICAgcmVzZXRQYXNzd29yZFRva2VuS2V5OiAncmVzZXRfcGFzc3dvcmRfdG9rZW4nLFxuICAgIGRlZmF1bHRFcnJvcnM6IFsnU29tZXRoaW5nIHdlbnQgd3JvbmcsIHBsZWFzZSB0cnkgYWdhaW4uJ10sXG4gICAgZGVmYXVsdE1lc3NhZ2VzOiBbJ1lvdXIgcGFzc3dvcmQgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGNoYW5nZWQuJ10sXG4gIH07XG4gIGxvZ291dD86IGJvb2xlYW4gfCBOYlBhc3N3b3JkU3RyYXRlZ3lSZXNldCA9IHtcbiAgICBhbHdheXNGYWlsOiBmYWxzZSxcbiAgICBlbmRwb2ludDogJ2xvZ291dCcsXG4gICAgbWV0aG9kOiAnZGVsZXRlJyxcbiAgICByZWRpcmVjdDoge1xuICAgICAgc3VjY2VzczogJy8nLFxuICAgICAgZmFpbHVyZTogbnVsbCxcbiAgICB9LFxuICAgIGRlZmF1bHRFcnJvcnM6IFsnU29tZXRoaW5nIHdlbnQgd3JvbmcsIHBsZWFzZSB0cnkgYWdhaW4uJ10sXG4gICAgZGVmYXVsdE1lc3NhZ2VzOiBbJ1lvdSBoYXZlIGJlZW4gc3VjY2Vzc2Z1bGx5IGxvZ2dlZCBvdXQuJ10sXG4gIH07XG4gIHJlZnJlc2hUb2tlbj86IGJvb2xlYW4gfCBOYlBhc3N3b3JkU3RyYXRlZ3lNb2R1bGUgPSB7XG4gICAgZW5kcG9pbnQ6ICdyZWZyZXNoLXRva2VuJyxcbiAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICByZXF1aXJlVmFsaWRUb2tlbjogdHJ1ZSxcbiAgICByZWRpcmVjdDoge1xuICAgICAgc3VjY2VzczogbnVsbCxcbiAgICAgIGZhaWx1cmU6IG51bGwsXG4gICAgfSxcbiAgICBkZWZhdWx0RXJyb3JzOiBbJ1NvbWV0aGluZyB3ZW50IHdyb25nLCBwbGVhc2UgdHJ5IGFnYWluLiddLFxuICAgIGRlZmF1bHRNZXNzYWdlczogWydZb3VyIHRva2VuIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSByZWZyZXNoZWQuJ10sXG4gIH07XG4gIHRva2VuPzogTmJQYXNzd29yZFN0cmF0ZWd5VG9rZW4gPSB7XG4gICAgY2xhc3M6IE5iQXV0aFNpbXBsZVRva2VuLFxuICAgIGtleTogJ2RhdGEudG9rZW4nLFxuICAgIGdldHRlcjogKG1vZHVsZTogc3RyaW5nLCByZXM6IEh0dHBSZXNwb25zZTxPYmplY3Q+LCBvcHRpb25zOiBOYlBhc3N3b3JkQXV0aFN0cmF0ZWd5T3B0aW9ucykgPT4gZ2V0RGVlcEZyb21PYmplY3QoXG4gICAgICByZXMuYm9keSxcbiAgICAgIG9wdGlvbnMudG9rZW4ua2V5LFxuICAgICksXG4gIH07XG4gIGVycm9ycz86IE5iUGFzc3dvcmRTdHJhdGVneU1lc3NhZ2UgPSB7XG4gICAga2V5OiAnZGF0YS5lcnJvcnMnLFxuICAgIGdldHRlcjogKG1vZHVsZTogc3RyaW5nLCByZXM6IEh0dHBFcnJvclJlc3BvbnNlLCBvcHRpb25zOiBOYlBhc3N3b3JkQXV0aFN0cmF0ZWd5T3B0aW9ucykgPT4gZ2V0RGVlcEZyb21PYmplY3QoXG4gICAgICByZXMuZXJyb3IsXG4gICAgICBvcHRpb25zLmVycm9ycy5rZXksXG4gICAgICBvcHRpb25zW21vZHVsZV0uZGVmYXVsdEVycm9ycyxcbiAgICApLFxuICB9O1xuICBtZXNzYWdlcz86IE5iUGFzc3dvcmRTdHJhdGVneU1lc3NhZ2UgPSB7XG4gICAga2V5OiAnZGF0YS5tZXNzYWdlcycsXG4gICAgZ2V0dGVyOiAobW9kdWxlOiBzdHJpbmcsIHJlczogSHR0cFJlc3BvbnNlPE9iamVjdD4sIG9wdGlvbnM6IE5iUGFzc3dvcmRBdXRoU3RyYXRlZ3lPcHRpb25zKSA9PiBnZXREZWVwRnJvbU9iamVjdChcbiAgICAgIHJlcy5ib2R5LFxuICAgICAgb3B0aW9ucy5tZXNzYWdlcy5rZXksXG4gICAgICBvcHRpb25zW21vZHVsZV0uZGVmYXVsdE1lc3NhZ2VzLFxuICAgICksXG4gIH07XG4gIHZhbGlkYXRpb24/OiB7XG4gICAgcGFzc3dvcmQ/OiB7XG4gICAgICByZXF1aXJlZD86IGJvb2xlYW47XG4gICAgICBtaW5MZW5ndGg/OiBudW1iZXIgfCBudWxsO1xuICAgICAgbWF4TGVuZ3RoPzogbnVtYmVyIHwgbnVsbDtcbiAgICAgIHJlZ2V4cD86IHN0cmluZyB8IG51bGw7XG4gICAgfTtcbiAgICBlbWFpbD86IHtcbiAgICAgIHJlcXVpcmVkPzogYm9vbGVhbjtcbiAgICAgIHJlZ2V4cD86IHN0cmluZyB8IG51bGw7XG4gICAgfTtcbiAgICBmdWxsTmFtZT86IHtcbiAgICAgIHJlcXVpcmVkPzogYm9vbGVhbjtcbiAgICAgIG1pbkxlbmd0aD86IG51bWJlciB8IG51bGw7XG4gICAgICBtYXhMZW5ndGg/OiBudW1iZXIgfCBudWxsO1xuICAgICAgcmVnZXhwPzogc3RyaW5nIHwgbnVsbDtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgY29uc3QgcGFzc3dvcmRTdHJhdGVneU9wdGlvbnM6IE5iUGFzc3dvcmRBdXRoU3RyYXRlZ3lPcHRpb25zID0gbmV3IE5iUGFzc3dvcmRBdXRoU3RyYXRlZ3lPcHRpb25zKCk7XG4iXX0=