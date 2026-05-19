
export interface OpenFeed {
  id: string;
  name: string;
  url: string;
  category: 'News' | 'Weather' | 'Tech' | 'Finance' | 'Science' | 'Gaming' | 'Crypto';
}

export const RSS_FEEDS: OpenFeed[] = [
  // Tech
  { id: 'hn', name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'Tech' },
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },
  { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Tech' },
  { id: 'theverge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech' },
  { id: 'engadget', name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'Tech' },

  // News
  { id: 'bbc', name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'News' },
  { id: 'nytimes_world', name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'News' },
  { id: 'reuters', name: 'Reuters Global', url: 'https://api.reuters.ai/rss/topnews', category: 'News' },
  { id: 'npr', name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml', category: 'News' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'News' },

  // Finance
  { id: 'wsj_markets', name: 'WSJ Markets', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'Finance' },
  { id: 'cnbc', name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', category: 'Finance' },
  { id: 'ft', name: 'Financial Times', url: 'https://www.ft.com/?format=rss', category: 'Finance' },

  // Science
  { id: 'nasa', name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'Science' },
  { id: 'nature', name: 'Nature', url: 'https://www.nature.com/nature.rss', category: 'Science' },
  { id: 'sciam', name: 'Scientific American', url: 'https://rss.sciam.com/ScientificAmerican-Global', category: 'Science' },
  
  // Gaming
  { id: 'ign', name: 'IGN', url: 'https://feeds.ign.com/ign/news', category: 'Gaming' },
  { id: 'gamespot', name: 'GameSpot', url: 'https://www.gamespot.com/feeds/news/', category: 'Gaming' },
  { id: 'polygon', name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', category: 'Gaming' },

  // Crypto
  { id: 'coindesk', name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'Crypto' },
  { id: 'cointelegraph', name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', category: 'Crypto' }
];

export class OpenApiService {
  /**
   * Fetches and parses RSS without external dependencies using native DOMParser
   */
  static async fetchRSS(url: string): Promise<any[]> {
    try {
      // Note: In a browser environment, this often requires a proxy or server-side fetch
      // We'll route this through our server bridge for unrestricted access
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      const text = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const items = xmlDoc.querySelectorAll("item");
      
      return Array.from(items).map(item => ({
        title: item.querySelector("title")?.textContent,
        link: item.querySelector("link")?.textContent,
        description: item.querySelector("description")?.textContent,
        pubDate: item.querySelector("pubDate")?.textContent,
      })).slice(0, 10);
    } catch (e) {
      console.error("RSS Perception Failure:", e);
      return [];
    }
  }

  /**
   * Open-Meteo: No API Key required for weather data
   */
  static async getLocalWeather(lat: number, lon: number) {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    return await res.json();
  }

  /**
   * Browser Geolocation API with fallback to ipapi.co (which is HTTPS)
   */
  static async getGeoLocation(): Promise<any> {
    return new Promise(async (resolve) => {
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
           async (position) => {
             // Got it from browser
             resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                city: "GPS Location",
                countryCode: "GPS",
                query: "From Device"
             });
           },
           async (err) => {
             // Fallback
             console.warn("Geolocation permission denied/failed. Falling back to IP-based location.", err);
             try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                resolve({
                   lat: data.latitude,
                   lon: data.longitude,
                   city: data.city,
                   countryCode: data.country_code,
                   query: data.ip
                });
             } catch(e) { resolve(null); }
           }
         );
      } else {
         try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            resolve({
               lat: data.latitude,
               lon: data.longitude,
               city: data.city,
               countryCode: data.country_code,
               query: data.ip
            });
         } catch(e) { resolve(null); }
      }
    });
  }

  /**
   * Public APIs Directory: Fetch available skills dynamically
   */
  static async searchFreeAPIs(query: string) {
    const res = await fetch(`https://api.publicapis.org/entries?title=${query}`);
    return await res.json();
  }

  static async searchBooks(query: string) {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
    return await res.json();
  }

  static async getRandomUser() {
    const res = await fetch(`https://randomuser.me/api/`);
    return await res.json();
  }

  static async searchWikipedia(query: string) {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&origin=*&format=json`);
    return await res.json();
  }

  static async getSpaceNews() {
    const res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=5`);
    return await res.json();
  }
}
