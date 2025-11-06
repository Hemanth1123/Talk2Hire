const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ msg: "User not found" });

    if (user.role !== "admin")
      return res.status(403).json({ msg: "Admin access required" });

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

