// require('dotenv').config();
const betterLogging = require(`better-logging`)
betterLogging(console, {
  format: process.env.environment !== `production` ? undefined : ctx => `${ctx.STAMP(new Date().toISOString().slice(0, 19).replace(`T`, `_`))} ${ctx.type} ${ctx.msg}`,
  messageConstructionStrategy: betterLogging.MessageConstructionStrategy.FIRST,
})
console.logLevel = process.env.environment !== `production` ? 4 : 3
const Bot = require('./bot');
const { getUrl, sleep, checkDiscoveryServerReachable } = require('./util');
const { create, query } = require("./db.js");


function get_from_env_or_db(value) {
  let rValue;
  try {
    rValue = process.env[value.toUpperCase()]
    if (rValue === undefined){
      rValue = query('SELECT value from keyvalue where key = ?', value)[0]
    }
    return rValue
  } catch (err) {
    console.error(err)
    return ""
  }
}

(async () => {

  let praises = [
    'good bot',
    'good bot!',
    'goodbot',
    'goodbot!',
  ];

  let toScrape;
  let blacklistedUsers;
  let staleTimeout;

  create()
  try {
    toScrape = {
      new: query("SELECT name FROM scrape WHERE type = ?", 'new'),
      hot: query('SELECT name FROM scrape WHERE type = ?;', 'hot'),
      rising: query("SELECT name FROM scrape WHERE type = ?", 'rising')
    }
  } catch (err) {
    console.error('failed to load subs to scrape from database!', err);
    toScrape = {new: [], rising: [], hot: []};
  }

  try {
    staleTimeout = get_from_env_or_db("reddit_consider_invocation_stale")
  } catch (err) {
    console.error('failed to load stale timeout from datebase!');
    staleTimeout = 3600;
  }

  try {
    staleTimeout = JSON.parse(process.env.REDDIT_CONSIDER_INVOCATION_STALE);
  } catch (err) {
    console.error('failed to load stale timeout from environment variable!');
    staleTimeout = 3600;
  }

  let clientOptions = {
    userAgent: get_from_env_or_db("reddit_user_agent"),
    clientId: get_from_env_or_db("reddit_client_id"),
    clientSecret: get_from_env_or_db("reddit_client_secret"),
    username: get_from_env_or_db("reddit_user"),
    password: get_from_env_or_db("reddit_pass"),
  };

  const redditBot = new Bot(toScrape, praises, clientOptions, staleTimeout);

  try {

    redditBot.startPolling({
      submissionsIntervall: get_from_env_or_db("reddit_polling_submissions"),
      inboxIntervall: get_from_env_or_db("reddit_polling_interval"),
      mentionsIntervall: get_from_env_or_db("reddit_polling_mentions"),
      processQueueIntervall: get_from_env_or_db("reddit_polling_queue"),
    });

    console.info(`Bot is now running!`);

  } catch (err) {
    console.error(`Couldn't start the bot: ${err}`);
  }

})();

if (process.env.ODCRAWLER_DISCOVERY_UPLOAD_FREQUENCY > 0) {
  checkDiscoveryServerReachable()
}
