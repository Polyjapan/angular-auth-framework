export class ApiTokens {
    token: string;
    scopes: string[];
    audiences: string[];
    duration: number;
}

export class APIToken {
    scopes: string[];
    iss: string; // should be auth
    sub: string; // user|id or app|id
    aud: string[]; // target services
}

export enum PrincipalType {
    USER = 'user', APP = 'app'
}

export class Principal {
    type: PrincipalType;
    id: number;
}

export function hasScope(scope: string, token: APIToken) {
    return containsScope(scope, token.scopes);
}

export function containsScope(scope: string, scopes: string[]) {
    if (scopes.includes(scope)) {
        return true;
    } else {
        const parts = scope.split("/").map(part => part + "/"); // [admin/, access/]
        const joined = [""];

        // ["", "admin/", "admin/access/"]
        parts.forEach((part, index) => joined.push(joined[index] + part)); // equiv to scanLeft
        joined.splice(joined.length - 1, 1);

        return joined.map(path => path + '*')
            .some(starPath => scopes.includes(starPath));
    }
}

export function getPrincipal(token: APIToken): Principal {
    const parts = token.sub.split("|");
    const id = Number.parseInt(parts[1], 10);

    switch (parts[0]) {
        case 'user': return {type: PrincipalType.USER, id};
        case 'app': return {type: PrincipalType.APP, id};
        default: return undefined;
    }
}
