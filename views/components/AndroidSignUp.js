import React, { Component } from 'react';

export default class AndroidSignUp extends Component {
  render() {
    return (
      <div className="container-splash-lead">
        <div className="container-splash">
          <div className="splash-top">
            <a href="/">
              <img
                src="/images/app-page/LaunchPage-Logo-Mobile.png"
                className="splash-logo"
              />
            </a>
            <div className="splash-header">Hear it first.</div>
            <div className="splash-subtitle">
              Our Android app is in the works—sign up to be the{' '}
              <strong>first</strong> to find out when it launches.
            </div>
          </div>
          <div className="splash-signup-form">
            <form action="/android-signup" method="post">
              <div className="splash-form-field">
                <input
                  required
                  className="form-control"
                  value=""
                  type="text"
                  name="FNAME"
                  id="mce-FNAME"
                />
                <label htmlFor="mce-FNAME">First Name</label>
                <span>*</span>
              </div>
              <div className="splash-form-field">
                <input
                  required
                  className="form-control"
                  type="email"
                  value=""
                  name="EMAIL"
                  id="mce-EMAIL"
                />
                <label htmlFor="mce-EMAIL">Email</label>
                <span>*</span>
              </div>
              <div className="splash-bottom">
                <div className="splash-button">
                  <button
                    type="submit"
                    className="get-notified button"
                    value="Subscribe"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                  >
                    Notify Me
                  </button>
                </div>
                <div className="splash-image" />
              </div>
            </form>
          </div>
        </div>
        <div className="container-splash-desktop">
          <div className="desktop-container-splash">
            <div className="desktop-splash-top">
              <a href="/">
                <img
                  src="/images/app-page/LaunchPage-Logo-Mobile.png"
                  className="desktop-splash-logo"
                />
              </a>
              <div className="desktop-splash-header">Hear it first.</div>
              <div className="desktop-splash-subtitle">
                Our Android app is in the works—sign up to be the{' '}
                <strong>first</strong> to find out when it launches.
              </div>
            </div>
            <div className="desktop-splash-signup-form">
              <form action="/android-signup" method="post">
                <div className="splash-form-field">
                  <input
                    required
                    className="form-control"
                    value=""
                    type="text"
                    name="FNAME"
                    id="mce-FNAME"
                  />
                  <label htmlFor="mce-FNAME">First Name</label>
                  <span>*</span>
                </div>
                <div className="splash-form-field">
                  <input
                    required
                    className="form-control"
                    type="email"
                    value=""
                    name="EMAIL"
                    id="mce-EMAIL"
                  />
                  <label htmlFor="mce-EMAIL">Email</label>
                  <span>*</span>
                </div>
                <div className="splash-button">
                  <button
                    type="submit"
                    className="get-notified button"
                    value="Subscribe"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                  >
                    Notify Me
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="desktop-image">
            <img src="/images/app-page/Phone-LifeIsComplicated.png" />
          </div>
        </div>
      </div>
    );
  }
}