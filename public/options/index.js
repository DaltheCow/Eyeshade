"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const Button_1 = __importDefault(require("@mui/material/Button"));
const FormControl_1 = __importDefault(require("@mui/material/FormControl"));
const FormControlLabel_1 = __importDefault(require("@mui/material/FormControlLabel"));
const FormLabel_1 = __importDefault(require("@mui/material/FormLabel"));
const Radio_1 = __importDefault(require("@mui/material/Radio"));
const RadioGroup_1 = __importDefault(require("@mui/material/RadioGroup"));
const Switch_1 = __importDefault(require("@mui/material/Switch"));
const TextField_1 = __importDefault(require("@mui/material/TextField"));
const styles_1 = require("@mui/material/styles");
const React = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const storage_context_1 = require("../contexts/storage.context");
const index_1 = require("../background/index");
const DeleteOutlined_1 = __importDefault(require("@mui/icons-material/DeleteOutlined"));
const App = () => {
    const { dataStorage, isLoaded, setToggles, deleteLink, deleteWhiteListLink, addSite, addWhiteListSite, updateRedirectLink, updateRedirectOption, } = (0, storage_context_1.useStorageContext)();
    const { siteList, isBlocking, whiteListSites, isWhiteListing, redirectLink, redirectOption } = dataStorage;
    const [site, setSite] = React.useState("");
    const [whiteListSite, setWhiteListSite] = React.useState("");
    const [redirectLinkInput, setRedirectLinkInput] = React.useState("");
    const test = "afdsaa";
    const thing = (ds) => {
        console.log(ds, ds);
    };
    console.log("🚀 ~ file: index.tsx ~ line 48 ~ App ~ test", test);
    React.useEffect(() => {
        setRedirectLinkInput(redirectLink);
    }, [redirectLink]);
    if (!isLoaded)
        return React.createElement(React.Fragment, null);
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
    const handleRadioChange = (e) => {
        updateRedirectOption(e.target.value);
    };
    return (React.createElement("div", null, isLoaded && (React.createElement("div", { className: "main-content" },
        React.createElement("div", { className: "switch-list-container" },
            React.createElement("div", { className: "switch-container" },
                "Block Sites:",
                React.createElement("div", { className: "switch" },
                    React.createElement("div", { className: "switch-show" }, "SHOW"),
                    React.createElement(Switch_1.default, { onClick: () => {
                            const fields = { isBlocking: !isBlocking };
                            if (!isBlocking && isWhiteListing) {
                                fields.isWhiteListing = false;
                            }
                            setToggles(fields);
                        }, checked: isBlocking, color: "secondary" }),
                    React.createElement("div", { className: "switch-hide" }, "HIDE"))),
            React.createElement("div", { className: "switch-container" },
                "Whitelist Sites:",
                React.createElement("div", { className: "switch" },
                    React.createElement("div", { className: "switch-show" }, "SHOW"),
                    React.createElement(Switch_1.default, { onClick: () => {
                            const fields = { isWhiteListing: !isWhiteListing };
                            if (!isWhiteListing && isBlocking) {
                                fields.isBlocking = false;
                            }
                            setToggles(fields);
                        }, checked: isWhiteListing, color: "secondary" }),
                    React.createElement("div", { className: "switch-hide" }, "HIDE")))),
        React.createElement("div", { style: { display: "flex" } },
            React.createElement("div", { className: "content-column" },
                React.createElement("div", { className: "site-input" },
                    React.createElement("form", { onSubmit: handleSubmitBlockSite },
                        React.createElement("label", null,
                            React.createElement("h4", null, "Block These Sites"),
                            React.createElement(TextField_1.default, { placeholder: "www.reddit.com", size: "small", type: "text", value: site, onChange: (e) => setSite(e.target.value) }),
                            React.createElement(Button_1.default, { style: { color: "white" }, color: "secondary", variant: "contained", type: "submit" }, "+")))),
                React.createElement("br", null),
                React.createElement("ul", { className: "site-list" }, siteList.map((url) => {
                    return (React.createElement("li", null,
                        React.createElement("div", { className: "icon-container", onClick: () => deleteLink(url) },
                            React.createElement(DeleteOutlined_1.default, null)),
                        React.createElement("a", { className: "fake-link", href: "#" },
                            "https://",
                            url)));
                }))),
            React.createElement("div", { className: "content-column" },
                React.createElement("div", { className: "site-input" },
                    React.createElement("form", { onSubmit: handleSubmitWhiteListSite },
                        React.createElement("label", null,
                            React.createElement("h4", null, "Whitelist These Sites"),
                            React.createElement(TextField_1.default, { placeholder: "www.reddit.com", type: "text", size: "small", value: whiteListSite, onChange: (e) => setWhiteListSite(e.target.value) }),
                            React.createElement(Button_1.default, { style: { color: "white" }, color: "secondary", variant: "contained", type: "submit" }, "+")))),
                React.createElement("br", null),
                React.createElement("ul", { className: "site-list" }, whiteListSites.map((url) => {
                    return (React.createElement("li", { style: { display: "flex" } },
                        React.createElement("div", { className: "icon-container", onClick: () => deleteWhiteListLink(url) },
                            React.createElement(DeleteOutlined_1.default, null)),
                        React.createElement("a", { className: "fake-link", href: "#" },
                            "https://",
                            url)));
                }))),
            React.createElement("div", { className: "content-column" },
                React.createElement("label", null,
                    React.createElement("h4", null,
                        "Redirect Website",
                        " ",
                        React.createElement("span", { style: { cursor: "pointer" }, title: "Your redirect url should:\rredirect to a whitelist site when whitelisting;\rredirect to a non blocked site when blocking" }, "\u24D8")),
                    React.createElement("form", { onSubmit: handleSubmitRedirectLink },
                        React.createElement(TextField_1.default, { placeholder: "www.google.com", value: redirectLinkInput, size: "small", type: "text", onChange: (e) => setRedirectLinkInput(e.target.value) }),
                        React.createElement(Button_1.default, { style: { color: "white" }, color: "secondary", variant: "contained", type: "submit" }, "+"))),
                React.createElement("br", null),
                redirectLink && `Current Redirect: https://${redirectLink}`),
            React.createElement("div", { className: "content-column" },
                React.createElement(FormControl_1.default, null,
                    React.createElement(FormLabel_1.default, null, "Redirect"),
                    React.createElement(RadioGroup_1.default, { defaultValue: redirectOption || index_1.RedirectEnum.BLANK, name: "radio-buttons-group", onChange: handleRadioChange, value: redirectOption },
                        React.createElement(FormControlLabel_1.default, { value: index_1.RedirectEnum.URL, control: React.createElement(Radio_1.default, null), label: "My URL" }),
                        React.createElement(FormControlLabel_1.default, { value: index_1.RedirectEnum.DEFAULT, control: React.createElement(Radio_1.default, null), label: "Default" }),
                        React.createElement(FormControlLabel_1.default, { value: index_1.RedirectEnum.BLANK, control: React.createElement(Radio_1.default, null), label: "Blank Page" }),
                        React.createElement(FormControlLabel_1.default, { value: index_1.RedirectEnum.ENCOURAGING, control: React.createElement(Radio_1.default, null), label: "Encouraging Tips" }),
                        React.createElement(FormControlLabel_1.default, { value: index_1.RedirectEnum.OFFENSIVE, control: React.createElement(Radio_1.default, null), label: "Offensive Tips" })))))))));
};
const theme = (0, styles_1.createTheme)({
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
    return (React.createElement(styles_1.ThemeProvider, { theme: theme },
        React.createElement(storage_context_1.StorageProvider, null,
            React.createElement(App, null))));
};
(0, react_dom_1.render)(React.createElement(AppWrapper, null), document.getElementById("root"));
//# sourceMappingURL=index.js.map