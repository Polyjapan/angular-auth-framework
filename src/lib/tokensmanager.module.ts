import {ModuleWithProviders, NgModule, Optional, SkipSelf} from "@angular/core";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AUTH_API_OPTIONS} from "./authapioptions.tokens";
import {TokenInterceptor} from "./tokeninterceptor";
import {AuthApiService} from "./authapi.service";
import {TokenStorageService} from "./tokenstorage.service";

export interface TokensManagerModuleOptions {
    whitelistedDomains?: Array<string | RegExp>;
    blacklistedRoutes?: Array<string | RegExp>;
    /**
     * The base domain for the login API
     */
    authApiDomain: string;

    registerPath?: string;
    loginPath?: string;
    profilePath?: string;
    refreshPath?: string;

    throwNoTokenError?: boolean;
    skipWhenExpired?: boolean;
}

@NgModule()
export class TokensmanagerModule {

    constructor(@Optional() @SkipSelf() parentModule: TokensmanagerModule) {
        if (parentModule) {
            throw new Error('TokensmanagerModule is already loaded. It should only be imported in your application\'s main module.');
        }
    }

    static forRoot(options: TokensManagerModuleOptions): ModuleWithProviders<TokensmanagerModule> {

        return {
            ngModule: TokensmanagerModule,
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: TokenInterceptor,
                    multi: true
                },

                {
                    provide: AUTH_API_OPTIONS,
                    useValue: options
                },

                AuthApiService,
                TokenStorageService
            ],


        };
    }
}
