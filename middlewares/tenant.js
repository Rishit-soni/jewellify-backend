const attachTenantId = (req, res, next) => {
  if (!req.tenantId) {
    return res.status(403).json({ message: "Tenant ID missing. Authentication required." });
  }
  
  if (req.body && typeof req.body === 'object') {
    req.body.tenantId = req.tenantId;
  }
  
  next();
};

module.exports = { attachTenantId };
