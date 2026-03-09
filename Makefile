.PHONY: openapi

openapi:
	$(MAKE) -C ../server openapi
	pnpm --dir apps/web run generate:api
