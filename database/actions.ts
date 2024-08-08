import { login } from "../oauth";
import { User } from "../types";
import { query } from "./main";
import dotenv from "dotenv";
import { get_user_by_id as get_local_user_by_id } from "../oauth";
import { compare } from "bcrypt";
import { Get_App, Get_Auth } from "../config/firebase";

import { Auth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { query as DocQuery, where, getFirestore, collection, getDocs } from "firebase/firestore";

export const authentication_backend = dotenv.config().parsed?.AUTHENTICATION_BACKEND;

/**
 * TODO:
 * 
 * Add support for different authentication methods
 * Add support for multiple authentication backends
 * Add support for two factor authentication
 * Add support for password resets
 * Add support for email verification
 * Add support for passwordless login
 */

/**
 * Retrieves a user from the database based on the provided email and password.
 *
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @return {Promise<User | null>} A promise that resolves with the user object if found, or rejects if not found.
 */
function Login(email: string, password: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
        if (authentication_backend === "local") {
            const user = login(email, password);

            if (!user) 
                return reject('Invalid email or password');

             return resolve(user);
        }

        if (authentication_backend === "firebase") {
            const app = Get_App();

            if (!app)
                return reject('Firebase backend not configured, please configure it in the .env file');
            
            const auth = Get_Auth(app as FirebaseApp) as Auth;               
 
            signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
                const user = userCredential.user;
                
                const userObj: User = {
                    email: user.email || '',
                    id: user.uid,
                    password: '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }

                signOut(auth).then(() => {
                    return resolve(userObj);                   
                })
                .catch((error) => {
                    return reject(error.message);
                })           
            }).catch((error) => {
                return reject(error.message);
            })
        }

        if (authentication_backend === "external") {                    
            query(`SELECT * FROM users WHERE username = ?`, [ email ]).then((users: User[]) => {
                compare(password, users[0].password, (err: any, result: boolean) => {
                    if (!result) return reject('Invalid email or password');
                if (users.length > 0) {
                    resolve(users[0]);
                } else {
                    reject('Could not find user: ' + email);
                }
            })
            })   
        }
    })
}

/**
 * Retrieves a user from the database based on the provided email.
 *
 * @param {string} email - The email of the user.
 * @return {Promise<User | null>} A promise that resolves with the user object if found, or rejects with an error message if not found.
 */
function get_user_by_email(email: string) {
    return new Promise((resolve, reject) => {
        if (!email)
            return reject('Invalid email');

        if (authentication_backend === "firebase") {
            const app = Get_App();
            const db = getFirestore(app as FirebaseApp);

            const ref = collection(db, "users");
            const q = DocQuery(ref, where("email", "==", email));
            getDocs(q).then((querySnapshot) => {
                if (querySnapshot.size > 0) {
                    const user = querySnapshot.docs[0].data() as User;
                    resolve(user);
                } else {
                    reject('Could not find user: ' + email);
                }
            })
        }

        if (authentication_backend === "external") {
            query(`SELECT * FROM users WHERE email = ?`, [email]).then((users: any) => {
                if (users.length > 0) {
                    resolve(users[0]);
                } else {
                    reject('Could not find user: ' + email);
                }
            })
        }
    })
}

/**
 * Retrieves a user from the database based on the provided ID.
 *
 * @param {string} id - The ID of the user.
 * @return {Promise<User | null>} A promise that resolves with the user object if found, or rejects with an error message if not found.
 */
function get_user_by_id(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
        if (!id)
            return reject('Invalid ID');

        if (authentication_backend === "local") {
            const user = get_local_user_by_id(id);

            if (!user)
                return reject('Could not find user: ' + id);

            return resolve(user);
        }

        if (authentication_backend === "firebase") {
            const app = Get_App();
            const db = getFirestore(app as FirebaseApp);

            const ref = collection(db, "users");
            const q = DocQuery(ref, where("id", "==", id));
            getDocs(q).then((querySnapshot) => {
                if (querySnapshot.size > 0) {
                    const user = querySnapshot.docs[0].data() as User;
                    resolve(user);
                } else {
                    reject('Could not find user: ' + id);
                }
            })
        }

        if (authentication_backend === "external") {
            query(`SELECT * FROM users WHERE id = ?`, [id]).then((users: any) => {
                if (users.length > 0) {
                    resolve(users[0]);
                } else {
                    reject('Could not find user: ' + id);
                }
            })
        }
    })
}

export { Login, get_user_by_email, get_user_by_id }