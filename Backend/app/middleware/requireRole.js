export default function requireRole(...roles) {
  return function checkRole(req, res, next) {
    if (!req.actor) {
      return res.status(401).json({ message: "Sign in required" });
    }
    if (!roles.includes(req.actor.role)) {
      return res.status(403).json({ message: "You do not have access to this action" });
    }
    return next();
  };
}
