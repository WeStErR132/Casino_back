export default {
  routes: [
    {
      method: 'GET',
      path: '/geo-location',
      handler: 'geo-location.getLocation',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
