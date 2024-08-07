import { Scopes as ScopesType } from '../types';
class Scopes {
    scopes: string[];
    translatedScopes: ScopesType;
    constructor(...scopes: string[]) {
        this.scopes = scopes;
        this.translatedScopes = [];
        this.transpile();
    }

    /**
     * Transpiles the scopes to translatedScopes array based on the scope values.
     * Throws an error if no scopes were added to the scopes object.
     *
     */
    transpile() {
        this.scopes.forEach(scope => {
            switch (scope) {
                case "openid":
                    this.translatedScopes.push({ name: "openid", description: "Allow access to your account", type: "openid" });
                    break;

                case "email":
                    this.translatedScopes.push({ name: "email", description: "Can read your email", type: "email" });
                    break;

                case "profile":
                    this.translatedScopes.push({ name: "profile", description: "Can read your profile", type: "profile" });
                    break;

                case "offline_access":
                    this.translatedScopes.push({ name: "offline_access", description: "Can refresh tokens", type: "offline_access" });
                    break;

                default:
                    break;
            }            
        })

        // see if scopes were added
        if (this.translatedScopes.length === 0) {
            throw new Error("No scopes were added to the scopes object");            
        }
    }

    /**
     * Retrieves the translated scopes.
     *
     * @return {ScopesType} The translated scopes.
     */
    getScopes(): ScopesType {
        return this.translatedScopes;
    }
}

export default Scopes;