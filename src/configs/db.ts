import pg from 'pg';

const client = new pg.Pool({
  user: process.env.DATABASE_USERNAME,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

client.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('DB is Running!');
  }
});

export { client };
