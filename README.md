# blorrent-bot

Discord bot that allows users to blorrent movies.

## Architecture

The discord bot is run in a container based on sgtsquiggs/deluge-openvpn image in dockerhub
This container runs a deluge blorrent web client that has an API for adding magnet links
This container will not run without a provided openvpn configuration
Currently supports YTS movies.

## Installation

### Prerequisites:
- Virtualization enabled hardware and OS
- Docker installed https://docs.docker.com/get-docker/
- Docker compose installed https://docs.docker.com/compose/install/
- A VPN that supports OpenVPN
- A discord bot created with a token for login https://discord.com/developers/applications/


### Running the container
- Git pull the project
- Copy `env.local` to `env` and fill in the required values
- Update docker-compose.yml with openvpn variables and local volumes 
- Download your .ovpn file and rename it to default.ovpn
- Run `docker-compose up` from the root of the project. Add a `-d` to run in detached mode
- Can access deluge web client at http://localhost:8112/ 
- Optionally set seeding to 0 via preferences in UI

### Usage
- Tag the bot on discord with a movie name `@blorrent-bot harry potter`
- The bot searches YTS movies for matches and returns the  top 5. 
- (Add a year after the movie name if the top 5 doesn't include the movie you want to download)
- React to the message with the number [:one:, :two:, :three:, :four:, :five:] to select a movie
- React with a thumbs up to confirm your choice.


### Troubleshooting
- `You must define TUN/TAP device`: Issues with your .ovpn file. (I had to edit the file to include `auth-user-pass /config/openvpn-credentials.txt`)
- Download speed drops to 0 in client: Problems with download folders, ensure container user has permissions. 

### To Do
- Currently you need to manually connect to deamon via localhost:8112, this might be automatable
- To stop the auto-seeding this can also be done via the UI or in config files