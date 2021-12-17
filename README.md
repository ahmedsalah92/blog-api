# blog-api

This is a simple blog api. Users and write posts and comments and perform all CRUD operations. 
## Installation

After cloning the project, run the following command to install the dependencies   
```bash
Run npm install
```

## Database Configuration - postgres on localhost


1. Create new empty posrgres database with the name: **blog** 
2. Add your postgres configuration in file: **config.json** at path: **./config**
3. Run the migration script to create the tables.

```bash
npm run migrate
```

## Technologies
- Typescript
- Node.js
- Express
- PostgreSQL
- Sequelize
- Git
- NPM
- Postman
