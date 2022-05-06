import * as React from "react";
import { render } from "react-dom";
import { StorageProvider, useStorageContext } from "../contexts/storage.context";

const NotAvailable = () => {
  const { dataStorage } = useStorageContext();
  const { tipType } = dataStorage;
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
  ];

  const offensiveTips = [
    { title: "Focus", text: "Don't get distracted you piece of crap" },
    {
      title: "Why are you reading this?",
      text: "Your brain so small and unfocused I can't see it. Why don't you get back to work?",
    },
    {
      title: "You're losing it",
      text: "It's official, your attention span is less than that of a goldfish",
    },
  ];
  const getRandom = (quotes) => {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
  };
  const quote = getRandom(encouragingTips);
  return (
    <div className="quotes-container">
      <div className="quotes-card encouraging-theme">
        <h3 style={{ margin: "20px" }}>{quote.title}</h3>
        <span>{quote.text}</span>
      </div>
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
