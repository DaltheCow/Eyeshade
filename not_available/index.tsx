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
    {
      title: "Don't be grass",
      text: "Once upon a time there was a blade of grass that moved wherever the wind pushed it. That blade of grass is your brain and you have no focus",
    },
  ] as Tip[];

  const whimsicalTips = [
    {
      title: "Your mind walked into a bar",
      text: "Then it warped into a bear, then it sparked into a flare. Regardless, you didn't get anything done. You are running low on brain juice. Refuel with a combination of 78% Nitrogen, 21% Oxygen, < 1% hot gas. Snort through nose hole(s)",
    },
    {
      title: "Your hair is on fire",
      text: "It isn't that you lost focus. Your hair is just on fire :/ There isn't much that can be done. Maybe give it a quick scratch. See if that snuffs it out. Is it itchy? Yeah. A quick scratch, then see if you have +1 focus.",
    },
    {
      title: "Fairy dust deployed",
      text: "Once upon a time a wizard saw your mind go this way and that, so he gave you a healthy supply of invisible fairy dust. It is bound to whatever air is in front of you. He said, 'They won't believe it's there, but if they breathe the stuff, it'll work. Oh yeah. It will work'. So yeah, try breathing the fairy dust, I guess?",
    },
    {
      title: "The mummies are invading",
      text: "Simultaneously someone just left the bathroom, while an ancient Egyptian tomb was invaded. The toilet paper stuck to the rogue reliever looks much like a mummy's foot socky. And they serve a similar purpose. Traction. If you had toilet paper in your hair, it would give your mind the traction it needs to get a bit more work done. Just consider it is alls I'm sayin'.",
    },
    {
      title: "Three donkeys",
      text: "Have you ever seen three donkeys? I feel like we only ever see donkeys in the singular. Where are the other donkeys??? Your brain is similar. You just have one focuses, yet there have to be at least 2 or 3 more focuses out there waiting in the void. Grasp at the air and see if you can find one of them.",
    },
    {
      title: "Ugh, Tuesday",
      text: "Once a week we have to live through Tuesday :/ Such a mid day, you know? Nothing good, nothing bad. So ordinary. Today is Tuesday in this universe. I don't feel any special way about it. Sometimes I prefer Monday, sometimes I prefer Wednesday. I don't tend to prefer Tuesday. Don't get stuck in Tuesday. That is the worst day to have as a groundhog day. Is Ruby Tuesday any good? God, I doubt it. If today is Tuesday for you, I'm sorry, don't ask too much of yourself. If it isn't Tuesday, just be thankful <3.",
    },
    {
      title: "Screaming onions",
      text: "No wonder you're crying, the onion is screaming into the air, and your eye is the only compassionate part of your body! If I were you I'd give your eyes a quick thank you, and give them a little break for holding the world together. Then after that put them back to work and keep on ignoring those onion screams. God forsook onions a millenia ago, so it is kosher.",
    },
    {
      title: "Potatoes or Tomatoes",
      text: "Brown vs Red. Or did you get red potatoes? What about those green tomatoes. Don't even consider the notion of brown tomatoes. In fact, don't consider tomatoes. What if your brain was a tomato. Sometimes it gets a little mushy. It might be. If so, if your brain truly is a tomato, you probably ought to see what special powers you have. EMP and such. I think tomatoes are pretty good at magic stuff. At least they can change colors. Maybe you can change your eyes from green to red. I bet that would make it easier to focus.",
    },
  ] as Tip[];

  const defaultTips = [
    { title: "You blocked this for a reason :)", text: "No need to get distracted" },
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
    case RedirectEnum.WHIMSICAL: {
      quote = getRandom(whimsicalTips);
      theme = "whimsical-theme";
      break;
    }
    case RedirectEnum.DEFAULT:
      quote = getRandom(defaultTips);
      theme = "default-theme";
      break;
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
