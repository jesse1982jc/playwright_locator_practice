/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { NbAuthOAuth2Token } from '../../services/token/token';
import { NbAuthStrategyOptions } from '../auth-strategy-options';
export var NbOAuth2ResponseType;
(function (NbOAuth2ResponseType) {
    NbOAuth2ResponseType["CODE"] = "code";
    NbOAuth2ResponseType["TOKEN"] = "token";
})(NbOAuth2ResponseType || (NbOAuth2ResponseType = {}));
// TODO: client_credentials
export var NbOAuth2GrantType;
(function (NbOAuth2GrantType) {
    NbOAuth2GrantType["AUTHORIZATION_CODE"] = "authorization_code";
    NbOAuth2GrantType["PASSWORD"] = "password";
    NbOAuth2GrantType["REFRESH_TOKEN"] = "refresh_token";
})(NbOAuth2GrantType || (NbOAuth2GrantType = {}));
export var NbOAuth2ClientAuthMethod;
(function (NbOAuth2ClientAuthMethod) {
    NbOAuth2ClientAuthMethod["NONE"] = "none";
    NbOAuth2ClientAuthMethod["BASIC"] = "basic";
    NbOAuth2ClientAuthMethod["REQUEST_BODY"] = "request-body";
})(NbOAuth2ClientAuthMethod || (NbOAuth2ClientAuthMethod = {}));
export class NbOAuth2AuthStrategyOptions extends NbAuthStrategyOptions {
    constructor() {
        super(...arguments);
        this.baseEndpoint = '';
        this.clientId = '';
        this.clientSecret = '';
        this.clientAuthMethod = NbOAuth2ClientAuthMethod.NONE;
        this.redirect = {
            success: '/',
            failure: null,
        };
        this.defaultErrors = ['Something went wrong, please try again.'];
        this.defaultMessages = ['You have been successfully authenticated.'];
        this.authorize = {
            endpoint: 'authorize',
            responseType: NbOAuth2ResponseType.CODE,
            requireValidToken: true,
        };
        this.token = {
            endpoint: 'token',
            grantType: NbOAuth2GrantType.AUTHORIZATION_CODE,
            requireValidToken: true,
            class: NbAuthOAuth2Token,
        };
        this.refresh = {
            endpoint: 'token',
            grantType: NbOAuth2GrantType.REFRESH_TOKEN,
            requireValidToken: true,
        };
    }
}
export const auth2StrategyOptions = new NbOAuth2AuthStrategyOptions();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2F1dGgyLXN0cmF0ZWd5Lm9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2F1dGgvc3RyYXRlZ2llcy9vYXV0aDIvb2F1dGgyLXN0cmF0ZWd5Lm9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sRUFBRSxpQkFBaUIsRUFBb0IsTUFBTSw0QkFBNEIsQ0FBQztBQUNqRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVqRSxNQUFNLENBQU4sSUFBWSxvQkFHWDtBQUhELFdBQVksb0JBQW9CO0lBQzlCLHFDQUFhLENBQUE7SUFDYix1Q0FBZSxDQUFBO0FBQ2pCLENBQUMsRUFIVyxvQkFBb0IsS0FBcEIsb0JBQW9CLFFBRy9CO0FBRUQsMkJBQTJCO0FBQzNCLE1BQU0sQ0FBTixJQUFZLGlCQUlYO0FBSkQsV0FBWSxpQkFBaUI7SUFDM0IsOERBQXlDLENBQUE7SUFDekMsMENBQXFCLENBQUE7SUFDckIsb0RBQStCLENBQUE7QUFDakMsQ0FBQyxFQUpXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFJNUI7QUFFRCxNQUFNLENBQU4sSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLHlDQUFhLENBQUE7SUFDYiwyQ0FBZSxDQUFBO0lBQ2YseURBQTZCLENBQUE7QUFDL0IsQ0FBQyxFQUpXLHdCQUF3QixLQUF4Qix3QkFBd0IsUUFJbkM7QUFFRCxNQUFNLE9BQU8sMkJBQTRCLFNBQVEscUJBQXFCO0lBQXRFOztRQUNFLGlCQUFZLEdBQVksRUFBRSxDQUFDO1FBQzNCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFDdEIsaUJBQVksR0FBWSxFQUFFLENBQUM7UUFDM0IscUJBQWdCLEdBQVksd0JBQXdCLENBQUMsSUFBSSxDQUFDO1FBQzFELGFBQVEsR0FBNEM7WUFDbEQsT0FBTyxFQUFFLEdBQUc7WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUM7UUFDRixrQkFBYSxHQUFXLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUNwRSxvQkFBZSxHQUFXLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUN4RSxjQUFTLEdBUUw7WUFDRixRQUFRLEVBQUUsV0FBVztZQUNyQixZQUFZLEVBQUUsb0JBQW9CLENBQUMsSUFBSTtZQUN2QyxpQkFBaUIsRUFBRSxJQUFJO1NBQ3hCLENBQUM7UUFDRixVQUFLLEdBT0Q7WUFDRixRQUFRLEVBQUUsT0FBTztZQUNqQixTQUFTLEVBQUUsaUJBQWlCLENBQUMsa0JBQWtCO1lBQy9DLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsS0FBSyxFQUFFLGlCQUFpQjtTQUN6QixDQUFDO1FBQ0YsWUFBTyxHQUtIO1lBQ0YsUUFBUSxFQUFFLE9BQU87WUFDakIsU0FBUyxFQUFFLGlCQUFpQixDQUFDLGFBQWE7WUFDMUMsaUJBQWlCLEVBQUUsSUFBSTtTQUN4QixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQWdDLElBQUksMkJBQTJCLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBBa3Zlby4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXG4gKi9cblxuaW1wb3J0IHsgTmJBdXRoT0F1dGgyVG9rZW4sIE5iQXV0aFRva2VuQ2xhc3MgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy90b2tlbi90b2tlbic7XG5pbXBvcnQgeyBOYkF1dGhTdHJhdGVneU9wdGlvbnMgfSBmcm9tICcuLi9hdXRoLXN0cmF0ZWd5LW9wdGlvbnMnO1xuXG5leHBvcnQgZW51bSBOYk9BdXRoMlJlc3BvbnNlVHlwZSB7XG4gIENPREUgPSAnY29kZScsXG4gIFRPS0VOID0gJ3Rva2VuJyxcbn1cblxuLy8gVE9ETzogY2xpZW50X2NyZWRlbnRpYWxzXG5leHBvcnQgZW51bSBOYk9BdXRoMkdyYW50VHlwZSB7XG4gIEFVVEhPUklaQVRJT05fQ09ERSA9ICdhdXRob3JpemF0aW9uX2NvZGUnLFxuICBQQVNTV09SRCA9ICdwYXNzd29yZCcsXG4gIFJFRlJFU0hfVE9LRU4gPSAncmVmcmVzaF90b2tlbicsXG59XG5cbmV4cG9ydCBlbnVtIE5iT0F1dGgyQ2xpZW50QXV0aE1ldGhvZCB7XG4gIE5PTkUgPSAnbm9uZScsXG4gIEJBU0lDID0gJ2Jhc2ljJyxcbiAgUkVRVUVTVF9CT0RZID0gJ3JlcXVlc3QtYm9keScsXG59XG5cbmV4cG9ydCBjbGFzcyBOYk9BdXRoMkF1dGhTdHJhdGVneU9wdGlvbnMgZXh0ZW5kcyBOYkF1dGhTdHJhdGVneU9wdGlvbnMge1xuICBiYXNlRW5kcG9pbnQ/OiBzdHJpbmcgPSAnJztcbiAgY2xpZW50SWQ6IHN0cmluZyA9ICcnO1xuICBjbGllbnRTZWNyZXQ/OiBzdHJpbmcgPSAnJztcbiAgY2xpZW50QXV0aE1ldGhvZD86IHN0cmluZyA9IE5iT0F1dGgyQ2xpZW50QXV0aE1ldGhvZC5OT05FO1xuICByZWRpcmVjdD86IHsgc3VjY2Vzcz86IHN0cmluZzsgZmFpbHVyZT86IHN0cmluZyB9ID0ge1xuICAgIHN1Y2Nlc3M6ICcvJyxcbiAgICBmYWlsdXJlOiBudWxsLFxuICB9O1xuICBkZWZhdWx0RXJyb3JzPzogYW55W10gPSBbJ1NvbWV0aGluZyB3ZW50IHdyb25nLCBwbGVhc2UgdHJ5IGFnYWluLiddO1xuICBkZWZhdWx0TWVzc2FnZXM/OiBhbnlbXSA9IFsnWW91IGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZC4nXTtcbiAgYXV0aG9yaXplPzoge1xuICAgIGVuZHBvaW50Pzogc3RyaW5nO1xuICAgIHJlZGlyZWN0VXJpPzogc3RyaW5nO1xuICAgIHJlc3BvbnNlVHlwZT86IHN0cmluZztcbiAgICByZXF1aXJlVmFsaWRUb2tlbj86IGJvb2xlYW47IC8vIHVzZWQgb25seSB3aXRoIE5iT0F1dGgyUmVzcG9uc2VUeXBlLlRPS0VOXG4gICAgc2NvcGU/OiBzdHJpbmc7XG4gICAgc3RhdGU/OiBzdHJpbmc7XG4gICAgcGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgfSA9IHtcbiAgICBlbmRwb2ludDogJ2F1dGhvcml6ZScsXG4gICAgcmVzcG9uc2VUeXBlOiBOYk9BdXRoMlJlc3BvbnNlVHlwZS5DT0RFLFxuICAgIHJlcXVpcmVWYWxpZFRva2VuOiB0cnVlLFxuICB9O1xuICB0b2tlbj86IHtcbiAgICBlbmRwb2ludD86IHN0cmluZztcbiAgICBncmFudFR5cGU/OiBzdHJpbmc7XG4gICAgcmVkaXJlY3RVcmk/OiBzdHJpbmc7XG4gICAgc2NvcGU/OiBzdHJpbmc7IC8vIFVzZWQgb25seSB3aXRoICdwYXNzd29yZCcgZ3JhbnRUeXBlXG4gICAgcmVxdWlyZVZhbGlkVG9rZW4/OiBib29sZWFuO1xuICAgIGNsYXNzOiBOYkF1dGhUb2tlbkNsYXNzLFxuICB9ID0ge1xuICAgIGVuZHBvaW50OiAndG9rZW4nLFxuICAgIGdyYW50VHlwZTogTmJPQXV0aDJHcmFudFR5cGUuQVVUSE9SSVpBVElPTl9DT0RFLFxuICAgIHJlcXVpcmVWYWxpZFRva2VuOiB0cnVlLFxuICAgIGNsYXNzOiBOYkF1dGhPQXV0aDJUb2tlbixcbiAgfTtcbiAgcmVmcmVzaD86IHtcbiAgICBlbmRwb2ludD86IHN0cmluZztcbiAgICBncmFudFR5cGU/OiBzdHJpbmc7XG4gICAgc2NvcGU/OiBzdHJpbmc7XG4gICAgcmVxdWlyZVZhbGlkVG9rZW4/OiBib29sZWFuO1xuICB9ID0ge1xuICAgIGVuZHBvaW50OiAndG9rZW4nLFxuICAgIGdyYW50VHlwZTogTmJPQXV0aDJHcmFudFR5cGUuUkVGUkVTSF9UT0tFTixcbiAgICByZXF1aXJlVmFsaWRUb2tlbjogdHJ1ZSxcbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IGF1dGgyU3RyYXRlZ3lPcHRpb25zOiBOYk9BdXRoMkF1dGhTdHJhdGVneU9wdGlvbnMgPSBuZXcgTmJPQXV0aDJBdXRoU3RyYXRlZ3lPcHRpb25zKCk7XG4iXX0=