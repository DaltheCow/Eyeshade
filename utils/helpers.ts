export function formatTimer(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  if (ms < 1000) return "0";
  return `${hours ? hours + ":" : ""}${!minutes && hours ? "00:" : ""}${
    minutes ? (hours && minutes < 10 ? "0" : "") + minutes + ":" : ""
  }${seconds < 10 ? "0" : ""}${seconds}`;
}
