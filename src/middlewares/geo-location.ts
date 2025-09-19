import { Context, Next } from 'koa';
import geoLocationService from '../api/custom/services/geo-location';

export default (config: any, { strapi }: any) => {
  return async (ctx: Context, next: Next) => {
    try {
      // Получаем IP адрес из заголовков запроса
      const forwarded = ctx.request.headers['x-forwarded-for'];
      const realIP = ctx.request.headers['x-real-ip'];
      const clientIP = ctx.request.ip;
      
      // Определяем реальный IP адрес клиента
      let ip = '';
      if (forwarded) {
        ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
      } else if (realIP) {
        ip = Array.isArray(realIP) ? realIP[0] : realIP;
      } else {
        ip = clientIP;
      }

      // Если IP не найден, используем заглушку для разработки
      if (!ip || ip === '::1' || ip === '127.0.0.1') {
        ip = '8.8.8.8'; // Google DNS для тестирования
      }

      // Получаем геолокацию
      const locationData = geoLocationService.getLocationByIP(ip);
      
      if (locationData) {
        // Добавляем информацию о геолокации в контекст
        ctx.state.geoLocation = locationData;
        
        // Если язык не указан в query параметрах, устанавливаем его на основе геолокации
        if (!ctx.query.locale && (await locationData).language) {
          ctx.query.locale = (await locationData).language;
        }
      }
    } catch (error) {
      console.error('Error in geo-location middleware:', error);
      // Продолжаем выполнение даже при ошибке
    }

    await next();
  };
};

