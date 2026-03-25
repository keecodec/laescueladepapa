FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# We only copy package files here if we want to build. 
# In our docker-compose dev setup, we mount the client folder directly so npm install is done locally or inside the container.
# However, it's good practice to install here.
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

EXPOSE 5173

# Run Vite dev server exposed on network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
