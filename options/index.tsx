import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import * as React from "react";
import { render } from "react-dom";
import { useStorageContext, StorageProvider } from "../contexts/storage.context";
import { RedirectEnum } from "../background/index";

const App = () => {
  const {
    dataStorage,
    isLoaded,
    setFields,
    deleteLink,
    deleteWhiteListLink,
    addSite,
    addWhiteListSite,
    updateRedirectLink,
    updateRedirectOption,
  } = useStorageContext();
  const { siteList, isBlocking, whiteListSites, isWhiteListing, redirectLink, redirectOption } =
    dataStorage;

  const [site, setSite] = React.useState("");
  const [whiteListSite, setWhiteListSite] = React.useState("");
  const [redirectLinkInput, setRedirectLinkInput] = React.useState("");
  const [redirectOptionRadio, setRedirectOptionRadio] = React.useState("");

  React.useEffect(() => {
    setRedirectOptionRadio(redirectOption);
  }, [redirectOption]);

  React.useEffect(() => {
    setRedirectLinkInput(redirectLink);
  }, [redirectLink]);
  if (!isLoaded) return <></>;

  const handleSubmitBlockSite = (e: any) => {
    e.preventDefault();
    addSite(site);
    setSite("");
  };

  const handleSubmitWhiteListSite = (e: any) => {
    e.preventDefault();
    addWhiteListSite(whiteListSite);
    setWhiteListSite("");
  };

  const handleSubmitRedirectLink = (e: any) => {
    e.preventDefault();
    updateRedirectLink(redirectLinkInput);
  };

  const handleRadioChange = (e: any) => {
    setRedirectOptionRadio(e.target.value);
    updateRedirectOption(e.target.value);
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
                    const fields = { isBlocking: !isBlocking } as any;
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
                      whiteListSites.length === 0 &&
                      !isWhiteListing &&
                      !confirm("Are you sure you want to turn this on before adding some sites?")
                    ) {
                      return;
                    }
                    const fields = { isWhiteListing: !isWhiteListing } as any;
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
                {siteList.map((url: string) => {
                  return (
                    <div style={{ display: "flex", margin: "3px" }}>
                      <a style={{ marginRight: "1px" }} className="fake-link" href="#">
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
                {whiteListSites.map((url: string) => {
                  return (
                    <div style={{ display: "flex" }}>
                      <a className="fake-link" href="#">
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
            <div className="content-column">
              <FormControl>
                <FormLabel>Redirect</FormLabel>
                <RadioGroup
                  defaultValue={redirectOption || RedirectEnum.BLANK}
                  name="radio-buttons-group"
                  onChange={handleRadioChange}
                  value={redirectOptionRadio}
                >
                  <FormControlLabel value={RedirectEnum.URL} control={<Radio />} label="My URL" />
                  <FormControlLabel
                    value={RedirectEnum.BLANK}
                    control={<Radio />}
                    label="Blank Page"
                  />
                  <FormControlLabel
                    value={RedirectEnum.ENCOURAGING}
                    control={<Radio />}
                    label="Encouraging Tips"
                  />
                  <FormControlLabel
                    value={RedirectEnum.OFFENSIVE}
                    control={<Radio />}
                    label="Offensive Tips"
                  />
                </RadioGroup>
              </FormControl>
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
