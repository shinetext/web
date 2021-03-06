/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

var routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  '/': 'WebViewController.app',
  '/500': {
    view: '500',
  },
  '/about': 'WebViewController.about',
  '/allraise': 'WebViewController.allraise',
  '/app': 'WebViewController.app',
  '/advice': 'WebViewController.advice',
  '/articles': 'WebViewController.advice',
  '/articles/*': 'WebViewController.articlesRedirect',
  '/bumble': 'WebViewController.bumble',
  '/c/:campaign': 'WebViewController.campaigns',
  '/c/:campaign/share': 'WebViewController.campaignReferral',
  '/campaigns/:campaign': 'WebViewController.campaigns',
  '/campaigns/:campaign/share': 'WebViewController.campaignReferral',
  '/careers': 'WebViewController.careers',
  '/coming-soon': 'WebViewController.splash',
  '/coming-soon-android': 'WebViewController.androidSignUp',
  '/confirmation': 'WebViewController.confirmation',
  '/daily': 'WebViewController.daily',
  '/dreamforce': 'WebViewController.dreamforce',
  '/faq': 'WebViewController.faq',
  '/gift': 'WebViewController.gift',
  '/invite': 'WebViewController.invite',
  '/mentalhealthbreak': 'WebViewController.mentalhealthbreak',
  '/home': 'WebViewController.app',
  '/jobs': 'WebViewController.jobs',
  '/nod': 'WebViewController.nod',
  '/quiz': 'WebViewController.quiz',
  '/p/:partner': 'WebViewController.partners',
  '/pandemic-self-care-toolkit': 'WebViewController.virusanxiety',
  '/partners/:partner': 'WebViewController.partners',
  '/podcast': 'WebViewController.podcast',
  '/mealtime': 'WebViewController.mealtime',
  '/privacy-policy': {
    view: 'privacy-policy',
    locals: {
      title: 'Privacy Policy | Shine',
      layout: 'layouts/subpage.layout',
    },
  },
  '/referrals': {
    view: 'referrals',
    locals: {
      title: 'Referrals | Shine',
      layout: 'layouts/subpageCustomHeader.layout',
      headerImage: 'images/refer-header.gif',
      headerText: 'Shine with friends!',
    },
  },
  '/referrals/:phone': 'WebViewController.myReferral',
  '/sms-settings': 'WebViewController.smsSettings',
  '/speakers': {
    view: 'speakers',
    locals: {
      title: 'Speakers | Shine',
      layout: 'layouts/subpage.layout',
    },
  },
  '/squad': 'WebViewController.squad',
  '/swag': {
    view: 'swag-page',
    locals: {
      title: 'Swag | Shine',
      layout: 'layouts/subpage.layout',
      hideFooterCta: true,
    },
  },
  '/terms-of-service': {
    view: 'terms-of-service',
    locals: {
      title: 'Terms of Service | Shine',
      layout: 'layouts/subpage.layout',
    },
  },
  '/try-messenger': {
    view: 'try-messenger',
    locals: {
      title: 'Try Messenger | Shine',
      layout: 'layouts/subpage.layout',
    },
  },
  '/virusanxiety': 'WebViewController.virusanxiety',
  '/year1': {
    view: 'year1',
    locals: {
      layout: 'layouts/scalable.layout',
    },
  },

  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/

  'post /joinSplashList': 'WebActionsController.joinSplashList',
  'post /join': 'WebActionsController.join',
  'post /save-settings': 'WebActionsController.saveSettings',
  'post /sms-invite': 'WebActionsController.smsInvite',

  '/:promo': {
    controller: 'WebViewController',
    action: 'promoRedirect',
    skipAssets: true,
  },
};

/**
 * Routes that should not exist on production can go here.
 */
if (process.env.NODE_ENV !== 'production') {
  routes['post /mc-join'] = 'TestController.ok';
}

module.exports.routes = routes;
