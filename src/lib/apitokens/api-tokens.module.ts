import {NgModule} from "@angular/core";
import {ApiTokenStorageService} from "./api-token-storage.service";

export interface ApiTokensOptions {
    whitelistedDomains?: Array<string | RegExp>;
    blacklistedRoutes?: Array<string | RegExp>;
}

@NgModule({
    providers: [
        ApiTokenStorageService
    ]
})
export class ApiTokensModule {
}
