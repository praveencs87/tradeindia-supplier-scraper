# TradeIndia Supplier Scraper

**Extract highly valuable B2B supplier profiles, company names, cities, trust seals, and product snippets directly from TradeIndia category pages.**

TradeIndia is one of India's largest B2B marketplaces. Paired with our IndiaMART scraper, this tool allows you to build incredibly comprehensive databases of Indian manufacturers, wholesalers, and exporters.

This actor uses a high-speed static scraper built on `Cheerio` and `got-scraping` (for browser TLS fingerprinting to bypass bot protections). It instantly sweeps through category pages to compile highly structured B2B lead datasets.

## What can this Actor do?

- ✅ **Supplier Extraction** - Extracts the supplier/company name and a direct link to their TradeIndia profile.
- ✅ **Location Data** - Grabs the city or region where the supplier is based.
- ✅ **Trust & Verification** - Extracts trust badges (e.g., "Super Seller", "Trust Stamp") so you can filter for high-quality manufacturers.
- ✅ **Experience** - Extracts the "Years in Business" badge if the supplier prominently displays it.
- ✅ **Pricing & Products** - Extracts the primary product advertised in the card and any visible pricing snippets.

## Why use this Actor?

- 🎯 **B2B Lead Generation** - Instantly build a database of manufacturers or wholesalers for your specific niche.
- 🤝 **Procurement & Sourcing** - Find the top-rated, Verified suppliers in specific cities.
- 📊 **Market Coverage** - Don't miss out on suppliers who list on TradeIndia instead of IndiaMART.

## How to use it

1. Enter a list of TradeIndia category URLs into the **Category URLs** field.
   - *(e.g., `https://www.tradeindia.com/manufacturers/cotton-fabric.html`)*
2. Set the **Max Suppliers to Extract** limit to prevent massive categories from running endlessly (default is 500).
3. Click Start!

## How much does it cost?

This actor uses a **Pay-Per-Event (PPE)** pricing model. You only pay for the exact number of suppliers extracted!
- **$1.50 per 1,000 suppliers extracted.**

## Output Example

When a supplier is extracted, the actor pushes this data to your dataset:

```json
{
  "companyName": "Surat Textile Mills",
  "profileUrl": "https://www.tradeindia.com/Seller-123456-Surat-Textile-Mills/",
  "location": "Surat, Gujarat",
  "trustBadges": ["Super Seller", "Trust Stamp"],
  "yearsInBusiness": "15 Years",
  "productSnippet": "100% Pure Cotton Fabric",
  "price": "50 INR/Meter",
  "scrapedAt": "2023-10-25T15:00:00.000Z"
}
```
