type User = {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

type clients = {
    id: string;
    secret: string;
    applicationName: string;
    redirectUris: string[];
}

type authCode = {
    code: string;
    client_id: string;
    user_id: string;
}

export { User, clients, authCode };