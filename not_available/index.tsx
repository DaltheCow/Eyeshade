import { Tip, RedirectEnum } from "../background";
import * as React from "react";
import { render } from "react-dom";
import { StorageProvider, useStorageContext } from "../contexts/storage.context";
import Paper from "@mui/material/Paper";

const getRandom = (quotes: Tip[]) => {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
};

const NotAvailable = () => {
  const { dataStorage } = useStorageContext();
  const { redirectOption } = dataStorage;
  let quote: Tip;
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
  ] as Tip[];

  const offensiveTips = [
    { title: "Focus", text: "Don't get distracted you piece of doodoo" },
    {
      title: "Why are you reading this?",
      text: "Your brain so small and unfocused I can't see it. Why don't you get back to work?",
    },
    {
      title: "You're losing it",
      text: "It's official, your attention span is less than that of a goldfish",
    },
    {
      title: "Distracted Dummy",
      text: "I don't have anything else to say, and no I'm not sorry",
    },
  ] as Tip[];
  let theme = "";
  switch (redirectOption) {
    case RedirectEnum.BLANK:
      return <></>;
    case RedirectEnum.ENCOURAGING: {
      quote = getRandom(encouragingTips);
      theme = "encouraging-theme";
      break;
    }
    case RedirectEnum.OFFENSIVE: {
      quote = getRandom(offensiveTips);
      theme = "offensive-theme";
      break;
    }
    default:
      return <></>;
  }

  return (
    <div className="quotes-container">
      <Paper elevation={5} className={`quotes-card ${theme}`}>
        <div className="quotes-card-content">
          <h3 style={{ margin: "20px" }}>{quote.title}</h3>
          <span>{quote.text}</span>
        </div>
      </Paper>
    </div>
  );
};

const App = () => {
  return (
    <StorageProvider>
      <NotAvailable />
    </StorageProvider>
  );
};

render(<App />, document.getElementById("root"));
