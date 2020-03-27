import { InjectionToken } from '@angular/core';
import {TokensManagerModuleOptions} from "./tokensmanager.module";

export const AUTH_API_OPTIONS = new InjectionToken<TokensManagerModuleOptions>('AUTH_API_OPTIONS');
