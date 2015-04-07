import cherrypy
import urllib

class Graph_Server(object):
    @cherrypy.expose
    def index(self):
        return "Hello!"
    @cherrypy.expose
    def proxy(self,url):
        cherrypy.response\
            .headers['Access-Control-Allow-Origin'] = "*"
        res = urllib.request.urlopen(url)
        data = res.read()
        charset = res.headers.get_content_charset()
        if(charset == None):
            return data

        data = data.decode(charset)
        return str(data)
    


cherrypy.config.update({'server.socket_port': 8000})
cherrypy.quickstart(Graph_Server())
