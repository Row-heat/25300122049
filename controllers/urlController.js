const { nanoid } = require("nanoid");
const dayjs = require("dayjs");

let urlDatabase = {}; // In-memory store

// Create Short URL
const createShortUrl = async (req, res) => {
    try {
        const { url, validity, shortcode } = req.body;
        const user = req.user; // From auth middleware
        
        // Validate URL
        if (!url || !/^https?:\/\/.+/i.test(url)) {
            return res.status(400).json({ 
                message: "Invalid URL format. URL must start with http:// or https://" 
            });
        }

        // Validate custom shortcode if provided
        if (shortcode && (!/^[a-zA-Z0-9_-]+$/.test(shortcode) || shortcode.length > 20)) {
            return res.status(400).json({ 
                message: "Invalid shortcode. Use only alphanumeric characters, hyphens, and underscores (max 20 chars)" 
            });
        }

        // Validate validity period
        if (validity && (validity < 1 || validity > 10080)) { // Max 1 week
            return res.status(400).json({ 
                message: "Validity must be between 1 and 10080 minutes (1 week)" 
            });
        }

        let code = shortcode || nanoid(6);
        if (urlDatabase[code]) {
            return res.status(409).json({ message: "Shortcode already exists" });
        }

        const expiryMinutes = validity || process.env.DEFAULT_EXPIRY_MINUTES || 30;
        const expiryTime = dayjs().add(expiryMinutes, "minute").toISOString();
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

        urlDatabase[code] = {
            originalUrl: url,
            createdAt: new Date().toISOString(),
            expiry: expiryTime,
            clicks: [],
            createdBy: user ? {
                email: user.email,
                name: user.name,
                rollNo: user.rollNo,
                clientID: user.clientID
            } : null
        };

        return res.status(201).json({
            shortLink: `${baseUrl}/${code}`,
            expiry: expiryTime,
            code: code,
            createdBy: user ? user.name : "Anonymous"
        });
    } catch (error) {
        console.error('Error creating short URL:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Redirect to original URL
const redirectUrl = async (req, res) => {
    try {
        const { code } = req.params;
        const entry = urlDatabase[code];

        if (!entry) {
            return res.status(404).json({ message: "Shortcode not found" });
        }

        if (dayjs().isAfter(entry.expiry)) {
            return res.status(410).json({ message: "Link expired" });
        }

        // Log the click
        entry.clicks.push({
            timestamp: new Date().toISOString(),
            source: req.get("Referer") || "direct",
            location: req.ip,
            userAgent: req.get("User-Agent") || "unknown"
        });

        return res.redirect(entry.originalUrl);
    } catch (error) {
        console.error('Error redirecting URL:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Retrieve statistics
const getStats = async (req, res) => {
    try {
        const { code } = req.params;
        const entry = urlDatabase[code];

        if (!entry) {
            return res.status(404).json({ message: "Shortcode not found" });
        }

        return res.status(200).json({
            originalUrl: entry.originalUrl,
            createdAt: entry.createdAt,
            expiry: entry.expiry,
            totalClicks: entry.clicks.length,
            clickDetails: entry.clicks,
            isExpired: dayjs().isAfter(entry.expiry),
            createdBy: entry.createdBy
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get all URLs (for admin/debugging purposes)
const getAllUrls = async (req, res) => {
    try {
        const user = req.user;
        let urls = Object.keys(urlDatabase).map(code => ({
            code,
            originalUrl: urlDatabase[code].originalUrl,
            createdAt: urlDatabase[code].createdAt,
            expiry: urlDatabase[code].expiry,
            totalClicks: urlDatabase[code].clicks.length,
            isExpired: dayjs().isAfter(urlDatabase[code].expiry),
            createdBy: urlDatabase[code].createdBy
        }));

        // If user is authenticated, they can see all URLs
        // Otherwise, only show public URLs (optional filter)
        
        return res.status(200).json({
            total: urls.length,
            urls: urls,
            requestedBy: user ? user.name : "Anonymous"
        });
    } catch (error) {
        console.error('Error getting all URLs:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createShortUrl, redirectUrl, getStats, getAllUrls };
