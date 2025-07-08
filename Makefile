buildFront:
	cd frontend && npm ci && npm run build

buildBack:
	cd backend && npm ci && npm run build

build: buildFront buildBack

run:
	cd backend && npm run start

buildRun: build run