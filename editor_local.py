"""Editor local sin dependencias. SOLO escucha en 127.0.0.1.
Inicia con `python editor_local.py` desde la carpeta mi-portafolio.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import json, re, os, shutil, datetime, tempfile, socket, webbrowser

ROOT = Path(__file__).resolve().parent
PORT = 8765
MAX_UPLOAD = 90 * 1024 * 1024
CONTENT = ROOT / 'contenido.js'

def read_data():
    source = CONTENT.read_text(encoding='utf-8')
    match = re.search(r'window\.PORTAFOLIO\s*=\s*(\{.*\})\s*;?\s*$', source, re.S)
    if not match:
        raise ValueError('El archivo contenido.js no tiene el formato esperado.')
    return json.loads(match.group(1))

def write_atomic(path, body):
    fd, name = tempfile.mkstemp(dir=str(path.parent), prefix='.temp_portafolio_')
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(body)
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def json_response(self, value, code=200):
        body = json.dumps(value, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if urlparse(self.path).path == '/api/data':
            try:
                self.json_response(read_data())
            except Exception as ex:
                self.json_response({'error': str(ex)}, 500)
        elif urlparse(self.path).path == '/':
            self.send_response(302)
            self.send_header('Location', '/editor.html')
            self.end_headers()
        else:
            return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path not in ('/api/save', '/api/upload'):
            return self.json_response({'error':'Ruta no disponible'},404)
        try:
            length = int(self.headers.get('Content-Length', '-1'))
            if length < 0 or length > MAX_UPLOAD:
                return self.json_response({'error':'Archivo demasiado grande o tamaño inválido'},413)
            body = self.rfile.read(length)
            payload = json.loads(body.decode('utf-8')) if path == '/api/save' else None
            if path == '/api/save':
                if not isinstance(payload, dict) or not all(isinstance(payload.get(k),t) for k,t in [('perfil',dict),('habilidades',list),('proyectos',list),('certificados',list)]):
                    raise ValueError('Datos del editor inválidos')
                # Copia de seguridad local del contenido anterior.
                backup = ROOT / 'copias-seguridad'
                backup.mkdir(exist_ok=True)
                stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f')
                shutil.copy2(CONTENT, backup / f'contenido-{stamp}.js')
                jsontext = json.dumps(payload, ensure_ascii=False, indent=2).replace('<', '\\u003c')
                write_atomic(CONTENT, ('/* Portafolio: contenido editado localmente */\nwindow.PORTAFOLIO = '+jsontext+';\n').encode('utf-8'))
                self.json_response({'ok': True, 'message': 'Cambios guardados en contenido.js'})
            else:
                # File upload raw bytes; no multipart encoding; content must not be executed.
                kind = self.headers.get('X-Upload-Type', '')
                name = self.headers.get('X-Upload-Name', '')
                if kind not in ('imagenes','certificados','descargas'):
                    raise ValueError('Tipo de archivo no permitido')
                basename = Path(name).name
                if basename != name or not re.fullmatch(r'[a-zA-Z0-9._-]{1,100}',basename):
                    raise ValueError('Nombre de archivo inválido: usa letras, números y guiones')
                allowed = {'imagenes':('.png','.jpg','.jpeg','.webp','.gif'), 'certificados':('.pdf',), 'descargas':('.apk',)}
                if Path(basename).suffix.lower() not in allowed[kind]:
                    raise ValueError('Formato no permitido para esta carpeta')
                folder = ROOT / ('imagenes/proyectos' if kind=='imagenes' else kind)
                folder.mkdir(parents=True,exist_ok=True)
                target = folder / basename
                if target.exists():
                    target = folder / (target.stem + '-' + datetime.datetime.now().strftime('%Y%m%d%H%M%S') + target.suffix)
                write_atomic(target, body)
                rel = target.relative_to(ROOT).as_posix()
                self.json_response({'ok':True,'path':rel})
        except Exception as ex:
            self.json_response({'error':str(ex)},400)

if __name__ == '__main__':
    try:
        server = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    except OSError as ex:
        raise SystemExit(f'No se pudo iniciar el editor en el puerto {PORT}: {ex}')
    print(f'Editor listo: http://127.0.0.1:{PORT}/editor.html')
    print('El editor solo es accesible desde este ordenador. Ctrl+C para cerrarlo.')
    webbrowser.open(f'http://127.0.0.1:{PORT}/editor.html')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nEditor cerrado.')
    finally:
        server.server_close()
