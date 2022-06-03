// import {
//   Button,
//   createTheme,
//   FormControl,
//   FormControlLabel,
//   FormLabel,
//   Radio,
//   RadioGroup,
//   Switch,
//   TextField,
//   ThemeProvider,
// } from "@mui/material";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import * as React from "react";
import { render } from "react-dom";
import { useStorageContext, StorageProvider } from "../contexts/storage.context";
import { RedirectEnum } from "../background/index";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

const App = () => {
  const {
    dataStorage,
    isLoaded,
    setToggles,
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

  const test: number = "afdsaa";
  const thing = (ds) => {
    console.log(ds);
  };
  console.log("🚀 ~ file: index.tsx ~ line 48 ~ App ~ test", test);

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
                <Switch
                  onClick={() => {
                    const fields = { isBlocking: !isBlocking } as any;
                    if (!isBlocking && isWhiteListing) {
                      fields.isWhiteListing = false;
                    }
                    setToggles(fields);
                  }}
                  checked={isBlocking}
                  color="secondary"
                />
                <div className="switch-hide">HIDE</div>
              </div>
            </div>
            <div className="switch-container">
              Whitelist Sites:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <Switch
                  onClick={() => {
                    const fields = { isWhiteListing: !isWhiteListing } as any;
                    if (!isWhiteListing && isBlocking) {
                      fields.isBlocking = false;
                    }
                    setToggles(fields);
                  }}
                  checked={isWhiteListing}
                  color="secondary"
                />
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
                    <TextField
                      placeholder="www.reddit.com"
                      size="small"
                      type="text"
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                    />
                    <Button
                      style={{ color: "white" }}
                      color="secondary"
                      variant="contained"
                      type="submit"
                    >
                      +
                    </Button>
                  </label>
                </form>
              </div>
              <br />
              <ul className="site-list">
                {siteList.map((url: string) => {
                  return (
                    <li>
                      <div className="icon-container" onClick={() => deleteLink(url)}>
                        <DeleteOutlinedIcon />
                      </div>
                      <a className="fake-link" href="#">
                        https://{url}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="content-column">
              <div className="site-input">
                <form onSubmit={handleSubmitWhiteListSite}>
                  <label>
                    <h4>Whitelist These Sites</h4>
                    <TextField
                      placeholder="www.reddit.com"
                      type="text"
                      size="small"
                      value={whiteListSite}
                      onChange={(e) => setWhiteListSite(e.target.value)}
                    />
                    <Button
                      style={{ color: "white" }}
                      color="secondary"
                      variant="contained"
                      type="submit"
                    >
                      +
                    </Button>
                  </label>
                </form>
              </div>
              <br />
              <ul className="site-list">
                {whiteListSites.map((url: string) => {
                  return (
                    <li style={{ display: "flex" }}>
                      <div className="icon-container" onClick={() => deleteWhiteListLink(url)}>
                        <DeleteOutlinedIcon />
                      </div>
                      <a className="fake-link" href="#">
                        https://{url}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="content-column">
              <label>
                <h4>
                  Redirect Website{" "}
                  <span
                    style={{ cursor: "pointer" }}
                    title="Your redirect url should:&#013;redirect to a whitelist site when whitelisting;&#013;redirect to a non blocked site when blocking"
                  >
                    &#9432;
                  </span>
                </h4>
                <form onSubmit={handleSubmitRedirectLink}>
                  <TextField
                    placeholder="www.google.com"
                    value={redirectLinkInput}
                    size="small"
                    type="text"
                    onChange={(e) => setRedirectLinkInput(e.target.value)}
                  />
                  <Button
                    style={{ color: "white" }}
                    color="secondary"
                    variant="contained"
                    type="submit"
                  >
                    +
                  </Button>
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
                  value={redirectOption}
                >
                  <FormControlLabel value={RedirectEnum.URL} control={<Radio />} label="My URL" />
                  <FormControlLabel
                    value={RedirectEnum.DEFAULT}
                    control={<Radio />}
                    label="Default"
                  />
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

const theme = createTheme({
  palette: {
    secondary: {
      main: "#1ebc8e",
    },
  },
  components: {
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "white !important",
        },
        thumb: {
          height: 12,
          width: 12,
          marginTop: "7px",
          marginLeft: "7px",
        },
        track: {
          height: "20px",
          minWidth: "40px",
          borderRadius: "10px",
          backgroundColor: "#f16132",
          opacity: "1 !important",
        },
      },
    },
  },
});

const AppWrapper = () => {
  return (
    <ThemeProvider theme={theme}>
      <StorageProvider>
        <App />
      </StorageProvider>
    </ThemeProvider>
  );
};

render(<AppWrapper />, document.getElementById("root"));
