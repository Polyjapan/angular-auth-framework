
import {of as observableOf, AsyncSubject, Observable, of} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';

import {JwtHelperService} from '@auth0/angular-jwt';
import {AuthApiService} from "./authapi.service";
import {AccessToken, TokenResponse} from "./tokenresponse";

@Injectable()
export class TokenStorageService {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  private jwtHelper: JwtHelperService = new JwtHelperService();

  private refresh: AsyncSubject<boolean> = undefined;

  constructor(private api: AuthApiService) {

  }

  login(accessToken: string, refreshToken: string) {
    if (this.jwtHelper.isTokenExpired(accessToken)) {
      throw new Error('Token is already expired');
    }

    localStorage.setItem(TokenStorageService.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(TokenStorageService.ACCESS_TOKEN_KEY, accessToken);
  }

  loginWithTokenResponse(tokenResponse: TokenResponse) {
    this.login(tokenResponse.accessToken, tokenResponse.refreshToken);
  }

  refreshToken(): Observable<boolean> {
    return this.api.refreshToken(this.getRefreshToken())
        .pipe(map(resp => {
          this.loginWithTokenResponse(resp);
          return true;
        }), catchError(err => {
          this.logout();
          console.log('Logging out: server replied with ' + err);
          console.log(err);
          return of(false)
        }));
  }

  logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem(TokenStorageService.ACCESS_TOKEN_KEY);
    localStorage.removeItem(TokenStorageService.REFRESH_TOKEN_KEY);
  }

  getAccessToken(): AccessToken | null {
    const raw = this.getRawAccessToken();
    return raw ? this.jwtHelper.decodeToken(this.getRawAccessToken()) : null;
  }

  getRawAccessToken() {
    return localStorage.getItem(TokenStorageService.ACCESS_TOKEN_KEY);
  }

  getRefreshToken() {
    return localStorage.getItem(TokenStorageService.REFRESH_TOKEN_KEY);
  }

  hasGroup(group: string): boolean {
    const token = this.getAccessToken();
    if (this.isAuthenticated() && token && token.grp) {
      return token.grp.indexOf(group) > -1;
    } else {
      return false;
    }
  }

  isExpired(): boolean {
    return this.isAuthenticated() && this.jwtHelper.isTokenExpired(this.getRawAccessToken());
  }

  isAuthenticated(): boolean {
    // no check for expiration here, because we don't want to refresh the session for nothing
    // TODO: we may still want to validate the public key of the token, to avoid showing an UI that is not supposed to be
    return this.getAccessToken() !== null;
  }
}
