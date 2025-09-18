import type { Schema, Struct } from '@strapi/strapi';

export interface PageComponentsInfoBlock extends Struct.ComponentSchema {
  collectionName: 'components_page_components_info_blocks';
  info: {
    displayName: 'Info_block';
  };
  attributes: {
    Description: Schema.Attribute.String;
    Name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'page-components.info-block': PageComponentsInfoBlock;
    }
  }
}
