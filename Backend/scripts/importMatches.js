const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Match = require('../models/Match');


const API_KEY = process.env.BALLDONTLIE_API_KEY;
const BASE_URL = 'https://api.balldontlie.io/v1';
const SEASON   = 2025;
const PER_PAGE = 100;  
const DELAY_MS = 300;  


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithHeaders = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: API_KEY },
  });

  if (!res.ok) {
    throw new Error(`Erreur API balldontlie : ${res.status} ${res.statusText}`);
  }

  return res.json();
};


const fetchAllGames = async (season) => {
  let allGames = [];
  let cursor   = null;
  let page     = 1;

  console.log(`\n📡 Récupération des matchs — saison ${season}...`);

  do {
    const url = cursor
      ? `${BASE_URL}/games?seasons[]=${season}&per_page=${PER_PAGE}&cursor=${cursor}`
      : `${BASE_URL}/games?seasons[]=${season}&per_page=${PER_PAGE}`;

    const data = await fetchWithHeaders(url);

    allGames = allGames.concat(data.data);
    cursor   = data.meta?.next_cursor ?? null;

    console.log(`  Page ${page} — ${data.data.length} matchs récupérés (total : ${allGames.length})`);
    page++;

    if (cursor) await sleep(DELAY_MS);
  } while (cursor);

  return allGames;
};


const transformGame = (game) => ({
  balldontlieId: game.id,
  date:          new Date(game.date),
  season:        game.season,
  postseason:    game.postseason,

  homeTeam: {
    teamId:       game.home_team.id,
    name:         game.home_team.full_name,
    abbreviation: game.home_team.abbreviation,
    score:        game.home_team_score ?? null,
  },
  visitorTeam: {
    teamId:       game.visitor_team.id,
    name:         game.visitor_team.full_name,
    abbreviation: game.visitor_team.abbreviation,
    score:        game.visitor_team_score ?? null,
  },

  status: game.status === 'Final'
    ? 'final'
    : game.status === 'In Progress'
      ? 'in_progress'
      : 'scheduled',
});


const saveGames = async (games) => {
  console.log(`\n💾 Sauvegarde en base...`);

  let inserted = 0;
  let updated  = 0;
  let errors   = 0;

  for (const game of games) {
    try {
      const doc = transformGame(game);

      const result = await Match.findOneAndUpdate(
        { balldontlieId: doc.balldontlieId },
        doc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      result.isNew ? inserted++ : updated++;
    } catch (err) {
      console.error(`  ❌ Erreur sur game id ${game.id} :`, err.message);
      errors++;
    }
  }

  return { inserted, updated, errors };
};


const run = async () => {
  if (!API_KEY) {
    console.error(' BALLDONTLIE_API_KEY manquante dans le .env');
    process.exit(1);
  }

  try {
    await connectDB();

    const games  = await fetchAllGames(SEASON);
    console.log(`\n✅ ${games.length} matchs récupérés depuis l'API`);

    const { inserted, updated, errors } = await saveGames(games);

    console.log('\n─────────────────────────────────');
    console.log(`🏀 Import terminé — saison ${SEASON}`);
    console.log(`   Nouveaux matchs : ${inserted}`);
    console.log(`   Mis à jour      : ${updated}`);
    console.log(`   Erreurs         : ${errors}`);
    console.log('─────────────────────────────────\n');
  } catch (err) {
    console.error('❌ Erreur fatale :', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

run();