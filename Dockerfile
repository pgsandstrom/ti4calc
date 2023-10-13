FROM node:18

# Create app directory
WORKDIR /app

EXPOSE 80

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .


RUN npm run build

CMD [ "npm", "run", "start" ]