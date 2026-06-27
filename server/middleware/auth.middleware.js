import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.accountStatus !== 'active') throw new Error();
    req.user = user;
    return next();
  } catch {
    res.status(401);
    return next(new Error('Invalid or expired token'));
  }
};
