FROM node:latest

# Create the directory!
RUN mkdir -p /usr/src/bot

WORKDIR /usr/src/bot

# Copy and Install our bot
COPY package.json /usr/src/bot
RUN npm install
RUN apt update && apt install vim -y

# Upgrade installed packages and hopefully address vulnerabilities
RUN apt upgrade -y

# Move code to working directory
RUN bash ./scripts/changelog.sh
COPY . /usr/src/bot


# Start me!
CMD ["node", "index.js"]