import express, { application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { complete_social_login, getClient, get_all_providers, start_social_login } from './oauth';
import path from 'path';
import { uuid } from 'uuidv4';
import Scopes from './security/scopes';
import { Login, get_user_by_id } from './database/actions';

const port = dotenv.config().parsed?.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST'],    
}));

app.use('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.use('/oauth2/v3/**', (req, res, next) => {
    const { authorization } = req.headers;
    const { token } = req.cookies;
    
    if (!authorization)
        return res.status(401).send('Authorization header must be provided!');

    const authToken = (authorization as string).split(' ')[1];
    if ((authorization as string).split(' ')[0] !== 'Bearer')
        return res.status(401).send('Inavid token type!');
    if (token && authToken === token) {
        next();
    } else {
        res.status(401).send('Invalid token');
    }
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.get('/oauth2', (req: express.Request, res: express.Response) => {
    const { client_id, client_secret, response_type, redirect_uri, scope, consent, state } = req.query;

    if (getClient(client_id as string, client_secret as string)) {
        res.cookie('state', state as string);                
        res.cookie('client_id', client_id as string);
        res.cookie('response_type', response_type as string);
        res.cookie('redirect_uri', redirect_uri as string);
        res.cookie('scope', scope as string);
        res.cookie('consent', consent as string);
        res.cookie('secret', client_secret as string);        

        res.redirect(`/oauth2/auth?client_id=${client_id}&response_type=${response_type}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`);
    } else {
        res.send('Invalid client credentials');
    }
})

app.get('/oauth2/auth', (req: express.Request, res: express.Response) => {
    const { client_id, response_type, redirect_uri, scope, state } = req.query;
    const { secret } = req.cookies;
    const code = req.cookies.state;
    const client = getClient(client_id as string, secret as string);

    if (state !== code) {
        return res.send('Invalid state');
    }

    if (client?.forceConsentPrompt) {
        res.cookie('consent', 'forced');
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
        client_id,
        response_type,
        redirect_uri,
        scope,
        state
    })
})

app.get('/oauth2/consent/screen', (req: express.Request, res: express.Response) => {
    const { scope, client_id, secret, redirect_uri } = req.cookies;

    const client = getClient(client_id as string, secret as string);
    if (!client) {
        return res.send('Invalid client credentials');
    }

    res.clearCookie('consent');

    const scopeInitializer = new Scopes(...scope.split(','));
    
    const scopes = scopeInitializer.getScopes();

    res.render('consent', {
        applicationName: client.applicationName,
        scopes: scopes,
        redirect_uri
    })
})

app.get('/sample/client', (req: express.Request, res: express.Response) => {
    res.render('client', {
        providers: get_all_providers(),
    })
})

app.get('/oauth2/callback', (req: express.Request, res: express.Response) => {
    const { code, redirect_uri, error } = req.query;
    const { consent, response_type } = req.cookies;

    if (consent === 'forced') {
        return res.redirect(`/oauth2/consent/screen?access_code=${code}`);
    }

    if (error) {
        res.clearCookie('client_id');
        res.clearCookie('response_type');
        res.clearCookie('redirect_uri');
        res.clearCookie('scope');
        res.clearCookie('secret');
        res.clearCookie('auth_code');
        res.clearCookie('auth_id');
        return res.redirect(`${redirect_uri}?error=${error}`);
    }

    res.redirect(`${redirect_uri}?${response_type}=${code}`);
    
})

app.post('/oauth2/login', async (req: express.Request, res: express.Response) => {
    const { username, password, client_id, redirect_uri, csrf_token } = req.body;
        if (csrf_token !== req.cookies.csrf_token) {
        return res.status(401).send('Invalid csrf token');
    }

    if (redirect_uri !== req.cookies.redirect_uri) {
        return res.status(401).send('Invalid redirect uri');
    }

    const authCode = uuid();

    res.cookie('auth_code', authCode);

    try {
        const user = await Login(username, password);

        if (!user) return res.status(401).send('Invalid credentials');

        res.cookie('auth_id', user.id);

        res.json({ code: authCode });
    } catch (err) {
        return res.status(401).send('Invalid credentials');
    }
})

app.post('/oauth2/token', async(req: express.Request, res: express.Response) => {
    const { code, grant_type, redirect_uri } = req.body;

    const authID = req.cookies.auth_id;
    const authCode = req.cookies.auth_code;

    if (grant_type !== 'authorization_code') {
        return res.status(401).json({
            error: 'Invalid grant type',
            error_description: 'You are not allowed to use this grant type'            
    });
    }   

    if (!code) {
        return res.status(401).json({
            error: 'Missing auth code',
            error_description: 'The code you provided is missing'
        });
    }
    
    if (code !== authCode) {
        return res.status(401).json({
            error: 'Invalid auth code',
            error_description: 'The code you provided does not match the code on the server'
        });
    }


    try {
        const user = await get_user_by_id(authID as string);

        if (!user) return res.status(401).json({
            error: 'Invalid User',
            error_description: 'Error while fetching user'
        })

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }, dotenv.config().parsed?.JWT_SECRET as string, {
            expiresIn: '13h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 13 * 60 * 60 * 1000
        });

        res.clearCookie('auth_code');
        res.clearCookie('auth_id');
        res.clearCookie('csrf_token');

        return res.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 13 * 60 * 60,
        })
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid User',
            error_description: 'Error while fetching user'
        })
    }
})

// Social Login APIs
app.post('/social/start', (req: express.Request, res: express.Response) => {
    const { redirect_uri } = req.body;
    return start_social_login(res, redirect_uri)
})

app.post('/social/end', (req: express.Request, res: express.Response) => {
    const { login_code } = req.cookies;

    return complete_social_login(req, res, login_code)
})

// User Endpoint OAuth2 APIs
app.get('/oauth2/v3/user', (req: express.Request, res: express.Response) => {
    const token = req.cookies.token;

    jwt.verify(token, dotenv.config().parsed?.JWT_SECRET as string, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).send('Invalid token');
        }

        return res.json({
            id: decoded.id,
            email: decoded.email
        })
        });
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