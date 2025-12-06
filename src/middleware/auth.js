import { auth } from 'express-oauth2-jwt-bearer';


export const checkJwt = auth({
  audience: 'https://api.gldimportaciones.com',
  issuerBaseURL: 'https://claudioparedes.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});


export const requireAdmin = (req, res, next) => {
  
  const userEmail = req.auth?.payload?.email || req.auth?.payload?.['https://api.gldimportaciones.com/email'];
  
  console.log('🔐 Verificando admin - Email del token:', userEmail);
  
  if (userEmail !== 'claudioparedesarbelo@gmail.com') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo administradores autorizados.'
    });
  }
  
  next();
};


export const protectAdmin = [checkJwt, requireAdmin];