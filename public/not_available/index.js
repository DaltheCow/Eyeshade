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
const background_1 = require("../background");
const React = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const storage_context_1 = require("../contexts/storage.context");
const Paper_1 = __importDefault(require("@mui/material/Paper"));
const getRandom = (quotes) => {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
};
const NotAvailable = () => {
    const { dataStorage } = (0, storage_context_1.useStorageContext)();
    const { redirectOption } = dataStorage;
    let quote;
    const encouragingTips = [
        {
            title: "Keep it simple",
            text: "If you're feeling restless, try setting a small goal within your work and choose to feel good about yourself when you achieve it",
        },
        {
            title: "Take a moment",
            text: "You were doing something and got distracted, that's okay though. Take a moment to set an intention and head back into what you were doing properly motivated",
        },
        {
            title: "Refresh your energy",
            text: "If you are getting distracted your mind might be tired, make sure to take an intentional break soon to reset your stamina",
        },
        {
            title: "Be mindful",
            text: "Even just reading this and taking a moment to notice your mental state can lead you toward better work habits. Always go into your work with fresh intention.",
        },
        {
            title: "Right now you're more than enough",
            text: "Stress is the weight of the past projected into the future. Every time we let the present moment simply exist and accept things we can regain the vision of a brighter future",
        },
    ];
    const offensiveTips = [
        { title: "Focus", text: "Don't get distracted you piece of doodoo" },
        {
            title: "Why are you reading this?",
            text: "Your brain is so small and unfocused I can't see it. Why don't you get back to work?",
        },
        {
            title: "You're losing it",
            text: "It's official, your attention span is less than that of a goldfish",
        },
        {
            title: "Distracted Dummy",
            text: "I don't have anything else to say, and no I'm not sorry",
        },
    ];
    const defaultTips = [
        { title: "You blocked this for a reason :)", text: "No need to get distracted" },
    ];
    let theme = "";
    switch (redirectOption) {
        case background_1.RedirectEnum.BLANK:
            return React.createElement(React.Fragment, null);
        case background_1.RedirectEnum.ENCOURAGING: {
            quote = getRandom(encouragingTips);
            theme = "encouraging-theme";
            break;
        }
        case background_1.RedirectEnum.OFFENSIVE: {
            quote = getRandom(offensiveTips);
            theme = "offensive-theme";
            break;
        }
        case background_1.RedirectEnum.DEFAULT:
            quote = getRandom(defaultTips);
            theme = "default-theme";
            break;
        default:
            return React.createElement(React.Fragment, null);
    }
    return (React.createElement("div", { className: "quotes-container" },
        React.createElement(Paper_1.default, { elevation: 5, className: `quotes-card ${theme}` },
            React.createElement("div", { className: "quotes-card-content" },
                React.createElement("h3", { style: { margin: "20px" } }, quote.title),
                React.createElement("span", null, quote.text)))));
};
const App = () => {
    return (React.createElement(storage_context_1.StorageProvider, null,
        React.createElement(NotAvailable, null)));
};
(0, react_dom_1.render)(React.createElement(App, null), document.getElementById("root"));
//# sourceMappingURL=index.js.map