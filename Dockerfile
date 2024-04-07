FROM node:latest

# Create the directory!
RUN mkdir -p /usr/src/bot


WORKDIR /usr/src/bot

# Copy and Install our bot
COPY package.json /usr/src/bot
RUN apt update && apt install vim jq -y 
RUN npm install


# Upgrade installed packages and hopefully address vulnerabilities
RUN apt upgrade -y

# Move code to working directory
COPY . /usr/src/bot
RUN bash ./scripts/changelog.sh
RUN if [ -f "changelog.json" ]; then echo "changelog.json exists"; else echo "changelog.json does not exist"; fi

# Set permissions for the user
RUN chown -R 1000:1000 /usr/src/bot

# Set the Usert
USER 1000

# Start me!
CMD ["node", "index.js"]