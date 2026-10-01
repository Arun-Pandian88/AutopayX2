const { Client } = require('pg');

const ports = [5432, 5433];
const passwords = ['', 'postgres', 'postgres#123', 'admin', 'root'];

async function findPostgres() {
  console.log('Testing PostgreSQL connections...');
  for (const port of ports) {
    for (const password of passwords) {
      const client = new Client({
        host: 'localhost',
        port: port,
        user: 'postgres',
        password: password,
        database: 'postgres'
      });
      try {
        await client.connect();
        console.log(`\n✅ SUCCESS! Connected to port ${port} with password: "${password}"`);
        await client.end();
        return { port, password };
      } catch (err) {
        process.stdout.write('.');
      }
    }
  }
  console.log('\n❌ FAILED to connect with any standard password combinations.');
}

findPostgres();
