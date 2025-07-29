import { urlBase64Decode } from '../../helpers';
export class NbAuthToken {
    constructor() {
        this.payload = null;
    }
    getName() {
        return this.constructor.NAME;
    }
    getPayload() {
        return this.payload;
    }
}
export class NbAuthTokenNotFoundError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NbAuthIllegalTokenError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NbAuthEmptyTokenError extends NbAuthIllegalTokenError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NbAuthIllegalJWTTokenError extends NbAuthIllegalTokenError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export function nbAuthCreateToken(tokenClass, token, ownerStrategyName, createdAt) {
    return new tokenClass(token, ownerStrategyName, createdAt);
}
export function decodeJwtPayload(payload) {
    if (payload.length === 0) {
        throw new NbAuthEmptyTokenError('Cannot extract from an empty payload.');
    }
    const parts = payload.split('.');
    if (parts.length !== 3) {
        throw new NbAuthIllegalJWTTokenError(`The payload ${payload} is not valid JWT payload and must consist of three parts.`);
    }
    let decoded;
    try {
        decoded = urlBase64Decode(parts[1]);
    }
    catch (e) {
        throw new NbAuthIllegalJWTTokenError(`The payload ${payload} is not valid JWT payload and cannot be parsed.`);
    }
    if (!decoded) {
        throw new NbAuthIllegalJWTTokenError(`The payload ${payload} is not valid JWT payload and cannot be decoded.`);
    }
    return JSON.parse(decoded);
}
/**
 * Wrapper for simple (text) token
 */
export class NbAuthSimpleToken extends NbAuthToken {
    constructor(token, ownerStrategyName, createdAt) {
        super();
        this.token = token;
        this.ownerStrategyName = ownerStrategyName;
        this.createdAt = createdAt;
        try {
            this.parsePayload();
        }
        catch (err) {
            if (!(err instanceof NbAuthTokenNotFoundError)) {
                // token is present but has got a problem, including illegal
                throw err;
            }
        }
        this.createdAt = this.prepareCreatedAt(createdAt);
    }
    parsePayload() {
        this.payload = null;
    }
    prepareCreatedAt(date) {
        return date ? date : new Date();
    }
    /**
     * Returns the token's creation date
     * @returns {Date}
     */
    getCreatedAt() {
        return this.createdAt;
    }
    /**
     * Returns the token value
     * @returns string
     */
    getValue() {
        return this.token;
    }
    getOwnerStrategyName() {
        return this.ownerStrategyName;
    }
    /**
     * Is non empty and valid
     * @returns {boolean}
     */
    isValid() {
        return !!this.getValue();
    }
    /**
     * Validate value and convert to string, if value is not valid return empty string
     * @returns {string}
     */
    toString() {
        return !!this.token ? this.token : '';
    }
}
NbAuthSimpleToken.NAME = 'nb:auth:simple:token';
/**
 * Wrapper for JWT token with additional methods.
 */
export class NbAuthJWTToken extends NbAuthSimpleToken {
    /**
     * for JWT token, the iat (issued at) field of the token payload contains the creation Date
     */
    prepareCreatedAt(date) {
        const decoded = this.getPayload();
        return decoded && decoded.iat ? new Date(Number(decoded.iat) * 1000) : super.prepareCreatedAt(date);
    }
    /**
     * Returns payload object
     * @returns any
     */
    parsePayload() {
        if (!this.token) {
            throw new NbAuthTokenNotFoundError('Token not found. ');
        }
        this.payload = decodeJwtPayload(this.token);
    }
    /**
     * Returns expiration date
     * @returns Date
     */
    getTokenExpDate() {
        const decoded = this.getPayload();
        if (decoded && !decoded.hasOwnProperty('exp')) {
            return null;
        }
        const date = new Date(0);
        date.setUTCSeconds(decoded.exp); // 'cause jwt token are set in seconds
        return date;
    }
    /**
     * Is data expired
     * @returns {boolean}
     */
    isValid() {
        return super.isValid() && (!this.getTokenExpDate() || new Date() < this.getTokenExpDate());
    }
}
NbAuthJWTToken.NAME = 'nb:auth:jwt:token';
const prepareOAuth2Token = (data) => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        }
        catch (e) { }
    }
    return data;
};
/**
 * Wrapper for OAuth2 token whose access_token is a JWT Token
 */
export class NbAuthOAuth2Token extends NbAuthSimpleToken {
    constructor(data = {}, ownerStrategyName, createdAt) {
        // we may get it as string when retrieving from a storage
        super(prepareOAuth2Token(data), ownerStrategyName, createdAt);
    }
    /**
     * Returns the token value
     * @returns string
     */
    getValue() {
        return this.token.access_token;
    }
    /**
     * Returns the refresh token
     * @returns string
     */
    getRefreshToken() {
        return this.token.refresh_token;
    }
    /**
     *  put refreshToken in the token payload
      * @param refreshToken
     */
    setRefreshToken(refreshToken) {
        this.token.refresh_token = refreshToken;
    }
    /**
     * Parses token payload
     * @returns any
     */
    parsePayload() {
        if (!this.token) {
            throw new NbAuthTokenNotFoundError('Token not found.');
        }
        else {
            if (!Object.keys(this.token).length) {
                throw new NbAuthEmptyTokenError('Cannot extract payload from an empty token.');
            }
        }
        this.payload = this.token;
    }
    /**
     * Returns the token type
     * @returns string
     */
    getType() {
        return this.token.token_type;
    }
    /**
     * Is data expired
     * @returns {boolean}
     */
    isValid() {
        return super.isValid() && (!this.getTokenExpDate() || new Date() < this.getTokenExpDate());
    }
    /**
     * Returns expiration date
     * @returns Date
     */
    getTokenExpDate() {
        if (!this.token.hasOwnProperty('expires_in')) {
            return null;
        }
        return new Date(this.createdAt.getTime() + Number(this.token.expires_in) * 1000);
    }
    /**
     * Convert to string
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.token);
    }
}
NbAuthOAuth2Token.NAME = 'nb:auth:oauth2:token';
/**
 * Wrapper for OAuth2 token embedding JWT tokens
 */
export class NbAuthOAuth2JWTToken extends NbAuthOAuth2Token {
    parsePayload() {
        super.parsePayload();
        this.parseAccessTokenPayload();
    }
    parseAccessTokenPayload() {
        const accessToken = this.getValue();
        if (!accessToken) {
            throw new NbAuthTokenNotFoundError('access_token key not found.');
        }
        this.accessTokenPayload = decodeJwtPayload(accessToken);
    }
    /**
     * Returns access token payload
     * @returns any
     */
    getAccessTokenPayload() {
        return this.accessTokenPayload;
    }
    /**
     * for Oauth2 JWT token, the iat (issued at) field of the access_token payload
     */
    prepareCreatedAt(date) {
        const payload = this.accessTokenPayload;
        return payload && payload.iat ? new Date(Number(payload.iat) * 1000) : super.prepareCreatedAt(date);
    }
    /**
     * Is token valid
     * @returns {boolean}
     */
    isValid() {
        return this.accessTokenPayload && super.isValid();
    }
    /**
     * Returns expiration date :
     * - exp if set,
     * - super.getExpDate() otherwise
     * @returns Date
     */
    getTokenExpDate() {
        if (this.accessTokenPayload && this.accessTokenPayload.hasOwnProperty('exp')) {
            const date = new Date(0);
            date.setUTCSeconds(this.accessTokenPayload.exp);
            return date;
        }
        else {
            return super.getTokenExpDate();
        }
    }
}
NbAuthOAuth2JWTToken.NAME = 'nb:auth:oauth2:jwt:token';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2F1dGgvc2VydmljZXMvdG9rZW4vdG9rZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVoRCxNQUFNLE9BQWdCLFdBQVc7SUFBakM7UUFFWSxZQUFPLEdBQVEsSUFBSSxDQUFDO0lBZ0JoQyxDQUFDO0lBUEMsT0FBTztRQUNMLE9BQVEsSUFBSSxDQUFDLFdBQWdDLENBQUMsSUFBSSxDQUFDO0lBQ3JELENBQUM7SUFFRCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxLQUFLO0lBQ2pELFlBQVksT0FBZTtRQUN6QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxLQUFLO0lBQ2hELFlBQVksT0FBZTtRQUN6QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxxQkFBc0IsU0FBUSx1QkFBdUI7SUFDaEUsWUFBWSxPQUFlO1FBQ3pCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEQsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLDBCQUEyQixTQUFRLHVCQUF1QjtJQUNy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Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXJsQmFzZTY0RGVjb2RlIH0gZnJvbSAnLi4vLi4vaGVscGVycyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOYkF1dGhUb2tlbiB7XG5cbiAgcHJvdGVjdGVkIHBheWxvYWQ6IGFueSA9IG51bGw7XG5cbiAgYWJzdHJhY3QgZ2V0VmFsdWUoKTogc3RyaW5nO1xuICBhYnN0cmFjdCBpc1ZhbGlkKCk6IGJvb2xlYW47XG4gIC8vIHRoZSBzdHJhdGVneSBuYW1lIHVzZWQgdG8gYWNxdWlyZSB0aGlzIHRva2VuIChuZWVkZWQgZm9yIHJlZnJlc2hpbmcgdG9rZW4pXG4gIGFic3RyYWN0IGdldE93bmVyU3RyYXRlZ3lOYW1lKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0Q3JlYXRlZEF0KCk6IERhdGU7XG4gIGFic3RyYWN0IHRvU3RyaW5nKCk6IHN0cmluZztcblxuICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLmNvbnN0cnVjdG9yIGFzIE5iQXV0aFRva2VuQ2xhc3MpLk5BTUU7XG4gIH1cblxuICBnZXRQYXlsb2FkKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMucGF5bG9hZDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmJBdXRoVG9rZW5Ob3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgbmV3LnRhcmdldC5wcm90b3R5cGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOYkF1dGhJbGxlZ2FsVG9rZW5FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIG5ldy50YXJnZXQucHJvdG90eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmJBdXRoRW1wdHlUb2tlbkVycm9yIGV4dGVuZHMgTmJBdXRoSWxsZWdhbFRva2VuRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgbmV3LnRhcmdldC5wcm90b3R5cGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOYkF1dGhJbGxlZ2FsSldUVG9rZW5FcnJvciBleHRlbmRzIE5iQXV0aElsbGVnYWxUb2tlbkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIG5ldy50YXJnZXQucHJvdG90eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5iQXV0aFJlZnJlc2hhYmxlVG9rZW4ge1xuICBnZXRSZWZyZXNoVG9rZW4oKTogc3RyaW5nO1xuICBzZXRSZWZyZXNoVG9rZW4ocmVmcmVzaFRva2VuOiBzdHJpbmcpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5iQXV0aFRva2VuQ2xhc3M8VCA9IE5iQXV0aFRva2VuPiB7XG4gIE5BTUU6IHN0cmluZztcbiAgbmV3IChyYXc6IGFueSwgc3RyYXRlZ3lOYW1lOiBzdHJpbmcsIGV4cERhdGU/OiBEYXRlKTogVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5iQXV0aENyZWF0ZVRva2VuPFQgZXh0ZW5kcyBOYkF1dGhUb2tlbj4odG9rZW5DbGFzczogTmJBdXRoVG9rZW5DbGFzczxUPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyU3RyYXRlZ3lOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0PzogRGF0ZSkge1xuICByZXR1cm4gbmV3IHRva2VuQ2xhc3ModG9rZW4sIG93bmVyU3RyYXRlZ3lOYW1lLCBjcmVhdGVkQXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlSnd0UGF5bG9hZChwYXlsb2FkOiBzdHJpbmcpOiBhbnkge1xuXG4gIGlmIChwYXlsb2FkLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBOYkF1dGhFbXB0eVRva2VuRXJyb3IoJ0Nhbm5vdCBleHRyYWN0IGZyb20gYW4gZW1wdHkgcGF5bG9hZC4nKTtcbiAgfVxuXG4gIGNvbnN0IHBhcnRzID0gcGF5bG9hZC5zcGxpdCgnLicpO1xuXG4gIGlmIChwYXJ0cy5sZW5ndGggIT09IDMpIHtcbiAgICB0aHJvdyBuZXcgTmJBdXRoSWxsZWdhbEpXVFRva2VuRXJyb3IoXG4gICAgICBgVGhlIHBheWxvYWQgJHtwYXlsb2FkfSBpcyBub3QgdmFsaWQgSldUIHBheWxvYWQgYW5kIG11c3QgY29uc2lzdCBvZiB0aHJlZSBwYXJ0cy5gKTtcbiAgfVxuXG4gIGxldCBkZWNvZGVkO1xuICB0cnkge1xuICAgIGRlY29kZWQgPSB1cmxCYXNlNjREZWNvZGUocGFydHNbMV0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IE5iQXV0aElsbGVnYWxKV1RUb2tlbkVycm9yKFxuICAgICAgYFRoZSBwYXlsb2FkICR7cGF5bG9hZH0gaXMgbm90IHZhbGlkIEpXVCBwYXlsb2FkIGFuZCBjYW5ub3QgYmUgcGFyc2VkLmApO1xuICB9XG5cbiAgaWYgKCFkZWNvZGVkKSB7XG4gICAgdGhyb3cgbmV3IE5iQXV0aElsbGVnYWxKV1RUb2tlbkVycm9yKFxuICAgICAgYFRoZSBwYXlsb2FkICR7cGF5bG9hZH0gaXMgbm90IHZhbGlkIEpXVCBwYXlsb2FkIGFuZCBjYW5ub3QgYmUgZGVjb2RlZC5gKTtcbiAgfVxuICByZXR1cm4gSlNPTi5wYXJzZShkZWNvZGVkKTtcbn1cblxuLyoqXG4gKiBXcmFwcGVyIGZvciBzaW1wbGUgKHRleHQpIHRva2VuXG4gKi9cbmV4cG9ydCBjbGFzcyBOYkF1dGhTaW1wbGVUb2tlbiBleHRlbmRzIE5iQXV0aFRva2VuIHtcblxuICBzdGF0aWMgTkFNRSA9ICduYjphdXRoOnNpbXBsZTp0b2tlbic7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IHRva2VuOiBhbnksXG4gICAgICAgICAgICAgIHByb3RlY3RlZCByZWFkb25seSBvd25lclN0cmF0ZWd5TmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlZEF0PzogRGF0ZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMucGFyc2VQYXlsb2FkKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBOYkF1dGhUb2tlbk5vdEZvdW5kRXJyb3IpKSB7XG4gICAgICAgIC8vIHRva2VuIGlzIHByZXNlbnQgYnV0IGhhcyBnb3QgYSBwcm9ibGVtLCBpbmNsdWRpbmcgaWxsZWdhbFxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY3JlYXRlZEF0ID0gdGhpcy5wcmVwYXJlQ3JlYXRlZEF0KGNyZWF0ZWRBdCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGFyc2VQYXlsb2FkKCk6IGFueSB7XG4gICAgdGhpcy5wYXlsb2FkID0gbnVsbDtcbiAgfVxuXG4gIHByb3RlY3RlZCBwcmVwYXJlQ3JlYXRlZEF0KGRhdGU6IERhdGUpIHtcbiAgICByZXR1cm4gZGF0ZSA/IGRhdGUgOiBuZXcgRGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRva2VuJ3MgY3JlYXRpb24gZGF0ZVxuICAgKiBAcmV0dXJucyB7RGF0ZX1cbiAgICovXG4gIGdldENyZWF0ZWRBdCgpOiBEYXRlIHtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVkQXQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdG9rZW4gdmFsdWVcbiAgICogQHJldHVybnMgc3RyaW5nXG4gICAqL1xuICBnZXRWYWx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnRva2VuO1xuICB9XG5cbiAgZ2V0T3duZXJTdHJhdGVneU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5vd25lclN0cmF0ZWd5TmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyBub24gZW1wdHkgYW5kIHZhbGlkXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNWYWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLmdldFZhbHVlKCk7XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgdmFsdWUgYW5kIGNvbnZlcnQgdG8gc3RyaW5nLCBpZiB2YWx1ZSBpcyBub3QgdmFsaWQgcmV0dXJuIGVtcHR5IHN0cmluZ1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gISF0aGlzLnRva2VuID8gdGhpcy50b2tlbiA6ICcnO1xuICB9XG59XG5cbi8qKlxuICogV3JhcHBlciBmb3IgSldUIHRva2VuIHdpdGggYWRkaXRpb25hbCBtZXRob2RzLlxuICovXG5leHBvcnQgY2xhc3MgTmJBdXRoSldUVG9rZW4gZXh0ZW5kcyBOYkF1dGhTaW1wbGVUb2tlbiB7XG5cbiAgc3RhdGljIE5BTUUgPSAnbmI6YXV0aDpqd3Q6dG9rZW4nO1xuXG4gIC8qKlxuICAgKiBmb3IgSldUIHRva2VuLCB0aGUgaWF0IChpc3N1ZWQgYXQpIGZpZWxkIG9mIHRoZSB0b2tlbiBwYXlsb2FkIGNvbnRhaW5zIHRoZSBjcmVhdGlvbiBEYXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgcHJlcGFyZUNyZWF0ZWRBdChkYXRlOiBEYXRlKSB7XG4gICAgICBjb25zdCBkZWNvZGVkID0gdGhpcy5nZXRQYXlsb2FkKCk7XG4gICAgICByZXR1cm4gZGVjb2RlZCAmJiBkZWNvZGVkLmlhdCA/IG5ldyBEYXRlKE51bWJlcihkZWNvZGVkLmlhdCkgKiAxMDAwKSA6IHN1cGVyLnByZXBhcmVDcmVhdGVkQXQoZGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBwYXlsb2FkIG9iamVjdFxuICAgKiBAcmV0dXJucyBhbnlcbiAgICovXG4gIHByb3RlY3RlZCBwYXJzZVBheWxvYWQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnRva2VuKSB7XG4gICAgICB0aHJvdyBuZXcgTmJBdXRoVG9rZW5Ob3RGb3VuZEVycm9yKCdUb2tlbiBub3QgZm91bmQuICcpXG4gICAgfVxuICAgIHRoaXMucGF5bG9hZCA9IGRlY29kZUp3dFBheWxvYWQodGhpcy50b2tlbik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBleHBpcmF0aW9uIGRhdGVcbiAgICogQHJldHVybnMgRGF0ZVxuICAgKi9cbiAgZ2V0VG9rZW5FeHBEYXRlKCk6IERhdGUge1xuICAgIGNvbnN0IGRlY29kZWQgPSB0aGlzLmdldFBheWxvYWQoKTtcbiAgICBpZiAoZGVjb2RlZCAmJiAhZGVjb2RlZC5oYXNPd25Qcm9wZXJ0eSgnZXhwJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoMCk7XG4gICAgZGF0ZS5zZXRVVENTZWNvbmRzKGRlY29kZWQuZXhwKTsgLy8gJ2NhdXNlIGp3dCB0b2tlbiBhcmUgc2V0IGluIHNlY29uZHNcbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyBkYXRhIGV4cGlyZWRcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzdXBlci5pc1ZhbGlkKCkgJiYgKCF0aGlzLmdldFRva2VuRXhwRGF0ZSgpIHx8IG5ldyBEYXRlKCkgPCB0aGlzLmdldFRva2VuRXhwRGF0ZSgpKTtcbiAgfVxufVxuXG5jb25zdCBwcmVwYXJlT0F1dGgyVG9rZW4gPSAoZGF0YSkgPT4ge1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiAqIFdyYXBwZXIgZm9yIE9BdXRoMiB0b2tlbiB3aG9zZSBhY2Nlc3NfdG9rZW4gaXMgYSBKV1QgVG9rZW5cbiAqL1xuZXhwb3J0IGNsYXNzIE5iQXV0aE9BdXRoMlRva2VuIGV4dGVuZHMgTmJBdXRoU2ltcGxlVG9rZW4ge1xuXG4gIHN0YXRpYyBOQU1FID0gJ25iOmF1dGg6b2F1dGgyOnRva2VuJztcblxuICBjb25zdHJ1Y3RvciggZGF0YTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmd8bnVtYmVyIH18c3RyaW5nID0ge30sXG4gICAgICAgICAgICAgICBvd25lclN0cmF0ZWd5TmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgY3JlYXRlZEF0PzogRGF0ZSkge1xuXG4gICAgLy8gd2UgbWF5IGdldCBpdCBhcyBzdHJpbmcgd2hlbiByZXRyaWV2aW5nIGZyb20gYSBzdG9yYWdlXG4gICAgc3VwZXIocHJlcGFyZU9BdXRoMlRva2VuKGRhdGEpLCBvd25lclN0cmF0ZWd5TmFtZSwgY3JlYXRlZEF0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0b2tlbiB2YWx1ZVxuICAgKiBAcmV0dXJucyBzdHJpbmdcbiAgICovXG4gIGdldFZhbHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudG9rZW4uYWNjZXNzX3Rva2VuO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlZnJlc2ggdG9rZW5cbiAgICogQHJldHVybnMgc3RyaW5nXG4gICAqL1xuICBnZXRSZWZyZXNoVG9rZW4oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5yZWZyZXNoX3Rva2VuO1xuICB9XG5cbiAgLyoqXG4gICAqICBwdXQgcmVmcmVzaFRva2VuIGluIHRoZSB0b2tlbiBwYXlsb2FkXG4gICAgKiBAcGFyYW0gcmVmcmVzaFRva2VuXG4gICAqL1xuICBzZXRSZWZyZXNoVG9rZW4ocmVmcmVzaFRva2VuOiBzdHJpbmcpIHtcbiAgICB0aGlzLnRva2VuLnJlZnJlc2hfdG9rZW4gPSByZWZyZXNoVG9rZW47XG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIHRva2VuIHBheWxvYWRcbiAgICogQHJldHVybnMgYW55XG4gICAqL1xuICBwcm90ZWN0ZWQgcGFyc2VQYXlsb2FkKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy50b2tlbikge1xuICAgICAgdGhyb3cgbmV3IE5iQXV0aFRva2VuTm90Rm91bmRFcnJvcignVG9rZW4gbm90IGZvdW5kLicpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghT2JqZWN0LmtleXModGhpcy50b2tlbikubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBOYkF1dGhFbXB0eVRva2VuRXJyb3IoJ0Nhbm5vdCBleHRyYWN0IHBheWxvYWQgZnJvbSBhbiBlbXB0eSB0b2tlbi4nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wYXlsb2FkID0gdGhpcy50b2tlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0b2tlbiB0eXBlXG4gICAqIEByZXR1cm5zIHN0cmluZ1xuICAgKi9cbiAgZ2V0VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnRva2VuLnRva2VuX3R5cGU7XG4gIH1cblxuICAvKipcbiAgICogSXMgZGF0YSBleHBpcmVkXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNWYWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3VwZXIuaXNWYWxpZCgpICYmICghdGhpcy5nZXRUb2tlbkV4cERhdGUoKSB8fCBuZXcgRGF0ZSgpIDwgdGhpcy5nZXRUb2tlbkV4cERhdGUoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBleHBpcmF0aW9uIGRhdGVcbiAgICogQHJldHVybnMgRGF0ZVxuICAgKi9cbiAgZ2V0VG9rZW5FeHBEYXRlKCk6IERhdGUge1xuICAgIGlmICghdGhpcy50b2tlbi5oYXNPd25Qcm9wZXJ0eSgnZXhwaXJlc19pbicpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuY3JlYXRlZEF0LmdldFRpbWUoKSArIE51bWJlcih0aGlzLnRva2VuLmV4cGlyZXNfaW4pICogMTAwMCk7XG59XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdG8gc3RyaW5nXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnRva2VuKTtcbiAgfVxufVxuXG4vKipcbiAqIFdyYXBwZXIgZm9yIE9BdXRoMiB0b2tlbiBlbWJlZGRpbmcgSldUIHRva2Vuc1xuICovXG5leHBvcnQgY2xhc3MgTmJBdXRoT0F1dGgySldUVG9rZW4gZXh0ZW5kcyBOYkF1dGhPQXV0aDJUb2tlbiB7XG5cbiAgc3RhdGljIE5BTUUgPSAnbmI6YXV0aDpvYXV0aDI6and0OnRva2VuJztcblxuICBwcm90ZWN0ZWQgYWNjZXNzVG9rZW5QYXlsb2FkOiBhbnk7XG5cbiAgcHJvdGVjdGVkIHBhcnNlUGF5bG9hZCgpOiB2b2lkIHtcbiAgICBzdXBlci5wYXJzZVBheWxvYWQoKTtcbiAgICB0aGlzLnBhcnNlQWNjZXNzVG9rZW5QYXlsb2FkKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGFyc2VBY2Nlc3NUb2tlblBheWxvYWQoKTogYW55IHtcbiAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHRoaXMuZ2V0VmFsdWUoKTtcbiAgICBpZiAoIWFjY2Vzc1Rva2VuKSB7XG4gICAgICB0aHJvdyBuZXcgTmJBdXRoVG9rZW5Ob3RGb3VuZEVycm9yKCdhY2Nlc3NfdG9rZW4ga2V5IG5vdCBmb3VuZC4nKVxuICAgIH1cbiAgICB0aGlzLmFjY2Vzc1Rva2VuUGF5bG9hZCA9IGRlY29kZUp3dFBheWxvYWQoYWNjZXNzVG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWNjZXNzIHRva2VuIHBheWxvYWRcbiAgICogQHJldHVybnMgYW55XG4gICAqL1xuICBnZXRBY2Nlc3NUb2tlblBheWxvYWQoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5hY2Nlc3NUb2tlblBheWxvYWQ7XG4gIH1cblxuICAvKipcbiAgICogZm9yIE9hdXRoMiBKV1QgdG9rZW4sIHRoZSBpYXQgKGlzc3VlZCBhdCkgZmllbGQgb2YgdGhlIGFjY2Vzc190b2tlbiBwYXlsb2FkXG4gICAqL1xuICBwcm90ZWN0ZWQgcHJlcGFyZUNyZWF0ZWRBdChkYXRlOiBEYXRlKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHRoaXMuYWNjZXNzVG9rZW5QYXlsb2FkO1xuICAgIHJldHVybiBwYXlsb2FkICYmIHBheWxvYWQuaWF0ID8gbmV3IERhdGUoTnVtYmVyKHBheWxvYWQuaWF0KSAqIDEwMDApIDogc3VwZXIucHJlcGFyZUNyZWF0ZWRBdChkYXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0b2tlbiB2YWxpZFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWNjZXNzVG9rZW5QYXlsb2FkICYmIHN1cGVyLmlzVmFsaWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGV4cGlyYXRpb24gZGF0ZSA6XG4gICAqIC0gZXhwIGlmIHNldCxcbiAgICogLSBzdXBlci5nZXRFeHBEYXRlKCkgb3RoZXJ3aXNlXG4gICAqIEByZXR1cm5zIERhdGVcbiAgICovXG4gIGdldFRva2VuRXhwRGF0ZSgpOiBEYXRlIHtcbiAgICBpZiAodGhpcy5hY2Nlc3NUb2tlblBheWxvYWQgJiYgdGhpcy5hY2Nlc3NUb2tlblBheWxvYWQuaGFzT3duUHJvcGVydHkoJ2V4cCcpKSB7XG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoMCk7XG4gICAgICBkYXRlLnNldFVUQ1NlY29uZHModGhpcy5hY2Nlc3NUb2tlblBheWxvYWQuZXhwKTtcbiAgICAgIHJldHVybiBkYXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuZ2V0VG9rZW5FeHBEYXRlKCk7XG4gICAgfVxuICB9XG59XG4iXX0=