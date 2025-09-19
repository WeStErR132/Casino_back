/**
 * online-casino controller
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::online-casino.online-casino', ({ strapi }) => ({
  async find(ctx: Context) {
    try {
      // Получаем язык из query параметров, геолокации или заголовков
      const geoLocation = ctx.state.geoLocation;
      const language = ctx.query.locale || 
                     geoLocation?.language || 
                     ctx.request.headers['accept-language']?.split(',')[0]?.split('-')[0] || 
                     'en';
      
      // Добавляем фильтрацию по языку
      const query = {
        ...ctx.query,
        locale: language,
        populate: {
          Rating_Pic: true
        }
      };

      // Используем новый метод findWithFallback из сервиса
      const data = await strapi.service('api::online-casino.online-casino').findWithFallback(query);
      
      return { data };
    } catch (error) {
      console.error('Error in online-casino find:', error);
      return ctx.badRequest('Error fetching online casinos');
    }
  }
}));
