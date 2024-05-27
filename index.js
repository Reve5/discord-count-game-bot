const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs')
const config = require('./config.json');

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]
const client = new Client({ intents: intents });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.channel.id == config.CHANNEL_ID) {
        if ( message.author.bot ) {
            return
        };

        let rawData = fs.readFileSync('count.json');
        let count = JSON.parse(rawData);

        if ( message.content == count.nextCount && count.lastMessage.authorId != message.author.id ) {
            count.nextCount = count.nextCount + 1
            count.lastMessage.messageId = message.id
            count.lastMessage.authorId = message.author.id
        } else {
            message.delete()
        }

        let data = JSON.stringify(count);
        fs.writeFileSync('count.json', data);
    };
});

client.on('messageDelete', async (message) => {
    try {
        if (message.channel.id == config.CHANNEL_ID) {
            let rawData = fs.readFileSync('count.json');
            let count = JSON.parse(rawData);
    
            if ( count.lastMessage.messageId == message.id ) {
                let lastCount = count.nextCount - 1;
                message.channel.send(`${message.author}: ${lastCount}`)
            }
        }; 
    } catch (error) {
        console.log(error)
        return
    }
    
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    try {
        if (oldMessage.channel.id == config.CHANNEL_ID) {
            let rawData = fs.readFileSync('count.json');
            let count = JSON.parse(rawData);
    
            if ( count.lastMessage.messageId == oldMessage.id ) {
                let lastCount = count.nextCount - 1;
                count.lastMessage.messageId = 0
                newMessage.channel.send(`${newMessage.author}: ${lastCount}`)
                newMessage.delete()
            }

            let data = JSON.stringify(count);
            fs.writeFileSync('count.json', data);
        }; 
    } catch (error) {
        console.log(error)
        return
    }
    
});

client.login(config.TOKEN)
