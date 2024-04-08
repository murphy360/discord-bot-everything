FROM node:21.6.1-slim

# Create and set the directory!
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# Copy and Install our code
COPY package.json /usr/src/bot
RUN apt update && apt install git vim jq -y 
RUN npm install

# Upgrade installed packages and hopefully address vulnerabilities
RUN apt upgrade -y

# Move code to working directory
COPY . /usr/src/bot

# Create changelog
RUN bash ./scripts/changelog.sh

# Set permissions for default user and change default user
RUN chown -R 1000:1000 /usr/src/bot
USER 1000

# Start me!
CMD ["node", "index.js"]