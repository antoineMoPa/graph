from http.server import *


def run():
    server_class=HTTPServer
    handler_class=Glaph_Server
    server_address = ('', 8000)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()
    
def nice_str(string):
    return bytes(string, "utf-8")

    
class Glaph_Server(BaseHTTPRequestHandler):    
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(nice_str("dude"))
        self.wfile.write(nice_str(self.path))

    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(nice_str("dude"))
        self.wfile.write(nice_str(self.path))

run()
