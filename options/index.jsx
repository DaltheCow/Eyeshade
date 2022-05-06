import * as React from "react";
import { render } from "react-dom";
import { useStorageContext, StorageProvider } from "../contexts/storage.context.jsx";

const App = () => {
  const [site, setSite] = React.useState();
  const [whiteListSite, setWhiteListSite] = React.useState();
  const {
    dataStorage,
    isLoaded,
    setFields,
    deleteLink,
    deleteWhiteListLink,
    addSite,
    addWhiteListSite,
    updateRedirectLink,
  } = useStorageContext();
  const { siteList, isBlocking, whiteListSites, isWhiteListing, redirectLink } = dataStorage;
  const [redirectLinkInput, setRedirectLinkInput] = React.useState("");
  React.useEffect(() => {
    setRedirectLinkInput(redirectLink);
  }, [redirectLink]);

  const handleSubmitBlockSite = (e) => {
    e.preventDefault();
    addSite(site);
    setSite("");
  };

  const handleSubmitWhiteListSite = (e) => {
    e.preventDefault();
    addWhiteListSite(whiteListSite);
    setWhiteListSite("");
  };

  const handleSubmitRedirectLink = (e) => {
    e.preventDefault();
    updateRedirectLink(redirectLinkInput);
  };

  return (
    <div>
      {isLoaded && (
        <div className="main-content">
          <div className="switch-list-container">
            <div className="switch-container">
              Block Sites:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div
                  onClick={() => {
                    const fields = { isBlocking: !isBlocking };
                    if (!isBlocking && isWhiteListing) {
                      fields.isWhiteListing = false;
                    }
                    setFields(fields);
                  }}
                  className={`switcher_slider${isBlocking ? " checked" : ""}`}
                ></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>
            <div className="switch-container">
              Whitelist Sites:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div
                  onClick={() => {
                    if (
                      whiteListSites.lenth === 0 &&
                      !isWhiteListing &&
                      !confirm("Are you sure you want to turn this on before adding some sites?")
                    ) {
                      return;
                    }
                    const fields = { isWhiteListing: !isWhiteListing };
                    if (!isWhiteListing && isBlocking) {
                      fields.isBlocking = false;
                    }
                    setFields(fields);
                  }}
                  className={`switcher_slider${isWhiteListing ? " checked" : ""}`}
                ></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div className="content-column">
              <div className="site-input">
                <form onSubmit={handleSubmitBlockSite}>
                  <label>
                    <h4>Block These Sites</h4>
                    <input
                      placeholder="www.reddit.com"
                      type="text"
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                    />
                    <button type="submit">+</button>
                  </label>
                </form>
              </div>
              <br />
              <div className="site-list">
                {siteList.map((url) => {
                  return (
                    <div style={{ display: "flex" }}>
                      <a class="fake-link" href="#">
                        https://{url}
                      </a>
                      <div className="icon-container" onClick={() => deleteLink(url)}>
                        <i className="far fa-times-circle"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="content-column">
              <div className="site-input">
                <form onSubmit={handleSubmitWhiteListSite}>
                  <label>
                    <h4>Whitelist These Sites</h4>
                    <input
                      placeholder="www.reddit.com"
                      type="text"
                      value={whiteListSite}
                      onChange={(e) => setWhiteListSite(e.target.value)}
                    />
                    <button type="submit">+</button>
                  </label>
                </form>
              </div>
              <br />
              <div className="site-list">
                {whiteListSites.map((url) => {
                  return (
                    <div style={{ display: "flex" }}>
                      <a class="fake-link" href="#">
                        https://{url}
                      </a>
                      <div className="icon-container" onClick={() => deleteWhiteListLink(url)}>
                        <i className="far fa-times-circle"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="content-column">
              <label>
                <h4>
                  Redirect Website{" "}
                  <span
                    style={{ cursor: "pointer" }}
                    title="Your redirect url should:&#013;redirect to a whitelist site when whitelisting;&#013;redirect to a non blacklisted site when blacklisting"
                  >
                    &#9432;
                  </span>
                </h4>
                <form onSubmit={handleSubmitRedirectLink}>
                  <input
                    placeholder="www.google.com"
                    value={redirectLinkInput}
                    type="text"
                    onChange={(e) => setRedirectLinkInput(e.target.value)}
                  />
                  <button type="submit">+</button>
                </form>
              </label>
              <br />
              {redirectLink && `Current Redirect: https://${redirectLink}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppWrapper = () => {
  return (
    <StorageProvider>
      <App />
    </StorageProvider>
  );
};

render(<AppWrapper />, document.getElementById("root"));
