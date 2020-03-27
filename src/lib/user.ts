
export class UserDetails {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

export class UserProfile {
    id: number;
    email: string;
    details: UserDetails;
}

export class UserAddress {
    address: string;
    addressComplement: string;
    postCode: string;
    city: string;
    country: string;
}
