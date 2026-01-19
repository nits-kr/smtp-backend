const httpStatus = require('http-status');
const { emailService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { Email } = require('../models');

const TRANSPARENT_GIF_BUFFER = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

const trackOpen = catchAsync(async (req, res) => {
    const { trackingId } = req.params;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Update asynchronously without waiting (fire and forget for performance)
    Email.findOneAndUpdate(
        { trackingId },
        {
            $push: { opens: { timestamp: new Date(), ip, userAgent } },
            $inc: { openCount: 1 }
        }
    ).exec();

    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': TRANSPARENT_GIF_BUFFER.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.end(TRANSPARENT_GIF_BUFFER);
});

const trackClick = catchAsync(async (req, res) => {
    const { trackingId } = req.params;
    const { url } = req.query;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (!url) {
        return res.status(httpStatus.BAD_REQUEST).send('URL is required');
    }

    try {
        await Email.findOneAndUpdate(
            { trackingId },
            {
                $push: { clicks: { timestamp: new Date(), url, ip, userAgent } },
                $inc: { clickCount: 1 }
            }
        );
    } catch (error) {
        console.error('Error tracking click:', error);
    }

    // Always redirect, even if tracking failed
    res.redirect(url);
});

module.exports = {
    trackOpen,
    trackClick
};
