require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// npx prisma migrate dev --name init
