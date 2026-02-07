.PHONY: init plan apply dev build vapid-keys

init:
	cd infra && tofu init

plan:
	cd infra && tofu plan

apply:
	cd infra && tofu apply

dev:
	cd app && bun run dev

build:
	cd app && bun run build

vapid-keys:
	npx web-push generate-vapid-keys --json
