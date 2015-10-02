Usage manual
============
This can be found [here](docs/usage.md)

Dependencies
============
Here we use nginx as a reverse proxy for both the frontend and backend application.
~~~bash
sudo apt-get update
sudo apt-get install nginx
~~~

Configuration
============
For the frontend, the application can be cloned in a folder which has read permissions for the www-data user, e.g. */opt/cros/frontend*
Modify */js/adapter.js* where the main REST url will be hosted (from an external IP perspective with reverse proxy, not the internal server):

~~~javascript
App.CustomAdapter = DS.RESTAdapter.extend({
    host : "http://myhostname.com/rest",
    namespace : "",
...
~~~

Next, we'll configure Nginx as a static file host for the frontend and reverse proxy for the backend. By default this is hosted on localhost port 9000.
Use the following configuration and modify the port / URL to the REST api and the location to the frontend. This configuration can be found in */etc/nginx/sites-enabled/default*:

~~~
upstream play_srv {
        server 127.0.0.1:9000;
}

server {
        listen 80 default_server;
        listen [::]:80 default_server ipv6only=on;
        root /opt/cros/frontend/;
        index index.html index.htm;

        server_name myhostname.com;
        location ^~ /rest/ {
                proxy_pass http://play_srv/rest/;
                sendfile off;

                # Websocket forwarding enabled
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_http_version 1.1;
                proxy_set_header   Host             $host;
                proxy_set_header   X-Real-IP        $remote_addr;
                proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
                proxy_max_temp_file_size 0;

                #this is the maximum upload size
                client_max_body_size       10m;
                client_body_buffer_size    128k;
                proxy_connect_timeout      90;
                proxy_send_timeout         90;
                proxy_read_timeout         90;
                proxy_buffer_size          4k;
                proxy_buffers              4 32k;
                proxy_busy_buffers_size    64k;
                proxy_temp_file_write_size 64k;
        }
}
~~~

Now restart nginx:
~~~bash
sudo service nginx restart
~~~
