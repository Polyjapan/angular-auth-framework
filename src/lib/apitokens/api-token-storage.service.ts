import {Injectable} from '@angular/core';

import {JwtHelperService} from '@auth0/angular-jwt';
import {APIToken, hasScope} from "./api-tokens";

@Injectable()
export class ApiTokenStorageService {
    private static API_TOKEN_KEY = 'api_token';

    private jwtHelper: JwtHelperService = new JwtHelperService();

    constructor() {
    }

    login(apiToken: string) {
        if (this.jwtHelper.isTokenExpired(apiToken)) {
            throw new Error('Token is already expired');
        }

        localStorage.setItem(ApiTokenStorageService.API_TOKEN_KEY, apiToken);
    }

    logout(): void {
        // Remove tokens and expiry time from localStorage
        localStorage.removeItem(ApiTokenStorageService.API_TOKEN_KEY);
    }

    getApiToken(): APIToken | null {
        const raw = this.getRawApiToken();
        return raw ? this.jwtHelper.decodeToken(this.getRawApiToken()) : null;
    }

    getRawApiToken() {
        return localStorage.getItem(ApiTokenStorageService.API_TOKEN_KEY);
    }

    hasScope(scope: string): boolean {
        const token = this.getApiToken();
        if (this.isAuthenticated() && token && token.scopes) {
            return hasScope(scope, token);
        } else {
            return false;
        }
    }

    hasAudience(audience: string): boolean {
        const token = this.getApiToken();
        if (this.isAuthenticated() && token && token.aud) {
            return token.aud.includes(audience);
        } else {
            return false;
        }
    }

    isAuthenticated(): boolean {
        return this.getApiToken() !== null && !this.jwtHelper.isTokenExpired(this.getRawApiToken());
    }
}
