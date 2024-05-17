## Getting started

Firstly create .env file with command in root:
```
cp .env.example .env
```
then change variables by your configs
### 1. Run the below command line for local:
```
docker-compose -f docker-compose.local.yml up --build -d
```
OR run without docker
```
npm install
```
then
```
npm start
```
### 2. Run migarate database
Create and update tables with command
```
npm run migrate
```
and insert master data with command
```
npm run seed:all
```
