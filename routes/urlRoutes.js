const express = require("express");
const { createShortUrl, redirectUrl, getStats, getAllUrls } = require("../controllers/urlController");
const { authenticateToken, verifyUserAccess } = require("../middleware/auth");
const { autoLog } = require("../controllers/logController");
const router = express.Router();

// Protected routes (require authentication)
router.post("/shorturls", 
    authenticateToken, 
    verifyUserAccess, 
    autoLog('CREATE'), 
    createShortUrl
);

router.get("/shorturls", 
    authenticateToken, 
    verifyUserAccess, 
    autoLog('LIST'), 
    getAllUrls
);

router.get("/shorturls/:code", 
    authenticateToken, 
    verifyUserAccess, 
    autoLog('STATS'), 
    getStats
);

// Public route (no authentication required for redirection)
router.get("/:code", autoLog('REDIRECT'), redirectUrl);

module.exports = router;
