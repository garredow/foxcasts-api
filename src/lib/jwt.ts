import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from './config';

const client = jwksClient({
  jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`,
});

function getKey(header: any, next: any) {
  client.getSigningKey(header.kid, function (error, key: any) {
    if (error) {
      return next(error);
    }

    const signingKey = key.publicKey || key.rsaPublicKey;
    next(null, signingKey);
  });
}

export async function verifyToken(bearerToken?: string): Promise<JwtPayload | undefined> {
  return new Promise((resolve, reject) => {
    const token = bearerToken?.split(' ')[1];
    if (!token) {
      return reject('No token provided');
    }
    jwt.verify(
      token,
      getKey,
      {
        audience: config.auth0.audience,
        issuer: `https://${config.auth0.domain}/`,
        algorithms: ['RS256'],
      },
      (error, decoded) => {
        if (error) {
          return reject(error);
        }
        resolve(decoded as JwtPayload);
      }
    );
  });
}
