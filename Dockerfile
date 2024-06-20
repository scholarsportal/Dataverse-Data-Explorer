# Compile and build web app
FROM node:latest as build
LABEL authors="nanaboateng"
ENTRYPOINT ["top", "-b"]

# Setting working directory
WORKDIR /usr/local/app

# Add source code to working directory
COPY ./ /usr/local/app

# Install dependencies
RUN npm install

# Build app
RUN npm run build:docker

# Serve web app

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/docs/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

