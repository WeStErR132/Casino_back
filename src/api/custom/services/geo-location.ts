import geoip from 'geoip-lite';

export interface GeoLocationData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  language: string;
}

interface ExternalApiResponse {
  status: 'success' | 'fail';
  message?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  timezone?: string;
}

export interface GeoLocationService {
  getLocationByIP(ip: string): Promise<GeoLocationData | null>;
  getLanguageByCountry(country: string): string;
}

class GeoLocationServiceImpl implements GeoLocationService {
  private readonly countryLanguageMap: Record<string, string> = {
    'US': 'en',
    'GB': 'en', 
    'CA': 'en',
    'AU': 'en',
    'NZ': 'en',
    'FR': 'fr',
    'BE': 'fr',
    'CH': 'fr',
    'LU': 'fr',
    'MC': 'fr',
    'DE': 'de',
    'AT': 'de',
    'LI': 'de',
    'IT': 'it',
    'SM': 'it',
    'VA': 'it',
    'RU': 'ru',
    'BY': 'ru',
    'KZ': 'ru',
    'KG': 'ru',
    'TJ': 'ru',
    'TM': 'ru',
    'UZ': 'ru',
    'UA': 'uk',
    'ES': 'es',
    'PT': 'pt',
    'NL': 'nl',
    'SE': 'sv',
    'NO': 'no',
    'DK': 'da',
    'FI': 'fi',
    'PL': 'pl',
    'CZ': 'cs',
    'SK': 'sk',
    'HU': 'hu',
    'RO': 'ro',
    'BG': 'bg',
    'HR': 'hr',
    'SI': 'sl',
    'LT': 'lt',
    'LV': 'lv',
    'EE': 'et',
    'GR': 'el',
    'CY': 'el',
    'TR': 'tr',
    'JP': 'ja',
    'KR': 'ko',
    'CN': 'zh',
    'TW': 'zh',
    'HK': 'zh',
    'SG': 'en',
    'MY': 'ms',
    'TH': 'th',
    'VN': 'vi',
    'ID': 'id',
    'PH': 'tl',
    'IN': 'hi',
    'BD': 'bn',
    'LK': 'si',
    'NP': 'ne',
    'MM': 'my',
    'KH': 'km',
    'LA': 'lo',
    'BR': 'pt',
    'AR': 'es',
    'CL': 'es',
    'CO': 'es',
    'PE': 'es',
    'VE': 'es',
    'EC': 'es',
    'BO': 'es',
    'PY': 'es',
    'UY': 'es',
    'MX': 'es',
    'GT': 'es',
    'BZ': 'en',
    'SV': 'es',
    'HN': 'es',
    'NI': 'es',
    'CR': 'es',
    'PA': 'es',
    'CU': 'es',
    'DO': 'es',
    'HT': 'ht',
    'JM': 'en',
    'TT': 'en',
    'BB': 'en',
    'AG': 'en',
    'BS': 'en',
    'ZA': 'en',
    'NG': 'en',
    'KE': 'en',
    'TZ': 'en',
    'UG': 'en',
    'GH': 'en',
    'ET': 'am',
    'EG': 'ar',
    'MA': 'ar',
    'TN': 'ar',
    'DZ': 'ar',
    'LY': 'ar',
    'SD': 'ar',
    'SA': 'ar',
    'AE': 'ar',
    'QA': 'ar',
    'BH': 'ar',
    'KW': 'ar',
    'OM': 'ar',
    'YE': 'ar',
    'IQ': 'ar',
    'JO': 'ar',
    'LB': 'ar',
    'SY': 'ar',
    'IL': 'he',
    'PS': 'ar',
    'IR': 'fa',
    'AF': 'fa'
  };

  async getLocationByIP(ip: string): Promise<GeoLocationData | null> {
    try {
      // Очищаем IP от портов и протоколов
      const cleanIP = ip.replace(/^::ffff:/, '').split(':')[0];
      console.log('Looking up IP:', cleanIP);
      
      // Сначала пробуем geoip-lite
      const geo = geoip.lookup(cleanIP);
      console.log('GeoIP result:', geo);
      
      if (geo && geo.country) {
        const country = geo.country;
        const language = this.getLanguageByCountry(country);
        
        const result = {
          country,
          region: geo.region || 'Unknown',
          city: geo.city || 'Unknown',
          timezone: geo.timezone || 'UTC',
          language
        };
        console.log('GeoIP location result:', result);
        return result;
      }

      // Если geoip-lite не сработал, пробуем внешний API
      console.log('Trying external API for IP:', cleanIP);
      try {
        const response = await fetch(`http://ip-api.com/json/${cleanIP}?fields=status,message,country,countryCode,region,regionName,city,timezone`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json() as ExternalApiResponse;
        
        if (data.status === 'success' && data.countryCode) {
          const country = data.countryCode;
          const language = this.getLanguageByCountry(country);
          
          const result: GeoLocationData = {
            country,
            region: data.regionName || 'Unknown',
            city: data.city || 'Unknown',
            timezone: data.timezone || 'UTC',
            language
          };
          console.log('External API location result:', result);
          return result;
        } else {
          console.log('External API failed:', data.message || 'Unknown error');
        }
      } catch (externalError) {
        console.error('External API error:', externalError);
      }

      // Если ничего не сработало, возвращаем null
      console.log('Could not determine location for IP:', cleanIP);
      return null;
    } catch (error) {
      console.error('Error getting location by IP:', error);
      return null;
    }
  }

  getLanguageByCountry(country: string): string {
    return this.countryLanguageMap[country] || 'en';
  }
}

export default new GeoLocationServiceImpl();
