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
COPY . /usr/src/bot
RUN echo "Changes since $(git describe --tags --abbrev=0)" > changelog.txt && git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%h %s (%ad)" >> changelog.txt

# Start me!
CMD ["node", "index.js"]