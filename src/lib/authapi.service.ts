import {Inject, Injectable} from '@angular/core';


import {HttpClient} from '@angular/common/http';
import {AUTH_API_OPTIONS} from "./authapioptions.tokens";
import {TokensManagerModuleOptions} from "./tokensmanager.module";
import {Observable} from "rxjs";
import {TokenResponse} from "./tokenresponse";


@Injectable()
export class AuthApiService {
    private baseApiUrl: string;
    private apiKey: string;
    private refreshUrl: string;
    private profileUrl: string;

    constructor(private http: HttpClient, @Inject(AUTH_API_OPTIONS) config: TokensManagerModuleOptions) {
        this.baseApiUrl = config.authApiDomain;
        if (!this.baseApiUrl.startsWith('http')) this.baseApiUrl = 'https://' + this.baseApiUrl;
        if (this.baseApiUrl.endsWith('/')) this.baseApiUrl.substr(0, this.baseApiUrl.length - 1);

        this.apiKey = config.authApiKey;

        this._loginUrl = this.baseApiUrl + (config.loginPath ? config.loginPath : '/login');
        this.profileUrl = this.baseApiUrl + (config.profilePath ? config.profilePath : '/api/user/');
        this._registerUrl = this.baseApiUrl + (config.loginPath ? config.loginPath : '/register');
        this.refreshUrl = this.baseApiUrl + (config.loginPath ? config.loginPath : '/api/refresh/:token');
    }

    private _loginUrl: string;

    get loginUrl() {
        return this._loginUrl + '?app=' + this.apiKey + '&tokenType=token';
    }

    private _registerUrl: string;

    get registerUrl() {
        return this._registerUrl + '?app=' + this.apiKey + '&tokenType=token';
    }

    refreshToken(refreshToken: string): Observable<TokenResponse> {
      return this.http.get<TokenResponse>(refreshToken.replace(':token', refreshToken));
    }

    getCurrentUser(refreshToken: string): Observable<TokenResponse> {
      return this.http.get<TokenResponse>(refreshToken.replace(':token', refreshToken));
    }
}
