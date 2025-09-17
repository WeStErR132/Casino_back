/**
 * casino-bonus service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::casino-bonus.casino-bonus', ({ strapi }) => ({
  /**
   * Получает карточки бонусов с фоллбэком на английский язык
   * Если переведенных карточек меньше чем английских, дополняет недостающие карточки с английского
   */
  async findWithFallback(params: any = {}) {
    const requestedLocale = params.locale || 'en';
    const defaultLocale = 'en';
    
    try {
      // Запрашиваем карточки на запрошенном языке
      const translatedItems = await strapi.entityService.findMany('api::casino-bonus.casino-bonus', {
        ...params,
        locale: requestedLocale,
        populate: {
          Logo: true
        }
      });

      // Если запрошенный язык - английский, просто возвращаем результат
      if (requestedLocale === defaultLocale) {
        return translatedItems;
      }

      // Запрашиваем карточки на английском языке
      const defaultItems = await strapi.entityService.findMany('api::casino-bonus.casino-bonus', {
        ...params,
        locale: defaultLocale,
        populate: {
          Logo: true
        }
      });

      // Если переведенных карточек меньше чем дефолтных, дополняем
      if (translatedItems.length < defaultItems.length) {
        // Получаем ID переведенных карточек для исключения дублей
        const translatedIds = new Set(translatedItems.map(item => item.id));
        
        // Находим карточки которые есть на английском, но нет в переводе
        const missingItems = defaultItems.filter(item => !translatedIds.has(item.id));
        
        // Определяем сколько карточек нужно добавить
        const itemsToAdd = Math.min(missingItems.length, defaultItems.length - translatedItems.length);
        
        // Добавляем недостающие карточки
        const fallbackItems = missingItems.slice(0, itemsToAdd);
        
        return [...translatedItems, ...fallbackItems];
      }

      return translatedItems;
    } catch (error) {
      console.error('Error in casino-bonus findWithFallback:', error);
      throw error;
    }
  }
}));
