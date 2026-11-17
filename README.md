# Moto Log

A simple mobile app for motorcycle owners to record oil changes and repairs, with costs, and to get a reminder for the next oil change.

**Live app:** https://my-moto-log.netlify.app

## Features

- Add a record for an **Oil Change** or a **Repair** with date, motorcycle, odometer (km), cost, and description
- See the **total cost for this month** and **this year**
- **Next oil change reminder** for each motorcycle (every 3,000 km or 3 months), with green, yellow, and red status
- Filter the list by motorcycle when you have more than one
- Delete a record
- Records are saved on the device (localStorage), so they stay after you close the app
- Installable on a phone as an app (PWA) and works offline
- Light and dark mode that follows the phone setting

## Built with

- React
- Vite
- Progressive Web App (manifest and service worker)
- Hosted on Netlify

## How to install and run

### Option 1: Install on your phone (easiest)

1. Open https://my-moto-log.netlify.app in Chrome on an Android phone.
2. Tap the **⋮ menu** and choose **Install app** (or **Add to Home screen**).
3. Open **Moto Log** from the home screen.

### Option 2: Run on a computer

Requirements: [Node.js](https://nodejs.org) and [Git](https://git-scm.com).

```bash
git clone https://github.com/lealeron19/moto-log.git
cd moto-log
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

To make a production build:

```bash
npm run build
```

## Author

- **Name:** Lea B. Leron
- **Section:** BSINTE 2C
