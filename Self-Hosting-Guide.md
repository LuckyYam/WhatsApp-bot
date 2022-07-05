# WhatsApp-bot Self-Hosting-Guide

## ⛵ Prerequisites

 - [Git](https://git-scm.com/)
 - [Node.js](https://nodejs.org/en/)
 - [FFmpeg](https://ffmpeg.org/download.html)
 - [ImageMagick](https://imagemagick.org/script/download.php)
 - [webP](https://developers.google.com/speed/webp/download)

 ## 🚀 Installation

 Run the following commands to clone the repo
 ```SH
> git clone https://github.com/LuckyYam/WhatsApp-bot
> cd WhatsApp-bot
 ```

 Run this following command to install the dependencies 
 ```SH
 > yarn install
 ```

 ## ⚠ Requirements

 - A cluster URI of the [MongoDB](https://www.mongodb.com/). You can get it by following the steps given [here](https://github.com/LuckyYam/WhatsApp-bot/blob/master/MongoDB-Guide.md)

 ## 🔧 Configuration

 Rename the file `.env.example` to `.env` and fill the missing fields

 ```env
 PREFIX=PREFIX_OF_THE_BOT
 BOT_NAME=NAME
 SESSION=YOUR_SESSION
 MONGO_URI=YOUR_CLUSTER_URI
 MODS=BOT_ADMINS_NUMBER (should be seperated by a comma and a space)
 ```
 - `PREFIX`: Prefix of the bot
 - `BOT_NAME`: Name of the bot
 - `MONGO_URI`: A secret String for MongoDB connection. (Required)
 - `MODS`: Number of the users who should be the admins of the bot (should be in international format without "+" and multiple numbers must be separated by a comma ", ")
 - `SESSION`: Session of the bot

 ## 🍀 Running

 ```SH
 > yarn start
 ```
 Running the above command will start the bot. To authenticate scan the QR which shows up in the terminal or the link which is logged when the QR event fires using the WA-Web Scanner on your WhatsApp. Now you're on your own. Good Luck!

# Don't want to do the hassle of setting up on your own PC?

 [Set it up on Heroku](https://github.com/LuckyYam/WhatsApp-bot/blob/master/Heroku-Hosting-Guide.md)