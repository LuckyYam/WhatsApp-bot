# WhatsApp-bot Heroku Deploy Guide

## ⚠ Requirements

 - A cluster URI of the [MongoDB](https://www.mongodb.com/). You can get it by following the steps given [here](https://github.com/LuckyYam/WhatsApp-bot/blob/master/MongoDB-Guide.md)

### Pre-requisite

1. [WhatsApp-bot](https://github.com/LuckyYam/WhatsApp-bot) - Go there
2. Scroll down a bit and you will see the "Deploy To Heroku" button in purple color (sorry if you are color blind)
3. Click on it and login or sign up for Heroku
4. Enter the following fields
    | KEY | VALUE |
    | --- | ----------- |
    | NAME | NAME_OF_THE_BOT |
    | PREFIX | PREFIX_OF_THE_BOT |
    | SESSION | BOT_SESSION |
    | MODS | BOT_ADMINS_NUMBER (should be seperated by a comma and a space) |
    | MONGO_URI | YOUR_CLUSTER_URI |
 - `PREFIX`: Prefix of the bot
 - `NAME`: Name of the bot
 - `MONGO_URI`: A secret String for MongoDB connection. (Required)
 - `MODS`: Number of the users who should be the admins of the bot (should be in international format without "+" and multiple numbers must be separated by a comma ", ")
 - `SESSION`: Session of the bot
5. Wait for the building to finish, you should always keep an eye on log messages, you can find log messages in the Dashboard -> More -> View logs.<br>
6. After it builds, click on the "View" or "Open App".<br>
7. Authenticate By going to http://your_app_name/qr/your_session>.<br>
8. Open WhatsApp on your phone -> Click on the 3 Dots on the top Right -> Click on WhatsApp Web -> Click on "Link a Device" and scan the QR from the previous step.<br>
9. Your heroku app can fall asleep so for keeping it awaken add your app to ([Kaffeine](https://kaffeine.herokuapp.com/))<br>. It pings your Heroku app every 30 minutes so it will never go to sleep.<br>