const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

exports.authorize = (roles = []) => {
     if (typeof roles === "string") {
          roles = [roles];
     }

     return [
          // authorize based on user role
          (req, res, next) => {
               const authHeader = req.headers["authorization"];
               const token = authHeader && authHeader.split(" ")[1];

               if (token == null) return res.sendStatus(401);

               jwt.verify(token, secret, (err, user) => {
                    if (err) return res.sendStatus(403);
                    req.user = user;
                    if (roles.length && !roles.includes(req.user.role)) {
                         return res.status(401).json({ message: "Unauthorized" });
                    }
                    next();
               });
          },
     ];
};

exports.verify = (token) => {
     return jwt.verify(token, secret);
};
