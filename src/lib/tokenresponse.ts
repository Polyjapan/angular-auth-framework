export class TokenResponse {
    accessToken: string;
    refreshToken: string;
    duration: number;
}

export class AccessToken {
    uid: number; // user id
    grp: string[]; // groups
}
