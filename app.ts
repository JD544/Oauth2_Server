import express, { application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getClient, get_all_providers, get_user_by_id, login } from './oauth';
import path from 'path';
import { uuid } from 'uuidv4';
import { authCode } from './types';

const app = express();
const port = dotenv.config().parsed?.LISTENING_PORT || 8080;
const authUrl = `http://localhost:${port as string}/oauth2/auth`;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true    
}));

app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.get('/oauth', (req: express.Request, res: express.Response) => {
    const { client_id, client_secret, response_type, redirect_uri, scope, state } = req.query;

    if (getClient(client_id as string, client_secret as string)) {
        res.cookie('state', state as string);        
        res.cookie('client_id', client_id as string);
        res.cookie('response_type', response_type as string);
        res.cookie('redirect_uri', redirect_uri as string);
        res.cookie('scope', scope as string);
        res.cookie('secret', client_secret as string);

        res.redirect(`${authUrl}?client_id=${client_id}&response_type=${response_type}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`);
    } else {
        res.send('Invalid client credentials');
    }
})

app.get('/oauth2/auth', (req: express.Request, res: express.Response) => {
    const { client_id, response_type, redirect_uri, scope, state } = req.query;
    const { secret } = req.cookies;
    const code = req.cookies.state;
    const client = getClient(client_id as string, secret as string);

    if (state!== code) {
        return res.send('Invalid state');
    }

    if (!client) {
        return res.send('Invalid client credentials');
    }

    if (redirect_uri != client.redirectUris[0]) {
        return res.send('Invalid redirect uri');
    }

    if (response_type!== 'code') {
        return res.send('Invalid response type');
    }

    const applicationName = client.applicationName;    
    const csrfToken = uuid();
    res.cookie('csrf_token', csrfToken);
    
    // TODO: Add Scope Rules

    res.render('auth', {
        applicationName,
        csrfToken,
        authUrl,
        client_id,
        response_type,
        redirect_uri,
        scope,
        state
    })
})

app.get('/sample/client', (req: express.Request, res: express.Response) => {
    res.render('client', {
        providers: get_all_providers(),
    })
})

app.get('/oauth2/callback', (req: express.Request, res: express.Response) => {
    const { code, redirect_uri } = req.query;

    res.redirect(`${redirect_uri}?code=${code}`);
    
})

app.post('/oauth2/login', (req: express.Request, res: express.Response) => {
    const { username, password, client_id, redirect_uri, csrf_token } = req.body;
    const user = login(username, password);

    if (csrf_token !== req.cookies.csrf_token) {
        return res.status(401).send('Invalid csrf token');
    }

    if (!user) {
        return res.status(401).send('Invalid credentials');
    }

    if (redirect_uri !== req.cookies.redirect_uri) {
        return res.status(401).send('Invalid redirect uri');
    }

    const authCode = uuid();

    res.cookie('auth_code', authCode);
    res.cookie('auth_id', user.id);

    return res.json({
        code: authCode,
    })
})

app.post('/oauth2/token', (req: express.Request, res: express.Response) => {
    const { client_id, client_secret, code, grant_type } = req.body;

    const authID = req.cookies.auth_id;
    const authCode = req.cookies.auth_code;

    if (grant_type !== 'authorization_code') {
        return res.status(401).send('Invalid grant type');
    }   

    if (!authCode || !authID) {
        return res.status(401).send('Invalid auth code');
    }
    
    if (code !== authCode) {
        return res.status(401).send('Invalid code');
    }

    const user = get_user_by_id(authID);

    if (!user) {
        return res.status(401).send('Invalid user');
    }

    const token = jwt.sign({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }, dotenv.config().parsed?.JWT_SECRET as string, {
        expiresIn: '1h'
    });

    res.cookie('token', token);
    
    const decodedToken = jwt.verify(token, dotenv.config().parsed?.JWT_SECRET as string);

    res.clearCookie('auth_code');
    res.clearCookie('auth_id');
    res.clearCookie('csrf_token');

    return res.json({
        token: token,        
        decodedToken
    })
})
/*
    Handle 404
*/
app.get("*", (req: express.Request, res: express.Response) => {
    res.send('This route does not exist');
})

app.listen(port, () => {
    console.log(`OAuth server listening on port ${port}`)
})