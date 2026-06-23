export async function onRequestGet() {
  return Response.json({
    ok: true,
    sistema: 'GIAE Chile',
    version: '1.3.1',
    autor: 'Julio Vera Concha',
    estado: 'API Cloudflare Pages Functions operativa'
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    return Response.json({
      ok: true,
      message: 'Proyecto recibido. Próximo paso: conectar Cloudflare D1.',
      recibido: body,
      fecha: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ ok: false, message: 'JSON inválido', error: String(error) }, { status: 400 });
  }
}
