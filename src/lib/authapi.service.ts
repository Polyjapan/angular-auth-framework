import {Inject, Injectable} from '@angular/core';


import {HttpClient} from '@angular/common/http';
import {AUTH_API_OPTIONS} from "./authapioptions.tokens";
import {TokensManagerModuleOptions} from "./tokensmanager.module";
import {Observable} from "rxjs";
import {TokenResponse} from "./tokenresponse";
import {UserProfile} from "./user";


@Injectable()
export class AuthApiService {
    private baseApiUrl: string;
    private refreshUrl: string;
    private profileUrl: string;
    private loginUrl: string;

    constructor(private http: HttpClient, @Inject(AUTH_API_OPTIONS) config: TokensManagerModuleOptions) {
        this.baseApiUrl = config.authApiDomain;
        if (!this.baseApiUrl.startsWith('http')) this.baseApiUrl = 'https://' + this.baseApiUrl;
        if (this.baseApiUrl.endsWith('/')) this.baseApiUrl.substr(0, this.baseApiUrl.length - 1);

        this.loginUrl = this.baseApiUrl + (config.loginPath ? config.loginPath : '/internal/login') + '?service=:callback';
        this.profileUrl = this.baseApiUrl + (config.profilePath ? config.profilePath : '/api/user/');
        this.refreshUrl = this.baseApiUrl + (config.loginPath ? config.loginPath : '/api/refresh/:token');
    }

    getLoginUrl(callbackUrl: string) {
        return this.loginUrl.replace(':callback', callbackUrl);
    }

    refreshToken(refreshToken: string): Observable<TokenResponse> {
        return this.http.get<TokenResponse>(this.refreshUrl.replace(':token', refreshToken));
    }

    getCurrentUser(): Observable<UserProfile> {
        return this.http.get<UserProfile>(this.profileUrl);
    }
}
