require('./configs/dotenv');
import { app } from './app';
require('./configs/db');
export {};

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running at ${port}.`);
});
