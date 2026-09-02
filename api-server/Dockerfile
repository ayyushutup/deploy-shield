FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && \
    apk add --no-cache python3 py3-pip && \
    pip3 install --no-cache-dir joblib scikit-learn pandas numpy
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
