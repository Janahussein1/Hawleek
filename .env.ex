PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hawleek?retryWrites=true&w=majority
JWT_SECRET=hawleek_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development

# External API (OpenWeatherMap - free tier at openweathermap.org)
WEATHER_API_KEY=your_openweathermap_api_key_here
WEATHER_CITY=Cairo

# Email (Nodemailer) — use Gmail App Password or any SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Hawleek <your_email@gmail.com>
