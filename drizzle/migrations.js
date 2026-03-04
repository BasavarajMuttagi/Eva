// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_dark_madripoor.sql';
import m0001 from './0001_black_ultimatum.sql';
import m0002 from './0002_first_jubilee.sql';
import m0003 from './0003_ambitious_typhoid_mary.sql';
import m0004 from './0004_simple_gladiator.sql';
import m0005 from './0005_graceful_blockbuster.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005
    }
  }
  