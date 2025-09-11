import { Context, Next } from 'koa';
import geoLocationService, { GeoLocationData } from '../../api/custom/services/geo-location';

interface StrapiContext extends Context {
  state: {
    geoLocation?: GeoLocationData;
  };
  query: {
    locale?: string;
  };
}

export default (config: any, { strapi }: any) => {
  return async (ctx: StrapiContext, next: Next) => {
    try {
      // Получаем IP адрес из заголовков запроса
      const forwarded = ctx.request.headers['x-forwarded-for'];
      const realIP = ctx.request.headers['x-real-ip'];
      const clientIP = ctx.request.ip;
      

      console.log('=== IP Detection Debug ===');
      console.log('x-forwarded-for:', forwarded);
      console.log('x-real-ip:', realIP);
      console.log('ctx.request.ip:', clientIP);
      console.log('All headers:', ctx.request.headers);

      // Определяем реальный IP адрес клиента
      let ip = '';
      if (forwarded) {
        ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
        console.log('Using forwarded IP:', ip);
      } else if (realIP) {
        ip = Array.isArray(realIP) ? realIP[0] : realIP;
        console.log('Using real IP:', ip);
      } else {
        ip = clientIP;
        console.log('Using client IP:', ip);
      }

      // Если IP не найден, используем заглушку для разработки
      if (!ip || ip === '::1' || ip === '127.0.0.1') {
        console.log('IP is localhost, using test IP');
        ip = '8.8.8.8'; // Google DNS для тестирования
      }

      console.log('Final IP to lookup:', ip);
      console.log('========================');

      // Получаем геолокацию
      console.log('Looking up geolocation for IP:', ip);
      const locationData = await geoLocationService.getLocationByIP(ip);
      
      if (locationData) {
        console.log('Geolocation found:', locationData);
        // Добавляем информацию о геолокации в контекст
        ctx.state.geoLocation = locationData;
        
        // Если язык не указан в query параметрах, устанавливаем его на основе геолокации
        if (!ctx.query.locale && locationData.language) {
          console.log('Setting locale from geolocation:', locationData.language);
          ctx.query.locale = locationData.language;
        }
      } else {
        console.log('No geolocation data found for IP:', ip);
      }
    } catch (error) {
      console.error('Error in geo-location middleware:', error);
      // Продолжаем выполнение даже при ошибке
    }

    await next();
  };
};

