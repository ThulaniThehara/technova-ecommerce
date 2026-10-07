// Sri Lanka time, fixed, so the server-rendered date matches what the owner expects
// regardless of where the server (e.g. Vercel in the US) runs.
const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Colombo",
});

export const formatDateTime = (iso: string | Date) => dateTime.format(new Date(iso));
