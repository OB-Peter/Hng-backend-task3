🌍 HNG Backend Task 3 – Country API

This project is a Node.js + Express application connected to a MySQL database (hosted on Railway).
It provides API endpoints for managing and retrieving country data, including population, currency, and GDP.

🚀 Features

Fetch all countries

Add a new country

Update or delete countries

Connected to a live MySQL Railway database

Uses Sequelize ORM for DB management

⚙️ Tech Stack

Node.js (v22+)

Express.js – Web framework

MySQL – Database

Sequelize – ORM for MySQL

dotenv – For environment variable management

🛠️ Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

2️⃣ Install Dependencies

Make sure you have Node.js and npm installed.

npm install

3️⃣ Configure Environment Variables

Create a file named .env in the root directory with the following variables:

PORT=3000
DB_HOST=centerbeam.proxy.rlwy.net
DB_PORT=33579
DB_USER=root
DB_PASSWORD=PgJZVyxSPHeudSXmrlEODewEiZDzrlAz
DB_NAME=railway


⚠️ Never commit .env to GitHub. Make sure .env is included in .gitignore.

▶️ Run Locally
Development Mode
npm run dev

Production Mode
npm start


Then open your browser and visit:

http://localhost:3000

🧩 Dependencies
Package	Purpose
express	Web server framework
mysql2	MySQL driver for Node.js
sequelize	ORM for managing models & queries
dotenv	Load environment variables
nodemon	Auto-restart for development (optional)

Install them manually (if needed):

npm install express mysql2 sequelize dotenv
npm install --save-dev nodemon

📡 API Endpoints
Method	Endpoint	Description
GET	/api/countries	Get all countries
POST	/api/countries	Add a new country
PUT	/api/countries/:id	Update a country
DELETE	/api/countries/:id	Delete a country
📦 Deployment (Railway)

This project is deployed on Railway
.
Railway automatically installs dependencies and runs the command in your Procfile or package.json’s start script.

🧾 Procfile (if using Railway)

Make sure you have a Procfile in your root with:

web: node server.js

🧰 Troubleshooting

❌ MODULE_NOT_FOUND: '/app/index.js'
→ Ensure your main file is named server.js and package.json includes:

"main": "server.js",
"scripts": {
  "start": "node server.js"
}


❌ Unknown collation: 'utf8mb4_uca1400_ai_ci'
→ Replace it with utf8mb4_general_ci in your .sql file.

👨‍💻 Author

OBPeter App
📧 [your-email@example.com
]
🌐 https://techcloudinsight.com