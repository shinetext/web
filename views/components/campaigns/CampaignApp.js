import React, { Component } from 'react';
import Image from '../Image';
import AlphaSignUpForm from '../AlphaSignUpForm';
import FormField from '../FormField';
import PartnerLogo from './PartnerLogo';
import Disclaimer from '../Disclaimer';

/**
 * Campaign Landing page
 */
export default class CampaignApp extends Component {
  render() {
    const {
      name: header,
      imageUrl,
      copy: subhead,
      campaignId,
      partners,
      campaignKey,
      buttonCopy,
    } = this.props;
    let subHeadView;
    if (subhead) {
      subHeadView = <p dangerouslySetInnerHTML={{ __html: subhead }} />;
    }
    const alphaView = <AlphaSignUpForm optin={campaignKey} />;
    return (
      <section className="container-campaigns-lead">
        <div className="container-signup col-md-7">
          <h2>
            {header}
          </h2>
          {subHeadView}
          <form class="signup-form" id="alpha-signup" action="/join" method="post">
            {alphaView}
            <FormField
              type="hidden"
              fieldName="campaign"
              value={campaignId ? campaignId : null}
            />
            <div>
              <input
                is
                class="btn"
                type="submit"
                value={buttonCopy}
                ga-on="click"
                ga-event-category="SignUp"
                ga-event-action="SMS"
                ga-event-label={campaignId}
              />
            </div>
          </form>
          <Disclaimer />
          <div className="campaign-partner-logo-container">
            {partners.map((partner, key) =>
              <a href={partner.link} key={key} target="_blank">
                <PartnerLogo src={partner.logo} />
              </a>
            )}
          </div>
        </div>
        <Image src={imageUrl} />
      </section>
    );
  }
}
