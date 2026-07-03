import { armKillSwitch, disarmKillSwitch } from './utils/timeoutManager.js';
import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

await Actor.init();

try {
    const input = await Actor.getInput();
    if (!input || !input.categoryUrls || input.categoryUrls.length === 0) {
        throw new Error('categoryUrls input is required!');
    }

    const { categoryUrls, maxSuppliers = 500 } = input;

    let totalSuppliersExtracted = 0;

    const crawler = new CheerioCrawler({
        maxConcurrency: 5,
        maxRequestRetries: 3,
        
        async requestHandler({ request, $, log }) {
            const url = request.url;
            log.info(`Scraping TradeIndia category: ${url}`);
            
            // Wait/check if it's blocked by Cloudflare/Bot protection
            if ($('title').text().toLowerCase().includes('just a moment') || $('title').text().toLowerCase().includes('cloudflare')) {
                throw new Error('Blocked by Cloudflare challenge. Retrying...');
            }

            // TradeIndia listings usually sit in cards
            const cards = $('.company-card, .listing-card, .supplier-card, li.list-item').toArray();
            let suppliersOnPage = 0;

            for (const card of cards) {
                if (totalSuppliersExtracted >= maxSuppliers) break;

                const el = $(card);
                
                // Company Name & URL
                let companyName = el.find('h2.company-name, h3.company-name, .co-name, .c-name').text().trim() || null;
                let profileUrl = el.find('.company-name a, .co-name a, a.c-name').attr('href') || null;
                
                if (profileUrl && !profileUrl.startsWith('http')) {
                    profileUrl = `https://www.tradeindia.com${profileUrl.startsWith('/') ? profileUrl : '/' + profileUrl}`;
                }

                // Location
                let location = el.find('.location, .city, .loc').text().trim() || null;
                
                // Product & Price Snippet
                let productSnippet = el.find('h3.product-title, .p-name, .product-name').text().trim() || null;
                let price = el.find('.price, .prc').text().trim() || null;
                if (price) price = price.replace(/\s+/g, ' '); // Clean up extra spaces
                
                // Trust Badges
                const trustBadges = [];
                el.find('img[src*="super-seller"], img[src*="trust-stamp"], .verified-icon').each((_, badge) => {
                    const alt = $(badge).attr('alt') || $(badge).attr('title');
                    if (alt) trustBadges.push(alt.trim());
                    else if ($(badge).attr('src').includes('super-seller')) trustBadges.push('Super Seller');
                    else if ($(badge).attr('src').includes('trust-stamp')) trustBadges.push('Trust Stamp');
                });

                // Years in business
                let yearsInBusiness = el.find('.years, .yr-est').text().trim() || null;
                if (!yearsInBusiness) {
                    const textContent = el.text();
                    const yearMatch = textContent.match(/(\d+)\s+Years/i);
                    if (yearMatch) yearsInBusiness = yearMatch[0];
                }

                // Fallback to checking embedded JSON-LD if DOM is sparse
                if (!companyName) {
                    const jsonLd = el.find('script[type="application/ld+json"]').html();
                    if (jsonLd) {
                        try {
                            const data = JSON.parse(jsonLd);
                            if (data && data.name) companyName = data.name;
                            if (data && data.url) profileUrl = data.url;
                        } catch (e) {
                            // Ignored
                        }
                    }
                }

                if (!companyName) continue; // Skip if still not found

                const output = {
                    companyName,
                    profileUrl,
                    location,
                    trustBadges,
                    yearsInBusiness,
                    productSnippet,
                    price,
                    scrapedAt: new Date().toISOString()
                };

                await Actor.pushData(output);
                
                totalSuppliersExtracted++;
                suppliersOnPage++;
                
                // PPE Monetization
                await Actor.charge({ eventName: 'supplier-extracted', count: 1 });
            }

            log.info(`✅ Extracted ${suppliersOnPage} suppliers from this page. Total so far: ${totalSuppliersExtracted}`);
            
            // Pagination
            if (totalSuppliersExtracted < maxSuppliers) {
                const nextBtn = $('a.next-page, a.next, a[rel="next"]').attr('href');
                if (nextBtn) {
                    let nextUrl = nextBtn.startsWith('http') ? nextBtn : new URL(nextBtn, 'https://www.tradeindia.com').href;
                    log.info(`Enqueueing next page: ${nextUrl}`);
                    await crawler.addRequests([nextUrl]);
                }
            }
        },
        
        async failedRequestHandler({ request, log }) {
            log.error(`Failed to scrape ${request.url} after multiple retries.`);
        },
    });

    log.info(`Starting TradeIndia crawler for ${categoryUrls.length} start URLs...`);
    
    await crawler.addRequests(categoryUrls);
    armKillSwitch(crawler);
    await crawler.run();
    disarmKillSwitch();

    log.info(`🎉 Finished! Extracted ${totalSuppliersExtracted} suppliers.`);
} catch (error) {
    log.error('Actor failed:', error);
    throw error;
}

await Actor.exit();
