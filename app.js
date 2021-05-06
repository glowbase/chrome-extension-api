const express = require('express');
const cors = require('cors');
const axios = require('axios');

const api = express();
api.use(cors());

const categories = {
    22: 'Accessibility',
    10: 'Blogging',
    15: 'By Google',
    11: 'Developer Tools',
    14: 'Fun',
    6: 'News & Weather',
    28: 'Photos',
    7: 'Productivity',
    38: 'Search Tools',
    12: 'Shopping',
    1: 'Social & Communication',
    13: 'Sports'
};

function extractText(text, start, end) {
    try {
        const temp = text.split(start)[1];

        return temp.substring(0, temp.indexOf(end));
    } catch (error) {
        console.log(error);
    }
}

api.get('/api/information/', async (res, req) => {
    const { id } = res.query;

    if (!id) return req.json({
        success: false,
        message: 'No extension id provided'
    });

    const ids = id.split(',');
    const idsRes = [];

    let index = 1;

    ids.forEach(async id => {
        const { data:html } = await axios('https://chrome.google.com/webstore/detail/' + id);
    
        const title = extractText(html, '<title>', '</title>').replace(' - Chrome Web Store', '');
        const icon = extractText(html, '<meta property=\"og:image\" content=\"', '">');
        const version = extractText(html, '<meta itemprop=\"version\" content=\"', '\"/>');
        const downloads = extractText(html, '<meta itemprop=\"interactionCount\" content=\"UserDownloads:', '\"/>');
        const rating = extractText(html, '<div class=\"rsw-stars\" title=\"Average rating: ', '\">');
        const updated = extractText(html, '<span class=\"C-b-p-D-Xe h-C-b-p-D-xh-hh\">', '</span>');
        const size = extractText(html, '<span class=\"C-b-p-D-Xe h-C-b-p-D-za\">', '</span>');
        const description = extractText(html, '<pre class=\"C-b-p-j-Oa\">', '</pre>');
        const category = extractText(html, '<Attribute name=\"category\">', '</Attribute>').split('_')[0];

        idsRes.push({
            title: title,
            id: id,
            icon: icon,
            version: version,
            downloads: downloads,
            rating: rating,
            last_updated: updated,
            size: size,
            description: description,
            category: categories[category]
        });

        if (index === ids.length) {
            req.json({
                success: true,
                data: idsRes
            });
        }

        index++;
    });
});

api.listen(3000, () => {
    console.clear();
    console.log('LISTENING ON 3000');
});