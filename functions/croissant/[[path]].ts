/**
 * /croissant/ → /das-croissant-prinzip/ (seit 19.10.2026).
 * Als Function statt in _redirects, damit ?qr=1 vom QR-Code auf der Verpackung sicher mitkommt.
 */
export const onRequest = ({ request }: { request: Request }): Response => {
  const url = new URL(request.url);
  return Response.redirect(`${url.origin}/das-croissant-prinzip/${url.search}`, 301);
};
