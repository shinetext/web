/**
 * Controller for handling custom actions from the web.
 */

'use strict';

const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));
const Mixpanel = require('mixpanel');
const crypto = require('crypto');

let mixpanel;

if (process.env.MIXPANEL_TOKEN) {
  mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
}
const ReferralCodes = require('@jonuy/referral-codes');

module.exports = {
  /**
   * Mobile Commons opt-in path to send on sign up.
   * https://secure.mcommons.com/campaigns/184541/opt_in_paths/271856
   */
  MOBILE_COMMONS_OPTIN: 'OP09D36BD6C2B25D1D27229D572E932783',

  /**
   * Mobile Commons SMS sent to people who are sending a referral invite.
   */
  MOBILE_COMMONS_INVITE_ALPHA_OPTIN: 'OPA4B8A4D073E4E00B797E5BDA9CD5BB2E',

  /**
   * Mobile Commons SMS sent to people who are receiving a referral invite.
   */
  MOBILE_COMMONS_INVITE_BETA_OPTIN: 'OP1B76DB1410D9C07679F422DB5F09E48A',

  /**
   * Prepares a the POST data for the Mobile Commons submission.
   *
   * @param req {object}
   * @return {object}
   */
  createMobileCommonsRequest: function(req) {
    let data = { form: this.createMobileCommonsFormData(req.body) };
    if (req.body.extras) {
      const keys = Object.keys(req.body.extras);
      for (const key of keys) {
        data.form[`person[${key}]`] = req.body.extras[key];
      }
    }

    // If an array of friends and opt-in path for them are provided, add it to
    // the submission data.
    if (req.body.friends_opt_in_path && req.body.friends.length > 0) {
      data.form['friends_opt_in_path'] = req.body.friends_opt_in_path;

      let friendCounter = 0;
      for (const friend of req.body.friends) {
        if (typeof friend === 'object' && friend.phone) {
          data.form[`friends[${friendCounter}][phone]`] = friend.phone;
          friendCounter++;
        }
      }
    }
    return data;
  },

  /**
   * Create initial form data for Mobile Commons join request
   * Form data depends on if a user is opting in themselves or referring friends
   */
  createMobileCommonsFormData: function(formData) {
    if (formData.betasOnly) {
      return { 'person[phone]': formData.phone };
    } else {
      return {
        'opt_in_path[]': formData.opt_in_path || this.MOBILE_COMMONS_OPTIN,
        'person[first_name]': formData.first_name,
        'person[phone]': formData.phone,
        'person[email]': formData.email,
        'person[send_gifs]':
          typeof formData.send_gifs === 'undefined' ? 'no' : 'yes',
        'person[referral_code]': ReferralCodes.encode(formData.phone),
        'person[date_signed_up]': new Date().toISOString(),
      };
    }
  },

  /**
   * Helper method for updating friend profiles after they've been invited
   * from an Alpha's join request.
   *
   * @param {string} phone Phone number of the inviter
   * @param {array} friends Data on the invitees
   */
  updateFriendProfiles: function(phone, friends) {
    for (const friend of friends) {
      if (typeof friend === 'object' && friend.first_name && friend.phone) {
        // Update the user profiles on Mobile Commons
        const mobilecommonsRequest = {
          url: `https://secure.mcommons.com/api/profile_update`,
          auth: {
            user: sails.config.globals.mobileCommonsUser,
            pass: sails.config.globals.mobileCommonsPassword,
          },
          form: {
            phone_number: friend.phone,
            first_name: friend.first_name,
            referral_code: ReferralCodes.encode(friend.phone),
          },
        };

        request.postAsync(mobilecommonsRequest);

        // Upsert the user profiles on our own Photon backed
        // Particularly necessary for tracking the referred_by value properly.
        let photonRequest = {
          method: 'POST',
          uri: sails.config.globals.photonApiUrl + '/signup',
          json: true,
          body: {
            firstName: friend.first_name,
            phone: friend.phone,
            referredByCode: ReferralCodes.encode(phone),
          },
        };

        request.postAsync(photonRequest);
      }
    }
  },

  joinSplashList: function(req, res) {
    let { EMAIL, FNAME, PHONE, group } = req.body;
    let memberHash = crypto
      .createHash('md5')
      .update(EMAIL.toLowerCase())
      .digest('hex');
    let redirectUrl = '/confirmation';

    const mailchimpUpdateRequest = {
      method: 'PATCH',
      uri: `${sails.config.globals.mailchimpApiUrl}/lists/${
        sails.config.globals.mailchimpListId
      }/members/${memberHash}`,
      json: true,
      auth: {
        user: sails.config.globals.mailchimpApiAuthUser,
        pass: sails.config.globals.mailchimpApiAuthPass,
      },
      body: {
        status: 'subscribed',
        // Subscribe users to Shine Splash App Group
        interests: { e8db15c44a: true },
      },
    };

    const mailchimpSubscribeRequest = {
      method: 'POST',
      uri: `${sails.config.globals.mailchimpApiUrl}/lists/${
        sails.config.globals.mailchimpListId
      }/members`,
      json: true,
      auth: {
        user: sails.config.globals.mailchimpApiAuthUser,
        pass: sails.config.globals.mailchimpApiAuthPass,
      },
      body: {
        email_address: EMAIL,
        status: 'subscribed',
        merge_fields: {
          FNAME: FNAME,
          PHONE: PHONE,
        },
        interests: { e8db15c44a: true }, // Subscribe users to Shine Splash App Group
      },
    };

    return Promise.coroutine(function*() {
      try {
        let patchRequest = yield request.patchAsync(mailchimpUpdateRequest);
        let postRequest;

        if (patchRequest.statusCode === 200) {
          sails.log.info('Successful MailChimp update');
          return res.redirect(redirectUrl);
        } else if (patchRequest.statusCode === 404) {
          postRequest = yield request.postAsync(mailchimpSubscribeRequest);
          if (postRequest && postRequest.statusCode === 200) {
            sails.log.info('Successful MailChimp User Subscribe');
            return res.redirect(redirectUrl);
          } else if (postRequest) {
            sails.log.error(
              'Invalid response received from MailChimp subscribe call.'
            );
            return res.redirect('500');
          }
        } else {
          sails.log.error(
            'Invalid response received from MailChimp update subscriber call.'
          );
          return res.redirect('500');
        }
      } catch (err) {
        sails.log.error(err);
        res.redirect('500');
      }
    })();
  },

  /**
   * Receives a join request and forwards it onto Mobile Commons.
   *
   * POST /join
   */
  join: function(req, res) {
    sails.log.info(
      `Beta's JOIN request: ${req.headers.referer} ${JSON.stringify(
        req.body,
        null,
        2
      )}`
    );

    let redirectUrl;

    // If signing up through partner landing pages, redirect directly to
    // confirmation page.
    if (req.body.partner) {
      redirectUrl = `/confirmation?phone=${req.body.phone}&firstName=${
        req.body.first_name
      }&partner=${req.body.partner}`;
    } else if (req.body.campaign) {
      // Redirect user to referral page if user comes from a campaign page
      // or redirects user to confirmation page if user comes from referral page
      let { phone, campaign } = req.body;
      // If a user has entered friend referral information redirect to confirmation page
      if (req.body.friends) {
        redirectUrl = `/confirmation?campaign=${campaign}`;
      } else {
        redirectUrl = `/campaigns/${campaign}/share?phone=${phone}&campaign=${campaign}`;
      }
    } else {
      redirectUrl = `/sms-settings?phone=${req.body.phone}&firstName=${
        req.body.first_name
      }`;
    }

    let photonRequest = {
      method: 'POST',
      uri: sails.config.globals.photonApiUrl + '/signup',
      json: true,
      body: {
        firstName: req.body.first_name,
        phone: req.body.phone,
        email: req.body.email,
        referredByCode: req.body.referredByCode,
      },
    };

    const joinByReferral =
      typeof req.body.referredByCode === 'string' &&
      req.body.referredByCode.length > 0;

    // Flag indicating the subscription to Mobile Commons was successful
    let mcSubscribeSuccessful = false;

    // Make the Mobile Commons submission
    let that = this;
    request
      .postAsync(
        sails.config.globals.mcJoinUrl,
        this.createMobileCommonsRequest(req)
      )
      .then(function(response) {
        // Mobile Commons responds with a 500 error code for numbers from
        // countries that are not supported by the account.
        if (response.statusCode == 500) {
          throw new ErrorMobileCommonsJoin(response.body);
        } else if (response.statusCode !== 200) {
          throw new Error();
        }

        mcSubscribeSuccessful = true;

        // Since we can't update friend names and phone numbers in the /join
        // request, we're updating their profiles here immediately after
        // the /join.
        if (req.body.friends) {
          that.updateFriendProfiles(req.body.phone, req.body.friends);
        }

        // Post the signup to Photon too
        return request.postAsync(photonRequest);
      })
      .then(function(response) {
        // this function will prepare and send data to publish to SNS referral event

        let referralCode = '';
        if (response.body && typeof response.body.referralCode === 'string') {
          // newUser's referralCode
          referralCode = response.body.referralCode;
        }

        // Prior to sending data to SNS, makes sure that:
        // 1) we have sucessfully added user to MC
        // 2) new user was referred by someone else (presense of referredByCode)
        // 3) new user did not refer themselves (referredByCode and referralCode are the same)
        if (
          mcSubscribeSuccessful &&
          req.body.referredByCode &&
          req.body.referredByCode.length > 0 &&
          req.body.referredByCode !== referralCode
        ) {
          let referrerPhone = ReferralCodes.decode(req.body.referredByCode);

          // GET referrer's referral count and platform id from Photon
          let referralCountRequest = {
            method: 'GET',
            uri:
              sails.config.globals.photonApiUrl + '/referral/' + referrerPhone,
            json: true,
          };

          request
            .getAsync(referralCountRequest)
            .then(resData => {
              if (!resData || !resData.body) {
                sails.log.error(
                  'Invalid response from Photon GET referral/:phone.'
                );
              } else {
                sails.log.info(
                  `Photon GET referral/:phone ${JSON.stringify(resData.body)}`
                );

                let referralData = {
                  newUser: {
                    platform: 'sms',
                    platformId: response.body.id,
                    referralCode,
                  },
                  referrer: {
                    platform: 'sms',
                    platformId: resData.body.id,
                    referralCode: req.body.referredByCode,
                    referralCount: resData.body.referralCount,
                  },
                };
                sails.log.info(`${
                  req.body.first_name
                } with phone # ${referrerPhone} just signed up. ${JSON.stringify(
                  referralData,
                  null,
                  2
                )}
                  Publishing SNS event...`);

                SnsService.publishEvent(
                  sails.config.globals.snsTopicReferral,
                  referralData
                );
              }
            })
            .catch(err => {
              sails.log.error(`Error getting Referral Count ${err}`);
            });
        }

        // Adds as a subscriber to MailChimp if we have an email
        if (typeof req.body.email === 'string' && req.body.email.length > 0) {
          // @todo Implement additional email validation?
          // @todo Not currently handling failed API calls
          const mailchimpRequest = {
            method: 'POST',
            uri: `${sails.config.globals.mailchimpApiUrl}/lists/${
              sails.config.globals.mailchimpListId
            }/members`,
            json: true,
            auth: {
              user: sails.config.globals.mailchimpApiAuthUser,
              pass: sails.config.globals.mailchimpApiAuthPass,
            },
            body: {
              email_address: req.body.email,
              status: 'subscribed',
              merge_fields: {
                FNAME: req.body.first_name,
                PHONE: req.body.phone,
                REFERRAL: referralCode,
              },
            },
          };

          request
            .postAsync(mailchimpRequest)
            .then(response => {
              if (!response || !response.body) {
                sails.log.error(
                  'Invalid response received from MailChimp subscribe call.'
                );
              } else {
                sails.log.info('Successful MailChimp subscribe');
                sails.log.info(`  id: ${response.body.id}`);
                sails.log.info(
                  `  unique_email_id: ${response.body.unique_email_id}`
                );
              }
            })
            .catch(err => {
              sails.log.error(err);
            });
        }

        // If available, attach the referralCode to the redirect URL
        if (referralCode.length > 0) {
          redirectUrl += `&referralCode=${referralCode}`;

          // Track sign up and identify with the referral code
          let trackingData = {
            distinct_id: referralCode,
            partner: req.body.partner || req.body.campaign,
            platform: 'sms',
            source: joinByReferral ? 'web-referral' : 'web',
            utm_campaign: req.body.utmCampaign,
            utm_content: req.body.utmContent,
            utm_medium: req.body.utmMedium,
            utm_source: req.body.utmSource,
          };

          mixpanel.track('Sign Up', trackingData);
        }

        return res.redirect(redirectUrl);
      })
      .catch(ErrorMobileCommonsJoin, function(err) {
        sails.log.error(err);
        return res.redirect('try-messenger');
      })
      .catch(function(err) {
        sails.log.error(err);

        // Even on error, display the confirmation screen if at least the Mobile
        // Commons subscription was successful.
        if (mcSubscribeSuccessful) {
          return res.redirect(redirectUrl);
        } else {
          return res.redirect('500');
        }
      });
  },

  /**
   * Updates a user's SMS preferences to Mobile Commons.
   *
   * POST /save-settings
   */
  saveSettings: function(req, res) {
    let birthday = '';
    if (
      req.body['bday-month'] &&
      req.body['bday-day'] &&
      req.body['bday-year']
    ) {
      birthday = `${req.body['bday-year']}-${req.body['bday-month']}-${
        req.body['bday-day']
      }`;
    }

    let updateRequest = {
      url: `https://secure.mcommons.com/api/profile_update`,
      auth: {
        user: sails.config.globals.mobileCommonsUser,
        pass: sails.config.globals.mobileCommonsPassword,
      },
      form: {
        phone_number: req.body.phone,
      },
    };

    if (birthday) {
      updateRequest.form.birthday = birthday;
    }

    if (req.body.zipcode) {
      updateRequest.form.postal_code = req.body.zipcode;
    }

    if (req.body['pref-time']) {
      updateRequest.form.pref_time = req.body['pref-time'];
    }

    request
      .postAsync(updateRequest)
      .then(response => {
        let redirectUrl = `/confirmation?phone=${req.body.phone}&firstName=${
          req.body.firstName
        }&referralCode=${req.body.referralCode}`;
        res.redirect(redirectUrl);
      })
      .catch(err => {
        console.error(err);
        res.redirect('500');
      });
  },

  /**
   * Helper to create the request for sending Mobile Commons referral invites.
   *
   * @param req {object}
   * @return {object || false}
   */
  createMobileCommonsReferralRequest: function(req) {
    let data = {
      form: {
        'opt_in_path[]': this.MOBILE_COMMONS_INVITE_ALPHA_OPTIN,
        'person[phone]': req.body.phone,
        friends_opt_in_path: this.MOBILE_COMMONS_INVITE_BETA_OPTIN,
      },
    };

    let numFriends = 0;
    const friends = [
      req.body.invitePhone1,
      req.body.invitePhone2,
      req.body.invitePhone3,
    ];
    for (const friend of friends) {
      if (friend) {
        data.form[`friends[${numFriends}]`] = friend;
        data.form[
          `friends[${numFriends}][referral_code]`
        ] = ReferralCodes.encode(friend);
        numFriends++;
      }
    }

    if (numFriends === 0) {
      return false;
    } else {
      return data;
    }
  },

  /**
   * Uses Mobile Commons to send an SMS invite to friends.
   *
   * POST /sms-invite
   */
  smsInvite: function(req, res) {
    const data = this.createMobileCommonsReferralRequest(req);

    if (!data) {
      return res.json(400, { status: 'No referral phone numbers provided' });
    }

    request
      .postAsync(sails.config.globals.mcJoinUrl, data)
      .then(response => {
        if (response.statusCode === 200) {
          return res.json(200, { status: 'ok' });
        } else {
          return res.json(response.statusCode, {
            error: 'Error sending referral invites',
          });
        }
      })
      .catch(err => {
        sails.log.error(err);
        return res.json(500, {
          error: 'Error sending referral invites',
        });
      });
  },
};

/**
 * Custom error from a Mobile Commons join request.
 */
class ErrorMobileCommonsJoin extends Error {
  constructor(message) {
    super(message);
  }
}
