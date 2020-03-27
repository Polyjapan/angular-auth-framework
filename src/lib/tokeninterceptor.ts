import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {AUTH_API_OPTIONS} from "./authapioptions.tokens";
import {Inject, Injectable} from '@angular/core';
import {TokenStorageService} from "./tokenstorage.service";
import {parse} from 'url';
import {Observable} from "rxjs";
import {TokensManagerModuleOptions} from "./tokensmanager.module";
import {catchError, flatMap, mergeMap} from "rxjs/operators";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private static readonly HEADER_NAME = 'Authorization';
    private static readonly AUTH_SCHEME = 'Bearer ';
    whitelistedDomains: Array<string | RegExp>;
    blacklistedRoutes: Array<string | RegExp>;
    jwtHelper = new JwtHelperService();

    constructor(
        @Inject(AUTH_API_OPTIONS) config: TokensManagerModuleOptions,
        public tokens: TokenStorageService
    ) {
        this.whitelistedDomains = config.whitelistedDomains || [];
        this.blacklistedRoutes = config.blacklistedRoutes || [];


        let baseApiUrl = config.authApiDomain;
        if (!baseApiUrl.startsWith('http')) baseApiUrl = 'https://' + baseApiUrl;
        if (baseApiUrl.endsWith('/')) baseApiUrl.substr(0, baseApiUrl.length - 1);

        this.whitelistedDomains.push(baseApiUrl);
        this.blacklistedRoutes.push(new RegExp((baseApiUrl + (config.loginPath ? config.loginPath : '/api/refresh/:token')).replace(':token', '[a-zA-Z0-9_=-]+')))
    }

    // Copied from https://github.com/auth0/angular2-jwt/blob/master/projects/angular-jwt/src/lib/jwt.interceptor.ts (MIT License)
    isWhitelistedDomain(request: HttpRequest<any>): boolean {
        const requestUrl: any = parse(request.url, false, true);

        return (requestUrl.host === null ||
            this.whitelistedDomains.findIndex(
                domain =>
                    typeof domain === 'string' ? domain === requestUrl.host : domain instanceof RegExp ? domain.test(requestUrl.host) : false
            ) > -1
        );
    }

    // Copied from https://github.com/auth0/angular2-jwt/blob/master/projects/angular-jwt/src/lib/jwt.interceptor.ts (MIT License)
    isBlacklistedRoute(request: HttpRequest<any>): boolean {
        const url = request.url;

        return (
            this.blacklistedRoutes.findIndex(
                route =>
                    typeof route === 'string' ? route === url : route instanceof RegExp ? route.test(url) : false
            ) > -1
        );
    }

    handleInterception(token: string | null, request: HttpRequest<any>, next: HttpHandler, isRetry = false): Observable<HttpEvent<any>> {
        if (token) {
            request = request.clone({
                setHeaders: {
                    [TokenInterceptor.HEADER_NAME]: `${TokenInterceptor.AUTH_SCHEME}${token}`
                }
            });

            return next.handle(request)
                .pipe(catchError(err => {
                    if (err.status === 401) {
                        // The error is Unauthorized, possibly our token expired

                        if (isRetry) {
                            console.log('Err: endpoint returned 401 again, even with fresh token. Giving up.');
                            throw err;
                        }

                        // Refresh the token before giving up
                        console.log('Warn: endpoint returned 401 - trying to refresh the token')

                        return this.tokens.refreshToken().pipe(flatMap(success => {
                            let newToken = null;
                            if (success) {
                                newToken = this.tokens.getRawAccessToken();
                            }

                            return this.handleInterception(newToken, request, next, true);
                        }));
                    } else throw err; // rethrow the error
                }));
        } else {
            // No token - if it fails it's not something I can fix anyway
            return next.handle(request);
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Do we have to do something on this domain?
        if (!this.isWhitelistedDomain(request) || this.isBlacklistedRoute(request)) {
            return next.handle(request);
        }

        const token = this.tokens.getRawAccessToken();

        if (token && this.jwtHelper.isTokenExpired(token, -10)) {
            // Try to refresh the token
            // If this doesn't work (401 error or anything), the session will be invalidated
            this.tokens.refreshToken().pipe(mergeMap(success => {
                let newToken = null;
                if (success) {
                    newToken = this.tokens.getRawAccessToken();
                }

                return this.handleInterception(newToken, request, next);
            }));
        } else {
            return this.handleInterception(token, request, next);
        }
    }
}
