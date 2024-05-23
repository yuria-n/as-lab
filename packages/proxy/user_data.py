import urllib.request
from mitmproxy import ctx

target_host = "jp-real-prod-v4tadlicuqeeumke.api.game25.klabgames.net"
target_path = "login/login"

server_url = "http://127.0.0.1:3000/data"
headers = {
  'Content-Type': 'application/json',
}

def response(flow):
  if flow.request.host != target_host:
  # TODO: allow google/ios
#     flow.kill()
    return
  if target_path not in flow.request.path:
    return
  ctx.log.info("Request path %s" % flow.request.path)
  user_id = flow.request.query['u']
  ctx.log.info("Request user_id %s" % user_id)
  if not user_id:
    return
  data = flow.response.content
  ctx.log.info("Response content %s" % data)
  req = urllib.request.Request(server_url + "?user_id=" + user_id, data, headers)
  with urllib.request.urlopen(req) as res:
      body = res.read()

