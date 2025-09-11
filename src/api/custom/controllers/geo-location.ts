import { Context } from 'koa';
import geoLocationService, { GeoLocationData } from '../services/geo-location';

interface GeoLocationResponse {
  success: boolean;
  data?: GeoLocationData;
  message?: string;
}

export default {
  async getLocation(ctx: Context) {
    try {
      // Получаем IP адрес из query параметров (отправляется с фронтенда)
      const ip = ctx.query.ip as string;
      
      console.log('=== Geo-location Controller Debug ===');
      console.log('IP from query params:', ip);
      console.log('Query params:', ctx.query);
      
      // Если IP не передан, возвращаем ошибку
      if (!ip) {
        console.log('No IP provided in query params');
        return ctx.badRequest('IP address is required');
      }

      console.log('Looking up location for IP:', ip);
      const locationData = await geoLocationService.getLocationByIP(ip);

      if (!locationData) {
        console.log('Could not determine location for IP:', ip);
        return ctx.badRequest('Unable to determine location');
      }

      console.log('Location data found:', locationData);
      const response: GeoLocationResponse = {
        success: true,
        data: locationData
      };
      ctx.body = response;
    } catch (error) {
      console.error('Error in geo-location controller:', error);
      ctx.internalServerError('Internal server error');
    }
  },
};
