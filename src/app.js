require('dotenv').config();

const _ = require('lodash');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const numWords = require('num-words');
const { token } = require('./config');
const deluge = require('deluge')('http://deluge:8112/json', 'deluge');

const client = new Discord.Client();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const findMovie = async (title) => {
    const response = await fetch(`https://yts.uproxy.best/api/v2/list_movies.json?query_term=${encodeURIComponent(title)}&limit=5`, {
        headers: { 'User-Agent': 'jim'},
    });
    const json = await response.json();
    return json
}

const numberEmojis = {
    '1️⃣': 1,
    '2️⃣': 2,
    '3️⃣': 3,
    '4️⃣': 4,
    '5️⃣': 5
}

client.on('message', async (msg) => {
    if (!msg.mentions.has(client.user)) return;

    const response = await findMovie(msg.content);
    const responseLength = response?.data?.movies?.length;
    if (responseLength === undefined || responseLength <= 0) {
        msg.channel.send('couldnt find movies');
        msg.channel.send(':sob:')
        return;
    }

    const movieTitles = _.map(response.data.movies, (movie, index) => {
        return `:${numWords(index+1)}: ${movie.title_long}`;
    })
    const moviePoll = await msg.channel.send(`React to choose a movie\n*you have 30 seconds to add a reaction*\n\n${movieTitles.join('\n')}`);
    const filter = (reaction, user) => {
        return user.id === msg.author.id;
    };
    
    const moviePollCollected = await moviePoll.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] }).catch(() => {
        msg.reply(`your 30 seconds are up..`);
    });
    if (!moviePollCollected) {
        return;
    }
    const movieReaction = moviePollCollected.first();
    
    if (!numberEmojis[movieReaction?.emoji?.name]) {
        msg.reply('Are you dumb?');
        return;
    }
    
    const movieListIndex = numberEmojis[movieReaction.emoji.name]-1;
    const selectedMovie = response.data.movies[movieListIndex];
    const torrentList = _.map(selectedMovie.torrents, (torrent, index) => {
        return `:${numWords(index+1)}: Quality: ${torrent.quality} Size: ${torrent.size} Seeds: ${torrent.seeds} Leachers: ${torrent.peers}`;
    })

    const blorrentPoll = await msg.channel.send(`React to choose a blorrent\n*you have 30 seconds to add a reaction*\n\n${torrentList.join('\n')}`);
    
    const blorrentPollCollected = await blorrentPoll.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] }).catch(() => {
        msg.reply(`your 30 seconds are up..`);
    });
    if (!blorrentPollCollected) {
        return;
    }
    const blorrentReaction = blorrentPollCollected.first();
    
    if (!numberEmojis[blorrentReaction?.emoji?.name]) {
        msg.reply('Are you dumb?');
        return;
    }
    const selectedBlorrent = numberEmojis[blorrentReaction.emoji.name]-1;
    
    const movieTitle = movieTitles[movieListIndex];
    const confirmation = await msg.reply(`React with a 👍 to confirm you want to download ${movieTitle}`);

    const confirmationReactions = await confirmation.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] }).catch(() => {
        msg.reply(`nvm then...`);
    });
    if (!confirmationReactions) {
        return;
    }

    const confirmReact = confirmationReactions.first();

    if (confirmReact.emoji.name != '👍') {
        msg.reply(`I'll take this as a no`);
        return;
    }

    msg.reply(`Adding blorrent to blorrent client!`);
    const magnet = `magnet:?xt=urn:btih:${selectedMovie.torrents[selectedBlorrent].hash}&dn=ez&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopentor.org%3A2710&tr=udp%3A%2F%2Ftracker.ccc.de%3A80&tr=udp%3A%2F%2Ftracker.blackunicorn.xyz%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969`;
    deluge.add(magnet, '/downloads', (error, result) => {
        if(error != undefined) {
            msg.reply(`Error adding to blorrent client: ${error}`);
            return
        } 
        msg.reply(`Blorrent added: ${result}`);
    })
    return;
});

client.login(token);