# Site specific proxy
# LSPDD proxy for now,
# might be a proxy for something else later
# how to use:
# go to this "http://server.com:8001/lspdd?id=32398989"
# how to start server:
# python3 proxy.py

import cherrypy
import urllib

lspdd_url = "http://galileo.graphycs.cegepsherbrooke.qc.ca/app/en/lamps/#ID#.json"

class Proxy_Server(object):
    @cherrypy.expose
    def index(self):
        return "Hello!"
    @cherrypy.expose
    def lspdd(self,lamp_id):
        cherrypy.response\
            .headers['Access-Control-Allow-Origin'] = "*"
        # Now this is what I call validation
        lamp_id = str(int(lamp_id))
        if(lamp_id == ""):
            return "FAIL: empty lamp_id"

        # Build url with right ID
        lamp_url = lspdd_url.replace("#ID#",lamp_id)
        # Fetch data
        res = urllib.request.urlopen(lamp_url)
        data = res.read()
        charset = res.headers.get_content_charset()
        if(charset == None):
            return data

        data = data.decode(charset)
        return str(data)

cherrypy.config.update({'server.socket_port': 8001})
cherrypy.quickstart(Proxy_Server())
