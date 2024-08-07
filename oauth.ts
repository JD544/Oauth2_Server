import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User, authCode, clients } from "./types";
import { uuid } from "uuidv4";
import express from "express";

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
        forceConsentPrompt: true,
        redirectUris: ['http://localhost:5173/kalicloud'],
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


const get_user_by_email = (email: string) => {
    const user = users.find(u => u.email === email)
    if (user) {
        return user
    }
    return null
}

/**
 * Login interface for OAuthify client
 */

/**
 * Starts the social login process by generating a login code and setting it as a cookie.
 *
 * @param {express.Response} res - The response object.
 * @param {string} redirect_uri - The redirect URI for the social login process.
 * @return {void} This function sends a response with a message to complete the login process.
 */
const start_social_login = (res: express.Response, redirect_uri: string) => {
    const token = uuid()

    res.cookie('login_code', token)

    if (!redirect_uri) 
        return res.status(401).send(`You must set a redirect_uri.`)

    res.send('Please complete the login process.')
}

/**
 * Completes the social login process.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @param {string} login_code - The login code.
 * @return {Promise<void>} - A promise that resolves when the social login process is complete.
 */
const complete_social_login = (req: express.Request, res: express.Response, login_code: string) => {
    const { code } = req.cookies
    const {
        redirect_uri, 
        client_id,
        client_secret,
        user_endpoint_uri,
        user_token
    } = req.body

    if (!redirect_uri) 
        return res.status(401).send(`You must set a redirect_uri.`)

    if (!client_id && !client_secret) 
        return res.status(401).send(`You are missing a client_id or client_secret.`)

    if (!user_endpoint_uri && !user_token) 
        return res.status(401).send(`You are missing a user_endpoint_uri or user_token.`)

    if (code !== login_code) 
        return res.status(401).send(`Invalid login code.`)

    fetch(user_endpoint_uri, {
        method: 'POST',        
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${user_token}`
        },
        body: `client_id=${client_id}&client_secret=${client_secret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirect_uri}`
    })
    .then(response => response.json())
    .then(data => {
        const user_data = data
        
        const token = jwt.sign({
            user: user_data
        }, process.env.JWT_SECRET!, {
            expiresIn: '30d'
        })

        res.cookie('token', token)

        return res.json({
            message: 'Login successful!',
            user_token: token
        })
    }).catch(err => {
        return res.status(401).send('Social login failed, network error!')
    })        
}

export { login, getClient, get_user_by_id, get_all_providers, get_user_by_email, start_social_login, complete_social_login }
