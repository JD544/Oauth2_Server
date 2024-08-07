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
    forceConsentPrompt?: boolean;
}

type authCode = {
    code: string;
    client_id: string;
    user_id: string;
}


// Scopes

type Scope = {
    name: string;
    description: string;
    type: string;    
}

type Scopes = Scope[]
// End Scopes

export { User, clients, authCode, Scope, Scopes };
