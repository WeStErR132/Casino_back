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
      
      if (!ip) {
        return ctx.badRequest('IP address is required');
      }

      const locationData = await geoLocationService.getLocationByIP(ip);

      if (!locationData) {
        return ctx.badRequest('Unable to determine location');
      }

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
