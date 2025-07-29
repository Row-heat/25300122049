const express = require("express");
const { createShortUrl, redirectUrl, getStats, getAllUrls } = require("../controllers/urlController");
const { authenticateToken, optionalAuth, verifyUserAccess } = require("../middleware/auth");
const router = express.Router();

// Routes with optional authentication (work better with or without auth)
router.post("/shorturls", 
    optionalAuth, 
    createShortUrl
);

router.get("/shorturls", 
    optionalAuth, 
    getAllUrls
);

router.get("/shorturls/:code", 
    optionalAuth, 
    getStats
);

// Public route (no authentication required for redirection)
router.get("/:code", redirectUrl);

module.exports = router;
