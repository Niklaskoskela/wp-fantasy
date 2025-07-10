buildFront:
	cd frontend && npm i && npm run build

buildBack:
	cd backend && npm i && npm run build

build: buildFront buildBack

run:
	cd backend && npm run start

buildRun: build run