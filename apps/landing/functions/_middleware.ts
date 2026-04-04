export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  if (url.hostname === "www.fabbitinc.com") {
    url.hostname = "fabbitinc.com";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
};
