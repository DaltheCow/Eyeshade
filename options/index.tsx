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
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import Snackbar from "@mui/material/Snackbar";
import { formatTimer, truncateText } from "../utils/helpers";
import { usePrevious } from "../utils/hooks/usePrevious";
import { Tooltip } from "@mui/material";

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
    setTimer,
    toggleHttps,
    toggleLink,
    toggleWhiteListLink,
  } = useStorageContext();
  const {
    siteList,
    isBlocking,
    whiteListSites,
    isWhiteListing,
    redirectLink,
    redirectOption,
    timer,
    savedMinutes,
    savedHours,
    isHttps,
    turnedOffBlockListSites,
    turnedOffWhiteListSites,
  } = dataStorage;

  const [site, setSite] = React.useState("");
  const [whiteListSite, setWhiteListSite] = React.useState("");
  const [redirectLinkInput, setRedirectLinkInput] = React.useState("");
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [intervalId, setIntervalId] = React.useState<ReturnType<typeof setInterval> | null>(null);
  const [timerMinutes, setTimerMinutes] = React.useState(savedMinutes || 0);
  const [timerHours, setTimerHours] = React.useState(savedHours || 0);
  const [open, setOpen] = React.useState(false);
  const [shouldAlertSaved, setShouldAlertSaved] = React.useState(false);
  const newTime = React.useMemo(() => formatTimer(countdown || 0), [countdown]);
  const previousTime = usePrevious(newTime);
  React.useEffect(() => {
    if (redirectLink) {
      setRedirectLinkInput(redirectLink);
    }
  }, [redirectLink]);

  React.useEffect(() => {
    if ((savedMinutes || savedHours) && timerMinutes === 0 && timerHours === 0) {
      setTimerMinutes(savedMinutes);
      setTimerHours(savedHours);
    }
  }, [savedMinutes, savedHours]);

  React.useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (timer) {
      const intvl = setInterval(() => {
        const newTime = formatTimer(timer - Date.now() || 0);
        if (previousTime !== newTime) {
          setCountdown(timer - Date.now());
        }
      }, 100);
      setIntervalId(intvl);

      return () => clearInterval(intvl);
    }
  }, [timer, previousTime, newTime]);

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
    updateRedirectLink(redirectLinkInput).then(() => {
      setShouldAlertSaved(true);
    });
  };

  const handleRadioChange = (e: any) => {
    updateRedirectOption(e.target.value);
  };

  const startTimer = async () => {
    const res = await setTimer(
      Date.now() + 1000 * 60 * timerMinutes + 1000 * 60 * 60 * timerHours,
      timerMinutes,
      timerHours
    );
    if (res) {
      setOpen(true);
    }
  };

  function preventNegative(num: number) {
    return num < 0 ? 0 : num;
  }

  return (
    <div>
      {isLoaded && (
        <div className="container">
          <div className="control-list-container">
            <div className="control-container">
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
            <div className="control-container">
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
            <div className="control-container">
              Timer (hrs:mins):
              {timer ? (
                <div
                  style={{
                    display: "flex",
                    marginTop: "12px",
                    fontSize: "24px",
                    alignItems: "center",
                  }}
                >
                  <Button
                    style={{ color: "white", marginRight: "5px" }}
                    color="secondary"
                    variant="contained"
                    onClick={() => setTimer(null, undefined, undefined)}
                  >
                    Stop
                  </Button>
                  <div>{newTime}</div>
                </div>
              ) : (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ display: "inline-flex", marginRight: "5px", marginBottom: "5px" }}>
                    <TextField
                      size="small"
                      type="number"
                      value={timerHours}
                      onChange={(e) => setTimerHours(preventNegative(Number(e.target.value)))}
                    />
                    <span style={{ fontSize: "28px" }}>:</span>
                    <TextField
                      size="small"
                      type="number"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(preventNegative(Number(e.target.value)))}
                    />
                  </div>
                  <Button
                    style={{ color: "white", marginBottom: "4px" }}
                    color="secondary"
                    variant="contained"
                    onClick={startTimer}
                  >
                    Start
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="main-content" style={{ display: "flex" }}>
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
                      variant="outlined"
                      onChange={(e) => setSite(e.target.value)}
                    />
                    <Button
                      style={{ color: "white", marginLeft: "5px" }}
                      color="secondary"
                      variant="contained"
                      type="submit"
                    >
                      +
                    </Button>
                  </label>
                </form>
              </div>
              <ul style={{ marginTop: "15px" }} className="site-list">
                {siteList?.map((url: string) => {
                  const disabled = turnedOffBlockListSites.includes(url);
                  return (
                    <li key={url}>
                      <div className="icon-container" onClick={() => deleteLink(url)}>
                        <DeleteOutlinedIcon />
                      </div>
                      <Tooltip style={{ cursor: "pointer" }} title={`https://${url}`}>
                        <a className={`fake-link${disabled ? " disabled" : ""}`} href="#">
                          {truncateText(`https://${url}`, 30)}
                        </a>
                      </Tooltip>
                      <div className="icon-container power-button" onClick={() => toggleLink(url)}>
                        <PowerSettingsNewIcon color={disabled ? "disabled" : "secondary"} />
                      </div>
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
                      style={{ color: "white", marginLeft: "5px" }}
                      color="secondary"
                      variant="contained"
                      type="submit"
                    >
                      +
                    </Button>
                  </label>
                </form>
              </div>
              <ul style={{ marginTop: "15px" }} className="site-list">
                {whiteListSites?.map((url: string) => {
                  const disabled = turnedOffWhiteListSites.includes(url);
                  return (
                    <li key={url} style={{ display: "flex" }}>
                      <div className="icon-container" onClick={() => deleteWhiteListLink(url)}>
                        <DeleteOutlinedIcon />
                      </div>
                      <a className="fake-link" href="#">
                        {truncateText(`https://${url}`, 35)}
                      </a>
                      <div
                        className="icon-container power-button"
                        onClick={() => toggleWhiteListLink(url)}
                      >
                        <PowerSettingsNewIcon color={disabled ? "disabled" : "secondary"} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <div className="content-column">
                <label>
                  <h4>
                    Redirect Website{" "}
                    <Tooltip
                      style={{ cursor: "pointer" }}
                      title="Your redirect url should:&#013;redirect to a whitelist site when whitelisting;&#013;redirect to a non blocked site when blocking"
                    >
                      <span>&#9432;</span>
                    </Tooltip>
                  </h4>
                  <form
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    onSubmit={handleSubmitRedirectLink}
                  >
                    <div
                      onClick={() => {
                        toggleHttps(!isHttps);
                        setShouldAlertSaved(true);
                      }}
                      style={{ cursor: "pointer", fontSize: "16px", fontFamily: "Helvetica" }}
                      className="padded-box"
                    >
                      {isHttps ? "https://" : "http://"}
                    </div>
                    <TextField
                      placeholder="www.google.com"
                      value={redirectLinkInput}
                      size="small"
                      type="text"
                      onChange={(e) => setRedirectLinkInput(e.target.value)}
                    />
                    <Button
                      style={{ color: "white", marginLeft: "5px" }}
                      color="secondary"
                      variant="contained"
                      type="submit"
                    >
                      +
                    </Button>
                  </form>
                </label>
              </div>
              <div style={{ marginTop: "15px" }} className="content-column">
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
        </div>
      )}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message={`${isBlocking ? "Blocking" : "White Listing"} will turn off in ${formatTimer(
          countdown || 0
        )}`}
      />
      <Snackbar
        open={shouldAlertSaved}
        autoHideDuration={2000}
        onClose={() => setShouldAlertSaved(false)}
        message={"redirect saved"}
      />
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
    MuiButton: {
      styleOverrides: {
        sizeMedium: {
          maxHeight: "38px",
          minHeight: "38px",
        },
      },
    },
    // MuiInputBase: {
    //   styleOverrides: {
    //     sizeSmall: {
    //       maxWidth: "225px",
    //       width: "225px",
    //     },
    //   },
    // },
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
