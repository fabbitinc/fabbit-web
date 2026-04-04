.PHONY: openapi

release:
	git checkout release
	git merge main
	git push
	git checkout main

openapi:
	$(MAKE) -C ../server openapi
	pnpm --dir apps/web run generate:api
