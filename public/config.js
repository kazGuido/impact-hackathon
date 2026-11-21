// Scam Coach: ONE place for branding and resources.
// A partner (bank, church, community centre) can co-brand the app by editing only this file.
window.SCAM_COACH_CONFIG = {
  // App name: top bar, home page and browser tab.
  appName: {
    en: "Scam Coach",
    zh: "防骗教练",
    es: "Coach Anti-Estafas",
    ko: "사기 방지 코치",
  },

  // Emoji shown on the home page.
  logo: "🛡️",

  // Colours. Each key becomes a CSS colour variable (--green, --red, --blue, --me).
  // Keep strong contrast: the users are older adults.
  // Must match public/theme.css (design agent). If empty, theme.css colours apply.
  colors: {
    green: "#447C9D", // Accept, main buttons, "Real"
    red: "#D04912",   // Decline, End, "Scam"
    blue: "#447C9D",  // links, Send
    me: "#DDEAF2",    // the user's chat bubbles
  },

  // Optional co-brand slot. Leave name empty to hide it.
  // Example: { name: "Maple Community Centre", logo: "partner-logo.png" }
  // (put the logo image file in the public/ folder)
  presentedBy: { name: "", logo: "" },

  // Language selector (labels are always written in their own language).
  languages: [
    { code: "en", label: "English" },
    { code: "zh", label: "中文" },
    { code: "es", label: "Español" },
    { code: "ko", label: "한국어" },
  ],

  // Where to get help. NUMBERS AND LINKS MUST BE CHECKED by a person before real use.
  // verified:false = copied from research/verify.md, not yet confirmed by the team.
  resources: {
    canada: { phone: "1-888-495-8501", site: "reportcyberandfraud.canada.ca", verified: false },
    us: { site: "reportfraud.ftc.gov", verified: false },
    emergency: "911", // only for emergencies
  },
};
