# Utilise une image Node officielle légère
FROM node:18-alpine

# Définit le répertoire de travail dans le container
WORKDIR /app

# Copie package.json et package-lock.json (si présent)
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste des fichiers du projet dans le container
COPY . .

# Expose le port sur lequel tourne ton app (ici 3000)
EXPOSE 3000

# Commande pour démarrer ton app (mettre dans package.json pour dev)
CMD ["npm", "run", "dev"]