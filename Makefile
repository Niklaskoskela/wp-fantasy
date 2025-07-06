buildFront:
	rm -rf frontend/dist
	rm -rf backend/dist
	cd frontend && npm ci && npm run build
	cp -r frontend/dist backend

buildBack::
	cd backend && npm run build

run:
	cd backend && npm run start

buildRun: buildFront buildBack run