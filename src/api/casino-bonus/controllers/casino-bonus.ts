/**
 * casino-bonus controller
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::casino-bonus.casino-bonus', ({ strapi }) => ({
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
          Logo: true
        }
      };

      // Используем новый метод findWithFallback из сервиса
      const data = await strapi.service('api::casino-bonus.casino-bonus').findWithFallback(query);
      
      return { data };
    } catch (error) {
      console.error('Error in casino-bonus find:', error);
      return ctx.badRequest('Error fetching casino bonuses');
    }
  }
}));
