import { User, authCode, clients } from "./types";

const users: User[] = [
    {
        id: '1',
        email: 'a@a.com',
        password: 'a',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        email: 'b@b.com',
        password: 'b',
        createdAt: new Date(),
        updatedAt: new Date()
    }
]

const authCodes: authCode[] = [
]   

const clients: clients[] = [
    {
        id: '1',
        secret: 'a',
        applicationName: 'Test',
        redirectUris: ['http://localhost:3000/sample/client'],
    },
    {
        id: '2',
        secret: 'b',
        applicationName: 'b',
        redirectUris: ['http://localhost:3000']
    },
    {
        id: '3',
        secret: '0956t-d6e6-6d6e-6d6e-6d6e-6d6e-6d6e',
        applicationName: 'A demo client',
        redirectUris: ['http://localhost:3000/sample/client'],
    }
]

const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
        return user
    }

    return null
}

const getClient = (clientId: string, clientSecret: string) => {
    const client = clients.find(c => c.id === clientId && c.secret === clientSecret)

    if (client) {
        return client
    }

    return null
}

const get_user_by_id = (id: string) => {
    const user = users.find(u => u.id === id)
    if (user) {
        return user
    }
    return null
}


const get_all_providers = () => {
    return clients
}

export { login, getClient, get_user_by_id, get_all_providers }