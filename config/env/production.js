/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {
  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMysqlServer'
  // },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  // port: 80,

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  // log: {
  //   level: "silent"
  // }

  globals: {
    // Base URL for advice content
    adviceBaseUrl: process.env.ADVICE_BASE_URL,

    // AWS SNS
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    serviceRegion: process.env.AWS_DEFAULT_REGION,
    snsTopicReferral: process.env.SNS_TOPIC_ARN_REFERRAL,

    // Base URL for the Daily Shine content
    dailyShineBaseUrl: process.env.DAILY_SHINE_BASE_URL,

    // External url where Shine jobs are posted
    jobsRedirectUrl: process.env.JOBS_REDIRECT_URL,

    // MailChimp
    mailchimpApiAuthUser: process.env.MAILCHIMP_API_USER,
    mailchimpApiAuthPass: process.env.MAILCHIMP_API_PASSWORD,
    mailchimpApiUrl: process.env.MAILCHIMP_API_URL,
    mailchimpListId: process.env.MAILCHIMP_LIST_ID,

    // The Mobile Commons URL to send join requests to
    mcJoinUrl: 'https://secure.mcommons.com/profiles/join',

    // Mobile Commons auth
    mobileCommonsUser: process.env.MOBILECOMMONS_USER,
    mobileCommonsPassword: process.env.MOBILECOMMONS_PASSWORD,

    // The Photon API URL
    photonApiUrl: process.env.PHOTON_API_URL,

    // Base URL for Shine Premium (web conversion) landing page.
    premiumShineBaseUrl: process.env.PREMIUM_SHINE_BASE_URL,
  },
};
