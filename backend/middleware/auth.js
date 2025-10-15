const jwt = require('jsonwebtoken');

// Chave secreta para JWT
const JWT_SECRET = 'produtivamente_secret_key';

module.exports = function(req, res, next) {
  // Obter token do header
  const token = req.header('x-auth-token');
  
  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }
  
  // Verificar token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};
