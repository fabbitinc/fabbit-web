.PHONY: openapi

openapi:
	$(MAKE) -C ../server2 openapi
	pnpm --dir apps/web2 run generate:api
