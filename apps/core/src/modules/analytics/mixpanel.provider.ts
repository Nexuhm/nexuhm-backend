import * as mixpanel from 'mixpanel';

export const mixpanelProvider = 'MIXPANEL_PROVIDER';

export const mixpanelProviderFactory = {
  provide: mixpanelProvider,
  useFactory: () => {
    return mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN);
  },
};
